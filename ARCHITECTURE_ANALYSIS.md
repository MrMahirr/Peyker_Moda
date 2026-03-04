# Peyker Moda — Production-Grade Architecture Analysis & Recovery Plan

> **Project type:** Fashion e-commerce (B2C) with in-store POS
> **Stack:** Turborepo · NestJS · React (Vite) · Next.js (App Router) · Prisma · PostgreSQL
> **Analysis date:** 2026-03-04

---

## 1. Current Project Problems

### 1.1 Structural & Hygiene Issues

| #   | Problem                                                                                                                                                                  | Severity    | Location                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ----------------------------- |
| S1  | **Debug artifacts littering API root** — 20+ log/JSON/txt files (`build_error.log`, `startup_log.txt`, `tsc_final_v6.txt`, `verify-*.js`, etc.) committed to `apps/api/` | 🟡 Medium   | `apps/api/`                   |
| S2  | **`.env` file committed to repo** with a hardcoded JWT secret `super-secret-key-change-in-production`                                                                    | 🔴 Critical | `apps/api/.env`               |
| S3  | **No `.env.example` files** — new developers cannot know which variables are required                                                                                    | 🟡 Medium   | All apps                      |
| S4  | **Shared types package nearly empty** — only a single 3-field `IProduct` interface; all frontend/backend types are duplicated locally                                    | 🔴 High     | `packages/types/src/index.ts` |
| S5  | **Dangling `stitch_boutique_admin_dashboard/`** directory at monorepo root — likely leftover from a previous project                                                     | 🟡 Medium   | Root                          |
| S6  | **Prisma migrations never run** — schema exists but `npx prisma migrate dev` was never executed per the docs                                                             | 🟡 Medium   | `apps/api/prisma/`            |
| S7  | **`packages/ui` has no components** shared between admin and storefront despite both using Tailwind + Lucide                                                             | 🟡 Medium   | `packages/ui/`                |
| S8  | **No `packages/config` or `packages/utils`** — no shared configuration or utility layer                                                                                  | 🟡 Medium   | `packages/`                   |

### 1.2 Backend (NestJS) Issues

| #   | Problem                                                                                                                                                         | Severity  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| B1  | **No Permissions model / granular RBAC** — roles are hardcoded enum (`ADMIN, MANAGER, STAFF, CASHIER`) with simple `@Roles()` guard; no permission-level checks | 🔴 High   |
| B2  | **No AuditLog model or audit trail** — critical for e-commerce (who deleted a product? who changed an order status?)                                            | 🔴 High   |
| B3  | **No Media model** — images stored as raw JSON array on Product (`images: Json?`), no CDN/S3 integration, no file validation on upload sizes/types              | 🔴 High   |
| B4  | **Missing standalone Returns module** — Return/ReturnItem schemas exist but no dedicated module, controller, or service; returns endpoints are not implemented  | 🟡 Medium |
| B5  | **Missing standalone Payments module** — Payment model exists but processing endpoints are missing                                                              | 🟡 Medium |
| B6  | **No Banner, StaticPage, or SEO Settings models** — storefront CMS capabilities are absent                                                                      | 🟡 Medium |
| B7  | **RefreshToken model has no FK to User** — `userId String` without `@relation`, allowing orphaned tokens                                                        | 🟡 Medium |
| B8  | **`@ts-ignore` in auth service** — refresh token generation suppresses TypeScript errors                                                                        | 🟡 Medium |
| B9  | **No Redis** — no caching layer for sessions, rate limiting is in-memory only (lost on restart), no pub/sub for multi-instance                                  | 🔴 High   |
| B10 | **Turbo build outputs only `.next/**`** — NestJS `dist/` output is not tracked by Turborepo                                                                     | 🟡 Medium |
| B11 | **No database seeding script** — `prisma.seed` is declared in package.json but no actual `seed.ts` file found                                                   | 🟡 Medium |
| B12 | **ThrottlerGuard is global but `APP_GUARD` only** — no per-route throttler overrides for sensitive endpoints like login                                         | 🟡 Medium |

### 1.3 Admin Panel (React + Vite) Issues

| #   | Problem                                                                                                                                  | Severity  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| A1  | **No error boundary** — any unhandled exception crashes the entire app                                                                   | 🟡 Medium |
| A2  | **Tokens stored in `localStorage`** — vulnerable to XSS attacks                                                                          | 🔴 High   |
| A3  | **Logout does NOT call backend** — refresh tokens are never revoked server-side (line 63: `// Optional: await api.post('/auth/logout')`) | 🔴 High   |
| A4  | **No role-based UI rendering** — all admin routes are visible to all users regardless of role                                            | 🟡 Medium |
| A5  | **No loading skeletons** — only basic loading states                                                                                     | 🟡 Medium |
| A6  | **No centralized state management** — scattered Context providers without query caching (no TanStack Query / SWR)                        | 🟡 Medium |
| A7  | **Missing CMS-like pages** — no Banner management, no Static Page editor, no SEO settings, no homepage section manager                   | 🔴 High   |
| A8  | **No pagination/filtering abstraction** — each feature re-implements table filtering                                                     | 🟡 Medium |

### 1.4 Storefront (Next.js) Issues

| #   | Problem                                                                                                                                      | Severity  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| F1  | **No auth session management** — `CartProvider` exists but no `AuthProvider` wrapper; login/register pages exist but session is detached     | 🔴 High   |
| F2  | **Cart is localStorage only** — no server-side cart; lost if user switches devices                                                           | 🟡 Medium |
| F3  | **No ISR/revalidation configured** — no `revalidate` exports on any page; all pages are either fully static or fully dynamic                 | 🟡 Medium |
| F4  | **No `<Head>` / `generateMetadata` per page** — only root layout has metadata; product/category pages lack dynamic SEO                       | 🔴 High   |
| F5  | **Using `Geist` + `Geist_Mono` fonts** — generic fonts, not aligned with fashion brand identity                                              | 🟡 Low    |
| F6  | **No image optimization strategy** — `<Image>` from `next/image` may or may not be used consistently; no CDN configured via `next.config.ts` | 🟡 Medium |
| F7  | **Route names in Turkish** (`/giris`, `/kayit`, `/odeme`, `/sepet`) — limits international expansion; no i18n support                        | 🟡 Low    |

### 1.5 Security Vulnerabilities

| #   | Vulnerability                                                                             | OWASP Category                       | Severity    |
| --- | ----------------------------------------------------------------------------------------- | ------------------------------------ | ----------- |
| V1  | JWT secret hardcoded in VCS                                                               | A07:2021 – Security Misconfiguration | 🔴 Critical |
| V2  | Tokens in `localStorage` → XSS exfiltration                                               | A02:2021 – Cryptographic Failures    | 🔴 High     |
| V3  | No CSRF token mechanism                                                                   | A01:2021 – Broken Access Control     | 🔴 High     |
| V4  | No file upload validation (size, MIME, extension) on `/uploads`                           | A04:2021 – Insecure Design           | 🔴 High     |
| V5  | No input sanitization beyond `class-validator`                                            | A03:2021 – Injection                 | 🟡 Medium   |
| V6  | Rate limiting in-memory only; resets on restart                                           | A07:2021 – Security Misconfiguration | 🟡 Medium   |
| V7  | Refresh tokens not rotated properly (same secret for both tokens)                         | A02:2021 – Cryptographic Failures    | 🟡 Medium   |
| V8  | `unsafe-inline` and `unsafe-eval` in CSP (for Swagger) — should be disabled in production | A05:2021 – Security Misconfiguration | 🟡 Medium   |
| V9  | No account lockout after failed login attempts                                            | A07:2021 – Security Misconfiguration | 🟡 Medium   |
| V10 | No password strength policy enforcement in RegisterDTO                                    | A07:2021 – Security Misconfiguration | 🟡 Medium   |

---

## 2. Proposed Architecture

### 2.1 High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Store["Storefront<br/>(Next.js SSR/ISR)"]
        Admin["Admin Panel<br/>(React + Vite)"]
    end

    subgraph "API Gateway Layer"
        API["NestJS API<br/>/api/*"]
    end

    subgraph "Infrastructure"
        PG["PostgreSQL 16"]
        Redis["Redis 7"]
        S3["S3 / MinIO<br/>(Media Storage)"]
    end

    Store -->|"REST + Server Actions"| API
    Admin -->|"REST + WebSocket"| API
    API --> PG
    API --> Redis
    API --> S3
```

### 2.2 Backend Architecture (DDD-lite)

```
Module Architecture:
┌─────────────────────────────────────────────┐
│               NestJS Application            │
├─────────────────────────────────────────────┤
│  Global: ConfigModule, ThrottlerModule,     │
│          PrismaModule, RedisModule,         │
│          CacheModule, EventEmitterModule    │
├─────────────────────────────────────────────┤
│  Domain Modules:                            │
│  ┌─────────┐ ┌──────────┐ ┌─────────────┐  │
│  │  Auth   │ │  Users   │ │   Roles &   │  │
│  │         │ │          │ │ Permissions │  │
│  └─────────┘ └──────────┘ └─────────────┘  │
│  ┌─────────┐ ┌──────────┐ ┌─────────────┐  │
│  │Products │ │Categories│ │  Variants   │  │
│  └─────────┘ └──────────┘ └─────────────┘  │
│  ┌─────────┐ ┌──────────┐ ┌─────────────┐  │
│  │ Orders  │ │ Payments │ │   Returns   │  │
│  └─────────┘ └──────────┘ └─────────────┘  │
│  ┌─────────┐ ┌──────────┐ ┌─────────────┐  │
│  │Customers│ │Campaigns │ │   Coupons   │  │
│  └─────────┘ └──────────┘ └─────────────┘  │
│  ┌─────────┐ ┌──────────┐ ┌─────────────┐  │
│  │  Media  │ │ Settings │ │ Audit Logs  │  │
│  └─────────┘ └──────────┘ └─────────────┘  │
│  ┌─────────┐ ┌──────────┐ ┌─────────────┐  │
│  │   POS   │ │Dashboard │ │ Storefront  │  │
│  └─────────┘ └──────────┘ └─────────────┘  │
│  ┌─────────┐ ┌──────────┐ ┌─────────────┐  │
│  │Invoices │ │  Email   │ │    Cargo    │  │
│  └─────────┘ └──────────┘ └─────────────┘  │
│  ┌─────────┐ ┌──────────┐                  │
│  │ CMS     │ │WebSocket │                  │
│  │(Banners,│ │          │                  │
│  │ Pages)  │ │          │                  │
│  └─────────┘ └──────────┘                  │
├─────────────────────────────────────────────┤
│  Cross-cutting:                             │
│  HttpExceptionFilter, TransformInterceptor, │
│  LoggingInterceptor, AuditInterceptor,      │
│  JwtAuthGuard, RolesGuard,PermissionsGuard  │
└─────────────────────────────────────────────┘
```

### 2.3 Key Architectural Decisions

| Decision                                      | Rationale                                                                                              |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Prisma** (keep)                             | Already integrated, good DX, type-safe; schema is well-structured                                      |
| **Redis** (add)                               | Required for rate limiting persistence, session caching, WebSocket adapter scaling, and query caching  |
| **S3/MinIO** (add)                            | Move image storage from local `uploads/` to object storage for scalability; MinIO for dev, S3 for prod |
| **TanStack Query** (add to admin)             | Replace raw axios calls with proper query caching, optimistic updates, infinite scroll                 |
| **Server-side sessions via HttpOnly cookies** | Replace `localStorage` JWT pattern to mitigate XSS                                                     |
| **Permission-based RBAC**                     | Extend current role-only system with granular permissions per module                                   |

---

## 3. Folder Structure

### Proposed Monorepo Structure

```
peyker-moda/
├── apps/
│   ├── api/                          # NestJS Backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   ├── seed.ts
│   │   │   └── tsconfig.seed.json
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── config/
│   │   │   │   ├── app.config.ts
│   │   │   │   ├── database.config.ts
│   │   │   │   ├── redis.config.ts
│   │   │   │   └── storage.config.ts
│   │   │   ├── common/
│   │   │   │   ├── decorators/        # @Roles, @Permissions, @CurrentUser, @Public
│   │   │   │   ├── filters/           # HttpExceptionFilter, PrismaExceptionFilter
│   │   │   │   ├── guards/            # JwtAuth, LocalAuth, Roles, Permissions
│   │   │   │   ├── interceptors/      # Transform, Logging, Audit, Cache
│   │   │   │   ├── pipes/             # ParseUUIDPipe, FileValidationPipe
│   │   │   │   ├── utils/             # Pagination, Slug, Helpers
│   │   │   │   └── constants/         # Error codes, default values
│   │   │   ├── prisma/                # PrismaModule & PrismaService
│   │   │   ├── redis/                 # RedisModule & RedisService  [NEW]
│   │   │   ├── storage/               # S3/MinIO service             [NEW]
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── roles/             # [NEW] Role + Permission CRUD
│   │   │   │   ├── categories/
│   │   │   │   ├── products/
│   │   │   │   ├── variants/
│   │   │   │   ├── customers/
│   │   │   │   ├── customer-groups/
│   │   │   │   ├── orders/
│   │   │   │   ├── payments/          # [NEW standalone]
│   │   │   │   ├── returns/           # [NEW standalone]
│   │   │   │   ├── pos/
│   │   │   │   ├── transactions/
│   │   │   │   ├── invoices/
│   │   │   │   ├── campaigns/
│   │   │   │   ├── media/             # [NEW] - centralized media management
│   │   │   │   ├── cms/               # [NEW] - Banners, StaticPages, SEO
│   │   │   │   ├── settings/          # [EXISTING - needs expansion]
│   │   │   │   ├── audit-logs/        # [NEW]
│   │   │   │   ├── dashboard/
│   │   │   │   ├── storefront/
│   │   │   │   ├── email/
│   │   │   │   └── cargo/
│   │   │   └── websocket/
│   │   ├── test/
│   │   ├── .env.example              # [NEW]
│   │   ├── Dockerfile                 # [NEW]
│   │   └── package.json
│   │
│   ├── admin/                         # React + Vite Admin Panel
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── App.tsx
│   │   │   │   └── main.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/                # Button, Input, Card, Modal, etc.
│   │   │   │   ├── layout/            # AdminLayout, PosLayout, AuthLayout
│   │   │   │   ├── shared/            # DataTable, ImageUpload, ErrorBoundary
│   │   │   │   └── skeletons/         # [NEW] Loading skeleton components
│   │   │   ├── context/
│   │   │   │   ├── AuthContext.tsx
│   │   │   │   ├── PosContext.tsx
│   │   │   │   └── ThemeContext.tsx
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── staff/
│   │   │   │   ├── catalog/
│   │   │   │   ├── sales/
│   │   │   │   ├── crm/
│   │   │   │   ├── pos/
│   │   │   │   ├── accounting/
│   │   │   │   ├── marketing/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── settings/
│   │   │   │   ├── cms/               # [NEW] Banner, Page, SEO mgmt
│   │   │   │   └── media/             # [NEW] Media library
│   │   │   ├── hooks/                 # [NEW] Shared hooks
│   │   │   │   ├── usePermission.ts
│   │   │   │   ├── usePagination.ts
│   │   │   │   └── useDebounce.ts
│   │   │   ├── lib/
│   │   │   │   ├── axios.ts
│   │   │   │   ├── socket.ts
│   │   │   │   ├── queryClient.ts     # [NEW] TanStack Query setup
│   │   │   │   └── utils.ts
│   │   │   ├── router/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── Dockerfile                 # [NEW]
│   │   └── package.json
│   │
│   └── storefront/                    # Next.js Storefront
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx           # Homepage
│       │   │   ├── (shop)/            # Route group for shop pages
│       │   │   │   ├── giyim/
│       │   │   │   ├── aksesuar/
│       │   │   │   ├── indirim/
│       │   │   │   ├── kolelsiyonlar/
│       │   │   │   └── urun/[slug]/
│       │   │   ├── (checkout)/        # Route group for checkout
│       │   │   │   ├── sepet/
│       │   │   │   ├── odeme/
│       │   │   │   └── odeme/sonuc/
│       │   │   ├── (auth)/            # Route group for auth
│       │   │   │   ├── giris/
│       │   │   │   └── kayit/
│       │   │   ├── profil/
│       │   │   └── siparis-takip/
│       │   ├── components/
│       │   │   ├── home/
│       │   │   ├── layout/
│       │   │   ├── shop/
│       │   │   ├── shared/
│       │   │   ├── profile/
│       │   │   └── ui/
│       │   └── lib/
│       │       ├── api.ts
│       │       ├── CartContext.tsx
│       │       ├── AuthContext.tsx     # [NEW]
│       │       └── utils.ts
│       ├── Dockerfile                 # [NEW]
│       └── package.json
│
├── packages/
│   ├── types/                         # Shared TypeScript types [EXPAND]
│   │   └── src/
│   │       ├── index.ts
│   │       ├── auth.types.ts
│   │       ├── product.types.ts
│   │       ├── order.types.ts
│   │       ├── customer.types.ts
│   │       ├── api-response.types.ts
│   │       └── enums.ts
│   ├── ui/                            # Shared UI components [EXPAND]
│   ├── config/                        # [NEW] Shared config constants
│   ├── utils/                         # [NEW] Shared utilities
│   ├── eslint-config/
│   └── typescript-config/
│
├── docker-compose.yml                 # Dev: PG + Redis + MinIO
├── docker-compose.prod.yml            # [NEW] Prod configuration
├── .env.example                       # [NEW]
├── .github/                           # [NEW]
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 4. Database Schema

### 4.1 New Models to Add

```prisma
// ============= NEW: Permission-based RBAC =============

model Role {
  id          String       @id @default(uuid())
  name        String       @unique        // e.g. "super_admin", "editor"
  displayName String
  description String?
  isSystem    Boolean      @default(false) // prevent deletion of system roles
  permissions Permission[]
  users       User[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@map("roles")
}

model Permission {
  id       String @id @default(uuid())
  resource String           // e.g. "products", "orders", "settings"
  action   String           // e.g. "create", "read", "update", "delete"
  roleId   String
  role     Role   @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@unique([roleId, resource, action])
  @@map("permissions")
}

// ============= NEW: Audit Logging =============

model AuditLog {
  id         String   @id @default(uuid())
  userId     String?
  action     String              // "CREATE", "UPDATE", "DELETE"
  resource   String              // "Product", "Order", etc.
  resourceId String?
  oldData    Json?
  newData    Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  @@index([userId])
  @@index([resource, resourceId])
  @@index([createdAt])
  @@map("audit_logs")
}

// ============= NEW: Media Management =============

model Media {
  id           String    @id @default(uuid())
  filename     String
  originalName String
  mimeType     String
  size         Int                  // bytes
  url          String
  thumbnailUrl String?
  alt          String?
  folder       String    @default("general")
  uploadedBy   String?
  createdAt    DateTime  @default(now())

  @@index([folder])
  @@map("media")
}

// ============= NEW: CMS =============

model Banner {
  id          String   @id @default(uuid())
  title       String
  subtitle    String?
  imageUrl    String
  linkUrl     String?
  position    String   @default("homepage_hero")  // homepage_hero, sidebar, etc.
  order       Int      @default(0)
  isActive    Boolean  @default(true)
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("banners")
}

model StaticPage {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  content     String   @db.Text
  metaTitle   String?
  metaDesc    String?
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("static_pages")
}

model SeoSetting {
  id            String  @id @default(uuid())
  page          String  @unique        // "homepage", "category", "product"
  metaTitle     String?
  metaDesc      String?
  ogImage       String?
  canonicalUrl  String?
  structuredData Json?

  @@map("seo_settings")
}
```

### 4.2 Existing Model Modifications

```diff
 model User {
   id           String        @id @default(uuid())
   email        String        @unique
   password     String
   firstName    String
   lastName     String
   phone        String?
   avatar       String?
-  role         UserRole      @default(STAFF)
+  roleId       String
+  role         Role          @relation(fields: [roleId], references: [id])
   isActive     Boolean       @default(true)
+  lastLoginAt  DateTime?
+  failedLogins Int           @default(0)
+  lockedUntil  DateTime?
   createdAt    DateTime      @default(now())
   updatedAt    DateTime      @updatedAt
   // ... relations

+  @@index([roleId])
   @@map("users")
 }

 model RefreshToken {
   id        String   @id @default(uuid())
   token     String   @unique
   userId    String
+  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
   expiresAt DateTime
+  deviceInfo String?
+  ipAddress  String?
   createdAt DateTime @default(now())

+  @@index([userId])
   @@map("refresh_tokens")
 }

-enum UserRole {
-  ADMIN
-  MANAGER
-  STAFF
-  CASHIER
-}
+// UserRole enum REMOVED — replaced by dynamic Role model
```

### 4.3 Indexing Strategy

| Table          | Index                    | Type      | Rationale               |
| -------------- | ------------------------ | --------- | ----------------------- |
| `products`     | `(categoryId)`           | B-tree    | Category filtering      |
| `products`     | `(slug)`                 | Unique    | URL lookup              |
| `products`     | `(sku)`                  | Unique    | Stock lookup            |
| `products`     | `(barcode)`              | Unique    | POS barcode scan        |
| `products`     | `(isActive, isFeatured)` | Composite | Storefront queries      |
| `orders`       | `(customerId)`           | B-tree    | Customer order history  |
| `orders`       | `(status)`               | B-tree    | Status filtering        |
| `orders`       | `(createdAt)`            | B-tree    | Date range queries      |
| `orders`       | `(orderNumber)`          | Unique    | Order tracking          |
| `customers`    | `(email)`                | B-tree    | Login/lookup            |
| `customers`    | `(phone)`                | B-tree    | POS quick search        |
| `audit_logs`   | `(createdAt)`            | B-tree    | Time-range queries      |
| `audit_logs`   | `(resource, resourceId)` | Composite | Entity history          |
| `variants`     | `(productId)`            | B-tree    | Product variant listing |
| `transactions` | `(transactionDate)`      | B-tree    | Accounting reports      |

### 4.4 Entity Relationship Diagram

```mermaid
erDiagram
    Role ||--o{ Permission : "has"
    Role ||--o{ User : "assigned to"
    User ||--o{ RefreshToken : "owns"
    User ||--o{ Order : "creates"
    User ||--o{ PosSession : "opens"
    User ||--o{ Transaction : "records"

    Category ||--o{ Category : "parent-child"
    Category ||--o{ Product : "contains"
    Product ||--o{ Variant : "has"

    Customer ||--o{ Order : "places"
    CustomerGroup ||--o{ Customer : "groups"

    Order ||--o{ OrderItem : "contains"
    Order ||--o{ Payment : "receives"
    Order ||--o{ Return : "triggers"
    Order ||--|o Invoice : "generates"
    Order ||--o{ Transaction : "links"

    OrderItem }o--|| Variant : "references"
    Return ||--o{ ReturnItem : "contains"

    Campaign }|--|| Product : "applies to (JSON)"
    Coupon }|--|| Order : "applied via couponCode"

    Banner ||--|| Media : "uses (URL)"
    StaticPage ||--|| SeoSetting : "optimized by"
```

---

## 5. Backend Modules Breakdown

### 5.1 Existing Modules (Status & Gaps)

| Module              | Status      | Missing                                        |
| ------------------- | ----------- | ---------------------------------------------- |
| **Auth**            | ✅ 90%      | HttpOnly cookie flow, account lockout, CSRF    |
| **Users**           | ✅ 90%      | Link to Role model (currently uses enum)       |
| **Categories**      | ✅ Complete | —                                              |
| **Products**        | ✅ Complete | Media integration (currently JSON)             |
| **Variants**        | ✅ Complete | —                                              |
| **Customers**       | ✅ Complete | —                                              |
| **Customer Groups** | ✅ Complete | —                                              |
| **Orders**          | ✅ 90%      | Missing cargo tracking integration             |
| **POS**             | ✅ 90%      | POS sale API integration not confirmed working |
| **Transactions**    | ✅ Complete | —                                              |
| **Invoices**        | ✅ Complete | —                                              |
| **Campaigns**       | ✅ Complete | —                                              |
| **Dashboard**       | ✅ Complete | Redis caching                                  |
| **Storefront**      | ✅ Complete | ISR cache headers                              |
| **Email**           | ✅ Basic    | Template system                                |
| **Upload**          | ⚠️ 50%      | Needs validation, S3, Media model              |
| **WebSocket**       | ✅ Basic    | Redis adapter for scaling                      |
| **Cargo**           | ⚠️ 30%      | Provider implementations                       |

### 5.2 New Modules Required

| Module                     | Priority    | Description                                                   |
| -------------------------- | ----------- | ------------------------------------------------------------- |
| **Roles & Permissions**    | 🔴 Critical | CRUD for roles, permission assignment, `@Permissions()` guard |
| **Audit Logs**             | 🔴 Critical | Automatic logging via interceptor, query API for admin        |
| **Media**                  | 🔴 High     | S3 upload, thumbnail generation, gallery management           |
| **CMS**                    | 🟡 Medium   | Banners CRUD, Static Pages CRUD, SEO settings                 |
| **Returns** (standalone)   | 🟡 Medium   | Dedicated return/exchange flow with stock restoration         |
| **Payments** (standalone)  | 🟡 Medium   | Payment processing, refund management                         |
| **Redis** (infrastructure) | 🔴 High     | Cache service, rate limiting store, pub/sub                   |

---

## 6. Admin Panel Structure

### 6.1 Current Coverage vs. Required

| Feature                     | Current | Required | Gap                        |
| --------------------------- | ------- | -------- | -------------------------- |
| Products CRUD               | ✅      | ✅       | —                          |
| Variants + Stock            | ✅      | ✅       | —                          |
| Categories                  | ✅      | ✅       | —                          |
| Orders + Status             | ✅      | ✅       | —                          |
| Customers                   | ✅      | ✅       | —                          |
| POS                         | ✅      | ✅       | —                          |
| Dashboard                   | ✅      | ✅       | —                          |
| Campaigns/Coupons           | ✅      | ✅       | —                          |
| Staff Management            | ✅      | ✅       | —                          |
| **Role/Permission CRUD**    | ❌      | ✅       | 🔴 New feature             |
| **Role-based UI rendering** | ❌      | ✅       | 🔴 `usePermission` hook    |
| **Banner Management**       | ❌      | ✅       | 🔴 New feature             |
| **Static Page Editor**      | ❌      | ✅       | 🔴 New feature (rich text) |
| **SEO Settings**            | ❌      | ✅       | 🔴 New feature             |
| **Homepage Section Mgr**    | ❌      | ✅       | 🟡 New feature             |
| **Media Library**           | ❌      | ✅       | 🔴 New feature             |
| **Audit Log Viewer**        | ❌      | ✅       | 🟡 New feature             |
| **Error Boundary**          | ❌      | ✅       | 🟡 Quick add               |
| **Loading Skeletons**       | ❌      | ✅       | 🟡 Quick add               |
| **TanStack Query**          | ❌      | ✅       | 🟡 Refactor                |

### 6.2 Recommended State Management Migration

```
Current:                         Target:
┌──────────────┐                 ┌─────────────────────────────┐
│ AuthContext   │  ──────────>   │ AuthContext (kept, enhanced) │
│ PosContext    │  ──────────>   │ PosContext  (kept)           │
│ ThemeContext  │  ──────────>   │ ThemeContext (kept)          │
│ Raw axios     │  ──────────>   │ TanStack Query + axios       │
│ calls in each │                │ ┌─ useProducts()             │
│ component     │                │ ├─ useOrders()               │
│               │                │ ├─ useCustomers()            │
│               │                │ └─ useMedia()                │
└──────────────┘                 └─────────────────────────────┘
```

---

## 7. Storefront Structure

### 7.1 Rendering Strategy

| Page           | Rendering | Revalidate | Rationale                           |
| -------------- | --------- | ---------- | ----------------------------------- |
| Homepage       | ISR       | 60s        | Frequently updated banners/featured |
| Category Pages | ISR       | 300s       | Products change occasionally        |
| Product Detail | ISR       | 120s       | Price/stock updates                 |
| Search Results | SSR       | —          | Dynamic queries                     |
| Cart           | CSR       | —          | User-specific                       |
| Checkout       | CSR       | —          | User-specific, sensitive            |
| Profile        | CSR       | —          | Authenticated                       |
| Static Pages   | SSG       | 3600s      | Rarely changes                      |

### 7.2 SEO Implementation

Each dynamic page needs `generateMetadata()`:

```typescript
// app/urun/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await api.getProductBySlug(params.slug);
  return {
    title: `${product.name} | Peyker Moda`,
    description: product.description?.slice(0, 160),
    openGraph: {
      images: product.images?.[0],
      type: "product",
    },
  };
}
```

### 7.3 Missing Storefront Features

| Feature                         | Priority | Notes                                       |
| ------------------------------- | -------- | ------------------------------------------- |
| **AuthContext / session**       | 🔴       | Must wrap layout for login state            |
| **`generateMetadata` per page** | 🔴       | Product, category, static pages             |
| **ISR with `revalidate`**       | 🟡       | Add to all server-fetched pages             |
| **Structured data (JSON-LD)**   | 🟡       | Product, Organization, BreadcrumbList       |
| **Server-side cart sync**       | 🟡       | Persist cart to backend for logged-in users |
| **Wishlist**                    | 🟢       | Nice-to-have for fashion e-commerce         |
| **Image CDN config**            | 🟡       | `next.config.ts` → `images.remotePatterns`  |

---

## 8. Security Improvements

### 8.1 Action Items (Ordered by Priority)

| #   | Action                                | Priority    | Details                                                                                                   |
| --- | ------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------- |
| 1   | **Remove `.env` from Git history**    | 🔴 Critical | Use `git filter-branch` or BFG to purge; rotate JWT secret immediately                                    |
| 2   | **Move tokens to HttpOnly cookies**   | 🔴 Critical | Set `HttpOnly`, `Secure`, `SameSite=Strict`; remove `localStorage` usage                                  |
| 3   | **Add CSRF token**                    | 🔴 High     | Use `csurf` or Double Submit Cookie pattern                                                               |
| 4   | **Add file upload validation**        | 🔴 High     | `FileValidationPipe`: max 5MB, allowed MIME types (image/jpeg, image/png, image/webp), reject executables |
| 5   | **Separate JWT secrets**              | 🟡 Med      | Use different secrets for access token and refresh token                                                  |
| 6   | **Implement account lockout**         | 🟡 Med      | Lock after 5 failed attempts for 15 minutes; store `failedLogins` and `lockedUntil` on User               |
| 7   | **Redis-backed rate limiting**        | 🟡 Med      | Replace in-memory ThrottlerStore with Redis store                                                         |
| 8   | **Tighten CSP in production**         | 🟡 Med      | Remove `unsafe-inline` and `unsafe-eval`; Swagger only accessible in non-production                       |
| 9   | **Add password strength validation**  | 🟡 Med      | Min 8 chars, 1 uppercase, 1 number, 1 special char in `RegisterDto`                                       |
| 10  | **Add refresh token device tracking** | 🟡 Med      | Store IP + User-Agent with each refresh token                                                             |
| 11  | **Add request sanitization**          | 🟡 Low      | Sanitize HTML inputs to prevent stored XSS                                                                |
| 12  | **Content Security Policy reporting** | 🟢 Low      | Add `report-uri` for CSP violation monitoring                                                             |

### 8.2 Auth Flow (Target)

```
┌─────────┐          ┌─────────┐         ┌──────────┐
│ Browser  │          │  API    │         │   DB     │
└────┬─────┘          └────┬────┘         └────┬─────┘
     │  POST /auth/login   │                   │
     │ {email, password}   │                   │
     │ ────────────────>   │                   │
     │                     │  Query User       │
     │                     │ ───────────────>  │
     │                     │  User + bcrypt    │
     │                     │ <───────────────  │
     │                     │                   │
     │  Set-Cookie:        │  Store RefreshToken│
     │  access_token=xxx   │ ───────────────>  │
     │  (HttpOnly,Secure)  │                   │
     │  Set-Cookie:        │                   │
     │  refresh_token=xxx  │                   │
     │  (HttpOnly,Secure,  │                   │
     │   Path=/auth/refresh)│                  │
     │ <────────────────   │                   │
     │                     │                   │
     │  GET /api/products  │                   │
     │  Cookie: access=xxx │                   │
     │ ────────────────>   │                   │
     │  200 + data         │                   │
     │ <────────────────   │                   │
```

---

## 9. DevOps Plan

### 9.1 Docker Setup

**Development (`docker-compose.yml` — enhanced):**

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:16-alpine
    container_name: peyker_db
    ports:
      - "2345:5432"
    environment:
      POSTGRES_USER: peyker_user
      POSTGRES_PASSWORD: peyker_password
      POSTGRES_DB: peyker_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U peyker_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: peyker_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio
    container_name: peyker_minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### 9.2 Environment Strategy

```
.env.example          # Template (committed)
.env                  # Local dev (gitignored)
.env.staging          # Staging (gitignored, managed in CI)
.env.production       # Production (gitignored, managed in CI)
```

**Required variables:**

```env
# Application
NODE_ENV=development|staging|production
PORT=3000
API_PREFIX=api

# Database
DATABASE_URL=postgresql://user:pass@host:port/db?schema=public

# Security
JWT_ACCESS_SECRET=<random-64-chars>
JWT_REFRESH_SECRET=<different-random-64-chars>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Storage
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=peyker-media
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_REGION=us-east-1

# CORS
CORS_ORIGIN=http://localhost:3500,http://localhost:5173

# Email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

### 9.3 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm check-types

  test-api:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
          POSTGRES_DB: test_db
        ports: ["5432:5432"]
        options: --health-cmd pg_isready
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      - run: cd apps/api && npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/test_db
      - run: cd apps/api && pnpm test
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/test_db
          JWT_ACCESS_SECRET: test-secret
          JWT_REFRESH_SECRET: test-refresh-secret

  build:
    needs: [lint-and-typecheck, test-api]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

### 9.4 Dockerfiles (Production)

**API Dockerfile:**

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
RUN pnpm install --frozen-lockfile --prod

FROM base AS build
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN cd apps/api && npx prisma generate
RUN pnpm --filter api build

FROM base AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### 9.5 Production Build Optimization

| Area            | Action                                                                            |
| --------------- | --------------------------------------------------------------------------------- |
| **Turbo cache** | Enable remote caching with `turbo login` + `turbo link`                           |
| **Next.js**     | Enable `output: 'standalone'` in `next.config.ts` for minimal Docker image        |
| **Admin**       | Vite tree-shaking + code splitting already optimal; add `vite-plugin-compression` |
| **API**         | Enable `--webpack` flag in `nest build` for bundling; or switch to SWC compiler   |

---

## 10. Step-by-Step Recovery Plan

> [!IMPORTANT]
> This is an **incremental migration plan** — each phase can be deployed independently without breaking existing functionality.

### Phase 1: Foundation & Security (Week 1) 🔴 Critical

| Step | Task                                                                                            | Breaking? | Effort |
| ---- | ----------------------------------------------------------------------------------------------- | --------- | ------ |
| 1.1  | Remove `.env` from Git history (BFG cleaner), create `.env.example`, add `.env` to `.gitignore` | No        | 30 min |
| 1.2  | Clean up API root — move all `*.log`, `*.txt`, `*.json` debug files to `.gitignore` or delete   | No        | 15 min |
| 1.3  | Delete `stitch_boutique_admin_dashboard/` directory                                             | No        | 5 min  |
| 1.4  | Run `docker-compose up -d` and execute `npx prisma migrate dev --name init`                     | No        | 15 min |
| 1.5  | Add Redis to `docker-compose.yml`                                                               | No        | 10 min |
| 1.6  | Create `RedisModule` and `RedisService` in API                                                  | No        | 1 hr   |
| 1.7  | Switch ThrottlerModule to use Redis store                                                       | No        | 30 min |
| 1.8  | Separate JWT access/refresh secrets, update `.env.example`                                      | No        | 30 min |
| 1.9  | Fix RefreshToken model — add `@relation` to User + `@@index`                                    | Migration | 15 min |
| 1.10 | Remove `@ts-ignore` from `generateRefreshToken` — fix types properly                            | No        | 15 min |

### Phase 2: RBAC & Audit (Week 2)

| Step | Task                                                                      | Breaking? | Effort |
| ---- | ------------------------------------------------------------------------- | --------- | ------ |
| 2.1  | Create `Role` and `Permission` Prisma models                              | Migration | 1 hr   |
| 2.2  | Write data migration to convert `UserRole` enum → `Role` records          | Migration | 1 hr   |
| 2.3  | Create `RolesModule` with CRUD endpoints                                  | No        | 2 hr   |
| 2.4  | Create `@Permissions('resource:action')` decorator and `PermissionsGuard` | No        | 1 hr   |
| 2.5  | Create `AuditLog` Prisma model and `AuditLogModule`                       | Migration | 1 hr   |
| 2.6  | Create `AuditInterceptor` — auto-log CUD operations                       | No        | 1.5 hr |
| 2.7  | Add `lastLoginAt`, `failedLogins`, `lockedUntil` to User model            | Migration | 30 min |
| 2.8  | Implement account lockout logic in AuthService                            | No        | 1 hr   |

### Phase 3: Auth Hardening & Media (Week 3)

| Step | Task                                                                                    | Breaking?   | Effort |
| ---- | --------------------------------------------------------------------------------------- | ----------- | ------ |
| 3.1  | Refactor auth flow: tokens in HttpOnly cookies instead of response body                 | 🔴 Breaking | 3 hr   |
| 3.2  | Update admin `AuthContext` — remove `localStorage` token storage, use cookie-based auth | 🔴 Breaking | 2 hr   |
| 3.3  | Fix admin logout — actually call `POST /auth/logout`                                    | No          | 15 min |
| 3.4  | Add MinIO to `docker-compose.yml`                                                       | No          | 15 min |
| 3.5  | Create `StorageService` (S3-compatible)                                                 | No          | 2 hr   |
| 3.6  | Create `Media` model and `MediaModule`                                                  | Migration   | 2 hr   |
| 3.7  | Add `FileValidationPipe` — MIME type, size limit, extension check                       | No          | 1 hr   |
| 3.8  | Migrate Product images from JSON to Media relation                                      | Migration   | 2 hr   |
| 3.9  | Add password strength validation to `RegisterDto`                                       | No          | 15 min |
| 3.10 | Tighten CSP — disable Swagger in production, remove `unsafe-*`                          | No          | 30 min |

### Phase 4: Shared Packages & Admin Enhancements (Week 4)

| Step | Task                                                                             | Breaking? | Effort |
| ---- | -------------------------------------------------------------------------------- | --------- | ------ |
| 4.1  | Populate `packages/types` — export all DTO interfaces, API response types, enums | No        | 2 hr   |
| 4.2  | Create `packages/utils` — shared formatters (currency, date), validators         | No        | 1 hr   |
| 4.3  | Add TanStack Query to admin — replace raw axios in all features                  | No        | 4 hr   |
| 4.4  | Add `ErrorBoundary` component to admin                                           | No        | 30 min |
| 4.5  | Add `usePermission()` hook — conditionally render UI based on user permissions   | No        | 1 hr   |
| 4.6  | Add loading skeleton components                                                  | No        | 1.5 hr |
| 4.7  | Create admin `cms/` feature — Banner management, Static pages, SEO settings      | No        | 4 hr   |
| 4.8  | Create admin `media/` feature — Media library with upload, browse, delete        | No        | 3 hr   |
| 4.9  | Create admin Audit Log viewer page                                               | No        | 2 hr   |

### Phase 5: Storefront & CMS Backend (Week 5)

| Step | Task                                                                      | Breaking? | Effort |
| ---- | ------------------------------------------------------------------------- | --------- | ------ |
| 5.1  | Create `CmsModule` in API — Banner CRUD, StaticPage CRUD, SeoSetting CRUD | No        | 4 hr   |
| 5.2  | Create storefront `AuthContext` + session management                      | No        | 2 hr   |
| 5.3  | Add `generateMetadata` to all product/category/static pages               | No        | 2 hr   |
| 5.4  | Configure ISR with `revalidate` on all server-fetched pages               | No        | 1 hr   |
| 5.5  | Add JSON-LD structured data (Product, Organization, BreadcrumbList)       | No        | 2 hr   |
| 5.6  | Configure `next.config.ts` — `images.remotePatterns` for API/S3 domains   | No        | 15 min |
| 5.7  | Add `next/image` to storefront components                                 | No        | 1 hr   |
| 5.8  | Create Returns standalone module in API                                   | No        | 2 hr   |
| 5.9  | Create Payments standalone module in API                                  | No        | 2 hr   |

### Phase 6: DevOps & Production (Week 5-6)

| Step | Task                                                              | Breaking? | Effort |
| ---- | ----------------------------------------------------------------- | --------- | ------ |
| 6.1  | Write Dockerfiles for all 3 apps                                  | No        | 2 hr   |
| 6.2  | Write `docker-compose.prod.yml`                                   | No        | 1 hr   |
| 6.3  | Set up GitHub Actions CI pipeline                                 | No        | 1 hr   |
| 6.4  | Write database seed script (`prisma/seed.ts`) with realistic data | No        | 2 hr   |
| 6.5  | Add E2E test foundation (at least auth + product flows)           | No        | 3 hr   |

---

## User Review Required

> [!IMPORTANT]
> **Breaking changes in Phase 3**: Migrating from `localStorage` JWT to HttpOnly cookies (steps 3.1, 3.2) will require updating both admin and storefront auth flows simultaneously. All three apps must be deployed together.

> [!WARNING]
> **Database migrations required**: Phases 1, 2, 3, and 5 include Prisma schema changes that require migrations. Each migration should be tested in staging before production.

> [!CAUTION]
> **Git history cleanup (Step 1.1)**: Using BFG or `git filter-branch` to remove `.env` from Git history will rewrite commit history. All team members will need to re-clone the repository.

**Key decisions for your review:**

1. **Role system migration**: Converting from enum-based roles to a dynamic `Role` model is a significant change. Should we maintain backward compatibility with the old enum during transition?
2. **Storage backend**: MinIO for local dev + S3 for production — or should we use a different storage provider?
3. **Storefront auth**: Should the storefront share the same User model as the admin panel, or should there be a separate `Customer` auth system?
4. **Phase prioritization**: Should security hardening (Phase 1-3) be strictly first, or can we parallelize some admin/storefront work (Phase 4-5)?

## Verification Plan

### Automated Tests

- Run `cd apps/api && pnpm test` after each phase to verify no regressions
- Run `pnpm lint && pnpm check-types` across all apps after each phase
- After Phase 6: Run full CI pipeline via `act` (local GitHub Actions runner) or on a PR

### Manual Verification

- After Phase 1: Verify `docker-compose up -d` starts PostgreSQL + Redis, then `npx prisma migrate dev` succeeds
- After Phase 3: Verify admin login works with HttpOnly cookies by checking browser DevTools → Application → Cookies (tokens should NOT appear in localStorage)
- After Phase 4: Verify admin panel shows/hides menu items based on user permissions
- After Phase 5: Verify storefront product pages have correct `<title>` and `<meta>` tags via View Source
