#!/bin/sh

set -e
set -u

: "${BACKEND_PORT:?Missing BACKEND_PORT}"

exec curl --fail "http://localhost:${BACKEND_PORT}/healthcheck"
