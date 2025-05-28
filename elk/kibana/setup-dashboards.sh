#!/bin/bash

# Wait for Kibana to be fully operational
echo "Waiting for Kibana to be fully operational..."
while ! curl --no-progress-meter "http://kibana:${KIBANA_PORT}/api/status" | grep -q '"overall":{"level":"available"'; do
  echo "Kibana is not yet fully available - waiting..."
  sleep 10
done

# Try to authenticate and import dashboards
echo "Kibana is fully operational. Importing dashboards..."

# Import dashboards
for dashboard in /usr/share/kibana/dashboards/*.ndjson; do
  echo "Importing dashboard: $(basename -- "$dashboard")"
  response=$(curl "http://kibana:${KIBANA_PORT}/api/saved_objects/_import?overwrite=true" \
    --user "${KIBANA_USER}:${KIBANA_PASSWORD}" \
    --header "kbn-xsrf: true" \
    --form "file=@$dashboard" \
    --verbose \
    --write-out "\n%{http_code}")
  
  echo "Response for $(basename -- "$dashboard"):"
  echo "$response"
  echo "---"
done

printf '\n---\n%s\n---\n' "Dashboard import completed. Check Kibana UI to verify."
