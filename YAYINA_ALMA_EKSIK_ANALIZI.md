# 🔍 Peyker Moda — Yayına Almadan Önce Eksiklik Analizi

Projenin tamamı (admin panel, API backend, storefront) kapsamlı olarak incelendi. Aşağıda **yayına almadan önce mutlaka tamamlanması gereken** tüm eksiklikler kategorize edilmiştir.

---

## 🔴 *1. KRİTİK — Backend API Eksiklikleri (Frontend'de Var, Backend'de Yok)

Frontend (admin panel) birçok modülde API çağrıları yapıyor ancak **backend'de karşılığı olan modüller/endpointler mevcut değil**. Bu, ilgili sayfaların açıldığında **hata vereceği** anlamına gelir.

> [!CAUTION]
> Aşağıdaki tüm frontend servislerin backend karşılıkları **tamamen eksik**. Bu sayfalar çalışmaz durumda.

| #   | Frontend Servisi / Sayfa                                         | Çağrılan API Endpoint'leri                                                                                                                                                                                                                   | Backend Modül Durumu                                                                        |
| --- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| *1  | **Kargo & Lojistik** (`shipping.service.ts`)             | `/shipping/carriers`, `/shipping/shipments`, `/shipping/rates`, `/shipping/reports`                                                                                                                                                     | ❌**Modül yok** — `CargoModule` var ama `/cargo` endpointleri; `/shipping` yok |
| *2  | **Muhasebe - Kasa Yönetimi** (`cash.service.ts`)        | `/accounting/registers`, `/accounting/bank-accounts`, `/accounting/checks`, `/accounting/installments`, `/accounting/due-payments`, `/accounting/reports/vat`, `/accounting/reports/period`, `/accounting/reports/close-period` | ❌**Modül yok** — Backend'de sadece `TransactionsModule` var                       |
| *3  | **Muhasebe - Cari Hesaplar** (`SupplierAccounts.tsx`)    | `/accounting/current-accounts?type=SUPPLIER`                                                                                                                                                                                                  | ❌**Endpoint yok**                                                                     |
| *4  | **CRM - Müşteri Notları** (`CustomerNotes.tsx`)       | `/customers/:id/notes`                                                                                                                                                                                                                        | ❌**Endpoint yok**                                                                     |
| *5  | **CRM - Müşteri Analizi** (`CustomerAnalytics.tsx`)    | `/customers/:id/analytics`                                                                                                                                                                                                                    | ❌**Endpoint yok**                                                                     |
| *6  | **CRM - Sadakat Programı** (`loyaltyService.ts`)        | `/loyalty/tiers`, `/loyalty/customers/:id`, `/loyalty/customers/:id/add`                                                                                                                                                                  | ❌**Modül yok**                                                                       |
| *7  | **Sipariş Notları** (`OrderNotes.tsx`)                 | `/orders/:id/notes`                                                                                                                                                                                                                           | ❌**Endpoint yok**                                                                     |
| *8  | **Pazarlama - Banner** (`BannerManager.tsx`)             | Banner CRUD (henüz service yok)                                                                                                                                                                                                                | ❌**Modül yok** + Frontend service de eksik                                           |
| *9  | **Pazarlama - Toplu Mesaj** (`BulkMessageSender.tsx`)    | Mesaj gönderme endpointleri                                                                                                                                                                                                                    | ❌**Modül yok**                                                                       |
| *10 | **Pazarlama - Fiyat Listeleri** (`PriceListManager.tsx`) | Fiyat listesi CRUD                                                                                                                                                                                                                              | ❌**Modül yok**                                                                       |
| *11 | **CMS** (`CmsPage.tsx`)                                  | Blog, Sayfalar, SSS CRUD                                                                                                                                                                                                                        | ❌**Modül yok**                                                                       |
| *12 | **Raporlar** (`ReportsPage.tsx`)                         | Satış raporu, ürün performansı                                                                                                                                                                                                             | ❌**Modül yok** (kısmen Dashboard'da var)                                            |
| *13 | **Tedarikçiler** (`SuppliersPage.tsx`)                  | Tedarikçi CRUD                                                                                                                                                                                                                                 | ❌**Modül yok**                                                                       |

---

## 🔴 2. KRİTİK — Güvenlik Açıkları

> [!WARNING]
> Bu maddeler yayın öncesi **mutlaka** düzeltilmelidir, aksi halde ciddi güvenlik riskleri oluşur.

### *2.1 JWT Secret Hardcoded

- **Dosya:** [app.config.ts](file:///c:/Users/MrMahirr/Desktop/Peyker_Moda_Web/peyker-moda/apps/api/src/config/app.config.ts#L12)
- `jwtSecret` fallback olarak `'super-secret-key-change-in-production'` kullanıyor
- `.env` dosyasında da aynı değer var: `JWT_SECRET="super-secret-key-change-in-production"`
- **Çözüm:** Production'da en az 64 byte random secret kullanılmalı

### *2.2 `.env` Dosyası Git'te

- `.gitignore` dosyasında `.env` var ancak `.env` dosyası zaten repo'da olabilir (kontrol edin)
- `.env` dosyasında **veritabanı şifreleri** ve **JWT secret** açık metin olarak var

### *2.3 Axios Interceptor Eksik — 401 Handling Yok

- **Dosya:** [axios.ts](file:///c:/Users/MrMahirr/Desktop/Peyker_Moda_Web/peyker-moda/apps/admin/src/lib/axios.ts#L22-L27)
- Response interceptor'da 401 hatası yakalanmıyor
- Token expire olduğunda kullanıcı otomatik logout olmuyor
- Refresh token mekanizması frontend'de **hiç uygulanmamış**
- `// TODO: Handle global errors (e.g. 401 Unauthorized)` yorumu mevcut

### *2.4 Admin Default Şifre

- `.env.example`'da varsayılan admin şifresi `Admin123!` olarak belirtilmiş
- Production'da bu değiştirilmezse ciddi güvenlik riski

### *2.5 RBAC Enforcement Eksik

- `JwtAuthGuard` var ancak route bazlı **Permission kontrolü** yapılmıyor
- Admin panel'de tüm route'lar sadece `isAuthenticated` kontrolü yapıyor
- **Staff/Admin/SuperAdmin** ayrımı frontend'de yok

### 2.6 MinIO Credentials

- `MINIO_ROOT_USER=minioadmin` ve `MINIO_ROOT_PASSWORD=minioadmin` production için değiştirilmeli

### *2.7 WebSocket Auth Yok

- Socket bağlantısında token doğrulaması yapılmıyor
- **Dosya:** [socket.ts](file:///c:/Users/MrMahirr/Desktop/Peyker_Moda_Web/peyker-moda/apps/admin/src/lib/socket.ts) — Auth header gönderilmiyor

---

## 🟠 3. Veritabanı (Prisma Schema) Eksiklikleri

Prisma schema'da **birçok frontend özelliği için tablo/model tanımlanmamış**:

| Eksik Model                                   | İlgili Frontend Özelliği      |
| --------------------------------------------- | -------------------------------- |
| `Supplier`                                  | Tedarikçi Yönetimi             |
| `SupplierAccount` / `CurrentAccount`      | Cari Hesaplar                    |
| `CashRegister`                              | Kasa Yönetimi (Nakit/POS/Banka) |
| `BankAccount`                               | Banka Hesap Yönetimi            |
| `Check`                                     | Çek Takibi                      |
| `Installment`                               | Taksit Takibi                    |
| `DuePayment`                                | Vadeli Ödeme Takibi             |
| `CustomerNote`                              | Müşteri Etkileşim Notları    |
| `OrderNote`                                 | Sipariş Notları                |
| `LoyaltyTier` / `LoyaltyPoints`           | Sadakat Programı                |
| `BlogPost` / `Page` / `Faq`             | CMS (Blog, Sayfalar, SSS)        |
| `Banner`                                    | Banner/Vitrin Yönetimi          |
| `Carrier` / `Shipment` / `ShippingRate` | Kargo Yönetimi                  |
| `PriceList`                                 | Fiyat Listeleri                  |
| `Notification`                              | Bildirim Sistemi                 |

---

## 🟠 4. Frontend-Backend Uyuşmazlıkları & Hardcoded Veriler

### *4.1 Muhasebe Sayfası — Hardcoded Değerler

- **Dosya:** [AccountingPage.tsx](file:///c:/Users/MrMahirr/Desktop/Peyker_Moda_Web/peyker-moda/apps/admin/src/features/accounting/AccountingPage.tsx#L63)
- Satır 63: `124.500 ₺` **hardcoded** kasa bakiyesi
- Satır 75: `+45.250 ₺` **hardcoded** aylık gelir
- Satır 87: `-12.800 ₺` **hardcoded** aylık gider
- Bu değerler API'den çekilmiyor, sabit yazılmış

### *4.2 Dashboard — Hardcoded Yüzdeler

- **Dosya:** [DashboardPage.tsx](file:///c:/Users/MrMahirr/Desktop/Peyker_Moda_Web/peyker-moda/apps/admin/src/features/dashboard/DashboardPage.tsx#L72-L99)
- `+12.5% düne göre`, `+8.2% hedefe göre`, `+5.7% artış` gibi değişim yüzdeleri hardcoded
- Backend'den gelmesi gereken trend verileri statik yazılmış

### *4.3 Storefront — Tamamen Mock Data

- **Dosya:** [data.ts](file:///c:/Users/MrMahirr/Desktop/Peyker_Moda_Web/peyker-moda/apps/storefront/src/lib/data.ts) — **491 satır** hardcoded ürün verisi
- Storefront API'den veri çekmeye çalışıyor (`storeApi.getProducts`) ama birçok sayfa hala `data.ts`'den statik veri kullanıyor
- Koleksiyonlar, hero slider, kategoriler tamamen hardcoded

### *4.4 Kalan TODO'lar

```
├── validators.ts:8        → // TODO: Add more schemas
├── PrinterTemplate.tsx:4  → // TODO: Implement printer template
├── ThemeContext.tsx:17     → // TODO: persist theme to local storage  
├── axios.ts:12            → // TODO: Add auth token to headers (ZATEN YAPILMIŞ ama yorum kalmış)
└── axios.ts:25            → // TODO: Handle global errors (401 Unauthorized) (YAPILMAMIŞ!)
```

---

## 🟡 5. Frontend Tasarım Uyuşmazlıkları

### *5.1 Tutarsız Sayfa Başlıkları

- Dashboard: `font-black tracking-tight` (h1)
- Accounting: `font-bold tracking-tight` (h1)
- Shipping: `font-bold tracking-tight` (h1)
- CRM: h1 yok, doğrudan `CustomerList` render ediliyor
- **Çözüm:** Tüm sayfalarda aynı header stili kullanılmalı

### *5.2 POS Sayfasında Türkçe Karakter Sorunu

- **Dosya:** [PosPage.tsx](file:///c:/Users/MrMahirr/Desktop/Peyker_Moda_Web/peyker-moda/apps/admin/src/features/pos/PosPage.tsx)
- `Urun bulunamadi`, `Sepet bos`, `Iade/Degisim`, `ODEME AL` — Türkçe karakterler (ü, ö, ş, ı, ç) **eksik**
- Karşılaştır: Diğer tüm sayfalar düzgün Türkçe kullanıyor

### *5.3 Kullanılmayan Import'lar

- [SuppliersPage.tsx](file:///c:/Users/MrMahirr/Desktop/Peyker_Moda_Web/peyker-moda/apps/admin/src/features/suppliers/SuppliersPage.tsx#L2): `Building`, `Truck`, `ShoppingCart` import ediliyor ama hiçbiri kullanılmıyor
- [SuppliersPage.tsx](file:///c:/Users/MrMahirr/Desktop/Peyker_Moda_Web/peyker-moda/apps/admin/src/features/suppliers/SuppliersPage.tsx#L1): `useState` import ediliyor ama kullanılmıyor

### *5.4 Navigation'da Eksik Route'lar

- Navigation'da `shipping`, `suppliers`, `reports`, `cms` ve `inventory` sayfa linkleri var
- Ancak route tanımında `shipping`, `suppliers`, `reports`, `cms` ve `inventory` **YOK** — 404 verir
- **Dosya:** [appRoutes.tsx](file:///c:/Users/MrMahirr/Desktop/Peyker_Moda_Web/peyker-moda/apps/admin/src/router/appRoutes.tsx) — Bu route'lar tanımlanmamış

### *5.5 `PrinterTemplate` Bileşeni Boş

- `PrinterTemplate.tsx` sadece `// TODO: Implement printer template` içeriyor
- Fiş/yazıcı ayarları sayfası bu nedenle boş render olacak

### *5.6 `eslint-disable` Yorumları

- `DashboardPage.tsx`: `eslint-disable-next-line react-hooks/exhaustive-deps` — `fetchData`'nın dependency olarak eklenmesi gerekiyor, `useCallback` ile sarılmalı
- `SupplierAccounts.tsx`: Birçok `@typescript-eslint/no-explicit-any` suppress

---

## 🟡 6. Sistem & Altyapı Eksiklikleri

### *6.1 Production Docker Compose Yok

- Mevcut `docker-compose.yml` sadece DB, Redis, MinIO servisleri için (development)
- API ve frontend için Dockerfile yok
- Production-grade deployment konfigürasyonu yok

### 6.2 CI/CD Pipeline Yok

- GitHub Actions, GitLab CI veya benzeri bir pipeline tanımlanmamış
- Otomatik test, build ve deploy mekanizması yok

### *6.3 Health Check Endpoint'i Yok

- API'de `/health` veya `/api/health` endpoint'i yok
- Load balancer ve monitoring araçları için gerekli

### *6.4 Logging Altyapısı Yetersiz

- Sadece `console.error` ve NestJS Logger kullanılıyor
- Structured logging (Winston, Pino) entegrasyonu yok
- Log aggregation (ELK, Loki) konfigürasyonu yok

### *6.5 Environment Validation Yok

- `.env` dosyasındaki değerlerin validate edilmesi yok (joi/zod)
- Eksik env değişkeni olduğunda sessizce fallback değer kullanılıyor
- Production'da `JWT_SECRET` unset olursa `'super-secret-key-change-in-production'` ile çalışır

### *6.6 Database Migration

- `prisma/migrations` klasörü yok veya boş — schema değişiklikleri migration ile takip edilmiyor
- `db_dump_20260314_055446.sql` dosyası root'ta duruyor (temizlenmeli)

### *6.7 Test Coverage Çok Düşük

- Backend'de sadece `auth.service.spec.ts` ve `app.controller.spec.ts` var
- Frontend'de **hiç test yok**
- E2E test yok

### *6.8 CORS Konfigürasyonu

- Production'da CORS origin'lerin doğru ayarlanması gerekiyor
- Şu an `localhost:3500,localhost:3501,localhost:5173` — production domain'leri eklenmeli

### *6.9 Rate Limiting Yetersiz

- Global `100 req/60s` limiti var
- Auth endpoint'leri (login, register) için ayrı, daha sıkı limit yok
- Brute force koruması sadece uygulama seviyesinde (hesap kilitleme), infra seviyesinde yok

---

## 🟡 7. Storefront (Müşteri Web Sitesi) Eksiklikleri

### 7.1 Ödeme Entegrasyonu Yok

- `odeme` klasörü var ama gerçek payment gateway (iyzico, PayTR, Stripe) entegrasyonu yok
- Backend `PaymentModule` mevcut ancak gerçek ödeme işleme yok

### 7.2 Müşteri Authentication Eksik

- `giris` ve `kayit` sayfaları var ama storefront için ayrı auth akışı yok
- Backend'de müşteri vs admin auth ayrımı yok

### 7.3 SEO Meta Tags Eksik

- `layout.tsx` basit — Open Graph, Twitter Card, yapılandırılmış veri (JSON-LD) yok

### 7.4 Sipariş Takip Sayfası

- `siparis-takip` klasörü var ancak backend'de müşteri bazlı sipariş sorgulama endpointi eksik

### 7.5 `via.placeholder.com` Kullanımı

- Storefront `page.tsx` satır 50: `'https://via.placeholder.com/400'` fallback olarak kullanılıyor — production'da uygun değil

---

## Öncelik Sıralaması

| Öncelik | Kategori                                           | Tahmini Efor |
| -------- | -------------------------------------------------- | ------------ |
| 🔴 P0    | Güvenlik Açıkları (JWT, RBAC, 401 handling)    | 2-3 gün     |
| 🔴 P0    | Axios 401 interceptor + Refresh Token              | 1 gün       |
| 🔴 P1    | Eksik Backend Modülleri (13 modül)               | 10-15 gün   |
| 🔴 P1    | Prisma Schema Güncellemesi (15+ model)            | 2-3 gün     |
| 🟠 P2    | Hardcoded veri temizliği (Accounting, Dashboard)  | 1-2 gün     |
| 🟠 P2    | Route eksiklikleri düzeltme                       | 0.5 gün     |
| 🟡 P3    | Storefront API entegrasyonu (mock data temizliği) | 3-5 gün     |
| 🟡 P3    | Frontend tasarım tutarlılığı                  | 1-2 gün     |
| 🟡 P3    | Docker + CI/CD + Logging                           | 3-5 gün     |
| 🟡 P4    | Test coverage artırma                             | 5-10 gün    |
| 🟡 P4    | Ödeme gateway entegrasyonu                        | 3-5 gün     |

> [!IMPORTANT]
> Toplam tahmini efor: **~30-50 gün** (1 kişilik ekip). En kritik öncelik güvenlik ve eksik backend modülleridir. Hangi modüllere öncelik vermek istediğinizi belirtin, implementasyona başlayalım.

## Open Questions

1. **Hangi modüllere öncelik vermek istiyorsunuz?** Tüm 13 eksik backend modülünün hepsini mi yoksa belirli olanları mı önce yapalım?
2. **Storefront yayına girecek mi?** Yoksa sadece admin panel + API mi yayınlanacak?
3. **Ödeme entegrasyonu hangi provider ile olacak?** (iyzico, PayTR, Stripe, vb.)
4. **Hosting/deploy planı nedir?** (VPS, Docker Swarm, Kubernetes, Vercel+Railway, vb.)
5. **Domain ve SSL sertifika hazır mı?**
