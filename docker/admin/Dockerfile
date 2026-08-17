# ============================================
# Peyker Moda Admin Panel — Production Dockerfile
# ============================================
# Multi-stage build: deps → build → serve (nginx)
# SOLID: Single Responsibility — yalnızca Admin Panel static build

# ---- Stage 1: Dependencies ----
FROM node:22-alpine AS deps

RUN npm install -g pnpm@9.0.0

WORKDIR /app

# Workspace root dosyaları
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Sadece Admin ve shared packages
COPY apps/admin/package.json ./apps/admin/
COPY packages/types/package.json ./packages/types/
COPY packages/typescript-config/ ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm install --frozen-lockfile

# ---- Stage 2: Build ----
FROM node:22-alpine AS build

RUN npm install -g pnpm@9.0.0

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/admin/node_modules ./apps/admin/node_modules
COPY --from=deps /app/packages ./packages

# Kaynak kodları kopyala
COPY apps/admin/ ./apps/admin/
COPY packages/ ./packages/
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./

# Build-time env (OCP — ortam değiştiğinde kodu değiştirmeden build)
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

# Vite production build
RUN cd apps/admin && npx vite build

# ---- Stage 3: Serve with Nginx ----
FROM nginx:1.27-alpine AS production

# SPA routing için custom nginx config
COPY docker/admin/nginx.conf /etc/nginx/conf.d/default.conf

# Build çıktısını nginx'e kopyala
COPY --from=build /app/apps/admin/dist /usr/share/nginx/html

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
