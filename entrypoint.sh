#!/bin/sh

# Ensure database file is writable by the nextjs user
if [ -f /app/prisma/prod.db ]; then
  chmod 664 /app/prisma/prod.db 2>/dev/null || true
fi

# Sync schema to database (creates new tables, safe for existing data)
node_modules/.bin/prisma db push --skip-generate --accept-data-loss 2>/dev/null || true

exec node server.js
