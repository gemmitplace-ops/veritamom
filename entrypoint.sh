#!/bin/sh
set -e

echo "Running database migrations..."
node ./node_modules/.bin/prisma db push --schema=prisma/schema.prisma --skip-generate

echo "Starting server..."
exec node server.js
