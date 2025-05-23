FROM node:23.9.0-alpine3.21

WORKDIR /frontend/

VOLUME /frontend/dist/

COPY ./package*.json ./

RUN npm clean-install

COPY ./ ./

RUN npm run build

ENV WATCH=0

CMD ["sh", "-c", "if [ \"$WATCH\" = \"1\" ]; then npm run build:dev; fi"]

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
service=frontend

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
					+ (
						if .value | type == "string" then
							(
								.value |
									gsub(
										"'\\''";
										"'\\''\\\\'\\'''\\''"
									)
							)
						else
							.value
						end
					  )
					+ "'\\''"
			] | join(" ")
		'
}

env_params=\$(get_all_secrets_as_env_params)

# Print all secrets for logging
printf "Environment start\\n"
eval printf '"%s\\n"' "\$env_params"
printf "Environment end\\n"

# Truncate file for good measure
: > "/run/secrets/\${service}_vault_token"

### Customization Point 3 ###
eval exec env -- "\$env_params" '"\$@"'
EOF

ENTRYPOINT ["/entrypoint.sh"]
