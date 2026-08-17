# ============================================
# Peyker Moda API — Production Dockerfile
# ============================================
# Multi-stage build: deps → build → production
# SOLID: Single Responsibility — yalnızca NestJS API

# ---- Stage 1: Dependencies ----
FROM node:22-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Workspace root dosyaları
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Sadece API ve shared packages (ISP — sadece gerekli paketler)
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/typescript-config/ ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/

# Install — sadece production'a gerekli deps
RUN pnpm install --frozen-lockfile

# ---- Stage 2: Build ----
FROM node:22-alpine AS build

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# deps stage'den node_modules kopyala
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages ./packages

# Kaynak kodları kopyala
COPY apps/api/ ./apps/api/
COPY packages/ ./packages/
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./

# Prisma client generate
RUN cd apps/api && npx prisma generate

# NestJS build
RUN cd apps/api && npx nest build

# ---- Stage 3: Production ----
FROM node:22-alpine AS production

# Prisma engine'in çalışabilmesi için openssl kur
RUN apk add --no-cache openssl

# Güvenlik: Non-root user (DIP — OS seviyesi güvenlik soyutlaması)
RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 nestjs

WORKDIR /app

# Production ortam değişkeni
ENV NODE_ENV=production

# pnpm symlink hedeflerini kopyala (Bu sayede Prisma ve diğer paketler çalışır)
COPY --from=build --chown=nestjs:nestjs /app/node_modules/.pnpm /app/node_modules/.pnpm

# Build çıktıları ve gerekli dosyaları Orijinal Yapısıyla kopyala (symlink yollarının kırılmaması için)
COPY --from=build --chown=nestjs:nestjs /app/apps/api/dist /app/apps/api/dist
COPY --from=build --chown=nestjs:nestjs /app/apps/api/node_modules /app/apps/api/node_modules
COPY --from=build --chown=nestjs:nestjs /app/apps/api/package.json /app/apps/api/package.json
COPY --from=build --chown=nestjs:nestjs /app/apps/api/prisma /app/apps/api/prisma

# Çalışma dizinini uygulama dizini olarak ayarla
WORKDIR /app/apps/api

# Uploads dizini (Eğer lokal upload kullanılıyorsa)
RUN mkdir -p /app/apps/api/uploads && chown nestjs:nestjs /app/apps/api/uploads

# Healthcheck — container orchestrator entegrasyonu
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Non-root user ile çalıştır
USER nestjs

EXPOSE 3000

# Entrypoint: Prisma migrate deploy + app start
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy --schema=./prisma/schema.prisma && node dist/main.js"]
