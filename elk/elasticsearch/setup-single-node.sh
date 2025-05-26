#!/bin/bash

set -e
#set -vx

: "${ELASTIC_PASSWORD:?Missing ELASTIC_PASSWORD}"
: "${ELASTICSEARCH_PORT:?Missing ELASTICSEARCH_PORT}"
: "${KIBANA_USER:?Missing KIBANA_USER}"
: "${KIBANA_PASSWORD:?Missing KIBANA_PASSWORD}"
: "${LOGSTASH_USER:?Missing LOGSTASH_USER}"
: "${LOGSTASH_PASSWORD:?Missing LOGSTASH_PASSWORD}"
: "${ELASTIC_USER:?Missing ELASTIC_USER}" # MUST be "elastic"! https://discuss.elastic.co/t/how-to-change-the-username-by-own-instead-of-elastic/337552/2

# Used in elasticsearch.yml, and the elasticsearch entrypoint is called below:
: "${ELASTICSEARCH_HOST:?Missing ELASTICSEARCH_HOST}"

# Start Elasticsearch in the background
/usr/local/bin/docker-entrypoint.sh eswrapper &
ES_PID=$!

# Wait for Elasticsearch to start
i=0
until echo "Waiting for Elasticsearch to start ($i seconds passed)..."; curl --silent --insecure --user "${ELASTIC_USER}:${ELASTIC_PASSWORD}" --fail "https://localhost:${ELASTICSEARCH_PORT}/_cluster/health"; do
    sleep 5
	i=$((i + 5))
done

# Create users and set up security
echo "Setting up users and security..."

# Create logstash user
curl --no-progress-meter --insecure "https://localhost:${ELASTICSEARCH_PORT}/_security/user/${LOGSTASH_USER}" --header 'Content-Type: application/json' --user "${ELASTIC_USER}:${ELASTIC_PASSWORD}" --data '{
  "password" : "'"${LOGSTASH_PASSWORD}"'",
  "roles" : [ "superuser" ],
  "full_name" : "Logstash User"
}'

# Create kibana user with both superuser and kibana_system roles
curl --no-progress-meter --insecure "https://localhost:${ELASTICSEARCH_PORT}/_security/user/${KIBANA_USER}" --header 'Content-Type: application/json' --user "${ELASTIC_USER}:${ELASTIC_PASSWORD}" --data '{
  "password" : "'"${KIBANA_PASSWORD}"'",
  "roles" : [ "superuser", "kibana_system" ],
  "full_name" : "Kibana System User"
}'

# Set up ILM policy
curl --no-progress-meter --insecure -X PUT "https://localhost:${ELASTICSEARCH_PORT}/_ilm/policy/logs" --header 'Content-Type: application/json' --user "${ELASTIC_USER}:${ELASTIC_PASSWORD}" --data "@/usr/share/elasticsearch/config/ilm-policy.json"

# Wait for the original Elasticsearch process
wait $ES_PID

echo -e "\nElasticsearch setup complete!"
