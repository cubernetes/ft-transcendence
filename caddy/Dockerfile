# Build Stage: Custom Caddy with Coraza WAF
FROM caddy:2.9.1-builder-alpine AS builder

# Needed because of CGO_ENABLED=1 below
RUN apk update && apk add build-base

# statically compile caddy
RUN CGO_ENABLED=1 XCADDY_GO_BUILD_FLAGS="-ldflags='-linkmode external -extldflags -static'" \
	xcaddy build --with github.com/corazawaf/coraza-caddy/v2

# make PID 1 unprivileged
RUN addgroup caddy
RUN adduser -h /frontend/ -S caddy -G caddy

FROM alpine:3.21.3

COPY --from=builder      /usr/bin/caddy /usr/bin/caddy
COPY --from=builder      /etc/passwd /etc/passwd
COPY --from=builder      /etc/group /etc/group
COPY --chown=caddy:caddy ./Caddyfile /etc/caddy/Caddyfile

RUN rm -rf /frontend/ && mkdir -p /frontend/.local/share/caddy/

RUN chown -R caddy:caddy /frontend/

WORKDIR /frontend/

EXPOSE 8080
EXPOSE 8443

VOLUME ["/frontend/.local/share/caddy/", "/frontend/dist/", "/frontend/uploads/"]

# Environment wrapper stuff for vault
RUN apk add --no-cache jq curl bash

COPY --chmod=755 <<EOF /entrypoint.sh
#!/bin/bash
#Must be bash since sh (specifically dash) sanitizes all environment variables which are not
#valid identifiers (e.g. the case for "bootstrap.memory_lock=true"). Bash passes them through, which
#is in line with POSIX.

set -e # exit on any error
set -u # treat failed expansion as error
#set -vx # for debugging

### Customization Point 2 ###
service=caddy

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

# Print all secrets for logging
printf "Environment start\\n"
eval printf '"%s\\n"' "\$env_params"
printf "Environment end\\n"

### Customization Point 3 ###
eval exec env -- "\$env_params" '"\$@"'
EOF

ENTRYPOINT ["/entrypoint.sh"]

USER caddy

ENV WATCH=0

CMD ["sh", "-c", "/usr/bin/caddy run --watch=$WATCH --adapter caddyfile --config /etc/caddy/Caddyfile"]
