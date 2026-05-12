# Peyker Moda - Yayın Öncesi Derin Analiz

Tarih: 2026-05-12  
Kapsam: `apps/admin`, `apps/storefront`, `apps/api`, root config ve yayın öncesi operasyonel hazırlıklar

## 1. Bu analiz nasıl yapıldı

Bu rapor aşağıdaki kaynaklara göre hazırlandı:

- Kod tabanı tarandı.
- Frontend route/page yüzeyi incelendi.
- Frontend servis URL'leri ile backend controller endpoint'leri karşılaştırıldı.
- Aşağıdaki komutlar çalıştırıldı:
  - `pnpm --filter api build`
  - `pnpm --filter admin build`
  - `pnpm --filter storefront build`
  - `pnpm --filter admin lint`
  - `pnpm --filter storefront lint`
  - `cd apps/api && pnpm exec jest --runInBand`

## 2. Kısa karar

Bu proje bu haliyle yayına alınmamalı.

Ana nedenler:

1. `admin` production build almıyor.
2. `storefront` production build almıyor.
3. Storefront içinde çalışan gibi görünen bazı akışlar gerçekte eksik endpoint veya ölü buton nedeniyle tamamlanamıyor.
4. Ödeme, e-posta ve toplu mesaj tarafında mock/pending entegrasyonlar var.
5. Test seti güven vermiyor; API testlerinin bir kısmı kırık.

## 3. Önemli not: eski kök raporun bir kısmı güncel değil

Root'taki eski raporlar tamamen çöpe atılmalı demiyorum ama aynen referans alınmamalı.

Örnek:

- `shipping`, `cms`, `loyalty`, `suppliers`, `reports`, `health` backend modülleri mevcut.
- Güvenlik tarafında env validation, health endpoint, CORS, Helmet, Winston ve role guard altyapısı da var.

Yani ilk iş "eksik backend modülü yazmak" değil. İlk iş build kırıklarını, storefront entegrasyon boşluklarını ve yayın blokajlarını kapatmak.

## 4. Mevcut durum özeti

| Alan | Durum | Not |
| --- | --- | --- |
| API build | Geciyor | `pnpm --filter api build` başarılı |
| API testleri | Kırık | 6 test suite'in 3'ü fail |
| Admin lint | Kırık | 141 error, 5 warning |
| Admin build | Kırık | TypeScript ve import hataları nedeniyle fail |
| Storefront lint | Kırık | 39 error, 28 warning |
| Storefront build | Kırık | `/ara` sayfasında `useSearchParams` nedeniyle fail |
| Health endpoint | Var | `apps/api/src/modules/health/health.controller.ts` |
| Migrations | Var | `apps/api/prisma/migrations` dolu |
| Env validation | Var | `apps/api/src/config/env.validation.ts` |

## 5. P0 - Yayını doğrudan bloklayan sorunlar

### 5.1 Admin build kırık

`pnpm --filter admin build` fail veriyor. Bu tek başına admin paneli production'a çıkarmayı engeller.

Örnek kanıtlar:

- Yanlış import path: `apps/admin/src/components/layout/Header.tsx:3`
- `JSX.Element` namespace hatası: `apps/admin/src/router/appRoutes.tsx:34`
- `import.meta.env` type problemi: `apps/admin/src/lib/axios.ts:4`, `apps/admin/src/lib/socket.ts:3`
- UI component API drift:
  - `variant="outline"`: `apps/admin/src/features/settings/profile/PersonalInfoForm.tsx:67`
  - `size="icon"`: `apps/admin/src/features/sales/orders/OrderDetail.tsx:77`
  - `variant="default"`: `apps/admin/src/features/sales/orders/OrderDetail.tsx:96`

Kök neden:

- Ortak UI bileşenleri ile feature kodları aynı contract'ta değil.
- Eski buton/badge varyantları kullanılmış.
- Bazı import yolları taşınmış ama tüketen dosyalar güncellenmemiş.

Ne yapmalısın:

1. Önce build'i yeşile çevir.
2. Lint'i sonra temizle; build kırıkları daha kritik.
3. İlk hedef: `pnpm --filter admin build` sıfır hata.

Nasıl yapmalısın:

1. `apps/admin/src/components/layout/Header.tsx` içindeki `NotificationDropdown` import'unu düzelt.
2. `JSX.Element` geçen yerleri `React.ReactElement` veya `ReactNode` ile değiştir.
3. Vite env typing ekle (`vite/client`) veya mevcut typing setup'ını düzelt.
4. `Button` ve `Badge` kullanan tüm feature dosyalarını mevcut component API'sine uydur:
   - `outline` -> `secondary` veya `ghost`
   - `default` -> `primary`
   - `icon` size yerine uygun sabit size + class kullan
   - `danger` yerine `error`/mevcut badge varyantı kullan
5. Sonra tekrar çalıştır:
   - `pnpm --filter admin build`

### 5.2 Storefront build kırık

`pnpm --filter storefront build` fail veriyor.

Kesin kanıt:

- `apps/storefront/src/app/ara/page.tsx:18` `useSearchParams()` kullanıyor.
- Build hatası: `/ara` sayfası suspense boundary olmadan prerender edilmeye çalışılıyor.

Ek problemli satırlar:

- `apps/storefront/src/app/ara/page.tsx:57` URL güncellemesi için `window.history.pushState`
- `apps/storefront/src/app/ara/page.tsx:141` ve `:230` unescaped quotes lint hatasına sebep oluyor

Ne yapmalısın:

1. `/ara` sayfasını Next 16 kurallarına uygun hale getir.
2. Sonra tekrar `pnpm --filter storefront build` çalıştır.

Nasıl yapmalısın:

1. `useSearchParams` kullanan UI'yi ayrı client component'e taşı.
2. Üst page'i `<Suspense>` ile sar.
3. Alternatif olarak sayfayı bilinçli şekilde dynamic hale getir.
4. Aynı turda lint hatalarını da temizle:
   - unescaped stringler
   - `any` kullanımları
   - effect dependency problemleri

### 5.3 API test seti kırık

`cd apps/api && pnpm exec jest --runInBand` sonucu:

- 6 suite'in 3'ü fail
- 17 testin 9'u fail

Ana problemler:

- `ProductsService` testlerinde `UploadService` mock'u eksik
- `auth.service.spec.ts` içinde hiç test yok
- `logger.module.spec.ts` `ConfigService` dependency çözmüyor

Bu ne demek:

- API build geçse de regresyon güveni zayıf.
- Yayın öncesi fix sonrası otomatik doğrulama güvenilir değil.

Ne yapmalısın:

1. Testleri geçirecek kadar test altyapısını onar.
2. Özellikle ürün, auth, logger ve storefront checkout tarafını kapsa.

## 6. Açılan ama işlevsel olarak eksik veya kırık sayfalar / butonlar

### 6.1 Storefront profil sayfası gerçek kullanıcı verisi göstermiyor

Kanıt:

- `apps/storefront/src/app/profil/page.tsx:139` `defaultValue="Peyker"`
- `apps/storefront/src/app/profil/page.tsx:147` `defaultValue="peyker@ornek.com"`
- `apps/storefront/src/app/profil/page.tsx:211` "Kayıtlı kartlar özelliği çok yakında eklenecek."

Sorun:

- Profil ekranı gerçek profile bağlı değil.
- Payment sekmesi placeholder.

Ne yapmalısın:

1. `store/auth/me` endpoint'ini gerçekten kullan.
2. Profil formunu local dummy default value yerine API verisiyle hydrate et.
3. Kayıtlı kartlar özelliği yoksa:
   - ya menüden kaldır
   - ya "yakında" değil tam kapsam dışı olarak gizle

### 6.2 Storefront siparişler ekranında ölü butonlar var

Kanıt:

- `apps/storefront/src/components/profile/OrdersContent.tsx:169` `Fatura`
- `apps/storefront/src/components/profile/OrdersContent.tsx:219` `Kargo Takip`
- `apps/storefront/src/components/profile/OrdersContent.tsx:224` `İade Talebi`
- `apps/storefront/src/components/profile/OrdersContent.tsx:225` `Tekrar Satın Al`
- `apps/storefront/src/components/profile/OrdersContent.tsx:228` `Sipariş Detayı`

Sorun:

- Butonlar render ediliyor ama click davranışı yok.

Ne yapmalısın:

1. Her buton için karar ver:
   - gerçekten çalışacak
   - ya da görünmeyecek
2. "Kargo Takip" için backend tracking URL veya tracking code akışı tanımla.
3. "Fatura" için invoice PDF endpoint'i veya download route ekle.
4. "Tekrar Satın Al" için item'ları yeniden sepete ekle.
5. "Sipariş Detayı" için detay drawer/page ekle.
6. "İade Talebi" yoksa butonu şimdilik kaldır.

### 6.3 Storefront footer sosyal linkleri ölü

Kanıt:

- `apps/storefront/src/components/layout/Footer.tsx:14`
- `apps/storefront/src/components/layout/Footer.tsx:15`

Her ikisi de `href="#"`.

Ne yapmalısın:

1. Gerçek sosyal URL'leri bağla.
2. Hazır değilse linkleri tamamen kaldır.

### 6.4 Storefront kayıt sayfası olmayan sayfalara link veriyor

Kanıt:

- `apps/storefront/src/app/kayit/page.tsx:211` `/kullanim-kosullari`
- `apps/storefront/src/app/kayit/page.tsx:212` `/gizlilik-politikasi`

Bu page'ler `src/app` altında yok.

Ne yapmalısın:

1. Bu iki sayfayı oluştur.
2. İçeriği hukuk onayıyla doldur.
3. Açılmayacaksa link verme.

### 6.5 Admin login ekranında "Şifremi unuttum" linki boş

Kanıt:

- `apps/admin/src/features/auth/components/LoginForm.tsx:67`

Sorun:

- Kullanıcıya aksiyon veriliyor ama link `#`.

Ne yapmalısın:

1. Reset password akışı varsa gerçek route bağla.
2. Yoksa bu linki kaldır.

### 6.6 Admin kampanya oluşturma sayfası boş iskelet

Kanıt:

- `apps/admin/src/features/marketing/campaigns/CampaignForm.tsx:24`

Sorun:

- Route var, sayfa açılıyor, ama form yok.

Ne yapmalısın:

1. Bu ekranı gerçekten implement et.
2. Hazır değilse route'u ve nav girişini geçici kapat.

### 6.7 Admin WhatsApp entegrasyonu sunuluyor ama gönderim kapalı

Kanıt:

- Uyarı metni: `apps/admin/src/features/marketing/messaging/WhatsAppIntegration.tsx:20`
- Buton disabled: `apps/admin/src/features/marketing/messaging/WhatsAppIntegration.tsx:23`

Sorun:

- Kullanıcıya fonksiyon varmış gibi gösteriliyor.

Ne yapmalısın:

1. Gerçek provider entegrasyonu tamamlanana kadar bu ekranı "read-only setup info" olarak netleştir.
2. Veya navigation'dan kaldır.

### 6.8 Admin bildirim dropdown'ında ölü CTA var

Kanıt:

- `apps/admin/src/features/notifications/components/NotificationDropdown.tsx:191` `Tüm Bildirimleri Gör`

Sorun:

- Buton render ediliyor ama route veya handler yok.

Ne yapmalısın:

1. Bildirimler sayfası aç.
2. Ya da butonu kaldır.

## 7. Frontend-backend entegrasyon boşlukları

### 7.1 Storefront `getOrders()` yanlış endpoint'e gidiyor

Kanıt:

- Frontend: `apps/storefront/src/lib/api.ts:289-291` -> `/store/orders`
- Backend `store` controller içinde böyle bir endpoint yok:
  - son route `apps/api/src/modules/storefront/storefront.controller.ts:128` `orders/track`

Sonuç:

- Profil > Siparişlerim verisi gerçek backend'den gelemez.

Ne yapmalısın:

1. Backend'e `GET /store/orders` ekle.
2. Customer auth ile koru.
3. Sadece login olan müşterinin siparişlerini döndür.
4. Frontend transform layer'ını o payload'a göre düzelt.

### 7.2 Storefront kupon doğrulama endpoint'i yanlış namespace kullanıyor

Kanıt:

- Frontend: `apps/storefront/src/lib/api.ts:357-359` -> `/store/coupons/validate`
- Backend: `apps/api/src/modules/campaigns/campaigns.controller.ts:140` -> `/coupons/validate`

Sonuç:

- Sepette kupon doğrulama çalışmaz.

Ne yapmalısın:

1. Tek bir contract seç:
   - ya frontend `/coupons/validate` çağırsın
   - ya backend store altında proxy route sunsun
2. Sonra `sepet` akışını manuel test et.

### 7.3 Header koleksiyon linkleri yanlış slug üretiyor olabilir

Kanıt:

- `apps/storefront/src/components/layout/Header.tsx:34-36`
- Banner varsa `slug: b.id` mapleniyor
- Ama collection fetch fonksiyonu `apps/storefront/src/lib/api.ts:416` `getCollectionBySlug(slug)`

Risk:

- Banner ID ile collection slug aynı değilse `/koleksiyonlar/:slug` kırılır.

Ne yapmalısın:

1. Banner ile collection'u karıştırma.
2. Header koleksiyonları için ayrı collection payload tasarla.
3. Eğer banner linki kullanılacaksa doğrudan `link` alanını kullan.

## 8. Operasyonel ve gerçek entegrasyon riskleri

### 8.1 Ödeme gerçek provider değil, mock

Kanıt:

- `apps/api/src/modules/payment/payment.service.ts:5`
- `apps/api/src/modules/payment/payment.service.ts:15`

Sorun:

- Gerçek ödeme sağlayıcısı yok.
- Checkout UI de fiilen sadece `CASH` sunuyor:
  - `apps/storefront/src/app/odeme/page.tsx:34`
  - `apps/storefront/src/app/odeme/page.tsx:93`
  - `apps/storefront/src/app/odeme/page.tsx:256`

Ne yapmalısın:

1. Net karar ver:
   - İlk yayında sadece kapıda ödeme mi?
   - Kartlı ödeme de olacak mı?
2. Sadece kapıda ödeme olacaksa:
   - payment result page'i ve initializePayment dead code'unu temizle
   - UI'da kartlı ödeme beklentisi oluşturma
3. Kartlı ödeme olacaksa:
   - provider entegre et
   - callback flow
   - hata, iptal, 3DS, timeout testleri

### 8.2 E-posta servisi SMTP yoksa mock modda

Kanıt:

- `apps/api/src/modules/email/email.service.ts:37`
- `apps/api/src/modules/email/email.service.ts:45-46`

Sonuç:

- Sipariş maili production'da sessizce mock log'a düşebilir.

Ne yapmalısın:

1. SMTP env'lerini production'da zorunlu yap.
2. Test ortamı dışında mock fallback'i kabul etme.

### 8.3 Toplu mesaj provider'ları pending

Kanıt:

- `apps/api/src/modules/messaging/messaging-provider-registry.service.ts:17`
- `apps/api/src/modules/messaging/messaging-provider-registry.service.ts:28`
- `apps/api/src/modules/messaging/messaging-provider-registry.service.ts:32`

Sonuç:

- UI var ama gerçek kanal yok.

Ne yapmalısın:

1. Email/SMS provider tamamlanana kadar bu modülü beta gibi işaretle veya gizle.

### 8.4 WebSocket CORS gevşek ve invalid token public odaya düşüyor

Kanıt:

- `apps/api/src/websocket/websocket.gateway.ts:26` `origin: '*'`
- `apps/api/src/websocket/websocket.gateway.ts:75`
- `apps/api/src/websocket/websocket.gateway.ts:80`

Risk:

- Browser origin kontrolü gevşek.
- Invalid token client tamamen reject edilmiyor, public room'a alınıyor.

Ne yapmalısın:

1. Production origin whitelist uygula.
2. Invalid token bağlantısını disconnect et.
3. Public namespace ihtiyacı yoksa kaldır.

## 9. Güvenlik tarafında iyi olanlar

Bunlar var; sıfırdan yapmana gerek yok:

- Env validation: `apps/api/src/config/env.validation.ts`
- Production'da zayıf JWT/admin password kontrolü: `apps/api/src/config/env.validation.ts:63-82`
- Helmet: `apps/api/src/main.ts:29`
- CORS setup: `apps/api/src/main.ts:43`
- Swagger: `apps/api/src/main.ts:97-98`
- Health endpoint: `apps/api/src/modules/health/health.controller.ts:8-24`
- Role guard: `apps/api/src/common/guards/roles.guard.ts`

Ama dikkat:

- Permissions guard yazılmış olsa da aktif kullanım göremedim.
- `@Permissions(...)` dekoratörü ile fiili kullanım yok.

## 10. Sana önerdiğim doğru iş sırası

### Faz 1 - Build kırıklarını kapat

Öncelik:

1. `admin` build
2. `storefront` build
3. `api` test fail'leri

Done kriteri:

- `pnpm --filter admin build` geçecek
- `pnpm --filter storefront build` geçecek
- `cd apps/api && pnpm exec jest --runInBand` en azından tamamen kırmızı olmayacak

### Faz 2 - Kullanıcıya görünen ölü alanları temizle

Öncelik:

1. Storefront ölü butonlar
2. Eksik sayfa linkleri
3. Admin boş/disabled görünen modüller

Done kriteri:

- Kullanıcının tıklayabildiği her CTA ya çalışıyor olacak ya da görünmeyecek

### Faz 3 - Storefront veri sözleşmesini düzelt

Öncelik:

1. `/store/orders`
2. `/coupons/validate` contract uyumu
3. Profil verisi
4. Koleksiyon slug mantığı

Done kriteri:

- Profil, siparişlerim, kupon ve arama akışları gerçek backend ile çalışacak

### Faz 4 - Gerçek entegrasyonlar

Öncelik:

1. Ödeme provider kararı
2. SMTP
3. SMS/WhatsApp/email bulk provider

Done kriteri:

- Mock modda çalışan kritik iş akışı kalmayacak

### Faz 5 - Yayın öncesi son QA

Mutlaka yap:

1. Admin login/logout
2. Ürün listeleme / detay / oluşturma
3. Sipariş listeleme / durum güncelleme
4. Storefront kayıt / giriş
5. Sepet / checkout
6. Sipariş takip
7. Profil / siparişlerim
8. Banner / collection linkleri
9. SMTP canlı mail
10. Health endpoint ve log kontrolü

## 11. Hızlı TODO listesi

### P0

- [ ] `admin` build hatalarını kapat
- [ ] `storefront` build hatasını kapat
- [ ] API test fail'lerini onar

### P1

- [ ] Storefront `getOrders()` için gerçek endpoint ekle
- [ ] Kupon endpoint sözleşmesini düzelt
- [ ] Profil sayfasındaki hardcoded alanları kaldır
- [ ] `/kullanim-kosullari` ve `/gizlilik-politikasi` sayfalarını ekle

### P2

- [ ] Footer sosyal linklerini gerçek URL'lere bağla
- [ ] Admin forgot-password linkini bağla veya kaldır
- [ ] Admin campaign formu gerçek form haline getir
- [ ] NotificationDropdown içindeki ölü CTA'yı kaldır veya bağla
- [ ] Storefront siparişler ekranındaki ölü butonları implemente et veya kaldır

### P3

- [ ] Payment provider kararını ver ve uygula
- [ ] SMTP'yi production zorunluluğu haline getir
- [ ] Messaging provider entegrasyonlarını tamamla
- [ ] WebSocket CORS ve auth davranışını sıkılaştır

## 12. Son söz

Bu projede en büyük yanlış öncelik, "eksik modül var mı?" diye başlamaktır. Şu an asıl problem modül eksikliği değil; build kırıkları, storefront contract boşlukları, ölü UI aksiyonları ve mock kalan kritik entegrasyonlardır.

İlk hedefin şu olmalı:

1. Production build'i iki frontend için de yeşile çek.
2. Tıklanabilir ama çalışmayan her şeyi kaldır veya tamamla.
3. Storefront backend sözleşmesini sabitle.
4. Ondan sonra gerçek yayın hazırlığına geç.
