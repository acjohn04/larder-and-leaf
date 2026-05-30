FROM node:22-slim AS base
# Install OpenSSL for Prisma and SQLite dependencies
RUN apt-get update -y && apt-get install -y openssl

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Set a dummy DATABASE_URL for build if needed by prisma generate
ENV DATABASE_URL="file:./dummy.db"
# Set dummy API key to pass Next.js build-time environment variable validation
ENV GEMINI_API_KEY="dummy_key_for_build"
# NEXT_PUBLIC_ vars are inlined at build time — accept the value as a build arg
ARG NEXT_PUBLIC_DEMO_MODE=false
ENV NEXT_PUBLIC_DEMO_MODE=$NEXT_PUBLIC_DEMO_MODE
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/app/data/dev.db"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create a data directory for the SQLite database
# The volume should be mounted to /app/data
RUN mkdir -p /app/data

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Next.js standalone output often fails to bundle native C++ modules
COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
# Copy prisma directory for database pushes/migrations
COPY --from=builder /app/prisma ./prisma
# Copy prisma config so the CLI knows where the DB is
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Install prisma CLI and config dependencies to evaluate prisma.config.ts
RUN npm install prisma dotenv typescript ts-node

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# We use db push instead of migrate deploy because we don't have migrations yet
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node server.js"]
