# Peyker Moda - E-Ticaret & POS Sistemi

Modern ve kapsamlı bir e-ticaret ve POS (Point of Sale) yönetim sistemi.

## 🚀 Özellikler

### Backend API
- **Kimlik Doğrulama**: JWT tabanlı güvenli auth sistemi
- **Ürün Yönetimi**: Kategoriler, varyantlar, stok takibi
- **Sipariş Yönetimi**: Sipariş oluşturma, takip, durum güncelleme
- **POS Modülü**: Satış noktası işlemleri, barkod okuma, hızlı satış
- **CRM**: Müşteri yönetimi, müşteri grupları
- **Muhasebe**: Fatura oluşturma, PDF export, gelir-gider takibi
- **Kampanyalar**: İndirim kampanyaları, kupon kodları
- **Dashboard**: Gerçek zamanlı istatistikler, raporlar
- **WebSocket**: Canlı bildirimler

### Admin Panel
- Modern React + TypeScript arayüzü
- DataGrid ile gelişmiş tablolar
- Gerçek zamanlı dashboard
- POS arayüzü

### Storefront
- Next.js 15 ile SSR
- Modern ve responsive tasarım
- Sepet yönetimi
- Ödeme akışı

## 🛠 Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Backend | NestJS, Prisma, PostgreSQL |
| Admin Panel | React, Vite, TypeScript, TailwindCSS |
| Storefront | Next.js 15, React 19 |
| Veritabanı | PostgreSQL |
| Auth | JWT, Passport.js |
| Docs | Swagger/OpenAPI |

## 📁 Proje Yapısı

```
peyker-moda/
├── apps/
│   ├── api/             # NestJS Backend API
│   ├── admin/           # React Admin Panel
│   └── storefront/      # Next.js Mağaza
├── packages/
│   └── types/           # Paylaşılan TypeScript tipleri
└── README.md
```

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- pnpm

### Adımlar

1. **Repoyu klonlayın**
```bash
git clone <repo-url>
cd peyker-moda
```

2. **Bağımlılıkları yükleyin**
```bash
pnpm install
```

3. **Ortam değişkenlerini ayarlayın**
```bash
# apps/api/.env
DATABASE_URL="postgresql://user:password@localhost:5432/peyker_moda"
JWT_SECRET="your-super-secret-key"
APP_PORT=3001
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
```

4. **Veritabanı migrasyonlarını çalıştırın**
```bash
cd apps/api
npx prisma migrate dev
npx prisma db seed  # Örnek veriler
```

5. **Geliştirme sunucularını başlatın**
```bash
# Kök dizinde
pnpm run dev
```

## 📚 API Dokümantasyonu

API çalışırken Swagger UI'a erişin:
```
http://localhost:3001/docs
```

### Ana Endpoint'ler

| Endpoint | Açıklama |
|----------|----------|
| `POST /api/auth/login` | Giriş yap |
| `GET /api/products` | Ürün listesi |
| `GET /api/orders` | Sipariş listesi |
| `GET /api/dashboard/stats` | Dashboard istatistikleri |
| `POST /api/pos/sales` | POS satış oluştur |
| `GET /api/store/products` | Mağaza ürünleri |

## 🔒 Güvenlik

- **Helmet**: HTTP güvenlik başlıkları
- **Rate Limiting**: Brute-force koruması (10/s, 50/10s, 100/dk)
- **ValidationPipe**: Input doğrulama ve sanitizasyon
- **Prisma ORM**: SQL Injection koruması
- **JWT**: Güvenli token tabanlı kimlik doğrulama

## 🧪 Test

```bash
# Unit testler
cd apps/api
npm run test

# Coverage raporu
npm run test:cov

# E2E testler
npm run test:e2e
```

## 📦 Production Build

```bash
# API
cd apps/api
npm run build
npm run start:prod

# Admin Panel
cd apps/admin
npm run build

# Storefront
cd apps/storefront
npm run build
npm run start
```

## 📊 Proje İlerlemesi

| Faz | Durum | Açıklama |
|-----|-------|----------|
| Faz 0-9 | ✅ | Backend API (70+ endpoint) |
| Faz 10 | ✅ | Admin Panel Entegrasyonu |
| Faz 11 | ✅ | Storefront Geliştirme |
| Faz 12 | ✅ | Güvenlik & Performans |
| Faz 13 | ✅ | Test & Dokümantasyon |
| Faz 14 | ⏳ | Deployment |

## 📄 Lisans

UNLICENSED - Özel Proje

## 👥 Katkıda Bulunanlar

- Peyker Moda Ekibi
