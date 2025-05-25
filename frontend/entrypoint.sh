#!/bin/bash
#Must be bash since sh (specifically dash) sanitizes all environment variables which are not
#valid identifiers (e.g. the case for "bootstrap.memory_lock=true"). Bash passes them through, which
#is in line with POSIX.

set -e # exit on any error
set -u # treat failed expansion as error
#set -vx # for debugging

### Customization Point 2 ###
service=frontend

vault_token=$(cat "/run/secrets/${service}_vault_token")
vault_addr=http://vault:${VAULT_API_PORT:-8200}

# Truncate file for good measure
: > "/run/secrets/${service}_vault_token"

get_all_secrets_as_env_params () {
	curl --no-progress-meter --header "X-Vault-Token: $vault_token" \
		"$vault_addr/v1/secret/data/$service" | jq --raw-output '
			[
				.data.data | to_entries[] |
					"'\''"
					+ .key
					+ "="
					+ ( if .value | type == "string" then ( .value | gsub( "'\''"; "'\''\\'\'''\''")) else .value end)
					+ "'\''"
			] | join(" ")
		'
}

env_params=$(get_all_secrets_as_env_params)

# Print all secrets for logging, should only be done for debugging
# printf "Environment start\n"
# eval printf '"%s\n"' "$env_params"
# printf "Environment end\n"

### Customization Point 3 ###
eval exec env -- "$env_params" '"$@"'
