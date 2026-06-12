#!/bin/sh

# Ensure database file is writable by the nextjs user
if [ -f /app/prisma/prod.db ]; then
  chmod 664 /app/prisma/prod.db 2>/dev/null || true
fi

# Sync schema to database (creates new tables, safe for existing data).
# Notes:
# - The volume mounted at /app/prisma shadows the schema.prisma baked into the
#   image, so we read the schema from /app/schema.prisma instead.
# - Prisma 7 removed --skip-generate and reads the datasource URL from
#   prisma.config.ts (not in this image), so the URL is passed explicitly.
# - Do NOT silence output: if this fails, API routes hit missing tables.
echo "[entrypoint] syncing database schema..."
node_modules/.bin/prisma db push \
  --schema=/app/schema.prisma \
  --url="${DATABASE_URL:-file:/app/prisma/prod.db}" \
  --accept-data-loss || echo "[entrypoint] WARNING: prisma db push FAILED — database schema may be out of date"

exec node server.js
