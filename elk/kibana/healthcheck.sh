#!/bin/sh

set -e
set -u

: "${KIBANA_PORT:?Missing KIBANA_PORT}"

exec curl --fail "http://localhost:${KIBANA_PORT}/api/status"
