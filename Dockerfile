# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./
# Copy workspace package manifests
COPY apps/web/package.json ./apps/web/
COPY packages/react-renderer/package.json ./packages/react-renderer/
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Declare build arguments for AI and Supabase configuration
ARG AI_MODEL
ARG AI_KEY
ARG AI_PROVIDER
ARG AI_BASE_URL
ARG AI_MODEL_WITH_STRUCTURE
ARG AI_KEY_WITH_STRUCTURE
ARG AI_PROVIDER_WITH_STRUCTURE
ARG AI_BASE_URL_WITH_STRUCTURE
ARG NEXT_PUBLIC_SUPABASE_URL
ARG SUPABASE_SERVICE_ROLE_KEY

# Set environment variables for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV AI_MODEL=${AI_MODEL}
ENV AI_KEY=${AI_KEY}
ENV AI_PROVIDER=${AI_PROVIDER}
ENV AI_BASE_URL=${AI_BASE_URL}
ENV AI_MODEL_WITH_STRUCTURE=${AI_MODEL_WITH_STRUCTURE}
ENV AI_KEY_WITH_STRUCTURE=${AI_KEY_WITH_STRUCTURE}
ENV AI_PROVIDER_WITH_STRUCTURE=${AI_PROVIDER_WITH_STRUCTURE}
ENV AI_BASE_URL_WITH_STRUCTURE=${AI_BASE_URL_WITH_STRUCTURE}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/react-renderer/package.json ./packages/react-renderer/

# Install dependencies
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

RUN pnpm --filter @ai-compoder/web run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Declare build arguments for AI and Supabase configuration (runtime)
ARG AI_MODEL
ARG AI_KEY
ARG AI_PROVIDER
ARG AI_BASE_URL
ARG AI_MODEL_WITH_STRUCTURE
ARG AI_KEY_WITH_STRUCTURE
ARG AI_PROVIDER_WITH_STRUCTURE
ARG AI_BASE_URL_WITH_STRUCTURE
ARG NEXT_PUBLIC_SUPABASE_URL
ARG SUPABASE_SERVICE_ROLE_KEY

# Set environment variables for runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV AI_MODEL=${AI_MODEL}
ENV AI_KEY=${AI_KEY}
ENV AI_PROVIDER=${AI_PROVIDER}
ENV AI_BASE_URL=${AI_BASE_URL}
ENV AI_MODEL_WITH_STRUCTURE=${AI_MODEL_WITH_STRUCTURE}
ENV AI_KEY_WITH_STRUCTURE=${AI_KEY_WITH_STRUCTURE}
ENV AI_PROVIDER_WITH_STRUCTURE=${AI_PROVIDER_WITH_STRUCTURE}
ENV AI_BASE_URL_WITH_STRUCTURE=${AI_BASE_URL_WITH_STRUCTURE}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["node", "apps/web/server.js"]
