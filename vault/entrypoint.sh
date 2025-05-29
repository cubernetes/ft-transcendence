#!/bin/sh

set -e
set -u
set -m
#set -vx

: "${LOG_LEVEL:=INFO}"
: "${SAVE_UNSEAL_KEYS:=0}"
: "${SAVE_ROOT_TOKEN:=0}"
: "${vault_config:=/vault/config/config.hcl}"
: "${vault_storage_path:=/vault/file/}" # must match what's inside /vault/config/config.hcl, if that's used
: "${vault_stdout_file:="$HOME"/vault-server-stdout}"
: "${vault_stderr_file:="$HOME"/vault-server-stderr}"
: "${vault_exit_code_file:="$HOME"/vault-server-exit-status}"
: "${vault_env_json:=/vault/config/env.json}"
: "${vault_kv_store_path:=secret/}"
: "${vault_secrets_path:=/vault/secret}"
: "${token_exchange_dir:=/run/secrets}"

loglevel_to_num () {
	level=$(printf %s "$1" | tr '[:lower:]' '[:upper:]')
	case "$level" in
		(DEBUG) printf 3
			;;
		(INFO) printf 2
			;;
		(WARN) printf 1
			;;
		(ERROR) printf 0
			;;
		(*) 	printf 0
			;;
	esac
}

log () {
	level=$(printf %s "$1" | tr '[:lower:]' '[:upper:]')
	shift

	OLDIFS=$IFS
	IFS=" "
	ansi_reset='\033\133m'
	case "$level" in
		(DEBUG) ansi_color='\033\133;97m'
			;;
		(INFO) ansi_color='\033\133;94m'
			;;
		(WARN) ansi_color='\033\133;93m'
			;;
		(ERROR) ansi_color='\033\133;91m'
			;;
		(*)	ansi_color='\033\133;91m'
			set "(Invalid loglevel for log function): " "$*"
			;;
	esac
	[ "$(loglevel_to_num "$level")" -gt "$(loglevel_to_num "$LOG_LEVEL")" ] && return 0

	printf '[ %b%-5s%b ]: %s\n' "$ansi_color" "$level" "$ansi_reset" "$(printf "$@")"
	IFS=$OLDIFS
}

debug () {
	log DEBUG "$@"
}

info () {
	log INFO "$@"
}

warn () {
	log WARN "$@"
}

error () {
	log ERROR "$@"
}

die () {
	error "$@"
	exit 1
}

debug "Creating vault storage path at directory '$vault_storage_path'"
mkdir -p "$vault_storage_path"

_start_vault_server () {
	vault server -log-format=json -config="$vault_config"
	#vault server -log-format=json -dev
}

is_initialized () {
	# Check if the storage path directory is empty. If it is (`read` returns 1), then we also
	# return with 1, meaning false (aka "is not initialized")
	{ find "$vault_storage_path" -mindepth 1 -maxdepth 1 || true; } | tee /tmp/storage_files | head -n 1 | read -r
	exit_status=$?
	[ "$exit_status" = "1" ] && debug "These files are present in the vault storage path directory (\033\133;93m%s\033\133m):\n%s" "$vault_storage_path" "$(sed 's/^/\t/' /tmp/storage_files)"
	return "$exit_status"
}

# Not needed anymore, we always have to start it in bg
#start_server () {
#	info "Starting vault server in foreground"
#
#	_start_vault_server
#}

start_server_in_bg () {
	info "Starting vault server in background job"

	(
		set +e
		1>"$vault_stdout_file" \
		2>"$vault_stderr_file" \
		_start_vault_server

		1>"$vault_exit_code_file" echo $?
	) &

	# Grace wait
	sleep .2
}

maybe_initialize_vault () {
	if [ -n "$VAULT_ADDR" ]; then
		if printf %s "$VAULT_ADDR" | grep -qF '0.0.0.0'; then
			warn "API address \033\133;93m%s\033\133m contains any-address 0.0.0.0 which works using a linux kernel (goes to loopback), but it might not work on other kernels. Please configure vault's api_addr manually" "$VAULT_ADDR"
		fi

		if grep -qFx '==> Vault server started! Log data will stream in below:' "$vault_stdout_file"; then
			if ! vault status -format=json | jq --exit-status .initialized 1>/dev/null; then
				info "Vault server has started (address \033\133;93m%s\033\133m) but is not initialized yet. Initializing it" "$VAULT_ADDR"
				# better would be to use -format=json, but then the logic from the loop in the calling function wouldn't find the keys
				vault operator init >> "$vault_stdout_file"
			fi
		fi
	fi
}

get_vault_addr () {
	VAULT_ADDR=$(grep -o '\<Api Address: [^[:space:]]\+\>' "$vault_stdout_file" | sed 's/^Api Address: //')
	export VAULT_ADDR
	# If api address is not set, try to get an address from the tcp listener
	[ -n "$VAULT_ADDR" ] || {
		VAULT_ADDR=$(grep -o 'Listener 1: tcp ([^)]\+)' "$vault_stdout_file" | grep -o '\<addr: "[^"]\+"' | sed 's/addr: "/http:\/\//;s/"$//')
		export VAULT_ADDR
	}
}

wait_and_extract_secrets () {
	i=0
	while :; do
		debug "Waiting until unseal keys and root token are available ($((i/10)).$((i%10)) second(s) passed)"

		unseal_keys=$(grep -o '^Unseal Key\( [[:digit:]]\+\)\?: .\+' "$vault_stdout_file" | sed 's/^Unseal Key\( [[:digit:]]\+\)\?: //')
		VAULT_TOKEN=$(grep -o '^\(Initial \)\?Root Token: .\+' "$vault_stdout_file" | sed 's/^\(Initial \)\?Root Token: //')
		export VAULT_TOKEN

		get_vault_addr

		exit_status=$(2>/dev/null cat "$vault_exit_code_file") || true
		[ -n "$exit_status" ] && die "Vault server exited. This is the stdout:\n\033\133;93m%s\033\133m\nAnd this is the stderr:\n\033\133;93m%s\033\133m" "$(sed 's/^/\t/' "$vault_stdout_file")" "$(sed 's/^/\t/' "$vault_stderr_file")"
		{ [ -n "$unseal_keys" ] && [ -n "$VAULT_TOKEN" ] && break; } || true # if these exist, vault is already initialized

		maybe_initialize_vault

		sleep 0.1
		i=$((i+1))
	done
}

just_wait_for_startup () {
	i=0
	while :; do
		debug "Waiting until server has started up ($((i/10)).$((i%10)) second(s) passed)"

		get_vault_addr

		exit_status=$(2>/dev/null cat "$vault_exit_code_file") || true
		[ -n "$exit_status" ] && die "Vault server exited. This is the stdout:\n\033\133;93m%s\033\133m\nAnd this is the stderr:\n\033\133;93m%s\033\133m" "$(sed 's/^/\t/' "$vault_stdout_file")" "$(sed 's/^/\t/' "$vault_stderr_file")"

		if [ -n "$VAULT_ADDR" ]; then
			if printf %s "$VAULT_ADDR" | grep -qF '0.0.0.0'; then
				warn "API address \033\133;93m%s\033\133m contains any-address 0.0.0.0 which works using a linux kernel (goes to loopback), but it might not work on other kernels. Please configure vault's api_addr manually" "$VAULT_ADDR"
			fi

			if grep -qFx '==> Vault server started! Log data will stream in below:' "$vault_stdout_file"; then
				if ! vault status -format=json | jq --exit-status .initialized 1>/dev/null; then
					die "Vault server has started (address \033\133;93m%s\033\133m) but is not initialized yet, but it should be initialized! Something went wrong" "$VAULT_ADDR"
				else
					info "Vault server has started (address \033\133;93m%s\033\133m) and is initialized. Waiting done" "$VAULT_ADDR"
					break
				fi
			fi
		fi

		sleep 0.1
		i=$((i+1))
	done
}

show_secrets () {
	i=1
	while read -r key; do
		info 'Unseal key %d: \033\133;93m%s\033\133;m\n' "$i" "$key"
		i=$((i+1))
	done <<-EOF
	$unseal_keys
	EOF

	info 'Root Token:   \033\133;93m%s\033\133;m\n' "$VAULT_TOKEN"
}

maybe_save_secrets () {
	if [ "$SAVE_UNSEAL_KEYS" = "1" ]; then
		i=1
		while read -r key; do
			printf %s "$key" > "$vault_secrets_path/unseal_key_$i"
			i=$((i+1))
		done <<-EOF
		$unseal_keys
		EOF
	fi

	if [ "$SAVE_ROOT_TOKEN" = "1" ]; then
		printf %s "$VAULT_TOKEN" > "$vault_secrets_path/root_token"
	fi
}

export_environment () {
	info "Extracting environment variables that need to be set"
	debug "Running the following commands through eval:\n\033\133;93m%s\033\133m" "$(grep -o '\$ export [A-Z_]\+=.\+' "$vault_stdout_file" | cut -c3- | sed 's/^/\t\$ /')"
	eval "$(grep -o '\$ export [A-Z_]\+=.\+' "$vault_stdout_file" | cut -c3-)"
	echo "$VAULT_ADDR" > /tmp/vault_addr
}

# NOTE: This procedure would normally NOT be automated, but rather every keyshare-holder would
#       PGP decrypt their keyshare and execute `vault operator unseal` on their machine using their
#       decrypted key (I think). Of course, in the scope of this project, this part is automated and the keyshares
#       are not PGP encrypted.
ensure_unsealed () {
	info "Checking if vault needs to be unsealed"
	if vault status -format=json | jq --exit-status .sealed 1>/dev/null; then
		info "Vault is sealed, trying to unseal it using unseal keys"

		i=1
		while read -r key; do
			debug "Trying to unseal using the %d. key: \033\133;93m%s\033\133;m" "$i" "$key"
			debug "Unseal command output: %s" "$(vault operator unseal -format=json "$key" | jq --compact-output --color-output)"
			i=$((i+1))
		done <<-EOF
		$unseal_keys
		EOF

		info "Double-checking if vault needs to be unsealed"
		if vault status -format=json | jq --exit-status .sealed 1>/dev/null; then
			error "Vault is still sealed after providing all unseal keys. Aborting"
			exit 1
		fi
		info "Vault was successfully unsealed"
	else
		info "Vault is already unsealed"
	fi
}

# Assumes that "vault is sealed" is the last diagnostic. In case it is not,
# a fallback context of 10 lines is supported. If the server produces more than
# 10 lines of output after saying "vault is sealed", it will be force shutdown using SIGKILL.
wait_until_sealed () {
	timeout=$((${1:-5} * 10)) # in seconds, default 5 seconds

	i=0
	while :; do
		debug "Waiting until server says 'vault is sealed' ($((i/10)).$((i%10)) second(s) passed)"
		tail -n 10 "$vault_stderr_file" | jq --raw-output '.["@message"]' | grep -qFx 'vault is sealed' && return 0
		sleep 0.1
		i=$((i+1))
		[ "$i" -gt "$timeout" ] && return 1
	done
}

shutdown_server () {
	warn "Terminating (with SIGTERM) vault server"
	kill %1 || true

	wait_until_sealed 10 && return 0

	# Grace wait
	sleep .2

	warn "Terminating (with SIGKILL) vault server"
	kill -s SIGKILL %1 || true
}

setup_kv_secrets_engine () {
	info "Disabling secrets engine at path '$vault_kv_store_path'"
	1>/dev/null vault secrets disable "$vault_kv_store_path" || die "Could not disable secrets engine at path '$vault_kv_store_path'"
	info "Enabling kv-v2 secrets engine at path '$vault_kv_store_path'"
	1>/dev/null vault secrets enable -path="$vault_kv_store_path" kv-v2 || die "Could not enable kv-v2 secrets engine at path '$vault_kv_store_path'"
}

ensure_env_json () {
	test -e "$vault_env_json" || die "File '$vault_env_json' is missing"
	test -f "$vault_env_json" || die "File '$vault_env_json' is not a regular file"
	test -r "$vault_env_json" || die "File '$vault_env_json' is not readable"
}

populate_kv_secrets () {
	ensure_env_json

	info "Populating key-value secret store with values from env.json"
	while read -r kv_entries; do
		service=$(printf %s "$kv_entries" | cut -d';' -f1)
		json=$(printf %s "$kv_entries" | cut -d';' -f2-)

		debug "Raw JSON: \033\133;93m%s\033\133m" "$(printf %s "$json")"
		# `vault kv put` can also read json from stdin
		debug "KV put command output: %s" "$(printf %s "$json" | vault kv put -format=json -mount="$vault_kv_store_path" "$service" - | jq --compact-output --color-output)"
	done <<-EOF
	$(/replace_json_templates.py "$vault_env_json" | jq --raw-output 'to_entries[]|.key+";"+(.value|tostring)')
	EOF
}

revoke_all_client_tokens () {
	info "Revoking all client (non-root) tokens"
	while read -r accessor; do
		display_name=$(vault token lookup -format=json -accessor "$accessor" | jq --raw-output '.data.display_name')
		policies=$(vault token lookup -format=json -accessor "$accessor" | jq --raw-output '.data.policies[]' | xargs | tr ' ' ',')
		if ! vault token lookup -format=json -accessor "$accessor" | jq --exit-status '.data.policies | index("root")' 1>/dev/null; then
			info "Token with name '$display_name' and policies '$policies' is not a root token, revoking it"
			1>/dev/null vault token revoke -accessor "$accessor"
		else
			info "Token with name '$display_name' and policies '$policies' is a root token, not revoking it"
		fi
	done <<-EOF
	$(vault list -format=json auth/token/accessors | jq --raw-output '.[]')
	EOF
}

get_or_recover_vault_secrets () {
	if [ "$SAVE_UNSEAL_KEYS" = "1" ]; then
		unseal_keys=$(find /vault/secret/ -mindepth 1 -type f -name 'unseal_key_*' -exec sh -c 'cat "$1" && printf "\n"' sh {} \;)
	else
		warn "Unseal keys were not saved. Giving the user $((VAULT_MANUAL_UNSEAL_TIMEOUT)) seconds to unseal vault via the UI"
		i=0
		while vault status -format=json | jq --exit-status .sealed 1>/dev/null; do
			debug "Vault is still sealed ($i seconds passed)"
			sleep 2
			i=$((i + 2))
			[ "$i" -le "${VAULT_MANUAL_UNSEAL_TIMEOUT}" ] || die "User didn't unseal vault in time ($VAULT_MANUAL_UNSEAL_TIMEOUT seconds)"
		done
	fi

	if [ "$SAVE_ROOT_TOKEN" = "1" ]; then
		VAULT_TOKEN=$(cat /vault/secret/root_token)
		export VAULT_TOKEN
	else
		warn "Root token was not saved. Giving the user $((VAULT_MANUAL_UNSEAL_TIMEOUT)) seconds to provide it via TCP"
		warn "at 0.0.0.0:${VAULT_ROOT_TOKEN_EXCHANGE_PORT} (trailing newline required, only first line is considered)"
		warn "%s" 'Hint: With netcat-openbsd, you may do something along the lines of `printf '\''%s\n'\'' "$VAULT_ROOT_TOKEN" | nc -N localhost '"${VAULT_ROOT_TOKEN_EXCHANGE_PORT}"'`'
		warn "Waiting for reply..."
		VAULT_TOKEN=$(timeout "${VAULT_MANUAL_UNSEAL_TIMEOUT}" nc -q0 -lnvp "${VAULT_ROOT_TOKEN_EXCHANGE_PORT}" | head -n 1) || true
		export VAULT_TOKEN

		if vault token lookup -format=json | jq --exit-status '.data.policies | index("root")' 1>/dev/null; then
			info "User provided a valid root token, proceeding"
		else
			die "User provided token \033\133;93m%s\033\133m is not valid/not a root token" "$VAULT_TOKEN"
		fi
	fi
}

get_services () {
	# Ignore those that start with a dot
	<"$vault_env_json" jq --raw-output 'to_entries[].key' | grep -v -- '^\.'
}

create_policies () {
	ensure_env_json

	while read -r service; do
		info "Creating new policy for service \033\133;93m%s\033\133m from file \033\133;93m%s\033\133m" "$service" "/vault/policies/${service}.hcl"
		1>/dev/null vault policy write "$service" "/vault/policies/${service}.hcl" || die "Failed to create policy for service \033\133;93m%s\033\133m" "$service"
	done <<-EOF
	$(get_services)
	EOF
}

create_token_roles () {
	ensure_env_json

	if [ "$WATCH" = "1" ]; then
		token_max_uses=''
		max_ttl='token_explicit_max_ttls=999d'
	else
		token_max_uses='token_num_uses=1'
		max_ttl='token_explicit_max_ttls=30s'
	fi

	while read -r service; do
		info "Determining IP for service \033\133;93m%s\033\133m" "$service"
		allowed_ip=$({ timeout 0.3 ping -q4 -s0 -w1 -W1 -c1 "$service" | grep -o '\([[:digit:]]\+\.\)\{3\}[[:digit:]]\+' | head -n 1; } 2>/dev/null)
		[ -n "$allowed_ip" ] || die "Failed to resolve domain \033\133;93m%s\033\133m to an IP address" "$service"
		debug "Service name resolves to: \033\133;93m%s -> %s\033\133m" "$service" "$allowed_ip"

		info "Creating new role for service \033\133;93m%s\033\133m" "$service"
		1>/dev/null vault write auth/token/roles/"$service" \
			allowed_entity_aliases="$service"               \
			allowed_policies="$service"                     \
			orphan=true                                     \
			renewable=false                                 \
			role_name="$service"                            \
			token_bound_cidrs="$allowed_ip"/32              \
			token_no_default_policy=true                    \
			$max_ttl                                        \
			$token_max_uses
	done <<-EOF
	$(get_services)
	EOF
}

create_and_share_client_tokens () {
	ensure_env_json

	while read -r service; do
		info "Creating new client token for service \033\133;93m%s\033\133m with role \033\133;93m%s\033\133m and with policy \033\133;93m%s\033\133m" "$service" "$service" "$service"
		vault token create -role="$service" -policy="$service" -format=json | jq --raw-output '.auth.client_token' > "$token_exchange_dir/${service}_vault_token"
		test -s "$token_exchange_dir/${service}_vault_token" || die "File \033\133;93m%s\033\133m is empty!" "$token_exchange_dir/${service}_vault_token"
		debug "%s token contents: \033\133;93m%s\033\133m" "$service" "$(cat "$token_exchange_dir/${service}_vault_token")"
	done <<-EOF
	$(get_services)
	EOF
}

main () {
	if [ "$WATCH" = "1" ]; then
		warn "Watch mode is ON. Service tokens will NOT expire to make hot reloading work"
	else
		info "Watch mode is OFF. Service tokens will be one-time-use"
	fi

	echo 0 > /tmp/vault_started
	if is_initialized; then
		info "Vault storage backend has files in it. Not re-initializing vault"

		start_server_in_bg
		just_wait_for_startup
		get_or_recover_vault_secrets
		export_environment
		ensure_unsealed
		revoke_all_client_tokens
		create_and_share_client_tokens
	else
		info "Vault storage backend is empty. Initializing vault"

		start_server_in_bg
		wait_and_extract_secrets
		show_secrets
		maybe_save_secrets
		export_environment
		ensure_unsealed
		setup_kv_secrets_engine
		populate_kv_secrets

		revoke_all_client_tokens
		create_policies
		create_token_roles
		create_and_share_client_tokens
		#shutdown_server # For debugging
	fi
	echo 1 > /tmp/vault_started
	tail -F "$vault_stdout_file" "$vault_stderr_file"
}

main "$@"

