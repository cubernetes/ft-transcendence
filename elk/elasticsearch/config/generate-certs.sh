#!/bin/bash

# Exit on error
set -e

CERTS_DIR="/usr/share/elasticsearch/config/certs"
KEYSTORE_PASSWORD=${ELASTIC_KEYSTORE_PASS:-changeme}

# Create certs directory if it doesn't exist and set proper permissions
mkdir -p "$CERTS_DIR"
chown -R elasticsearch:elasticsearch "$CERTS_DIR"
chmod -R 770 "$CERTS_DIR"

# Check if certificates already exist
if [ ! -f "$CERTS_DIR/elastic-certificates.p12" ]; then
    echo "Generating SSL certificates..."
    
    # Generate CA
    /usr/share/elasticsearch/bin/elasticsearch-certutil ca \
        --out "$CERTS_DIR/elastic-stack-ca.p12" \
        --pass "$KEYSTORE_PASSWORD" \
        --silent

    # Generate certificates
    /usr/share/elasticsearch/bin/elasticsearch-certutil cert \
        --ca "$CERTS_DIR/elastic-stack-ca.p12" \
        --ca-pass "$KEYSTORE_PASSWORD" \
        --out "$CERTS_DIR/elastic-certificates.p12" \
        --pass "$KEYSTORE_PASSWORD" \
        --silent

    echo "SSL certificates generated successfully"
else
    echo "SSL certificates already exist"
fi

# Set proper permissions on generated files
chown -R elasticsearch:elasticsearch "$CERTS_DIR"
chmod -R 660 "$CERTS_DIR"/* 