#!/bin/sh

set -e
set -u
set -m
#set -x

: "${LOGLEVEL:=INFO}"

loglevel_to_num () {
	level=$(printf %s "$1" | tr a-z A-Z)
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
	level=$(printf %s "$1" | tr a-z A-Z)
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
	[ "$(loglevel_to_num "$level")" -gt "$(loglevel_to_num "$LOGLEVEL")" ] && return 0

	printf '[ %b%-5s%b ]: %s\n' "$ansi_color" "$level" "$ansi_reset" "$(printf -- "$@")"
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

debug "Creating /vault/file/ directory"
mkdir -p /vault/file/

start_server_in_bg () {
	info "Starting vault server in background job"

	(
		set +e
		1>~/vault-server-stdout \
		2>~/vault-server-stderr \
		vault server -log-format=json -config=/vault/config/config.hcl
		#vault server -log-format=json -dev

		1>~/vault-server-exit-status echo $?
	) &
}

maybe_initialize_vault () {
	if [ -n "$VAULT_ADDR" ] && \
		if printf %s "$VAULT_ADDR" | grep -qF '0.0.0.0'; then
			warn "API address \033\133;93m%s\033\133m contains any-address 0.0.0.0 which works using a linux kernel (goes to loopback), but it might not work on other kernels. Please configure vault's api_addr manually" "$VAULT_ADDR"
		fi

		grep -qFx '==> Vault server started! Log data will stream in below:' ~/vault-server-stdout && \
		! vault status -format=json | jq --exit-status .initialized 1>/dev/null; then

			info "Vault server has started (address \033\133;93m%s\033\133m) but is not initialized yet. Initializing it" "$VAULT_ADDR"
			# better would be to use -format=json, but then the logic from the loop in the calling function wouldn't find the keys
			vault operator init >> ~/vault-server-stdout
	fi
}

wait_and_extract_secrets () {
	i=0
	while :; do
		debug "Waiting until unseal keys and root token are available ($((i/10)).$((i%10)) second(s) passed)"

		unseal_keys=$(grep -o '^Unseal Key\( [[:digit:]]\+\)\?: .\+' ~/vault-server-stdout | sed 's/^Unseal Key\( [[:digit:]]\+\)\?: //')
		export VAULT_TOKEN=$(grep -o '^\(Initial \)\?Root Token: .\+' ~/vault-server-stdout | sed 's/^\(Initial \)\?Root Token: //')

		export VAULT_ADDR=$(grep -o '\<Api Address: [^[:space:]]\+\>' ~/vault-server-stdout | sed 's/^Api Address: //')
		# If api address is not set, try to get an address from the tcp listener
		[ -n "$VAULT_ADDR" ] || export VAULT_ADDR=$(grep -o 'Listener 1: tcp ([^)]\+)' ~/vault-server-stdout | grep -o '\<addr: "[^"]\+"' | sed 's/addr: "/http:\/\//;s/"$//')

		exit_status=$(2>/dev/null cat ~/vault-server-exit-status) || true
		[ -n "$exit_status" ] && die "Vault server exited. This is the stdout:\n\033\133;93m%s\033\133m\nAnd this is the stderr:\n\033\133;93m%s\033\133m" "$(sed 's/^/\t/' ~/vault-server-stdout)" "$(sed 's/^/\t/' ~/vault-server-stderr)"
		[ -n "$unseal_keys" ] && [ -n "$VAULT_TOKEN" ] && break || true # if these exist, vault is already initialized

		maybe_initialize_vault

		sleep 0.1
		i=$((i+1))
	done
}

show_secrets () {
	i=1
	while read -r key; do
		debug 'Unseal key %d: \033\133;93m%s\033\133;m\n' "$i" "$key"
		i=$((i+1))
	done <<-EOF
	$unseal_keys
	EOF

	debug 'Root Token:   \033\133;93m%s\033\133;m\n' "$VAULT_TOKEN"
}


export_environment () {
	info "Extracting environment variables that need to be set"
	debug "Running the following commands through eval:\n\033\133;93m%s\033\133m" "$(grep -o '\$ export [A-Z_]\+=.\+' ~/vault-server-stdout | cut -c3- | sed 's/^/\t\$ /')"
	eval "$(grep -o '\$ export [A-Z_]\+=.\+' ~/vault-server-stdout | cut -c3-)"
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

# Assumes that 'vault is sealed' is the last diagnostic. In case it is not,
# a fallback context of 10 lines is supported. If the server produces more than
# 10 lines of output after saying 'vault is sealed', it will be force shutdown using SIGKILL.
wait_until_sealed () {
	timeout=$((${1:-5} * 10)) # in seconds, default 5 seconds

	i=0
	while :; do
		debug "Waiting until server says 'vault is sealed' ($((i/10)).$((i%10)) second(s) passed)"
		tail -n 10 ~/vault-server-stderr | jq --raw-output '.["@message"]' | grep -qFx 'vault is sealed' && return 0
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
	info "Disabling secrets engine at path secret/"
	1>/dev/null vault secrets disable secret/ || die "Could not disable secrets engine at path secret/"
	info "Enabling kv-v2 secrets engine at path secret/"
	1>/dev/null vault secrets enable -path=secret/ kv-v2 || die "Could not enable kv-v2 secrets engine at path secret/"
}

populate_kv_secrets () {
	test -e /vault/config/env.json || die "File /vault/config/env.json is missing"
	test -f /vault/config/env.json || die "File /vault/config/env.json is not a regular file"
	test -r /vault/config/env.json || die "File /vault/config/env.json is not readable"
	info "Populating key-value secret store with values from env.json"
	while read -r kv_entries; do
		service=$(printf %s "$kv_entries" | cut -d';' -f1)
		json=$(printf %s "$kv_entries" | cut -d';' -f2-)

		# `vault kv put' can also read json from stdin
		debug "KV put command output: %s" "$(printf %s "$json" | vault kv put -format=json -mount=secret "$service" - | jq --compact-output --color-output)"
	done <<-EOF
	$(/replace_json_templates.py /vault/config/env.json | jq -r 'to_entries[]|.key+";"+(.value|tostring)')
	EOF
}

main () {
	start_server_in_bg
	wait_and_extract_secrets
	show_secrets # TODO: Remove, since not needed
	export_environment
	ensure_unsealed
	setup_kv_secrets_engine
	populate_kv_secrets
	shutdown_server
}

main "$@"
