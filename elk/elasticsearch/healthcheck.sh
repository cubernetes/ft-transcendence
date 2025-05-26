#!/bin/sh

set -e
set -u

: "${ELASTIC_USER:?Missing ELASTIC_USER}"
: "${ELASTIC_PASSWORD:?Missing ELASTIC_PASSWORD}"
: "${ELASTICSEARCH_PORT:?Missing ELASTICSEARCH_PORT}"

TERM=linux exec setsid -f watch -xtcn5 curl \
		--no-progress-meter \
		--insecure \
		--user "${ELASTIC_USER}:${ELASTIC_PASSWORD}" \
		--fail \
		--write-out '%output{/tmp/healthcheck}%{exitcode}' \
		"https://localhost:${ELASTICSEARCH_PORT}/_cluster/health" 1>/dev/null 2>&1
