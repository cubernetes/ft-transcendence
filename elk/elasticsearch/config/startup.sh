#!/bin/bash

set -e

: "${ELASTIC_PASSWORD:?Missing ELASTIC_PASSWORD}"
: "${LOGSTASH_USER:?Missing LOGSTASH_USER}"
: "${LOGSTASH_PASSWORD:?Missing LOGSTASH_PASSWORD}"
: "${KIBANA_USER:?Missing KIBANA_USER}"
: "${KIBANA_PASSWORD:?Missing KIBANA_PASSWORD}"
: "${ELASTIC_KEYSTORE_PASS:?Missing ELASTIC_KEYSTORE_PASS}"
: "${ELASTICSEARCH_PORT:?Missing ELASTICSEARCH_PORT}"

# Set up permissions for certificates directory
CERTS_DIR="/usr/share/elasticsearch/config/certs"

chown -R elasticsearch:elasticsearch "$CERTS_DIR"
chmod -R 770 "$CERTS_DIR"

# Checking if certificates exist
su  --whitelist-environment='ELASTIC_PASSWORD,LOGSTASH_USER,LOGSTASH_PASSWORD,KIBANA_USER,KIBANA_PASSWORD,ELASTIC_KEYSTORE_PASS,ELASTICSEARCH_PORT' \
    --command="/usr/share/elasticsearch/config/generate-certs.sh" \
    --login \
    elasticsearch

# Create elasticsearch.keystore and add the keystore password
if [ ! -f "/usr/share/elasticsearch/config/elasticsearch.keystore" ]; then
    echo "Creating elasticsearch.keystore..."
    su - elasticsearch -c "/usr/share/elasticsearch/bin/elasticsearch-keystore create"
    echo "$ELASTIC_KEYSTORE_PASS" | su - elasticsearch -c "/usr/share/elasticsearch/bin/elasticsearch-keystore add xpack.security.transport.ssl.keystore.secure_password"
    echo "$ELASTIC_KEYSTORE_PASS" | su - elasticsearch -c "/usr/share/elasticsearch/bin/elasticsearch-keystore add xpack.security.transport.ssl.truststore.secure_password"
    echo "$ELASTIC_KEYSTORE_PASS" | su - elasticsearch -c "/usr/share/elasticsearch/bin/elasticsearch-keystore add xpack.security.http.ssl.keystore.secure_password"
    echo "$ELASTIC_KEYSTORE_PASS" | su - elasticsearch -c "/usr/share/elasticsearch/bin/elasticsearch-keystore add xpack.security.http.ssl.truststore.secure_password"
fi

# Run the setup script as elasticsearch user
su  --whitelist-environment='ELASTIC_PASSWORD,LOGSTASH_USER,LOGSTASH_PASSWORD,KIBANA_USER,KIBANA_PASSWORD,ELASTIC_KEYSTORE_PASS,ELASTICSEARCH_PORT' \
    --command="/usr/share/elasticsearch/setup-single-node.sh" \
    --login \
    elasticsearch
