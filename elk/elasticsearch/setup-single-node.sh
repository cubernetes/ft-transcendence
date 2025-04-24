#!/bin/bash
set -e

ELASTIC_PASSWORD="${ELASTIC_PASSWORD:?Missing ELASTIC_PASSWORD}"
KIBANA_USER="${KIBANA_USER:?Missing KIBANA_USER}"
KIBANA_PASSWORD="${KIBANA_PASSWORD:?Missing KIBANA_PASSWORD}"
LOGSTASH_USER="${LOGSTASH_USER:?Missing LOGSTASH_USER}"
LOGSTASH_PASSWORD="${LOGSTASH_PASSWORD:?Missing LOGSTASH_PASSWORD}"


# Start Elasticsearch in the background
echo "Starting Elasticsearch..."
/usr/local/bin/docker-entrypoint.sh eswrapper &

# Wait for Elasticsearch to be ready
echo "Waiting for Elasticsearch to be ready..."
until curl -s http://localhost:9200/ > /dev/null; do
  echo "Waiting for Elasticsearch..."
  sleep 5
done

# Try to authenticate with the bootstrap password
echo "Checking if Elasticsearch is ready with authentication..."
until curl -s -u elastic:"${ELASTIC_PASSWORD}" "http://localhost:9200/_cluster/health" > /dev/null; do
  echo "Waiting for Elasticsearch security to be ready..."
  sleep 2
done

echo "Creating .env file with credentials..."
cat > /usr/share/elasticsearch/config/.env << EOF
ELASTIC_PASSWORD=$ELASTIC_PASSWORD
KIBANA_USER=$KIBANA_USER
KIBANA_PASSWORD=$KIBANA_PASSWORD
LOGSTASH_USER=$LOGSTASH_USER
LOGSTASH_PASSWORD=$LOGSTASH_PASSWORD
KIBANA_ENCRYPTION_KEY=$(openssl rand -hex 32)
EOF

# Create logstash user with write privileges
echo "Creating logstash_writer role and user..."
curl -X POST -u elastic:"${ELASTIC_PASSWORD}" "http://localhost:9200/_security/role/logstash_writer" -H "Content-Type: application/json" -d '
{
  "cluster": ["manage_index_templates", "monitor", "manage_ilm"],
  "indices": [
    {
      "names": ["ft-transcendence-logs-*"],
      "privileges": ["write", "create_index", "manage"]
    }
  ]
}'

curl -X POST -u elastic:"${ELASTIC_PASSWORD}" "http://localhost:9200/_security/user/$LOGSTASH_USER" -H "Content-Type: application/json" -d '
{
  "password": "'"$LOGSTASH_PASSWORD"'",
  "roles": ["logstash_writer"],
  "full_name": "Logstash Writer"
}'

# Run ILM setup
echo "Running index lifecycle management setup..."
curl -X PUT -u elastic:"${ELASTIC_PASSWORD}" "http://localhost:9200/_ilm/policy/ft-transcendence-logs-policy" \
  -H 'Content-Type: application/json' \
  -d @/usr/share/elasticsearch/config/ilm-policy.json

# Create index template with ILM policy
echo "Creating index template with ILM policy..."
curl -X PUT -u elastic:"${ELASTIC_PASSWORD}" "http://localhost:9200/_template/ft-transcendence-logs" \
  -H 'Content-Type: application/json' \
  -d '{
    "index_patterns": ["ft-transcendence-logs-*"],
    "settings": {
      "index.lifecycle.name": "ft-transcendence-logs-policy",
      "index.lifecycle.rollover_alias": "ft-transcendence-logs",
      "number_of_shards": 1,
      "number_of_replicas": 0
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "level": { "type": "keyword" },
        "message": { "type": "text" },
        "log_message": { "type": "text", "fields": { "keyword": { "type": "keyword", "ignore_above": 256 } } },
        "tags": { "type": "keyword" },
        "hostname": { "type": "keyword" },
        "userId": { "type": "long" },
        "gameId": { "type": "keyword" },
        "service": { "type": "keyword" }
      }
    }
  }'

# Create initial index
echo "Creating initial index..."
curl -X PUT -u elastic:"${ELASTIC_PASSWORD}" "http://localhost:9200/%3Cft-transcendence-logs-%7Bnow%2Fd%7D-000001%3E" \
  -H 'Content-Type: application/json' \
  -d '{
    "aliases": {
      "ft-transcendence-logs": {
        "is_write_index": true
      }
    }
  }'

# Create Kibana user
echo "Creating Kibana user..."
curl -X POST -u elastic:"${ELASTIC_PASSWORD}" "http://localhost:9200/_security/user/$KIBANA_USER" -H "Content-Type: application/json" -d '
{
  "password": "'"$KIBANA_PASSWORD"'",
  "roles": ["kibana_system"],
  "full_name": "Kibana User"
}'

echo "Elasticsearch setup complete!"

# Keep container running
wait