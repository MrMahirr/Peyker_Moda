# Butik Mağaza Admin Paneli — Tüm Modüller

Aşağıda bir butik moda mağazasının admin panelinde olması gereken **tüm modüller**, POS satış ve ön muhasebe dahil olmak üzere listelenmiştir. Mevcut Peyker Moda projesinde **zaten var olan** modüller ✅, **eksik olan** modüller ❌ ile işaretlenmiştir.

---

## 1. 📊 Dashboard (Gösterge Paneli) ✅

| Alt Modül | Açıklama | Durum |
|-----------|----------|-------|
| Günlük/Haftalık/Aylık Satış Özeti | Toplam ciro, sipariş sayısı, ortalama sepet tutarı | ✅ Var |
| En Çok Satan Ürünler | Top 10 ürün, beden/renk kırılımları | ✅ Var |
| Stok Uyarıları | Kritik stok seviyesine düşen ürünler | ❌ Eksik |
| Kasa Durumu | Anlık kasa bakiyesi, günlük giriş/çıkış | ❌ Eksik |
| Müşteri İstatistikleri | Yeni müşteri, tekrar eden müşteri oranı | ❌ Eksik |
| Hedef Takibi | Aylık/yıllık satış hedefi ve ilerleme | ❌ Eksik |

---

## 2. 📦 Ürün Yönetimi (Katalog) ✅

| Alt Modül | Açıklama | Durum |
|-----------|----------|-------|
| Ürün CRUD | Ürün ekleme, düzenleme, silme, kopyalama | ✅ Var |
| Kategori Yönetimi | Ana/alt kategori ağaç yapısı | ✅ Var |
| Varyant Yönetimi | Beden, renk, kumaş varyantları | ✅ Var |
| Barkod Yönetimi | Barkod oluşturma, yazdırma, okuma | ✅ Var |
| Toplu Ürün İşlemleri | Excel/CSV import-export | ❌ Eksik |
| Ürün Görselleri | Çoklu görsel yükleme, sıralama | ✅ Var |
| Fiyat Yönetimi | Alış fiyatı, satış fiyatı, indirimli fiyat | ✅ Var |
| Marka Yönetimi | Marka ekleme, filtreleme | ❌ Eksik |
| Etiket (Tag) Yönetimi | Ürün etiketleri (yeni, trend, sezon sonu vb.) | ❌ Eksik |
| Sezon/Koleksiyon Yönetimi | Sezonlara göre ürün gruplama | ❌ Eksik |

---

## 3. 📋 Stok Yönetimi ❌ (Kısmi)

| Alt Modül | Açıklama | Durum |
|-----------|----------|-------|
| Stok Takibi | Ürün bazlı anlık stok durumu | ✅ Kısmi (varyant bazlı stok var) |
| Stok Giriş/Çıkış | Manuel stok giriş, çıkış, transfer | ❌ Eksik |
| Stok Sayımı | Fiziksel sayım ve düzeltme | ❌ Eksik |
| Depo/Mağaza Yönetimi | Çoklu lokasyon stok takibi | ❌ Eksik |
| Stok Hareket Geçmişi | Tüm stok hareketlerinin loglanması | ❌ Eksik |
| Minimum Stok Uyarıları | Kritik seviye altına düşünce bildirim | ❌ Eksik |
| Stok Devir Hızı Raporları | Ürün bazlı devir hızı analizi | ❌ Eksik |

---

## 4. 🛒 POS — Satış Noktası ✅

| Alt Modül | Açıklama | Durum |
|-----------|----------|-------|
| Hızlı Satış Ekranı | Barkod/isim ile ürün ekleme, sepet yönetimi | ✅ Var |
| Barkod Okuyucu | Barkod tarayıcı entegrasyonu | ✅ Var |
| Ödeme İşlemi | Nakit, kredi kartı, havale, çoklu ödeme | ✅ Var |
| Fiş/Fatura Yazdırma | Termal yazıcı ile fiş çıktısı | ✅ Var |
| İndirim Uygulama | Sepet/ürün bazlı indirim | ✅ Var |
| Müşteri Seçimi | Satışa müşteri bağlama | ✅ Var |
| İade/Değişim | POS üzerinden iade ve değişim | ✅ Var (kısmi) |
| Kasa Açma/Kapama | Vardiya başı/sonu kasa sayımı | ❌ Eksik |
| Park Edilen Satışlar | Satışı askıya alma, sonra tamamlama | ❌ Eksik |
| Hızlı Butonlar | Sık satılan ürünler için kısayol | ❌ Eksik |
| Çoklu Kasa Desteği | Birden fazla kasa/terminal yönetimi | ❌ Eksik |

---

## 5. 🧾 Sipariş Yönetimi ✅

| Alt Modül | Açıklama | Durum |
|-----------|----------|-------|
| Sipariş Listesi | Tüm siparişlerin filtrelenebilir listesi | ✅ Var |
| Sipariş Detayı | Ürünler, tutar, müşteri, ödeme bilgisi | ✅ Var |
| Sipariş Durumu Yönetimi | Onay, hazırlık, kargo, teslim durumları | ✅ Var |
| İade Yönetimi | İade talebi, onay, stok geri girişi | ✅ Kısmi |
| Sipariş Notu | Müşteri/personel notları | ❌ Eksik |
| Otomatik Stok Düşümü | Satış onayında stoğu otomatik düşme | ✅ Var |

---

## 6. 💰 Ön Muhasebe ✅ (Kısmi)

| Alt Modül | Açıklama | Durum |
|-----------|----------|-------|
| **Kasa Yönetimi** | | |
| ↳ Nakit Kasa | Günlük nakit giriş/çıkış takibi | ❌ Eksik |
| ↳ POS Kasa | Kredi kartı tahsilat takibi | ❌ Eksik |
| ↳ Banka Hesapları | Banka hesap bakiyeleri ve hareketleri | ❌ Eksik |
| **Gelir/Gider Yönetimi** | | |
| ↳ Gelir Kayıtları | Satış dışı gelirler (kira, faiz vb.) | ✅ Var (kısmi — `accounting/cash-flow`) |
| ↳ Gider Kayıtları | Kira, maaş, fatura, malzeme giderleri | ✅ Var (`accounting/expenses`) |
| ↳ Gider Kategorileri | Gider türlerini sınıflandırma | ✅ Var |
| **Fatura Yönetimi** | | |
| ↳ Satış Faturası | Otomatik fatura oluşturma | ✅ Var (`accounting/invoices`) |
| ↳ Alış Faturası | Tedarikçi fatura kaydı | ❌ Eksik |
| ↳ İade Faturası | İade işlemleri için fatura | ❌ Eksik |
| ↳ e-Fatura/e-Arşiv | GİB entegrasyonu | ❌ Eksik |
| **Cari Hesap Yönetimi** | | |
| ↳ Müşteri Cari | Müşteri borç/alacak takibi | ✅ Var (`accounting/current-accounts`) |
| ↳ Tedarikçi Cari | Tedarikçi borç/alacak takibi | ❌ Eksik |
| ↳ Cari Ekstre | Hesap özeti ve detaylı hareket | ✅ Kısmi |
| **Tahsilat / Ödeme** | | |
| ↳ Çek/Senet Takibi | Alınan/verilen çek ve senet | ❌ Eksik |
| ↳ Taksit Takibi | Taksitli satışların takibi | ❌ Eksik |
| ↳ Vade Takibi | Vadesi gelen ödemelerin listesi | ❌ Eksik |
| **Raporlama** | | |
| ↳ Kar/Zarar Raporu | Dönemsel kar/zarar hesabı | ✅ Var (`accounting/reports`) |
| ↳ Nakit Akışı Raporu | Nakit giriş/çıkış analizi | ✅ Var (`accounting/cash-flow`) |
| ↳ KDV Raporu | Dönemsel KDV hesaplaması | ❌ Eksik |
| ↳ Dönem Sonu Kapanış | Aylık/yıllık muhasebe kapanışı | ❌ Eksik |

---

## 7. 👥 Müşteri Yönetimi (CRM) ✅

| Alt Modül | Açıklama | Durum |
|-----------|----------|-------|
| Müşteri Listesi | Filtrelenebilir müşteri listesi | ✅ Var |
| Müşteri Detay | İletişim, adres, satın alma geçmişi | ✅ Var |
| Müşteri Grupları | VIP, toptan, perakende segmentleri | ✅ Var |
| Sadakat Programı | Puan sistemi, seviye bazlı avantajlar | ❌ Eksik |
| Müşteri Notu / Etkileşim | Müşteriyle yapılan görüşme notları | ❌ Eksik |
| Müşteri Analizi | Yaşam boyu değer, satın alma sıklığı | ❌ Eksik |

---

## 8. 📢 Pazarlama & Kampanya ✅

| Alt Modül | Açıklama | Durum |
|-----------|----------|-------|
| Kampanya Yönetimi | İndirim kampanyası oluşturma, süre ayarlama | ✅ Var |
| Kupon Kodu | Tek/çoklu kullanım kupon oluşturma | ❌ Eksik |
| Fiyat Listeleri | Toptan/perakende fiyat listeleri | ✅ Var |
| SMS/E-Posta Pazarlama | Toplu mesaj gönderimi | ✅ Var (messaging) |
| WhatsApp Entegrasyonu | WhatsApp Business bildirimleri | ❌ Eksik |
| Banner / Vitrin Yönetimi | Web sitesi vitrin ve banner düzeni | ❌ Eksik |

---

## 9. 🚚 Kargo & Lojistik ✅ (Kısmi)

| Alt Modül | Açıklama | Durum |
|-----------|----------|-------|
| Kargo Firması Yönetimi | Aras, MNG, Yurtiçi entegrasyonları | ✅ Var (kısmi) |
| Gönderi Oluşturma | Otomatik kargo etiketi ve barkod | ❌ Eksik |
| Kargo Takibi | Gönderi durum takibi | ❌ Eksik |
| Kargo Ücreti Hesaplama | Ağırlık/bölge bazlı ücret | ❌ Eksik |
| Teslimat Raporu | Teslim edilen/iade edilen kargo raporu | ❌ Eksik |

---

## 10. 👨‍💼 Personel & Yetki Yönetimi ✅

| Alt Modül | Açıklama | Durum |
|-----------|----------|-------|
| Kullanıcı Yönetimi | Personel ekleme, düzenleme, silme | ✅ Var |
| Rol Yönetimi | Admin, kasiyer, depocu rolleri | ✅ Var |
| Yetki Yönetimi (RBAC) | Modül/aksiyon bazlı izin tanımlama | ❌ Eksik (planlanmış) |
| Personel Performansı | Kişi bazlı satış performansı | ❌ Eksik |
| Vardiya/Mesai Takibi | Çalışma saatleri ve vardiya planı | ❌ Eksik |
| Aktivite Geçmişi (Audit Log) | Kim, ne zaman, ne yaptı logları | ✅ Var |

---

## 11. ⚙️ Ayarlar & Konfigürasyon ✅

| Alt Modül | Açıklama | Durum |
|-----------|----------|-------|
| Mağaza Bilgileri | İsim, adres, vergi no, logo | ✅ Var |
| Yazıcı Ayarları | Fiş yazıcısı, etiket yazıcısı | ✅ Var |
| Ödeme Yöntemleri | Aktif ödeme yöntemleri tanımlama | ❌ Eksik |
| Vergi Ayarları | KDV oranları tanımlama | ❌ Eksik |
| Bildirim Ayarları | E-posta/SMS bildirim tercihleri | ❌ Eksik |
| Döviz Kurları | Çoklu para birimi desteği | ❌ Eksik |
| Yedekleme | Veritabanı yedekleme/geri yükleme | ❌ Eksik |

---

## 12. 📈 Raporlama & Analiz ❌ (Kısmi)

| Alt Modül | Açıklama | Durum |
|-----------|----------|-------|
| Satış Raporları | Günlük/haftalık/aylık detaylı satış | ❌ Eksik (ayrı modül olarak) |
| Ürün Performans Raporu | En çok/az satan, kar marjı analizi | ❌ Eksik |
| Personel Satış Raporu | Kasiyer bazlı satış performansı | ❌ Eksik |
| Müşteri Analiz Raporu | Segmentasyon, satın alma alışkanlıkları | ❌ Eksik |
| Stok Raporu | Stok değeri, devir hızı, yaşlandırma | ❌ Eksik |
| Finansal Raporlar | Bilanço, gelir tablosu, nakit akışı | ✅ Kısmi (`accounting/reports`) |
| Karşılaştırmalı Raporlar | Dönem bazlı karşılaştırma | ❌ Eksik |
| Rapor Dışa Aktarım | PDF, Excel, CSV export | ❌ Eksik |

---

## 13. 🏭 Tedarikçi Yönetimi ❌

| Alt Modül | Açıklama | Durum |
|-----------|----------|-------|
| Tedarikçi Listesi | Tedarikçi bilgileri CRUD | ❌ Eksik |
| Sipariş Verme | Tedarikçiye sipariş oluşturma | ❌ Eksik |
| Tedarikçi Cari | Borç/alacak ve ödeme takibi | ❌ Eksik |
| Tedarik Geçmişi | Alım geçmişi ve fiyat karşılaştırma | ❌ Eksik |

---

## 14. 🌐 Storefront / CMS Yönetimi ❌

| Alt Modül | Açıklama | Durum |
|-----------|----------|-------|
| Anasayfa Düzeni | Vitrin, slider, öne çıkan ürünler | ❌ Eksik |
| Statik Sayfalar | Hakkımızda, İletişim, Politikalar | ❌ Eksik |
| SEO Ayarları | Meta bilgiler, Open Graph, sitemap | ❌ Eksik |
| Blog/Duyuru | İçerik yönetimi, moda yazıları | ❌ Eksik |

---

## Özet: Mevcut Durum

| Kategori | Toplam Alt Modül | Mevcut | Eksik |
|----------|:---:|:---:|:---:|
| Dashboard | 6 | 2 | 4 |
| Ürün Yönetimi | 10 | 5 | 5 |
| Stok Yönetimi | 7 | 1 | 6 |
| POS | 11 | 6 | 5 |
| Sipariş Yönetimi | 6 | 4 | 2 |
| Ön Muhasebe | 20 | 7 | 13 |
| CRM | 6 | 3 | 3 |
| Pazarlama | 6 | 3 | 3 |
| Kargo & Lojistik | 5 | 1 | 4 |
| Personel & Yetki | 6 | 3 | 3 |
| Ayarlar | 7 | 2 | 5 |
| Raporlama | 8 | 1 | 7 |
| Tedarikçi Yönetimi | 4 | 0 | 4 |
| CMS Yönetimi | 4 | 0 | 4 |
| **TOPLAM** | **106** | **38** | **68** |

> [!IMPORTANT]
> Projenizde toplamda **106 alt modülden 38'i** mevcut durumda var veya kısmen uygulanmış. **68 alt modül** henüz eksik. Öncelik sırası: **Stok Yönetimi → Ön Muhasebe tamamlama → POS geliştirme → Tedarikçi Yönetimi → Raporlama** şeklinde ilerlenebilir.
