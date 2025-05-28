#!/bin/sh

set -e
set -u

exec wget --no-verbose --tries=1 --spider "http://localhost:12345/caddy_health"
