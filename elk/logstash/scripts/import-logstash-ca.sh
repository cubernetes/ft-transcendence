#!/bin/bash

#set -vx

# Healthcheck background service (because only this process has access to the environment
# and an external healthcheck would need access to those, which is not intended)
TERM=linux setsid -f watch -xtcn5 curl \
	--no-progress-meter \
	--fail \
	--write-out '%output{/tmp/healthcheck}%{exitcode}' \
	"http://localhost:${LOGSTASH_API_PORT:-9600}/_node/stats" 1>/dev/null 2>&1

# Path to the CA cert inside the container
CA_CERT_PATH="/etc/logstash/config/certs/ca.crt"
# Alias for the cert in the truststore
CA_ALIAS="elasticsearch-ca"
# Path to the JVM truststore (default for Logstash official images)
TRUSTSTORE_PATH="/usr/share/logstash/jdk/lib/security/cacerts"

KEYTOOL="/usr/share/logstash/jdk/bin/keytool"
# Default truststore password
STOREPASS="generic_password"

if [ ! -f "$CA_CERT_PATH" ]; then
  echo "CA certificate not found at $CA_CERT_PATH"
  exit 1
fi

if [ ! -f "$TRUSTSTORE_PATH" ]; then
  echo "Truststore not found at $TRUSTSTORE_PATH"
  exit 1
fi

# Check if already imported
$KEYTOOL -list -keystore "$TRUSTSTORE_PATH" -storepass "$STOREPASS" -alias "$CA_ALIAS" > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "CA already imported."
else
  echo "Importing CA certificate..."
  $KEYTOOL -import -trustcacerts -alias "$CA_ALIAS" -file "$CA_CERT_PATH" -keystore "$TRUSTSTORE_PATH" -storepass "$STOREPASS" -noprompt
  echo "CA imported."
fi
