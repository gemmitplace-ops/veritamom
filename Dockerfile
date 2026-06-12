# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Pass --build-arg CACHEBUST=$(date +%s) to invalidate schema/source from here
ARG CACHEBUST=1
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code and public assets
COPY . .
RUN mkdir -p /app/public

# Build the app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN NODE_OPTIONS="--max-old-space-size=1800" NEXT_TELEMETRY_DISABLED=1 npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache python3 make g++

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built output
RUN mkdir -p ./public
COPY --from=builder /app/public/ ./public/
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
# The compose volume mounts over /app/prisma and shadows schema.prisma with the
# first-deploy copy. Keep a fresh schema outside the volume for entrypoint's db push.
COPY --from=builder /app/prisma/schema.prisma ./schema.prisma
COPY --from=builder /app/messages ./messages
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=builder /app/node_modules/@prisma/adapter-better-sqlite3 ./node_modules/@prisma/adapter-better-sqlite3
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Copy entrypoint
COPY entrypoint.sh ./entrypoint.sh

# Create data directory for SQLite and pre-create db file with correct ownership
RUN mkdir -p /app/prisma && touch /app/prisma/prod.db && chown -R nextjs:nodejs /app && chmod +x /app/entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/bin/sh", "/app/entrypoint.sh"]
