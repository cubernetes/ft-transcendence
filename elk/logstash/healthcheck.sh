#!/bin/sh

set -e
set -u

: "${LOGSTASH_API_PORT:?Missing LOGSTASH_API_PORT}"

exec curl --fail "http://localhost:${LOGSTASH_API_PORT}/_node/stats"
