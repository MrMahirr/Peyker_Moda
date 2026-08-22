# Peyker Moda

Peyker Moda; e-ticaret vitrini (storefront), yönetim paneli (admin) ve POS/API katmanlarını tek monorepo içinde toplayan bir moda satış platformudur. Bu doküman hem **geliştirici** (lokal kurulum, geliştirme akışı) hem de **production/sunucu yönetimi** (deploy, güvenlik, operasyon) için tam referans niteliğindedir.

- Canlı site: https://peykermoda.com
- Admin panel: https://admin.peykermoda.com
- API: https://peykermoda.com/api

---

## İçindekiler

1. [Proje Yapısı](#proje-yapısı)
2. [Teknolojiler](#teknolojiler)
3. [Özellikler / Modüller](#özellikler--modüller)
4. [Geliştirici Kılavuzu](#geliştirici-kılavuzu)
5. [Production / Sunucu Kılavuzu](#production--sunucu-kılavuzu)
6. [Sorun Giderme](#sorun-giderme)
7. [Lisans](#lisans)

---

## Proje Yapısı

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
|-- docker/            # Her servis icin production Dockerfile + nginx.conf
|-- scripts/           # Yardimci scriptler (db-backup.js)
|-- docker-compose.yml       # Lokal gelistirme altyapisi (Postgres/Redis/MinIO)
|-- docker-compose.prod.yml  # Production stack (7 servis, bkz. asagida)
|-- pnpm-workspace.yaml
`-- turbo.json
```

## Teknolojiler

| Katman | Teknolojiler |
| --- | --- |
| API | NestJS 11, Prisma 5, PostgreSQL 18, Redis 8, MinIO (S3 uyumlu), Socket.IO, Swagger |
| Admin | React 19, Vite 7, TypeScript, Tailwind CSS, React Router, TanStack Table |
| Storefront | Next.js 16, React 19, Tailwind CSS, Radix UI, Framer Motion |
| Monorepo | pnpm workspace, Turborepo |
| Altyapı | Docker, Docker Compose, Nginx (reverse proxy + TLS), Let's Encrypt |

## Özellikler / Modüller

API tarafındaki modüller (`apps/api/src/modules/`):

`accounting`, `audit-logs`, `auth`, `banners`, `barcode`, `campaigns`, `cargo`, `categories`, `cms`, `collections`, `customer-groups`, `customers`, `dashboard`, `email`, `health`, `invoices`, `loyalty`, `messaging`, `notifications`, `orders`, `payment`, `pos`, `price-lists`, `products`, `reports`, `returns`, `roles`, `settings`, `shipping`, `storefront`, `suppliers`, `transactions`, `upload`, `users`, `variants`.

Öne çıkan iki kavramın farkı (sık karıştırılıyor):

- **Kategori** (`categories`) — her ürünün ait olduğu, hiyerarşik (üst/alt kategori) zorunlu bir sınıflandırma. Bir ürünün tam olarak bir kategorisi vardır.
- **Koleksiyon** (`collections`) — ürünlerle çoktan-çoğa ilişkili, admin panelinden serbestçe oluşturulan, kendi özel URL'i (`/koleksiyonlar/{slug}`, isimden otomatik üretilir) olan pazarlama/kürasyon grupları. Bir ürün hiç koleksiyonda olmayabilir ya da birden fazla koleksiyonda yer alabilir. Ana sayfadaki "Koleksiyonları Keşfet" kartları ve üst menüdeki "Koleksiyonlar" açılır listesi **aktif koleksiyonlardan otomatik** beslenir — admin panelinde bir koleksiyon oluşturup ürün atadığınızda ayrıca hiçbir yerde elle bağlantı kurmanız gerekmez.

Admin panel; katalog (ürün/kategori/koleksiyon), sipariş, müşteri, POS, muhasebe, rapor, CMS ve sistem yönetimi (kullanıcı/rol) ekranları içerir. Storefront ise müşteriye açık vitrin ve alışveriş deneyimini sağlar (giriş/kayıt, sepet, ödeme, sipariş takibi, favoriler, iade talebi).

---

## Geliştirici Kılavuzu

### Gereksinimler

- Node.js 18 veya üzeri
- pnpm 9 (`packageManager` alanıyla sabitlenmiş)
- Docker ve Docker Compose (yerel Postgres/Redis/MinIO için)

### Kurulum

```bash
pnpm install
docker compose up -d          # Postgres, Redis, MinIO konteynerleri
cp apps/api/.env.example apps/api/.env
```

Windows PowerShell:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

`apps/api/.env` içinde en azından şunları doldurun:

```env
DATABASE_URL="postgresql://peyker_user:peyker_password@localhost:2345/peyker_db?schema=public"
JWT_SECRET=  # node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Frontend'ler için:

```env
# apps/admin/.env
VITE_API_URL=http://localhost:3000/api

# apps/storefront/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Veritabanı

```bash
pnpm run db:migrate:dev   # yeni migration oluştur + uygula (lokal geliştirme)
pnpm run db:seed          # admin kullanıcı, roller, örnek kategori/ürün
```

Yeni bir Prisma modeli/alanı eklediğinizde `apps/api/prisma/schema.prisma`'yı düzenleyip yukarıdaki `migrate:dev` komutunu çalıştırmanız migration dosyasını otomatik üretir. Production'da migration'lar **asla `migrate dev` ile değil**, `migrate deploy` ile uygulanır (bkz. [Production Kılavuzu](#deploy-akışı)).

### Geliştirme sunucularını başlatma

```bash
pnpm run dev                              # tüm uygulamalar (turbo)
pnpm --filter api run start:dev           # sadece API
pnpm --filter admin run dev               # sadece admin
pnpm --filter storefront run dev          # sadece storefront
```

| Uygulama | Adres |
| --- | --- |
| API | http://localhost:3000/api |
| Swagger | http://localhost:3000/docs (yalnızca `NODE_ENV !== production`) |
| Admin | http://localhost:5173 |
| Storefront | http://localhost:3500 |
| MinIO Console | http://localhost:9001 |

### Komutlar

```bash
pnpm run dev              # geliştirme sunucuları
pnpm run build            # tüm paketleri build et
pnpm run lint              # lint
pnpm run format             # prettier
pnpm run check-types        # tsc --noEmit (tüm paketler)
pnpm run db:migrate:dev
pnpm run db:migrate:deploy
pnpm run db:seed
pnpm run db:backup          # scripts/db-backup.js
```

Test:

```bash
pnpm --filter api run test
pnpm --filter api run test:cov
pnpm --filter api run test:e2e
```

Değişiklik yapmadan önce **her zaman** ilgili paket(ler)de `tsc --noEmit` çalıştırıp derlemenin temiz geçtiğini doğrulayın; CI/CD olmadığı için bu tek otomatik güvenlik ağıdır.

---

## Production / Sunucu Kılavuzu

### Sunucu

- **Sağlayıcı/IP:** `45.88.139.52` (Ubuntu 22.04 LTS)
- **DNS/CDN:** Cloudflare proxy arkasında (`peykermoda.com`, `www.peykermoda.com`, `admin.peykermoda.com`)
- **Proje dizini:** `/var/www/peyker-app` (bu reponun `master` branch'inin klonu)
- **Erişim:** `deploy` kullanıcısı, **sadece SSH anahtarıyla** (parola girişi ve doğrudan `root` girişi kapalı)
- **GitHub erişimi:** Sunucuda salt-okunur bir Deploy Key var (`~/.ssh/github_deploy_key`) — sunucu koda push edemez, sadece çeker

### Güvenlik sertleştirmesi (bir kez, sunucu ilk kurulurken yapıldı)

| Katman | Durum |
| --- | --- |
| SSH | `PermitRootLogin no`, `PasswordAuthentication no`, sadece `deploy` kullanıcısı + anahtar |
| Firewall (UFW) | Sadece `22` (SSH), `80`, `443` açık; her şey varsayılan reddediliyor |
| fail2ban | SSH için aktif, tekrarlayan başarısız girişleri otomatik banluyor |
| Otomatik güncelleme | `unattended-upgrades` aktif (güvenlik yamaları) |
| MinIO | Container portları (`9000`/`9001`) sadece `127.0.0.1`'e bağlı, dışarıya kapalı |
| Nginx | `server_tokens off`, güvenlik header'ları (`X-Frame-Options`, `X-Content-Type-Options`, vb.), rate limiting (`limit_req`) |
| API | Swagger (`/docs`) sadece `NODE_ENV !== production` iken açılıyor; production'da tamamen kapalı |

Sıfırdan sunucu kurulumu gerekirse (felaket kurtarma): yeni Ubuntu 22.04 sunucuda `deploy` kullanıcısı oluşturup SSH anahtarı ekleyin, `ufw`/`fail2ban`/`unattended-upgrades` kurup yukarıdaki kurallarla yapılandırın, Docker Engine + Compose plugin'i resmi script ile kurun, `certbot certonly --standalone` ile SSL sertifikası alın (port 80 boşken), sonra aşağıdaki "İlk deploy" adımlarını izleyin.

### Ortam değişkenleri (`.env.docker`)

Sunucuda `/var/www/peyker-app/.env.docker` dosyası bulunur (**git'e commit edilmez**, `.gitignore`'da). Şablonu `.env.docker.example`'da:

| Değişken | Açıklama |
| --- | --- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Veritabanı kimlik bilgileri |
| `REDIS_PASSWORD` | Redis parolası |
| `JWT_SECRET` | En az 64 byte random hex (`node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`) |
| `JWT_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Token ömürleri |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth (Google ile giriş) |
| `CORS_ORIGIN` | Virgülle ayrılmış izinli origin'ler (`https://peykermoda.com,https://admin.peykermoda.com`) |
| `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` | MinIO (S3) kimlik bilgileri |
| `S3_BUCKET` / `S3_REGION` | `peyker-media` / `us-east-1` |
| `UPLOAD_BASE_URL` | `https://peykermoda.com/media` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_FIRST_NAME` / `ADMIN_LAST_NAME` | İlk seed'de oluşturulan admin hesabı |
| `VITE_API_URL` / `VITE_SOCKET_URL` | Admin build-time değişkenleri |
| `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_GOOGLE_CLIENT_ID` / `NEXT_PUBLIC_SITE_URL` | Storefront build-time değişkenleri |
| `NGINX_HTTP_PORT` / `NGINX_HTTPS_PORT` | Varsayılan `80` / `443` |

⚠️ Tüm parola/secret alanları production'da **benzersiz ve rastgele** olmalı — hiçbir değer bu repodaki veya geliştirme ortamındaki değerlerle aynı olmamalı.

### Docker Compose servisleri (`docker-compose.prod.yml`)

| Servis | Container adı | Bellek limiti | Dışa açık port |
| --- | --- | --- | --- |
| `postgres` | `peyker_prod_db` | 512M | — (iç ağ) |
| `redis` | `peyker_prod_redis` | 256M | — (iç ağ) |
| `minio` | `peyker_prod_minio` | 512M | `127.0.0.1:9000-9001` |
| `api` | `peyker_prod_api` | 512M | — (nginx üzerinden) |
| `admin` | `peyker_prod_admin` | 128M | — (nginx üzerinden) |
| `storefront` | `peyker_prod_storefront` | 256M | — (nginx üzerinden) |
| `nginx` | `peyker_prod_nginx` | 128M | `80`, `443` |

Tüm servisler `peyker-network` adlı izole bir Docker bridge ağında; dışarıya sadece nginx'in 80/443 portları ve MinIO'nun localhost-only portları açık.

### Deploy akışı

Kod değişikliği → GitHub → sunucu akışı:

```bash
# 1. Lokalde: değişikliği yap, type-check et, commit + push
git add <dosyalar>
git commit -m "..."
git push origin master

# 2. Sunucuda: kodu çek
ssh -i ~/.ssh/peykermoda_server deploy@45.88.139.52
cd /var/www/peyker-app
git pull origin master

# 3. Değişen servisleri yeniden build et (sadece etkilenenleri belirtmek build'i hızlandırır)
docker compose -f docker-compose.prod.yml --env-file .env.docker build api admin storefront

# 4. Container'ları yeni image'lerle yeniden oluştur
docker compose -f docker-compose.prod.yml --env-file .env.docker up -d --force-recreate api admin storefront

# 5. (Şema değiştiyse) migration'ı uygula — API'nin docker-entrypoint.sh'ı zaten
#    container başlarken otomatik `prisma migrate deploy` çalıştırır, ama elle de tetiklenebilir:
make migrate
```

`make` kuruluysa yukarıdaki build/up adımları yerine kısayollar kullanılabilir: `make build`, `make up`, `make restart`, `make logs`, `make ps` (bkz. kök `Makefile`). Windows'ta `make` yoksa doğrudan `docker compose -f docker-compose.prod.yml --env-file .env.docker ...` komutları kullanılır.

**Migration dosyası oluşturma notu:** Sunucuda canlı veritabanına doğrudan `prisma migrate dev` çalıştırılmaz. Lokalde bağlı bir Postgres yoksa, migration SQL'i veritabanına dokunmadan salt şema karşılaştırmasıyla üretilebilir:

```bash
git show HEAD:apps/api/prisma/schema.prisma > /tmp/schema_old.prisma
cd apps/api
npx prisma migrate diff --from-schema-datamodel /tmp/schema_old.prisma --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/<timestamp>_<isim>/migration.sql
npx prisma generate
```

### SSL sertifikası

Let's Encrypt, `certbot` ile alınmış (`peykermoda.com`, `www.peykermoda.com`, `admin.peykermoda.com`), sertifikalar `/etc/letsencrypt/` altında, nginx container'ına salt-okunur mount edilir (`docker-compose.prod.yml`'de `volumes: - /etc/letsencrypt:/etc/letsencrypt:ro`). Yenileme, certbot paketinin kurduğu `/etc/cron.d/certbot` girdisiyle otomatik günlük kontrol edilir; sertifika yenilenince nginx container'ının yeni dosyayı okuması için `docker compose restart nginx` gerekebilir.

### Yedekleme

```bash
pnpm run db:backup   # scripts/db-backup.js — Postgres dump alır
```

Production'da veritabanı Docker volume'unda (`postgres_data`) kalıcıdır; container silinse bile veri korunur. Volume'u silen komutlar (`docker compose down -v`, `make clean`) **asla** production'da çalıştırılmamalı.

### Container sağlığını kontrol etme

```bash
docker compose -f docker-compose.prod.yml --env-file .env.docker ps
docker logs --tail 50 peyker_prod_api
```

---

## Sorun Giderme

Geliştirme sürecinde karşılaşılan ve kalıcı olarak çözülen sorunlar, benzerleri tekrarlanırsa hızlıca tanınması için:

- **Next.js standalone container'ı sağlıksız (`unhealthy`) görünüyor ama site çalışıyor:** Docker, her container'a otomatik bir `HOSTNAME` ortam değişkeni (container ID) atar; Next.js standalone `server.js` bu değişkeni bulursa sadece o adrese bağlanır, `127.0.0.1`'e değil — healthcheck (`localhost`) bu yüzden başarısız olur. Çözüm: `docker/storefront/Dockerfile`'da `ENV HOSTNAME=0.0.0.0`.
- **nginx/admin healthcheck'i `wget: can't connect` hatası veriyor:** Alpine'ın `wget`'i `localhost`'u önce IPv6 (`::1`)'e çözüyor, ama container sadece IPv4'te dinliyor. Çözüm: healthcheck komutlarında `localhost` yerine `127.0.0.1` kullanmak.
- **`GET /reports/sales` beklenmedik şekilde 400/401 dönüyor:** İki farklı controller aynı path'e kayıtlıydı (`TransactionsController`'ın bare `@Controller()` + `'reports/sales'` route'u, `ReportsController`'ın `@Controller('reports')` + `'sales'` route'uyla çakışıyordu). NestJS route'ları modül kayıt sırasına göre eşleştirdiği için yanlış handler tetikleniyordu — yeni route eklerken tüm `@Get`/`@Post` path'lerinin proje genelinde benzersiz olduğundan emin olun.
- **Rapor tarih filtreleri "Invalid Date" hatası veriyor:** Bazı yerlerde `endDate + 'T23:59:59.999Z'` gibi string concat kullanılıyordu; frontend tam ISO datetime gönderirse (`.toISOString()`) bu geçersiz bir string üretir. Çözüm: `Date` nesnesi üzerinde `setUTCHours(23,59,59,999)` kullanmak (bkz. `transactions.service.ts`'teki `endOfDay()` helper'ı).
- **Harici görsel servislerine (Unsplash, placeholder.com) bağımlılık:** Tüm hotlink edilmiş görseller kaldırıldı; yerel marka görselleri (`/peyker-moda-kapak1.png`, `/peyker-moda-kapak3.png`, her uygulamanın `public/` klasöründe) veya boş bırakılıp mevcut "Görsel Yok" arayüzüne düşecek şekilde değiştirildi. Yeni bir yerde placeholder görsel gerekirse bu deseni takip edin, harici bir servise hotlink vermeyin.

---

## Lisans

Bu proje özel kullanım içindir ve `UNLICENSED` olarak işaretlenmiştir.
