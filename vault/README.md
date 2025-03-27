# Vault service documentation

## General overview

All services that need secrets depend on the Vault service to start up and pass
the healthcheck. Vault injects a Vault token to each of those services via a
shared file (bind mount). Once the service has the token, it can make `GET` requests
to `http://vault:8200/v1/secret/$SERVICE_NAME` and extract the secrets from the
JSON response (`.data.data`). A token can only be used as many times as there
are secrets for a particular service (TODO) (if the `backend` service only has the
`JWT_SECRET` secret, then it can make only a single `GET` request, after which the
token is invalidated) and it can only read its own secrets (TODO) (enforced via policies).
If not all secrets are read, it's each service is advised to override/truncate
the file to prevent unwanted access from the host system.

## How Vault initially starts up

When Vault is started for the first time, the `vault` volume mounted at `/vault/file`
will be empty. The entrypoint recognizes that and starts the initialization process,
where it will start (`vault server`) and initialize (`vault operator init`) Vault.
Then it will extract the **unseal keys** and the **root token** from the stdout.
It uses the unseal keys to unseal Vault and then the root token to create
the policies and tokens for all the services. After that, if the environment
variables `SAVE_UNSEAL_KEYS` or `SAVE_ROOT_TOKEN` are `1`, it will save the
respective secret in another volume called `vault_secret` at `/vault/secret/`.
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

## I want to add a new service or more secrets for a given service

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

## I need the secret for a particular service, how do I get it?

If `SAVE_ROOT_TOKEN` was `1` and the vault is unsealed and running, you can retrieve
all secrets for a given `$SERIVCE` using the following command from the docker host:

```console
docker exec vault sh -c '
    SERVICE=backend
    wget --header="X-Vault-Token: $(cat /vault/secret/root_token)" \
        --quiet \
        --output-document=- \
        "$(cat /tmp/vault_addr)"/v1/secret/data/$SERVICE | 
    jq --raw-output --color-output .data.data'
```

## The vault architecture is weird, why would you do it this way?

It is weird, but this project's requirements (more or less) force us to
automate it to such a high degree that it almost doesn't make sense anymore.
Vault is wayyyy overkill for this project anyways.
Please read the first section of this [PR](https://github.com/cubernetes/ft-transcendence/pull/50)
to understand why some questionable decisions had to be made.
