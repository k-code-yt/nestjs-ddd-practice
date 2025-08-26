#!/bin/bash

echo "Setting up Debezium CDC for payments and orders tables..."

# Wait for services to be ready
echo "Waiting for PostgreSQL to be ready..."
until docker exec nest-ddd-pratice-postgres-1 pg_isready -h localhost -p 5432 -U user; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "Waiting for Kafka Connect to be ready..."
until curl -f http://localhost:8083/connectors; do
  echo "Kafka Connect is unavailable - sleeping"
  sleep 5
done

# Set up replica identity for existing tables (matching your TypeORM entities)
echo "Setting up database schema for CDC..."
docker exec -i nest-ddd-pratice-postgres-1 psql -U user -d db << EOF
SELECT schemaname, tablename, relreplident 
FROM pg_tables t 
JOIN pg_class c ON c.relname = t.tablename 
WHERE schemaname = 'public' 
AND tablename IN ('payments', 'orders');
EOF

# Register the Debezium connector
echo "Registering Debezium connector..."
curl -X POST http://localhost:8083/connectors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "payments-orders-connector",
	"config": {
		"connector.class": "io.debezium.connector.postgresql.PostgresConnector",
		"database.hostname": "nest-ddd-pratice-postgres-1",
		"database.port": "5432",
		"database.user": "user",
		"database.password": "pass",
		"database.dbname": "saga_test",
		"database.server.name": "ecommerce",
		"table.include.list": "public.payments,public.orders",
		"plugin.name": "pgoutput",
		"publication.autocreate.mode": "filtered",
		"schema.include.list": "public",
		"topic.prefix": "ecommerce",
		"key.converter": "org.apache.kafka.connect.json.JsonConverter",
		"value.converter": "org.apache.kafka.connect.json.JsonConverter",
		"key.converter.schemas.enable": "false",
		"value.converter.schemas.enable": "false",
		"include.schema.changes": "true",
		"decimal.handling.mode": "string",
		"snapshot.mode": "never",
		"skipped.operations": "r",
		"transforms": "route",
		"transforms.route.type": "org.apache.kafka.connect.transforms.RegexRouter",
		"transforms.route.regex": "([^.]+)\\.([^.]+)\\.([^.]+)",
		"transforms.route.replacement": "$3"
	}
  }'

echo ""
echo "Setup complete! Your Kafka topics will be:"
echo "  - payments (for payments table changes)"
echo "  - orders (for orders table changes)"
echo ""
echo "Check connector status with:"
echo "curl http://localhost:8083/connectors/payments-orders-connector/status"
echo ""
echo "View topics in Kafdrop at: http://localhost:9000"