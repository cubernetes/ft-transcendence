# Vault service documentation

## General overview

All services that need secrets depend on the Vault service to start up and pass
the healthcheck. Vault injects a Vault token to each of those services via a
shared file (bind mount). Once the service has the token, it can make `GET` requests
to `http://vault:${VAULT_API_PORT:-8200}/v1/secret/data/$SERVICE_NAME` and extract
the secrets from the JSON response (`.data.data`). A token can only be used once,
since the response should contain all the secrets relevant to that service,
and it can only read its own secrets (enforced via policies and roles). The
service may optionally override/truncate the file to prevent unwanted access
from the host system.

## How Vault initially starts up

When Vault is started for the first time, the `vault-storage` volume mounted at `/vault/file`
will be empty. The entrypoint recognizes that and starts the initialization process,
where it will start (`vault server`) and initialize (`vault operator init`) Vault.
Then it will extract the **unseal keys** and the **root token** from the stdout.
It uses the unseal keys to unseal Vault and then the root token to create
the policies and tokens for all the services. After that, if the environment
variables `SAVE_UNSEAL_KEYS` or `SAVE_ROOT_TOKEN` are `1`, it will save the
respective secret in another volume called `vault-secret` at `/vault/secret/`.
This is the default, but for security they should be `0` and you should look
at the service logs and make note of those secrets. However, as of now, there
is no way to provide those secrets to Vault at startup. One possible way would
be to have a helper script that then talks via HTTP (or raw TCP) to the Vault
container, but yeah, PRs welcome :)

## How Vault starts again

When the `/vault/file` directory is not empty, it must have been initialized before,
so it goes through a simpler flow where it just starts Vault, reads the unseal
keys and root token from `/vault/secret/`, unseals Vault, revokes all
tokens, creates new tokens, and injects those to the services as described above.

## I want to add more secrets for a given service

Secrets are specified in `./vault/env.json`. Since most secrets can be automatically
generated, you can specify them using a custom double brace syntax (sometimes called
mustache syntax): `{{alnum:64}}`. Make sure the system you're running on has [enough
entropy](https://superuser.com/questions/944510/why-am-i-constantly-running-out-of-entropy).
Each secret is a string associated to a service, and each service is a subkey of
the root JSON object. Secrets that don't follow this exact structure will be
skipped and a warning will be raised.
Secrets that cannot be generated at runtime should not be specified using the template
syntax, specifically, they must not match this PCRE regex: `\{\{\w+:\d+\}\}`. In
case they only match `\{\{.*\}\}`, a warning will be raised, but the string will
be left unmodified. Note that non-secret data can be specified here as well for
consistency.

**Important**: In case you add secrets that cannot be generated (like OAuth secrets),
it is highly advised to add `env.json` to `.gitignore`. In case you then change the
structure of `env.json`, remove it from `.gitignore`, run `git add -p` (only
add the non-sensitive parts), commit it, and then add it back to `.gitignore`.

## Increasing the LOGLEVEL

The `LOGLEVEL` environment variable may be set to `error`, `warn`, `info`, `debug`
Note that for loglevels `info` and `debug`, the unseal keys and the root token
will be printed to stdout, so they will show up in the service logs. You want this
if you need to manually save those secrets. However, you can also remove one
line in `./vault/endpoint.sh` to not print those secrets (then you should set
`SAVE_UNSEAL_KEYS` and `SAVE_ROOT_TOKEN` to `1`):

```diff
     else
         info "Vault storage backend is empty. Initializing vault"

         start_server_in_bg
         wait_and_extract_secrets
-        show_secrets
         maybe_save_secrets
         export_environment
         ensure_unsealed
```

## I dont want vault to consider an entry in env.json

Just prefix the key with a dot and vault will ignore it/not generate any service tokens,
policies or roles for it:

```json
{
    ".backend": {
        // <- backend service will be ignored by vault
        "JWT_SECRET": "{{alnum:64}}"
    }
}
```

## I need the secret for a particular service, how do I get it?

If `SAVE_ROOT_TOKEN` was `1` and the vault is unsealed and running, you can retrieve
all secrets for a given `$SERVICE` using the following command from the docker host:

```sh
docker exec vault sh -c '
    SERVICE=backend
    wget --header="X-Vault-Token: $(cat /vault/secret/root_token)" \
        --quiet \
        --output-document=- \
        "$(cat /tmp/vault_addr)"/v1/secret/data/$SERVICE |
    jq --raw-output --color-output .data.data'
```

## No, I mean: I need the secret inside another service container, how do I get it programmatically?

Unfortunately, at the moment, it is quite a lot of steps to register a completely
new service to the vault infrastructure. But they are all relatively straightforward.
Let's say your service is called `foo`, then the steps would be the following:

1. You need to mount a file between the `vault` and `foo` container. For that, adjust `compose.yaml`:

    1. Add the file mount to the `foo` container and ensure it depends on vault, is in the same network, and has a unique and named IP (look at other services and IPAM configuration at the networks section at the bottom of the Makefile and then choose a unique IP):

    ```diff
    +     foo:
    +         networks:
    +             ft-transcendence-net:
    +                 ipv4_address: &foo-ip 10.42.42.3
    +         volumes:
    +             - "./.secrets/foo_vault_token:/run/secrets/foo_vault_token"
    +         depends_on:
    +             vault:
    +                 restart: true
    +                 condition: service_healthy
    ```

    1. Add the file mount and extra host to the `vault` container:

    ```diff
          vault:
              build: "./vault/"
              container_name: vault
              restart: unless-stopped
              networks:
                  ft-transcendence-net
                      ipv4_address: &vault-ip 10.42.42.42
              extra_hosts:
                  backend: *backend-ip
                  caddy: *caddy-ip
    +             foo: *foo-ip
              cap_add:
                  - IPC_LOCK
              volumes:
                  - "vault-storage:/vault/file/"
                  - "vault-secret:/vault/secret/"
                  - "./.secrets/backend_vault_token:/run/secrets/backend_vault_token"
    +             - "./.secrets/foo_vault_token:/run/secrets/foo_vault_token"
              environment:
                  <<: *env-watch
                  LOGLEVEL: "debug"
                  SAVE_UNSEAL_KEYS: "1"
                  SAVE_ROOT_TOKEN: "1"
              tty: true
    ```

1. Add that mounted file to the Makefile to ensure it exists (otherwise, Docker will create it as a directory)

```diff
 D := docker

 VAULT_TOKEN_EXCHANGE_FILES := \
-       ./.secrets/backend_vault_token
+       ./.secrets/backend_vault_token \
+       ./.secrets/foo_vault_token

 .DEFAULT_GOAL := dev
```

1. Add `foo` as a new service to `./vault/env.json` and add the secret(s)

```diff
 {
     "backend": {
         "JWT_SECRET": "{{alnum:64}}"
-    }
+    },
+    "foo": {
+        "SIGNING_SECRET": "{{alpha:32}}",
+        "SOME_PASSWORD": "{{digit:12}}"
+    }
 }
```

1. Add a new policy file at path `./vault/policies/foo.hcl` (copy an existing one, they're all similar)

```diff
+path "secret/data/foo" {
+    capabilities = ["read"]
+}
```

1. If `foo` does NOT have a Dockerfile, you HAVE to create one with a shell entrypoint wrapper to pass the environment

    1. Get original entrypoint value

    ```sh
    docker pull foo:1.42.0
    docker image inspect $(docker images -q foo:1.42.0) | jq '.[0].Config.Entrypoint'
    ```

    1. Create Dockerfile with inline entrypoint (specifically look at the lines containing 'Customization Point')

    ```Dockerfile
    ### Customization Point 1 ###
    FROM foo:1.42.0

    # Might want to become root, but don't forget to change it back later
    # USER 0

    # If the base image doesn't even have bash, use a multistage build to get one.

    # Install and curl or wget and jq (or use stage from above) and bash to preserve
    # weird environment variables
    RUN apk/apt add/install curl/wget jq bash

    COPY --chmod=555 <<EOF /entrypoint.sh
    #!/bin/bash
    #Must be bash since sh (specifically dash) sanitizes all environment variables which are not
    #valid identifiers (e.g. the case for "bootstrap.memory_lock=true" in elk). Bash passes them through, which
    #is in line with POSIX.

    set -e # exit on any error
    set -u # treat failed expansion as error
    #set -vx # for debugging

    ### Customization Point 2 ###
    service=foo

    vault_token=\$(cat "/run/secrets/\${service}_vault_token")
    vault_addr=http://vault:${VAULT_API_PORT:-8200}

    get_all_secrets_as_env_params () {
    	curl --no-progress-meter --header "X-Vault-Token: \$vault_token" \\
    		"\$vault_addr/v1/secret/data/\$service" | jq --raw-output '
    			[
    				.data.data | to_entries[] |
    					"'\\''"
    					+ .key
    					+ "="
    					+ ( if .value | type == "string" then ( .value | gsub( "'\\''"; "'\\''\\\\'\\'''\\''")) else .value end)
    					+ "'\\''"
    			] | join(" ")
    		'
    }

    env_params=\$(get_all_secrets_as_env_params)

    # Print all secrets for logging, should only be done for debugging
    # printf "Environment start\\n"
    # eval printf '"%s\\n"' "\$env_params"
    # printf "Environment end\\n"

    # Truncate file for good measure
    : > "/run/secrets/\${service}_vault_token"

    ### Customization Point 3 ###
    # Don't forget the `"\$@"` at the end to pass arguments!
    eval exec env -- "\$env_params" <same value as "Entrypoint" key from previous step (watch out for quoting)> '"\$@"'
    # Common value for entrypoint: `/bin/tini --` https://github.com/krallin/tini
    # Note that `exec` is REQUIRED to correctly forward signals.
    # `env` will exec itself, so that's fine as well.
    # `eval` is needed because we are constructing params for `env`,
    # which is also why we have extra qoutes around this: '"\$@"'
    EOF

    # No need to set WORKDIR, will be inherited from base image
    # No need to set CMD, will be inherited from base image
    # No need to set any ENV, will be inherited from base image
    # No need to set USER, will be inherited from base image

    # Potentiall a default CMD
    # CMD ["/usr/local/bin/foo-init.sh"]

    # Potential Healthcheck
    # HEALTHCHECK --interval=30s --timeout=10s --retries=5 --start-period=60s --start-interval=1s CMD ["curl", "--fail", "http://foo:4242/"]

    # Potentially drop privileges
    # USER 1000

    ENTRYPOINT ["/entrypoint.sh"]
    ```

1. However, if your `foo` service DOES have a Dockerfile already and is
   running off of a particular language, then use your language's capabilities
   to do something similar to the entrypoint script above, or look at how
   the `backend` service does it (`./backend/` directory).

## The vault architecture is weird, why would you do it this way?

It is weird, but this project's requirements (more or less) force us to
automate it to such a high degree that it almost doesn't make sense anymore.
Vault is wayyyy overkill for this project anyways.
Please read the first section of this [PR](https://github.com/cubernetes/ft-transcendence/pull/50)
to understand why some questionable decisions had to be made.
