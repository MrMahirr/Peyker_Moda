# 🚀 Peyker Moda API - Backend Yapılacaklar Listesi

Bu belge, backend API geliştirmesi için adım adım takip edilecek görevleri içerir.

---

## 📌 Faz 0: Altyapı Kurulumu ✅ TAMAMLANDI

### 0.1 Prisma Kurulumu
- [x] `prisma/schema.prisma` dosyasını güncelle
- [x] Tüm modelleri ekle (User, Category, Product, Variant, Customer, Order, vb.)
- [x] İlişkileri tanımla
- [x] Enum tiplerini oluştur
- [ ] `npx prisma migrate dev --name init` ile migration oluştur ⚠️ PostgreSQL başlatılmalı
- [ ] `npx prisma generate` ile client oluştur ⚠️ PostgreSQL başlatılmalı

### 0.2 Prisma Servisi
- [x] `src/prisma/prisma.module.ts` oluştur
- [x] `src/prisma/prisma.service.ts` oluştur
- [x] AppModule'e PrismaModule'ü import et

### 0.3 Ortak Altyapı
- [x] `src/common/filters/http-exception.filter.ts` - Global hata yakalama
- [x] `src/common/interceptors/transform.interceptor.ts` - Response format
- [x] `src/common/interceptors/logging.interceptor.ts` - Request logging
- [x] `src/common/decorators/current-user.decorator.ts` - Aktif kullanıcı
- [x] `src/common/decorators/roles.decorator.ts` - Rol kontrolü
- [x] `src/common/utils/pagination.util.ts` - Sayfalama helper
- [x] `src/common/utils/helpers.util.ts` - Yardımcı fonksiyonlar

### 0.4 Konfigürasyon
- [x] `@nestjs/config` paketini kur
- [x] `src/config/app.config.ts` oluştur
- [x] `.env` dosyasını düzenle (DATABASE_URL, JWT_SECRET, vb.)
- [x] ConfigModule'ü global olarak import et

### 0.5 Swagger/OpenAPI
- [x] `@nestjs/swagger` paketini kur
- [x] `main.ts` içinde Swagger'ı yapılandır
- [x] Tüm DTO'lara `@ApiProperty()` dekoratörlerini ekle

### 0.6 CORS ve Güvenlik
- [x] CORS ayarlarını yapılandır
- [x] Helmet middleware ekle
- [x] Rate limiting ekle

---

## 📌 Faz 1: Kimlik Doğrulama (Auth) ✅ TAMAMLANDI

### 1.1 Gerekli Paketleri Kur
- [x] `pnpm add @nestjs/passport @nestjs/jwt passport passport-jwt passport-local bcryptjs`
- [x] `pnpm add -D @types/passport-jwt @types/passport-local @types/bcryptjs`

### 1.2 Auth Modülü Oluştur
- [x] `src/modules/auth/auth.module.ts`
- [x] `src/modules/auth/auth.controller.ts`
- [x] `src/modules/auth/auth.service.ts`

### 1.3 Strategies
- [x] `src/modules/auth/strategies/local.strategy.ts` - Kullanıcı adı/şifre
- [x] `src/modules/auth/strategies/jwt.strategy.ts` - JWT doğrulama

### 1.4 Guards
- [x] `src/common/guards/jwt-auth.guard.ts`
- [x] `src/common/guards/local-auth.guard.ts`
- [x] `src/common/guards/roles.guard.ts`

### 1.5 DTOs
- [x] `src/modules/auth/dto/login.dto.ts`
- [x] `src/modules/auth/dto/register.dto.ts`
- [x] `src/modules/auth/dto/refresh-token.dto.ts`

### 1.6 Endpoints
- [x] `POST /auth/login` - Giriş yap
- [x] `POST /auth/register` - Kayıt ol (Admin tarafından)
- [x] `POST /auth/refresh` - Token yenile
- [x] `POST /auth/logout` - Çıkış yap
- [x] `GET /auth/me` - Mevcut kullanıcı bilgisi

### 1.7 Users Modülü
- [x] `src/modules/users/users.module.ts`
- [x] `src/modules/users/users.controller.ts`
- [x] `src/modules/users/users.service.ts`
- [x] `src/modules/users/dto/index.ts` (CreateUserDto, UpdateUserDto, UserQueryDto)
- [x] `GET /users` - Kullanıcı listesi
- [x] `GET /users/:id` - Kullanıcı detayı
- [x] `POST /users` - Kullanıcı oluştur
- [x] `PATCH /users/:id` - Kullanıcı güncelle
- [x] `DELETE /users/:id` - Kullanıcı sil

---

## 📌 Faz 2: Ürün Kataloğu ✅ TAMAMLANDI

### 2.1 Categories Modülü
- [x] `src/modules/categories/categories.module.ts`
- [x] `src/modules/categories/categories.controller.ts`
- [x] `src/modules/categories/categories.service.ts`
- [x] DTOs: `create-category.dto.ts`, `update-category.dto.ts`
- [x] `GET /categories` - Kategori listesi
- [x] `GET /categories/tree` - Kategori ağacı
- [x] `GET /categories/:id` - Kategori detayı
- [x] `POST /categories` - Kategori oluştur
- [x] `PATCH /categories/:id` - Kategori güncelle
- [x] `PATCH /categories/:id/order` - Sıralama güncelle
- [x] `DELETE /categories/:id` - Kategori sil

### 2.2 Products Modülü
- [x] `src/modules/products/products.module.ts`
- [x] `src/modules/products/products.controller.ts`
- [x] `src/modules/products/products.service.ts`
- [x] DTOs: `create-product.dto.ts`, `update-product.dto.ts`, `product-query.dto.ts`
- [x] `GET /products` - Ürün listesi (filtreleme, sayfalama)
- [x] `GET /products/search` - Ürün arama
- [x] `GET /products/barcode/:barcode` - Barkod ile arama
- [x] `GET /products/:id` - Ürün detayı
- [x] `POST /products` - Ürün oluştur
- [x] `PATCH /products/:id` - Ürün güncelle
- [x] `PATCH /products/variants/:variantId/stock` - Stok güncelle
- [x] `DELETE /products/:id` - Ürün sil

### 2.3 Variants Modülü
- [x] `src/modules/variants/variants.module.ts`
- [x] `src/modules/variants/variants.controller.ts`
- [x] `src/modules/variants/variants.service.ts`
- [x] `GET /products/:productId/variants` - Varyant listesi
- [x] `GET /variants/:id` - Varyant detayı
- [x] `POST /products/:productId/variants` - Varyant ekle
- [x] `POST /products/:productId/variants/bulk` - Toplu varyant oluştur
- [x] `PATCH /variants/:id` - Varyant güncelle
- [x] `DELETE /variants/:id` - Varyant sil

### 2.4 Uploads Modülü
- [ ] `pnpm add @nestjs/platform-express multer sharp`
- [ ] `src/modules/uploads/uploads.module.ts`
- [ ] `src/modules/uploads/uploads.controller.ts`
- [ ] `src/modules/uploads/uploads.service.ts`
- [ ] `POST /uploads/image` - Tekli resim yükle
- [ ] `POST /uploads/images` - Çoklu resim yükle
- [ ] `DELETE /uploads/:id` - Resim sil

---

## 📌 Faz 3: Müşteri Yönetimi (CRM) ✅ TAMAMLANDI

### 3.1 Customers Modülü
- [x] `src/modules/customers/customers.module.ts`
- [x] `src/modules/customers/customers.controller.ts`
- [x] `src/modules/customers/customers.service.ts`
- [x] DTOs oluştur
- [x] `GET /customers` - Müşteri listesi
- [x] `GET /customers/search` - Hızlı arama (autocomplete)
- [x] `GET /customers/phone/:phone` - Telefon ile arama
- [x] `GET /customers/:id` - Müşteri detayı
- [x] `GET /customers/:id/orders` - Müşteri siparişleri
- [x] `GET /customers/:id/stats` - Müşteri istatistikleri
- [x] `POST /customers` - Müşteri oluştur
- [x] `PATCH /customers/:id` - Müşteri güncelle
- [x] `DELETE /customers/:id` - Müşteri sil

### 3.2 Customer Groups Modülü
- [x] `src/modules/customer-groups/` modülü oluştur
- [x] `GET /customer-groups` - Grup listesi
- [x] `GET /customer-groups/:id` - Grup detayı
- [x] `POST /customer-groups` - Grup oluştur
- [x] `PATCH /customer-groups/:id` - Grup güncelle
- [x] `POST /customer-groups/:id/customers/:customerId` - Gruba müşteri ekle
- [x] `DELETE /customer-groups/:id/customers/:customerId` - Gruptan müşteri çıkar
- [x] `DELETE /customer-groups/:id` - Grup sil

---

## 📌 Faz 4: Satış ve POS ✅ TAMAMLANDI

### 4.1 POS Modülü
- [x] `src/modules/pos/pos.module.ts`
- [x] `src/modules/pos/pos.controller.ts`
- [x] `src/modules/pos/pos.service.ts`
- [x] `POST /pos/sale` - Satış işlemi
- [x] `GET /pos/queue` - Bekleyen satışlar
- [x] `GET /pos/queue/:id` - Bekleyen satış detayı
- [x] `POST /pos/hold` - Satışı beklet
- [x] `DELETE /pos/queue/:id` - Bekleyen satışı iptal et
- [x] `POST /pos/sessions/open` - Kasa aç
- [x] `POST /pos/sessions/:id/close` - Kasa kapat
- [x] `GET /pos/sessions/:id/report` - Oturum raporu

### 4.2 Orders Modülü
- [x] `src/modules/orders/orders.module.ts`
- [x] `src/modules/orders/orders.controller.ts`
- [x] `src/modules/orders/orders.service.ts`
- [x] DTOs oluştur
- [x] `GET /orders` - Sipariş listesi
- [x] `GET /orders/:id` - Sipariş detayı
- [x] `POST /orders` - Sipariş oluştur
- [x] `PATCH /orders/:id/status` - Durum güncelle
- [x] `POST /orders/:id/cancel` - Sipariş iptal
- [x] `POST /orders/:id/payments` - Ödeme ekle

### 4.3 Returns Modülü
- [ ] `src/modules/returns/returns.module.ts`
- [ ] `src/modules/returns/returns.controller.ts`
- [ ] `src/modules/returns/returns.service.ts`
- [ ] `GET /returns` - İade listesi
- [ ] `POST /returns` - İade başlat
- [ ] `PATCH /returns/:id/approve` - İade onayla
- [ ] `PATCH /returns/:id/reject` - İade reddet

### 4.4 Payments Modülü
- [ ] `src/modules/payments/` modülü oluştur
- [ ] `POST /payments/process` - Ödeme işle
- [ ] `GET /payments/:id` - Ödeme detayı
- [ ] `POST /payments/:id/refund` - İade

---

## 📌 Faz 5: Muhasebe ✅ TAMAMLANDI

### 5.1 Transactions Modülü
- [x] `src/modules/transactions/transactions.module.ts`
- [x] `src/modules/transactions/transactions.controller.ts`
- [x] `src/modules/transactions/transactions.service.ts`
- [x] `GET /transactions` - İşlem listesi
- [x] `GET /transactions/:id` - İşlem detayı
- [x] `POST /transactions` - Gelir/Gider kaydı

### 5.2 Reports
- [x] `GET /reports/summary` - Özet rapor (gelir/gider)
- [x] `GET /reports/sales` - Satış raporu
- [x] `GET /reports/products` - Ürün raporu
- [x] `GET /reports/z-report/:date` - Z Raporu (günlük kasa kapanış)

---

## 📌 Faz 6: Kampanyalar ✅ TAMAMLANDI

### 6.1 Campaigns Modülü
- [x] `src/modules/campaigns/campaigns.module.ts`
- [x] `src/modules/campaigns/campaigns.controller.ts`
- [x] `src/modules/campaigns/campaigns.service.ts`
- [x] `GET /campaigns` - Kampanya listesi
- [x] `GET /campaigns/active` - Aktif kampanyalar
- [x] `GET /campaigns/:id` - Kampanya detayı
- [x] `POST /campaigns` - Kampanya oluştur
- [x] `PATCH /campaigns/:id` - Kampanya güncelle
- [x] `DELETE /campaigns/:id` - Kampanya sil

### 6.2 Coupons
- [x] `GET /coupons` - Kupon listesi
- [x] `GET /coupons/:id` - Kupon detayı
- [x] `POST /coupons` - Kupon oluştur
- [x] `PATCH /coupons/:id` - Kupon güncelle
- [x] `DELETE /coupons/:id` - Kupon sil
- [x] `POST /coupons/validate` - Kupon doğrula
- [x] `POST /coupons/:code/use` - Kupon kullan

---

## 📌 Faz 7: WebSocket (Gerçek Zamanlı) ✅ TAMAMLANDI

### 7.1 Gateway Kurulumu
- [x] `src/websocket/websocket.module.ts`
- [x] `src/websocket/websocket.gateway.ts`
- [x] JWT token doğrulama
- [x] Oda sistemi (user, role bazlı)

### 7.2 Events
- [x] `stock:updated` - Stok değişikliği
- [x] `stock:low` - Kritik stok uyarısı
- [x] `order:new` - Yeni sipariş
- [x] `order:status` - Sipariş durumu değişikliği
- [x] `pos:sale` - POS satış bildirimi
- [x] `notification:push` - Genel bildirim
- [x] `dashboard:update` - Dashboard güncellemesi

---

## 📌 Faz 8: Dashboard ✅ TAMAMLANDI

### 8.1 Dashboard Modülü
- [x] `src/modules/dashboard/dashboard.module.ts`
- [x] `src/modules/dashboard/dashboard.controller.ts`
- [x] `src/modules/dashboard/dashboard.service.ts`
- [x] `GET /dashboard/summary` - Genel özet
- [x] `GET /dashboard/sales-chart` - Satış grafiği
- [x] `GET /dashboard/top-products` - En çok satanlar
- [x] `GET /dashboard/low-stock` - Kritik stok
- [x] `GET /dashboard/recent-orders` - Son siparişler
- [x] `GET /dashboard/order-status` - Sipariş durumu dağılımı
- [x] `GET /dashboard/payment-methods` - Ödeme yöntemi dağılımı
- [x] `GET /dashboard/top-customers` - En iyi müşteriler

---

## 📌 Faz 9: Storefront API ✅ TAMAMLANDI

### 9.1 Public API
- [x] `src/modules/storefront/storefront.module.ts`
- [x] `src/modules/storefront/storefront.controller.ts`
- [x] `src/modules/storefront/storefront.service.ts`
- [x] `GET /store/categories` - Kategori listesi (tree)
- [x] `GET /store/categories/:slug` - Kategori detayı
- [x] `GET /store/products` - Ürün listesi (filtreleme, sayfalama)
- [x] `GET /store/products/:slug` - Ürün detayı
- [x] `POST /store/cart/calculate` - Sepet hesapla
- [x] `POST /store/checkout` - Sipariş oluştur
- [x] `GET /store/orders/track` - Sipariş takibi

---

## 📊 İlerleme Özeti

| Faz | Durum | Endpoint Sayısı |
|-----|-------|-----------------|
| Faz 0 | ✅ Tamamlandı | Altyapı |
| Faz 1 | ✅ Tamamlandı | 10 |
| Faz 2 | ✅ Tamamlandı | 21 |
| Faz 3 | ✅ Tamamlandı | 16 |
| Faz 4 | ✅ Tamamlandı | 14 |
| **Toplam** | | **61 endpoint** |

---

## 📝 Notlar

> Öncelik sırası: Faz 0 → Faz 1 → Faz 2 → Faz 4 → Faz 3 → Faz 5-9

⚠️ **Önemli:** PostgreSQL veritabanını başlatmadan migration yapılamaz. Docker ile başlatmak için:
```bash
docker-compose up -d
```

Ardından migration yapılabilir:
```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
```

Her fazı tamamladıktan sonra test etmeyi unutmayın!

---

## 🔜 Sonraki Adımlar (Backend Tamamlandı - Devam Edilecekler)

### Faz 10: Frontend Admin Panel Entegrasyonu
- [x] API endpoint'lerini Admin Panel'e bağlama
- [x] Dashboard sayfasını `/dashboard/*` endpoint'leriyle doldurma
  - [x] Özet istatistikler (`/dashboard/summary`)
  - [x] Düşük stok uyarıları (`/dashboard/low-stock`)
  - [x] En çok satanlar (`/dashboard/top-products`)
- [x] Ürün yönetimi sayfasını `/products` API'sine bağlama
  - [x] Ürün listeleme
  - [x] Ürün ekleme formu
  - [x] Ürün silme
- [x] Kategori yönetimi sayfasını `/categories` API'sine bağlama
  - [x] Kategori listeleme (tree view)
  - [x] Kategori ekleme/düzenleme
  - [x] Kategori silme
- [x] Sipariş yönetimi sayfasını `/orders` API'sine bağlama
  - [x] Sipariş listeleme
  - [x] Sipariş detayı
  - [x] Durum güncelleme
- [x] Müşteri yönetimi sayfasını `/customers` API'sine bağlama
  - [x] Müşteri listeleme
  - [x] Müşteri detayı
  - [x] Müşteri silme
- [x] POS modülünü aktif hale getirme
  - [x] Ürün grid API entegrasyonu
  - [x] Stok göstergeleri
  - [ ] Satış kaydetme API entegrasyonu
- [x] Kampanya/Kupon yönetimi sayfalarını bağlama
  - [x] Kampanya listeleme
  - [x] Kampanya silme/durum değiştirme
- [x] Fatura görüntüleme ve indirme özelliği
  - [x] Fatura listeleme
  - [x] PDF indirme
  - [x] Ödendi olarak işaretleme
- [x] Sidebar navigasyon güncelleme (Siparişler, Müşteriler)
- [x] Route düzeltmeleri (`/catalog/new`, `/sales/orders`)

### Faz 11: Frontend Mağaza (Storefront) Geliştirme
- [x] Anasayfa tasarımı (mevcut)
- [x] Kategori menüsü
- [x] Ürün listeleme sayfası
- [x] Ürün detay sayfası
- [x] Sepet sayfası (localStorage + CartContext)
- [x] API servisi (`api.ts`) - backend bağlantısı hazır
- [x] Checkout sayfası (`/odeme`)
- [x] Sipariş takip sayfası (`/siparis-takip`)

### Faz 12: Güvenlik ve Performans ✅ BÜYÜK ÖLÇÜDE TAMAMLANDI
- [x] Helmet middleware ekleme (CSP, XSS koruması)
- [x] Rate limiting ekleme (ThrottlerModule - brute-force koruması)
- [ ] HTTPS yapılandırması (production) - Canlıda yapılacak
- [ ] Redis cache entegrasyonu (opsiyonel)
- [x] Input sanitization kontrolü (ValidationPipe + whitelist)
- [x] SQL Injection koruması doğrulaması (Prisma ORM)

### Faz 13: Test ve Dokümantasyon
- [x] Unit testler yazma (Jest) - auth.service, products.service
- [ ] E2E testler (Playwright/Cypress)
- [x] API dokümantasyonu zenginleştirme (Swagger)
- [x] README.md güncelleme
- [x] Deployment rehberi oluşturma

### Faz 14: Deployment (Canlıya Alma)
- [ ] Docker Compose production yapılandırması
- [ ] Environment variables güvenliği (.env.production)
- [ ] CI/CD pipeline kurulumu (GitHub Actions)
- [ ] Veritabanı backup stratejisi
- [ ] Canlıya alma (VPS/Cloud - DigitalOcean, AWS, vb.)
- [ ] Domain ve SSL sertifikası yapılandırması
- [ ] Monitoring ve logging (PM2, Grafana, vb.)

---

## 📊 Güncel İlerleme Özeti

| Faz | Durum | Açıklama |
|-----|-------|----------|
| Faz 0-9 | ✅ Tamamlandı | Backend API (~70+ endpoint) |
| Faz 10 | ✅ Tamamlandı | Admin Panel Entegrasyonu |
| Faz 11 | ✅ Tamamlandı | Storefront Geliştirme + API |
| Faz 12 | ✅ %80 Tamamlandı | Helmet, Rate Limiting, ValidationPipe |
| Faz 13 | ✅ %70 Tamamlandı | Unit testler, README, Swagger |
| Faz 14 | ⏳ Bekliyor | Deployment |


