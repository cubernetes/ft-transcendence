#!/bin/bash

set -e

# Set up permissions for certificates directory
CERTS_DIR="/usr/share/elasticsearch/config/certs"

chown -R elasticsearch:elasticsearch "$CERTS_DIR"
chmod -R 770 "$CERTS_DIR"

# Export all environment variables
export ELASTIC_PASSWORD
export LOGSTASH_USER
export LOGSTASH_PASSWORD
export KIBANA_USER
export KIBANA_PASSWORD
export ELASTIC_KEYSTORE_PASS

# Checking if certificates exist
su - elasticsearch -c "export ELASTIC_PASSWORD='$ELASTIC_PASSWORD' && export LOGSTASH_USER='$LOGSTASH_USER' && export LOGSTASH_PASSWORD='$LOGSTASH_PASSWORD' && export KIBANA_USER='$KIBANA_USER' && export KIBANA_PASSWORD='$KIBANA_PASSWORD' && export ELASTIC_KEYSTORE_PASS='$ELASTIC_KEYSTORE_PASS' && /usr/share/elasticsearch/config/generate-certs.sh"

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
su - elasticsearch -c "export ELASTIC_PASSWORD='$ELASTIC_PASSWORD' && export LOGSTASH_USER='$LOGSTASH_USER' && export LOGSTASH_PASSWORD='$LOGSTASH_PASSWORD' && export KIBANA_USER='$KIBANA_USER' && export KIBANA_PASSWORD='$KIBANA_PASSWORD' && export ELASTIC_KEYSTORE_PASS='$ELASTIC_KEYSTORE_PASS' && /usr/share/elasticsearch/setup-single-node.sh" 