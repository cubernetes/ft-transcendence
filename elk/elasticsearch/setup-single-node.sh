#!/bin/bash
set -e

: "${ELASTIC_PASSWORD:?Missing ELASTIC_PASSWORD}"
: "${ELASTICSEARCH_PORT:?Missing ELASTICSEARCH_PORT}"
: "${KIBANA_USER:?Missing KIBANA_USER}"
: "${KIBANA_PASSWORD:?Missing KIBANA_PASSWORD}"
: "${LOGSTASH_USER:?Missing LOGSTASH_USER}"
: "${LOGSTASH_PASSWORD:?Missing LOGSTASH_PASSWORD}"

# Start Elasticsearch in the background
/usr/local/bin/docker-entrypoint.sh eswrapper &
ES_PID=$!

# Wait for Elasticsearch to start
echo "Waiting for Elasticsearch to start..."
until curl --silent --insecure --user "elastic:${ELASTIC_PASSWORD}" --fail "https://localhost:9200/_cluster/health"; do
    sleep 5
done

# Create users and set up security
echo "Setting up users and security..."

# Create logstash user
curl --insecure "https://localhost:9200/_security/user/${LOGSTASH_USER}" --header 'Content-Type: application/json' --user "elastic:${ELASTIC_PASSWORD}" --data '{
  "password" : "'"${LOGSTASH_PASSWORD}"'",
  "roles" : [ "superuser" ],
  "full_name" : "Logstash User"
}'

# Create kibana user with both superuser and kibana_system roles
curl --insecure "https://localhost:9200/_security/user/${KIBANA_USER}" --header 'Content-Type: application/json' --user "elastic:${ELASTIC_PASSWORD}" --data '{
  "password" : "'"${KIBANA_PASSWORD}"'",
  "roles" : [ "superuser", "kibana_system" ],
  "full_name" : "Kibana System User"
}'

# Set up ILM policy
curl --insecure -X PUT "https://localhost:9200/_ilm/policy/logs" --header 'Content-Type: application/json' --user "elastic:${ELASTIC_PASSWORD}" --data "@/usr/share/elasticsearch/config/ilm-policy.json"

# Wait for the original Elasticsearch process
wait $ES_PID

echo "\nElasticsearch setup complete!"
