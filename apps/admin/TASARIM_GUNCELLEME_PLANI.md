# Admin Panel Yeniden Tasarım Planı (Stitch Boutique)

Bu belge, Admin Panelinin "Stitch Boutique" tasarımına uygun olarak yenilenmesi için yapılacak işleri adım adım listeler.

## 1. Hazırlık ve Konfigürasyon
- [x] **Kütüphane Kurulumu:**
  - `recharts`: Satış grafikleri için.
  - `clsx`, `tailwind-merge`: Class yönetimi için (Zaten varsa kontrol edilecek).
- [x] **Tailwind CSS Ayarları (`apps/admin/src/index.css`):**
  - Renk paletinin eklenmesi:
    - Primary: `#308ce8`
    - Background Light: `#f6f7f8`
    - Background Dark: `#111921`
    - Boutique Rose: `#fdf2f2`
    - Boutique Gold: `#d4af37`
  - Fontların eklenmesi: `Manrope` ve `Noto Sans`.

## 2. Layout (Düzen) Bileşenleri
Konum: `apps/admin/src/components/layout/`

- [x] **`Sidebar.tsx`**:
  - Yeni logo ve marka alanı ("Boutique Admin").
  - Navigasyon linkleri (Dashboard, Inventory, Orders, Customers, vb.).
  - Aktif link stili (`active-nav`).
  - "Go to POS" butonu.
- [x] **`Header.tsx`**:
  - Arama çubuğu (Search input).
  - Bildirim ve Ayarlar butonları.
  - Kullanıcı profili alanı (Avatar ve İsim).
- [x] **`DashboardLayout.tsx`**:
  - Sidebar ve Header'ı birleştiren ana düzen.
  - Responsive yapı (Mobil uyumluluk).

## 3. Dashboard Widget'ları
Konum: `apps/admin/src/features/dashboard/components/`

- [x] **`StatCard.tsx`**:
  - KPI kartları (Daily Sales, Total Profit, vb.).
  - İkon, başlık, değer ve değişim yüzdesi (+12.5% gibi).
- [x] **`SalesChart.tsx`**:
  - `recharts` kullanılarak oluşturulacak alan grafiği (AreaChart).
  - Gelir ve Gider (Revenue vs Expenses) gösterimi.
- [x] **`InventoryAlerts.tsx`**:
  - Stok azalan ürünlerin listelendiği kart.
  - Ürün resmi, adı, kalan stok sayısı ve ekleme butonu.
- [x] **`RecentTransactions.tsx`**:
  - Son siparişlerin listelendiği tablo.
  - Sipariş ID, Müşteri, Tarih, Tutar ve Durum sütunları.

## 4. Sayfa Entegrasyonu
Konum: `apps/admin/src/features/dashboard/`

- [x] **`DashboardPage.tsx`**:
  - Yukarıdaki widget'ların grid yapısında (Grid Layout) birleştirilmesi.
  - "Bonjour, [Kullanıcı]" karşılama başlığı.
  - Tarih filtresi ve Rapor Export butonları.

## 5. Doğrulama
- [x] Admin panelinin hatasız açılması.
- [x] Tüm bileşenlerin ve grafiklerin görsel olarak tasarıma uyması.
- [x] Mobil ve masaüstü görünüm kontrolleri.
