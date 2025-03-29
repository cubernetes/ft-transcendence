#!/bin/sh

export VAULT_ADDR=$(cat /tmp/vault_addr)
vault_started=$(cat /tmp/vault_started)

if ! vault status -format=json | jq --exit-status .sealed 1>/dev/null && \
	[ "$vault_started" = "1" ]; then
	exit 0 # Healthy since it's started and not sealed
fi

exit 1
