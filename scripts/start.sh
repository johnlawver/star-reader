#!/bin/bash
set -e

# Start the Next.js server immediately so health checks pass
node .next/standalone/server.js &
SERVER_PID=$!

# Run migrations concurrently
npx drizzle-kit migrate
MIGRATE_STATUS=$?

if [ $MIGRATE_STATUS -ne 0 ]; then
  echo "Migrations failed — stopping server"
  kill $SERVER_PID
  exit 1
fi

echo "Migrations complete"
wait $SERVER_PID
