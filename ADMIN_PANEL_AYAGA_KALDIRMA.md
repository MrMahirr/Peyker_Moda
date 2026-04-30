# Admin Panelini Tam Anlamiyla Ayaga Kaldirma Plani

Bu dokuman, mevcut kod tabanina gore admin panelini tam calisir hale getirmek icin analiz ve adim adim is listesi icerir.

## Durum Ozeti (Kritik Bloklar)

- [x] POS satis payload uyumsuz (Admin gonderimi ile API DTO farkli).
  - Admin `paymentMethod/cashAmount/unitPrice` gonderiyor.
  - API `payments[]/price` bekliyor.
  - Dosyalar: `apps/admin/src/features/pos/components/PaymentModal.tsx`, `apps/api/src/modules/pos/dto/index.ts`
- [x] POS oturum endpoint uyumsuz
  - Admin: `GET /pos/sessions/current`, `POST /pos/sessions/close`
  - API: `POST /pos/sessions/:id/close`
  - Dosyalar: `apps/admin/src/features/pos/services/pos.service.ts`, `apps/api/src/modules/pos/pos.controller.ts`
- [x] Invoice list + status update endpoint yok
  - Admin: `GET /invoices`, `PATCH /invoices/:id`
  - API: `POST /invoices`, `GET /invoices/:id`, `GET /invoices/:id/pdf`
  - Dosyalar: `apps/admin/src/features/accounting/services/invoices.service.ts`, `apps/api/src/modules/invoices/invoices.controller.ts`
- [x] Settings/Profile endpointleri yok
  - Admin: `GET/PATCH /settings`, `GET/PATCH /auth/profile`, `POST /auth/change-password`
  - API: bu endpointler yok
  - Dosyalar: `apps/admin/src/features/settings/services/settings.service.ts`, `apps/api/src/modules/auth/auth.controller.ts`
- [x] Order cancel route decorator eksik
  - `cancel` metodu var, route decorator yok, `/orders/:id/cancel` calismaz
  - Dosya: `apps/api/src/modules/orders/orders.controller.ts`
- [x] Upload delete endpoint uyumsuz
  - Admin: `DELETE /upload/{folder}/{filename}`
  - API: `DELETE /upload/:id`
  - Dosyalar: `apps/admin/src/services/upload.service.ts`, `apps/api/src/modules/upload/upload.controller.ts`
- [x] Admin route guard yok (login olmadan sayfalara giriliyor)
  - Dosya: `apps/admin/src/router/appRoutes.tsx`

## Adim Adim Yapilacaklar (Senior Sirasi)

### 1) Altyapi servisleri
- [x] `docker-compose up -d` ile Postgres + Redis + MinIO calistir.
- [ ] Portlar:
  - Postgres: `2345`
  - Redis: `6379`
  - MinIO: `9000/9001`

### 2) MinIO bucket
- [x] MinIO Console (`http://localhost:9001`) icinden `peyker-media` bucket olustur.
- [x] Gerekirse public access policy tanimla.

### 3) API env kontrol
- [x] `apps/api/.env` icinde `DATABASE_URL`, `S3_*`, `CORS_ORIGIN` dogru mu kontrol et.

### 4) Prisma migrate + generate + seed
- [x] `cd apps/api`
- [x] `pnpm prisma migrate dev`
- [x] `pnpm prisma generate`
- [x] `pnpm prisma db seed`
  - Admin kullanici: `admin@peyker.com / Admin123!`

### 5) API ayaga kaldirma
- [x] `pnpm --filter api start:dev`
- [x] Swagger: `http://localhost:3000/docs`

### 6) Admin env ve dev
- [x] `apps/admin/.env`:
  - `VITE_API_URL=http://localhost:3000/api`
- [x] `pnpm --filter admin dev`

### 7) API-Admin kontrat uyumlari (kritik)
- [x] POS satis payloadunu API DTO ile uyumlu hale getir.
- [x] POS session endpointlerini uyumla.
- [x] Invoice list + status update endpointlerini ekle veya admini mevcut API’ye gore revize et.
- [x] Settings/Profile endpointlerini ekle veya admin servislerini degistir.
- [x] Orders cancel icin `@Post(':id/cancel')` ekle.
- [x] Upload delete endpointini tek formata indir (admin ya da API tarafinda).

### 8) Admin route guard
- [x] Login olmayan kullanici icin redirect (`/auth/login`).

### 9) Uctan uca test
- [ ] Urun ekle -> POS sepet -> odeme -> order kaydi -> stok dusumu -> fatura.
- [ ] Tum admin ekranlari, API response shape ile uyumlu mu kontrol et.

## Oncelik Sirasi

1. POS satis payload + session uyumu
2. Orders cancel decorator + Invoices list/status
3. Settings/Profile endpointleri
4. Upload delete uyumu
5. Admin route guard

## Notlar

- Global API prefix `api`.
- CORS listesinde admin portu olmalidir.

