# Peyker Moda

Peyker Moda, e-ticaret vitrini, yonetim paneli ve POS/API katmanlarini tek monorepo icinde toplayan bir moda satis platformudur.

## Proje Yapisi

```text
peyker-moda/
|-- apps/
|   |-- api/          # NestJS API, Prisma, PostgreSQL, Redis, MinIO
|   |-- admin/        # React + Vite yonetim paneli
|   `-- storefront/   # Next.js musteri vitrini
|-- packages/
|   |-- types/        # Paylasilan TypeScript tipleri
|   |-- ui/           # Paylasilan UI paketleri
|   |-- eslint-config/
|   `-- typescript-config/
|-- docker/           # Docker/Nginx yardimci dosyalari
|-- scripts/          # Yardimci scriptler
|-- docker-compose.yml
|-- docker-compose.prod.yml
|-- pnpm-workspace.yaml
`-- turbo.json
```

## Teknolojiler

| Katman | Teknolojiler |
| --- | --- |
| API | NestJS 11, Prisma 5, PostgreSQL, Redis, MinIO/S3, Socket.IO, Swagger |
| Admin | React 19, Vite 7, TypeScript, Tailwind CSS, React Router, TanStack Table |
| Storefront | Next.js 16, React 19, Tailwind CSS, Radix UI |
| Monorepo | pnpm workspace, Turborepo |

## Gereksinimler

- Node.js 18 veya uzeri
- pnpm 9
- Docker ve Docker Compose
- PostgreSQL, Redis ve MinIO icin yerel servisler veya `docker-compose.yml`

## Kurulum

Bagimliliklari kok dizinde yukleyin:

```bash
pnpm install
```

Gelistirme servislerini baslatin:

```bash
docker compose up -d
```

API ortam dosyasini olusturun:

```bash
cp apps/api/.env.example apps/api/.env
```

Windows PowerShell kullanirken:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

Yerel Docker servisleri icin temel `DATABASE_URL` degeri:

```env
DATABASE_URL="postgresql://peyker_user:peyker_password@localhost:2345/peyker_db?schema=public"
```

Varsayilan frontend API adresleri:

```env
# apps/admin/.env
VITE_API_URL=http://localhost:3000/api

# apps/storefront/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Veritabani

Migration ve seed islemleri kok dizinden calistirilabilir:

```bash
pnpm run db:migrate:dev
pnpm run db:seed
```

Alternatif olarak API paketi icinden:

```bash
pnpm --filter api run migrate:dev
pnpm --filter api run db:seed
```

## Gelistirme

Tum uygulamalari birlikte baslatmak icin:

```bash
pnpm run dev
```

Tek uygulama calistirma:

```bash
pnpm --filter api run start:dev
pnpm --filter admin run dev
pnpm --filter storefront run dev
```

Varsayilan adresler:

| Uygulama | Adres |
| --- | --- |
| API | http://localhost:3000/api |
| Swagger | http://localhost:3000/docs |
| Admin | http://localhost:5173 |
| Storefront | http://localhost:3500 |
| MinIO Console | http://localhost:9001 |

## Komutlar

Kok dizin komutlari:

```bash
pnpm run dev
pnpm run build
pnpm run lint
pnpm run format
pnpm run db:migrate:dev
pnpm run db:migrate:deploy
pnpm run db:seed
pnpm run db:backup
```

API testleri:

```bash
pnpm --filter api run test
pnpm --filter api run test:cov
pnpm --filter api run test:e2e
```

## Ana Moduller

API tarafinda urun, kategori, varyant, siparis, POS, musteri, musteri gruplari, kampanya, fatura, muhasebe, rapor, dashboard, bildirim, mesajlasma, kargo, odeme, CMS, banner, ayar, kullanici, rol ve audit log modulleri bulunur.

Admin panel; katalog, siparis, musteri, POS, rapor ve sistem yonetimi ekranlari icin kullanilir. Storefront ise musteriye acik vitrin ve alisveris deneyimini saglar.

## Docker

Gelistirme altyapisi:

```bash
docker compose up -d
docker compose down
```

Production compose dosyasi ve Makefile komutlari:

```bash
make build
make up
make logs
make down
```

Windows'ta `make` yoksa ayni islemler `docker compose -f docker-compose.prod.yml --env-file .env.docker ...` komutlariyla calistirilabilir.

## Build

Tum paketler:

```bash
pnpm run build
```

Tek tek:

```bash
pnpm --filter api run build
pnpm --filter admin run build
pnpm --filter storefront run build
```

## Lisans

Bu proje ozel kullanim icindir ve `UNLICENSED` olarak isaretlenmistir.
