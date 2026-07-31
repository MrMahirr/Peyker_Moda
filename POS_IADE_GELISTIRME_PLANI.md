# POS ve Iade Gelistirme Plani

Bu dokuman, `apps/admin` icindeki POS ve iade ekranlarini tam calisir hale getirmek, `apps/api` backend akisini gercek iade modeliyle baglamak ve sonraki adimda `apps/storefront` tarafinin ayni iade altyapisini kullanabilmesini saglamak icin hazirlanmistir.

## 1. Mevcut Durum Ozeti

### Frontend

- POS ana ekran: `apps/admin/src/features/pos/PosPage.tsx`
- POS servisleri: `apps/admin/src/features/pos/services/pos.service.ts`
- POS state: `apps/admin/src/context/PosContext.tsx`
- POS bilesenleri: `apps/admin/src/features/pos/components/*`
- Iade ekranlari: `apps/admin/src/features/sales/returns/ReturnRequests.tsx`, `RefundModal.tsx`
- Iade servisi: `apps/admin/src/features/sales/services/returns.service.ts`

Gozlemler:

- POS satis akisi `/pos/sale` endpointine bagli ve satis olusturuyor.
- POS sepetinde iade icin negatif adet destegi dusunulmus, fakat `updateQuantity` negatif adetleri kaldirdigi icin iade akisi guvenilir degil.
- `ReturnExchangeModal` POS icinden aciliyor, ancak backend ile tam bagli bir iade/degisim akisi olarak ele alinmali.
- Iade listesi su anda gercek `Return` kayitlarini okumuyor; `/orders?status=RETURN_REQUESTED` gibi bir siparis statusunden iade verisi turetmeye calisiyor.
- Prisma enumlarinda `RETURN_REQUESTED` yok; mevcut `OrderStatus` degerleri arasinda `RETURNED` var. Bu nedenle mevcut iade listesi sozlesmesi tutarsiz.
- UI metinlerinde karakter bozulmalari var. Bu gelistirme sirasinda ilgili dosyalar UTF-8 olarak duzeltilmeli.

### Backend

- POS backend: `apps/api/src/modules/pos`
- Siparis backend: `apps/api/src/modules/orders`
- Storefront backend: `apps/api/src/modules/storefront`
- Prisma modelleri: `apps/api/prisma/schema.prisma`

Gozlemler:

- `Return` ve `ReturnItem` modelleri mevcut.
- `StorefrontService.createReturn` iade kaydi olusturabiliyor, fakat:
  - tekil iade kontrolunde `orderId` parametresi dogrudan kullaniliyor; siparis `orderNumber` ile bulunursa `existingReturn` kontrolu hatali olabilir.
  - tum siparis kalemlerini iade ediyor; body ile gelen parcali iade kalemlerini dogru kullanmiyor.
  - siparis statusu, iade statusu, stok ve odeme/refund tarafini tamamlamiyor.
- Admin tarafinda `Return` icin ayri controller/service yok.
- POS satisinda stok dusme islemi siparis olustuktan sonra ayri dongude yapiliyor; transaction kullanimi planlanmali.

## 2. Ana Hedefler

1. POS sayfasini gunluk kasa operasyonuna uygun, hizli ve hataya dayanikli hale getirmek.
2. Iade ekranini gercek `Return` ve `ReturnItem` modelleri uzerinden calistirmak.
3. Iade onay/red/tamamla akisini stok, odeme durumu, siparis durumu ve finansal kayitlarla tutarli hale getirmek.
4. Storefront musteri iade talebini ayni backend domain servisine baglamak.
5. SOLID prensiplerine uygun, componentlesmeye acik, mevcut monorepo mimarisini bozmayan bir yapi kurmak.

## 3. Mimari Kararlar

### Backend Mimari

Yeni bir `returns` domain modulu eklenmeli:

```text
apps/api/src/modules/returns/
  returns.module.ts
  returns.controller.ts
  returns.service.ts
  return-calculator.service.ts
  return-stock.service.ts
  return-payment.service.ts
  dto/
    index.ts
```

Sorumluluklar:

- `ReturnsController`: HTTP endpointleri, guard/role, DTO girisleri.
- `ReturnsService`: iade sureci orkestrasyonu.
- `ReturnCalculatorService`: iade edilebilir miktar, tutar, indirim dagitimi, parcali iade hesaplari.
- `ReturnStockService`: iade kabul edilince stok geri ekleme.
- `ReturnPaymentService`: refund kaydi, payment/order paymentStatus guncelleme, kasa/transaction etkisi.

Bu ayirim, tek bir service dosyasinin satis, stok, odeme ve kural mantigiyla sismesini engeller.

### Frontend Mimari

POS ve iade ekranlari container + presentational component yapisina cekilmeli:

```text
apps/admin/src/features/pos/
  PosPage.tsx
  hooks/
    usePosProducts.ts
    usePosCart.ts
    usePosSale.ts
    usePosSession.ts
    usePosHotkeys.ts
  components/
    PosShell.tsx
    PosCartPanel.tsx
    PosCartItem.tsx
    PosTotals.tsx
    PaymentModal.tsx
    ReturnExchangeModal.tsx
    ProductGrid.tsx
  services/
    pos.service.ts
  types/
    index.ts
```

```text
apps/admin/src/features/sales/returns/
  ReturnRequests.tsx
  components/
    ReturnFilters.tsx
    ReturnStatusBadge.tsx
    ReturnDetailDrawer.tsx
    ReturnItemsTable.tsx
    RefundModal.tsx
  hooks/
    useReturns.ts
    useReturnActions.ts
  services/
    returns.service.ts
  types/
    index.ts
```

Container bilesenleri veri yukleme ve aksiyonlari yonetir. UI bilesenleri sadece props alir.

## 4. Backend Detayli Plan

### Faz 1: Iade Domain Sozlesmesi

Eklenecek admin endpointleri:

- `GET /returns`
  - filtreler: `status`, `source`, `orderNumber`, `customerId`, `dateFrom`, `dateTo`, `page`, `limit`
  - include: order, customer, items, variant, product, payments summary
- `GET /returns/:id`
  - detay ekraninda kullanilacak tam iade verisi
- `POST /returns`
  - admin/POS tarafindan manuel iade talebi veya direkt iade baslatma
- `PATCH /returns/:id/approve`
  - iade talebini onaylar, gerekirse refund bekleniyor durumuna alir
- `PATCH /returns/:id/reject`
  - red sebebiyle talebi kapatir
- `POST /returns/:id/refund`
  - para iadesi/kasa cikisi/refund kaydini tamamlar
- `PATCH /returns/:id/complete`
  - stok ve siparis durumunu finalize eder

Storefront endpointleri mevcut `/store/orders/:id/return` sozlesmesini koruyabilir, ancak implementasyon `ReturnsService.createCustomerReturn` metoduna devredilmeli.

### Faz 2: DTO ve Validasyon

DTO siniflari:

- `CreateReturnDto`
  - `orderId`
  - `reason`
  - `notes?`
  - `items: { orderItemId?, variantId, quantity, reason? }[]`
- `CreateCustomerReturnDto`
  - storefront icin daha kisitli alanlar
- `ApproveReturnDto`
  - `approvedItems?`
  - `restock: boolean`
  - `notes?`
- `RejectReturnDto`
  - `reason`
- `RefundReturnDto`
  - `method`
  - `amount`
  - `reference?`
  - `notes?`

Validasyon kurallari:

- Siparis musteriye ait degilse storefront iade acamaz.
- Sadece tamamlanmis/teslim edilmis uygun siparisler iade edilebilir.
- Iade miktari siparis kalem miktarini ve daha once iade edilmis miktari asamaz.
- `refundAmount`, istemciden gelen deger yerine backend hesaplamasiyla belirlenmeli.
- Ayni siparis icin birden fazla parcali iade desteklenecekse unique engel konulmamalidir; kontrol kalem bazinda yapilmalidir.

### Faz 3: Transaction Guvenligi

Asagidaki islemler Prisma transaction icinde yapilmali:

- POS satis olusturma + stok dusme + payment olusturma.
- Iade onay/tamamla + stok geri ekleme + order/payment status guncelleme.
- Refund olusturma + transaction kaydi + kasa raporu etkisi.

Boylece stok dustu ama siparis olusmadi veya iade onaylandi ama stok guncellenmedi gibi ara durumlar engellenir.

### Faz 4: Status Modeli

Mevcut enumlar korunarak ilerlenebilir:

- `ReturnStatus.PENDING`: talep olustu, inceleme bekliyor.
- `ReturnStatus.APPROVED`: iade kabul edildi, refund/stok islemi bekliyor.
- `ReturnStatus.REJECTED`: iade reddedildi.
- `ReturnStatus.COMPLETED`: stok ve refund tamamlandi.

Siparis statusu:

- Tum kalemler iade tamamlandiginda `OrderStatus.RETURNED`.
- Parcali iade varsa mevcut `OrderStatus` yeterli degil. Iki secenek:
  - kisa vade: order status ayni kalir, iade durumu `returns` iliskisinden okunur.
  - orta vade: `PARTIALLY_RETURNED` enum degeri migration ile eklenir.

Odeme statusu:

- Tam iade: `PaymentStatus.REFUNDED`.
- Parcali iade: mevcut `PaymentStatus.PARTIAL` kullanilabilir; fakat bunun odeme tahsilati mi iade mi oldugu raporlarda acik olmayabilir.
- Orta vade icin `Refund` modeli veya `Payment` icinde negatif tutar yerine ayri refund kaydi dusunulmeli.

### Faz 5: Storefront Baglantisi

`StorefrontService.createReturn` dogrudan Prisma yazmak yerine:

```text
StorefrontController
  -> StorefrontService.createReturn
    -> ReturnsService.createCustomerReturn
```

Storefront icin gerekli davranis:

- Musteri kendi siparislerini gorebilmeli.
- Siparis detayinda iade edilebilir kalem ve miktar hesaplanmali.
- Musteri parcali iade talebi acabilmeli.
- Talep sonrasi admin `ReturnRequests` ekranina dusmeli.
- Musteri iade durumunu hesap sayfasinda takip edebilmeli.

## 5. Admin POS Detayli Plan

### Faz 1: POS Sepet Modelini Netlestirme

`PosContext` icindeki cart item modeli genisletilmeli:

- `variantId` zorunlu hale getirilmeli.
- `lineType: 'SALE' | 'RETURN' | 'EXCHANGE'` eklenmeli.
- Negatif quantity yerine pozitif quantity + lineType kullanilmali.
- `sourceOrderId?`, `sourceOrderItemId?`, `returnReason?` alanlari iade satirlari icin tutulmali.

Bu, sepet toplamlarini ve API payloadlarini daha temiz yapar.

### Faz 2: POS UI Kullanilabilirlik

POS ekraninda iyilestirilecek alanlar:

- Cart paneli `PosCartPanel`, `PosCartItem`, `PosTotals` olarak bolunmeli.
- Sepette stok uyarisi, adet limiti ve variant bilgisi net gorunmeli.
- Odeme butonu, kasa oturumu yoksa pasif olmali.
- Satis sonrasi fis, basarili sonuc ve yeni satis akisi korunmali.
- Barkod aramada bulunamadi/stok yok/ag hatasi ayrimi yapilmali.
- Hata mesajlari UTF-8 karakterlerle duzeltilmeli.

### Faz 3: POS Iade/Degisim Akisi

`ReturnExchangeModal` gercek is akisi haline getirilmeli:

1. Siparis/fis arama:
   - order number
   - barkod
   - musteri telefonu
2. Siparis kalemlerini listeleme:
   - urun, beden/renk, satin alinan adet, daha once iade edilen adet, iade edilebilir adet
3. Iade tipi secimi:
   - para iadesi
   - degisim
   - magaza kredisi notu, eger ileride desteklenecekse sadece tasarimda yer ayrilir
4. Iade kalemi ve sebep secimi.
5. Onay:
   - backend `POST /returns` veya `POST /returns/:id/refund` akisi.

POS icinden hizli iade yapilacaksa admin yetkisi ve kasa oturumu kontrol edilmeli.

## 6. Admin Iade Sayfasi Detayli Plan

### Liste Ekrani

`ReturnRequests` artik `/returns` endpointini kullanmali.

Kolonlar:

- Iade no
- Siparis no
- Kaynak: POS / Online
- Musteri
- Talep tarihi
- Iade tutari
- Kalem sayisi
- Durum
- Aksiyonlar

Filtreler:

- Durum
- Kaynak
- Tarih araligi
- Siparis no / musteri arama

### Detay Drawer/Modal

Detay ekraninda:

- Siparis bilgisi
- Musteri bilgisi
- Iade sebebi ve notlar
- Kalem bazli iade tablosu
- Daha onceki iade/refund gecmisi
- Onayla, reddet, refund tamamla aksiyonlari

### Refund Modal

`RefundModal` sadece onay sorusu olmaktan cikmali:

- Iade tutari backendden gelen hesaplanmis deger olarak gosterilmeli.
- Refund yontemi secilmeli: nakit, kart, havale, diger.
- Referans no/not girilebilmeli.
- Stok geri eklensin mi secenegi olmali.
- Tamamlandiginda liste ve detay cache/state yenilenmeli.

## 7. Veri Modeli ve Migration Notlari

Mevcut `Return` ve `ReturnItem` modelleri baslangic icin kullanilabilir. Ancak parcali iade ve raporlama icin su ek alanlar degerlendirilmeli:

- `Return.returnNumber String @unique`
- `Return.source ReturnSource` veya order source uzerinden turetme
- `Return.requestedByCustomerId String?`
- `Return.approvedByUserId String?`
- `Return.rejectedReason String?`
- `Return.completedAt DateTime?`
- `ReturnItem.orderItemId String?`
- `ReturnItem.refundAmount Decimal`
- `ReturnItem.restock Boolean`

Orta vade icin ayrica `Refund` modeli onerilir:

```text
Refund
  id
  returnId
  orderId
  paymentId?
  amount
  method
  status
  reference?
  processedByUserId
  processedAt
```

Bu model raporlama ve muhasebe tarafinda `Payment` kayitlarini bozmadan refund takibi saglar.

## 8. Test Plani

### Backend Unit Test

- Iade edilebilir miktar hesaplama.
- Parcali iade tutari hesaplama.
- Daha once iade edilmis kalemlerin tekrar iade edilememesi.
- Tam iade ve parcali iade status kararlari.

### Backend Integration Test

- POS satis olusturma stok dusurur.
- POS satis transaction fail olursa stok degismez.
- Storefront iade talebi `Return` ve `ReturnItem` olusturur.
- Admin iade onayi stok geri ekler.
- Refund tamamlaninca payment/order/return status tutarli olur.

### Frontend Test

- POS urun ekleme, adet guncelleme, odeme payloadi.
- Kasa oturumu yokken odeme engeli.
- Iade listesi filtreleri.
- Refund modal validasyonlari.
- Storefronttan gelen iade talebi admin listesinde gorunur.

### Manuel Kabul Senaryolari

1. POS satis yapilir, stok azalir, fis numarasi olusur.
2. POS uzerinden fis aranir, bir kalem iade edilir, stok geri eklenir.
3. Online siparis icin storefronttan iade talebi acilir, admin listesine duser.
4. Admin talebi reddeder, storefront durumunda red gorunur.
5. Admin talebi onaylayip refund tamamlar, siparis/iade/payment durumlari tutarli olur.
6. Ayni kalemin iade edilebilir miktarindan fazlasi ikinci kez iade edilemez.

## 9. Uygulama Sirasi

1. UTF-8 karakter bozulmalarini POS ve iade dosyalarinda duzelt.
2. Backend `returns` modulunu DTO/controller/service katmanlariyla ekle.
3. `StorefrontService.createReturn` implementasyonunu `ReturnsService` uzerinden calisacak sekilde refactor et.
4. POS satis akisini Prisma transaction icine al.
5. Admin `returns.service.ts` sozlesmesini `/returns` endpointlerine tasiyip tipleri ayir.
6. `ReturnRequests` sayfasini hook + component yapisina bol.
7. `RefundModal` ve detay drawer akisini tamamla.
8. POS sepet modelini `lineType` destekleyecek sekilde duzenle.
9. `ReturnExchangeModal` icinden siparis arama ve kalem bazli iade akisini bagla.
10. Storefront hesap/siparis sayfasinin iade talebi icin kullanacagi backend sozlesmesini dondur.
11. Testleri ve manuel kabul senaryolarini calistir.

## 10. Riskler ve Dikkat Edilecek Noktalar

- Mevcut `PaymentStatus.PARTIAL` hem eksik tahsilat hem parcali iade icin kullanilirsa raporlar karisabilir.
- `OrderStatus.RETURNED` parcali iade icin yeterli degil; parcali iade gerekiyorsa yeni enum planlanmali.
- Stok hareketleri icin ayri inventory ledger yoksa iade kaynakli stok artislari sadece variant stock uzerinden izlenir.
- POS kasa kapanis raporu refund/cikis tutarlarini hesaba katmazsa beklenen kasa bakiyesi hatali cikar.
- Storefront ve admin ayni iade servis mantigini kullanmazsa iki farkli is kurali olusur.

## 11. Kabul Kriterleri

- Admin iade listesi gercek `Return` kayitlarini gosterir.
- Storefronttan acilan iade talebi admin iade listesinde gorunur.
- POS uzerinden yapilan iade stok, siparis ve odeme durumlarini gunceller.
- Parcali iade yapildiginda sadece secilen kalem/miktar islenir.
- Tam iade yapildiginda siparis `RETURNED`, iade `COMPLETED`, odeme `REFUNDED` veya belirlenen refund statusune gecer.
- Iade tutari frontend tarafindan serbest belirlenmez; backend hesaplar.
- Tum kritik satis/iade islemleri transaction icinde calisir.
- POS ve iade ekranlari componentlesmis, test edilebilir ve mevcut klasor mimarisine uyumlu hale gelir.
