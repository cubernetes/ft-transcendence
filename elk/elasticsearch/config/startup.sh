#!/bin/bash

set -e

# Set up permissions for certificates directory
CERTS_DIR="/usr/share/elasticsearch/config/certs"

chown -R elasticsearch:elasticsearch "$CERTS_DIR"
chmod -R 770 "$CERTS_DIR"

# Checking if certificates exist
su  --whitelist-environment='ELASTIC_PASSWORD,LOGSTASH_USER,LOGSTASH_PASSWORD,KIBANA_USER,KIBANA_PASSWORD,ELASTIC_KEYSTORE_PASS' \
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
su  --whitelist-environment='ELASTIC_PASSWORD,LOGSTASH_USER,LOGSTASH_PASSWORD,KIBANA_USER,KIBANA_PASSWORD,ELASTIC_KEYSTORE_PASS' \
    --command="/usr/share/elasticsearch/setup-single-node.sh" \
    --login \
    elasticsearch
