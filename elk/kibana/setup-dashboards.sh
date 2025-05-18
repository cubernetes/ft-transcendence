#!/bin/bash

# Wait for Kibana to be fully operational
echo "Waiting for Kibana to be fully operational..."
while ! curl --no-progress-meter "http://kibana:5601/api/status" | grep -q '"overall":{"level":"available"'; do
  echo "Kibana is not yet fully available - waiting..."
  sleep 10
done

# Try to authenticate and import dashboards
echo "Kibana is fully operational. Importing dashboards..."

# Import dashboards
for dashboard in /usr/share/kibana/dashboards/*.ndjson; do
  echo "Importing dashboard: $(basename -- "$dashboard")"
  curl "http://kibana:5601/api/saved_objects/_import" \
    --user "${KIBANA_USER}:${KIBANA_PASSWORD}" \
    --header "kbn-xsrf: true" \
    --form "file=@$dashboard" \
    --verbose
done

echo "Dashboard import completed. Check Kibana UI to verify."
