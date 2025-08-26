
#!/bin/bash

# Start Kafka Connect in background
# /docker-entrypoint.sh start &
# CONNECT_PID=$!

# echo "Waiting for Kafka Connect to be ready..."

# Wait for Kafka Connect to be available
while ! curl -f http://localhost:8083/connectors 2>/dev/null; do
  echo "Kafka Connect is not ready yet, waiting..."
  sleep 5
done

echo "Kafka Connect is ready! Registering connector..."

# Register the Debezium connector
curl -X POST http://localhost:8083/connectors \
  -H "Content-Type: application/json" \
  -d @/opt/kafka/config/debezium-config.json

if [ $? -eq 0 ]; then
  echo "Connector registered successfully!"
else
  echo "Failed to register connector"
fi

# Keep the process running
wait $CONNECT_PID