#!/bin/bash

# Exit on error
set -e
#set -vx

CERTS_DIR="/usr/share/elasticsearch/config/certs"
KEYSTORE_PASSWORD=${ELASTIC_KEYSTORE_PASS}

# Check if certificates already exist
if [ ! -f "$CERTS_DIR/elastic-certificates.p12" ]; then
    echo "Generating SSL certificates..."
    
    # Generate CA
    /usr/share/elasticsearch/bin/elasticsearch-certutil ca \
        --out "$CERTS_DIR/elastic-stack-ca.p12" \
        --pass "$KEYSTORE_PASSWORD" \
        --silent

    # Generate certificates
	elasticsearch_ip=$(hostname -I | grep -o '10\.42\.42\.[[:digit:]]\+' | head -n 1)
    /usr/share/elasticsearch/bin/elasticsearch-certutil cert \
        --ca "$CERTS_DIR/elastic-stack-ca.p12" \
        --ca-pass "$KEYSTORE_PASSWORD" \
        --out "$CERTS_DIR/elastic-certificates.p12" \
        --pass "$KEYSTORE_PASSWORD" \
        --silent \
		--dns elasticsearch \
  		--dns localhost \
  		--ip 127.0.0.1 \
		--ip "$elasticsearch_ip"

    echo "SSL certificates generated successfully"
else
	echo "SSL certificates already exist"
fi

# Always extract the CA certificate (for Logstash)
openssl pkcs12 \
	-in "$CERTS_DIR/elastic-stack-ca.p12" \
	-nokeys \
	-passin pass:"$KEYSTORE_PASSWORD" \
	-out "$CERTS_DIR/ca.crt"
echo "CA certificate extracted successfully"

# Set proper permissions on generated files
chmod -R 644 "$CERTS_DIR"/*
