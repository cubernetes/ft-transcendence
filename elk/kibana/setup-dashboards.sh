#!/bin/bash

# Wait for Kibana to be available
echo "Waiting for Kibana to be available..."
until curl -s -u elastic:$ELASTIC_PASSWORD http://kibana:5601/api/status | grep '"overall":{"level":"available"'; do
  echo "Kibana is unavailable - waiting"
  sleep 10
done

# Create index pattern
echo "Creating index pattern..."
curl -X POST "http://kibana:5601/api/saved_objects/index-pattern/ft-transcendence-logs-*" \
  -u elastic:$ELASTIC_PASSWORD \
  -H 'kbn-xsrf: true' \
  -H 'Content-Type: application/json' \
  -d '{"attributes":{"title":"ft-transcendence-logs-*","timeFieldName":"@timestamp"}}'

# Import dashboards
echo "Importing dashboards..."

# Application Overview dashboard
curl -X POST "http://kibana:5601/api/saved_objects/_import" \
  -u elastic:$ELASTIC_PASSWORD \
  -H "kbn-xsrf: true" \
  --form file=@/kibana/dashboards/app-overview-dashboard.ndjson

# Game Activity dashboard
curl -X POST "http://kibana:5601/api/saved_objects/_import" \
  -u elastic:$ELASTIC_PASSWORD \
  -H "kbn-xsrf: true" \
  --form file=@/kibana/dashboards/game-activity-dashboard.ndjson

# User Activity dashboard
curl -X POST "http://kibana:5601/api/saved_objects/_import" \
  -u elastic:$ELASTIC_PASSWORD \
  -H "kbn-xsrf: true" \
  --form file=@/kibana/dashboards/user-activity-dashboard.ndjson

# Error Tracking dashboard
curl -X POST "http://kibana:5601/api/saved_objects/_import" \
  -u elastic:$ELASTIC_PASSWORD \
  -H "kbn-xsrf: true" \
  --form file=@/kibana/dashboards/error-tracking-dashboard.ndjson

echo "Setup complete!"