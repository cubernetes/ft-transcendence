### Customization Point 1 ###
FROM docker.elastic.co/kibana/kibana:8.17.3

USER 0

RUN export DEBIAN_FRONTEND=noninteractive && apt update -y && apt install -y curl jq

COPY --chmod=755 <<EOF /entrypoint.sh
#!/bin/sh

set -e # exit on any error
set -u # treat failed expansion as error
#set -vx # for debugging

### Customization Point 2 ###
service=kibana

vault_token=\$(cat "/run/secrets/\${service}_vault_token")
vault_addr=http://vault:8200

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
printf "Environment start"
eval printf '"%s\\n"' "\$env_params"
printf "Environment end"

# Truncate file for good measure
: > "/run/secrets/\${service}_vault_token"

### Customization Point 3 ###
eval exec env -- "\$env_params" /bin/tini -- '"\$@"'
EOF

CMD ["sh", "-xec", "echo BEFORE-KIBANA; env; echo AFTER-KIBANA; /usr/local/bin/kibana-docker & KIBANA_PID=$! ; echo \"Kibana starting with PID $KIBANA_PID\" ; sleep 120 ; /usr/share/kibana/setup-dashboards.sh & wait $KIBANA_PID"]

# No need to set WORKDIR, will be inherited from base image
# No need to set CMD, will be inherited from base image
# No need to set any ENV, will be inherited from base image
# No need to set USER, will be inherited from base image

USER 1000
ENTRYPOINT ["/entrypoint.sh"]
