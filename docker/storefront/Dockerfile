# ============================================
# Peyker Moda Storefront — Production Dockerfile
# ============================================
# Multi-stage build: deps → build → production
# SOLID: Single Responsibility — yalnızca Next.js SSR Storefront

# ---- Stage 1: Dependencies ----
FROM node:22-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Workspace root dosyaları
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Sadece Storefront ve shared packages
COPY apps/storefront/package.json ./apps/storefront/
COPY packages/types/package.json ./packages/types/
COPY packages/typescript-config/ ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm install --frozen-lockfile

# ---- Stage 2: Build ----
FROM node:22-alpine AS build

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/storefront/node_modules ./apps/storefront/node_modules
COPY --from=deps /app/packages ./packages

# Kaynak kodları kopyala
COPY apps/storefront/ ./apps/storefront/
COPY packages/ ./packages/
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./

# Build-time env (OCP — ortam bazlı konfigürasyon)
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Next.js production build (standalone output)
RUN cd apps/storefront && npx next build

# ---- Stage 3: Production ----
FROM node:22-alpine AS production

# Güvenlik: Non-root user
RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js standalone output kopyala
COPY --from=build --chown=nextjs:nextjs /app/apps/storefront/.next/standalone ./
COPY --from=build --chown=nextjs:nextjs /app/apps/storefront/.next/static ./apps/storefront/.next/static
COPY --from=build --chown=nextjs:nextjs /app/apps/storefront/public ./apps/storefront/public

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

USER nextjs

EXPOSE 3000

# Next.js standalone server
CMD ["node", "apps/storefront/server.js"]
