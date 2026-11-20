FROM node:22-slim AS base

# Stage 1: Install dependencies (Debian glibc ensures @libsql native bindings match)
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build standalone Next.js production app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Minimal production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="file:/app/data/cms.db"

RUN mkdir -p /app/data .next

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Explicitly include platform-specific @libsql native binaries for Linux x64/arm64
COPY --from=deps /app/node_modules/@libsql ./node_modules/@libsql

EXPOSE 3001

CMD ["node", "server.js"]
