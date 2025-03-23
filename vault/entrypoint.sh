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

debug "Creating /vault/file/ directory"
mkdir /vault/ /vault/file/

start_server () {
	#vault server -config=/vault/config/config.hcl
	info "Starting vault server in background job"

	1>~/vault-server-stdout \
	2>~/vault-server-stderr \
	vault server -log-format=json -dev &
}

wait_and_extract_secrets () {
	i=0
	while :; do
		debug "Waiting until unseal keys and root token are available ($((i/10)).$((i%10)) second(s) passed)"
		unseal_keys=$(grep -o '^Unseal Key: .\+' ~/vault-server-stdout | sed 's/^Unseal Key: //')
		root_token=$(grep -o '^Root Token: .\+' ~/vault-server-stdout | sed 's/^Root Token: //')
		[ -n "$unseal_keys" ] && [ -n "$root_token" ] && break
		sleep 0.1
		i=$((i+1))
	done
}

show_secrets () {
	i=1
	while read -r; do
		info 'Unseal key %d: \033\133;93m%s\033\133;m\n' "$i" "$REPLY"
		i=$((i+1))
	done <<-EOF
	$unseal_keys
	EOF

	info 'Root Token:   \033\133;93m%s\033\133;m\n' "$root_token"
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
		while read -r; do
			debug "Trying to unseal using the %d. key: \033\133;93m%s\033\133;m" "$i" "$REPLY"
			debug "Unseal command output: %s" "$(vault operator unseal -format=json "$REPLY" | jq --compact-output --color-output)"
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

shutdown_server () {
	warn "Terminating (with SIGKILL) vault server"
	kill -s SIGKILL %%
}

main () {
	start_server
	wait_and_extract_secrets
	show_secrets
	export_environment
	ensure_unsealed
	shutdown_server
}

main "$@"
