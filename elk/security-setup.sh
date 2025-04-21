#!/bin/bash

set -e

# Wait for Elasticsearch to start
echo "Waiting for Elasticsearch to start..."
until curl -s --head --fail http://elasticsearch:9200 > /dev/null; do
    echo "Waiting for Elasticsearch..."
    sleep 5
done

# Generate certificates
elasticsearch-certutil cert --out /usr/share/elasticsearch/config/certs/elastic-certificates.p12 --pass ""

# Set permissions on certificate file
chown elasticsearch:elasticsearch /usr/share/elasticsearch/config/certs/elastic-certificates.p12

# Set bootstrap password
echo "Setting up passwords..."
(
echo "y" # Auto-generate elastic password
echo "y" # Auto-generate apm_system password
echo "y" # Auto-generate kibana_system password
echo "y" # Auto-generate logstash_system password
echo "y" # Auto-generate beats_system password
echo "y" # Auto-generate remote_monitoring_user password
) | elasticsearch-setup-passwords auto -b > /tmp/elasticsearch_passwords.txt

# Extract passwords from the output
ELASTIC_PASSWORD=$(grep "PASSWORD elastic" /tmp/elasticsearch_passwords.txt | awk '{print $4}')
KIBANA_PASSWORD=$(grep "PASSWORD kibana_system" /tmp/elasticsearch_passwords.txt | awk '{print $4}')
LOGSTASH_SYSTEM_PASSWORD=$(grep "PASSWORD logstash_system" /tmp/elasticsearch_passwords.txt | awk '{print $4}')

# Create .env file with passwords
cat > /usr/share/elasticsearch/config/.env << EOF
ELASTIC_PASSWORD=$ELASTIC_PASSWORD
KIBANA_PASSWORD=$KIBANA_PASSWORD
LOGSTASH_MONITORING_PASSWORD=$LOGSTASH_SYSTEM_PASSWORD
KIBANA_ENCRYPTION_KEY=$(openssl rand -hex 32)
EOF

# Create logstash user with write privileges
curl -X POST -u elastic:$ELASTIC_PASSWORD "http://elasticsearch:9200/_security/user/logstash_writer" -H "Content-Type: application/json" -d '
{
  "password": "'"$LOGSTASH_SYSTEM_PASSWORD"'",
  "roles": ["logstash_writer"],
  "full_name": "Logstash Writer"
}
'

# Create logstash_writer role
curl -X POST -u elastic:$ELASTIC_PASSWORD "http://elasticsearch:9200/_security/role/logstash_writer" -H "Content-Type: application/json" -d '
{
  "cluster": ["manage_index_templates", "monitor", "manage_ilm"],
  "indices": [
    {
      "names": ["ft-transcendence-logs-*"],
      "privileges": ["write", "create_index", "manage"]
    }
  ]
}
'

echo "Security setup completed successfully!"
echo "Passwords have been saved to /usr/share/elasticsearch/config/.env"