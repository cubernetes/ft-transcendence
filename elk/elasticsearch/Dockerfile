### Customization Point 1 ###
FROM docker.elastic.co/elasticsearch/elasticsearch:8.17.3

USER 0

RUN export DEBIAN_FRONTEND=noninteractive && apt update -y && apt install -y curl jq

COPY --chmod=755 <<EOF /entrypoint.sh
#!/bin/bash
#Must be bash since sh (specifically dash) sanitizes all environment variables which are not
#valid identifiers (e.g. the case for "bootstrap.memory_lock=true"). Bash passes them through, which
#is in line with POSIX.

set -e # exit on any error
set -u # treat failed expansion as error
#set -vx # for debugging

### Customization Point 2 ###
service=elasticsearch

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

CMD ["/usr/share/elasticsearch/config/startup.sh"]

# No need to set WORKDIR, will be inherited from base image
# No need to set CMD, will be inherited from base image
# No need to set any ENV, will be inherited from base image
# No need to set USER, will be inherited from base image

# Healthcheck defined in ${REPO_ROOT}/elk/logstash/scripts/import-logstash-ca.sh
HEALTHCHECK --interval=30s --timeout=10s --retries=5 CMD ["grep", "-Fxq", "0", "/tmp/healthcheck"]

USER 1000
ENTRYPOINT ["/entrypoint.sh"]
