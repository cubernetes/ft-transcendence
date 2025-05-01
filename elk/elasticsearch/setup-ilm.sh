#!/bin/bash

set -e

# Wait for Elasticsearch to be available
echo "Waiting for Elasticsearch to be available..."
until curl --silent http://elasticsearch:9200/_cluster/health | grep -q '"status":"green"\|"status":"yellow"'; do
  echo "Elasticsearch is unavailable - waiting"
  sleep 5
done

# Apply ILM policy
echo "Creating Index Lifecycle Management policy..."
curl -X PUT "http://elasticsearch:9200/_ilm/policy/ft-transcendence-logs-policy" \
  --header 'Content-Type: application/json' \
  --data "@/usr/share/elasticsearch/config/ilm-policy.json"

# Create index template with ILM policy
echo "Creating index template with ILM policy..."
curl -X PUT "http://elasticsearch:9200/_template/ft-transcendence-logs" \
  --header 'Content-Type: application/json' \
  --data '{
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
curl -X PUT "http://elasticsearch:9200/%3Cft-transcendence-logs-%7Bnow%2Fd%7D-000001%3E" \
  --header 'Content-Type: application/json' \
  --data '{
    "aliases": {
      "ft-transcendence-logs": {
        "is_write_index": true
      }
    }
  }'

echo "Index Lifecycle Management setup complete!"
