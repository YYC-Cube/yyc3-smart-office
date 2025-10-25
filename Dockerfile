# Multi-stage Dockerfile for Next.js (App Router)

# ---- Builder ----
FROM node:20-alpine AS builder

ENV NODE_ENV=production
WORKDIR /app

# Enable corepack and pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Install deps
COPY pnpm-lock.yaml package.json .npmrc ./
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build Next.js standalone output
RUN pnpm build

# ---- Runner ----
FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

# System deps (optional)
RUN apk add --no-cache curl

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Healthcheck (calls /api/health)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -fs http://localhost:${PORT}/api/health || exit 1

EXPOSE 3000
CMD ["node", "server.js"]
