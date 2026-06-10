#!/bin/sh
# Ensure database file is writable by the nextjs user
if [ -f /app/prisma/prod.db ]; then
  chmod 664 /app/prisma/prod.db 2>/dev/null || true
fi
exec node server.js
