# Peyker Moda Admin Panel - Geliştirme Yol Haritası

Bu belge, **Peyker Moda** projesinin Admin Panel ve POS sistemi için oluşturulmuş dosya yapısını ve adım adım yapılacaklar listesini içerir.

## 📂 1. Hedeflenen Dosya Yapısı

```
src/
├── app/                        # Uygulama giriş noktaları ve Provider'lar
│   ├── App.tsx                 # Ana Routing ve Layout sarmalayıcı
│   └── main.tsx                # React DOM render
│
├── assets/                     # Statik dosyalar
├── components/                 # GLOBAL & ORTAK BİLEŞENLER
│   ├── ui/                     # Temel UI (Button, Input, DatePicker, Modal)
│   ├── layout/                 # Layout Sistemleri
│   │   ├── AdminLayout.tsx     # Klasik Sidebar + Header düzeni
│   │   ├── PosLayout.tsx       # POS için Sidebar'sız, tam ekran düzen
│   │   └── AuthLayout.tsx      # Login/Register ekran düzeni
│   └── shared/                 # Ortak işlevsel bileşenler
│       ├── ImageUpload.tsx     # Sürükle-bırak resim yükleyici
│       ├── PrinterTemplate.tsx # Fiş/Fatura yazdırma şablonu
│       └── DataGrid.tsx        # Filtreleme özellikli gelişmiş tablo
│
├── context/                    # Global Durumlar
│   ├── AuthContext.tsx         # Kullanıcı oturumu
│   ├── PosContext.tsx          # POS sepeti ve satış durumu
│   └── ThemeContext.tsx        # Dark/Light mode
│
├── lib/                        # Konfigürasyonlar
│   ├── axios.ts                # API İstekçisi
│   ├── socket.ts               # Anlık sipariş/stok bildirimi
│   └── utils.ts                # Helper fonksiyonlar
│
├── features/                   # İŞ MODÜLLERİ
│   ├── auth/                   # Yetkilendirme
│   ├── staff/                  # Personel Yönetimi
│   ├── crm/                    # Müşteri Yönetimi (CRM)
│   ├── catalog/                # Ürün Yönetimi
│   ├── sales/                  # Sipariş & İade
│   ├── pos/                    # POS Sistemi
│   ├── accounting/             # Ön Muhasebe
│   └── marketing/              # Kampanya & Fiyat
│
├── router/                     # Rota Tanımları
└── utils/                      # Genel Yardımcılar
```

## 📋 2. Adım Adım Yapılacaklar Listesi

### 🏗️ Aşama 1: Altyapı ve Klasör Kurulumu
- [x] `src/app` klasörü oluşturulacak, `App.tsx` ve `main.tsx` taşınacak.
- [x] Ana klasör ağacı (`features`, `components`, `lib`, `context`) kurulacak.
- [x] Temel konfigürasyon dosyaları (`vite.config.ts`, `tsconfig.json`) kontrol edilecek.

### 🧩 Aşama 2: Temel Bileşenler (Core Components)
- [x] **UI Kit:** `components/ui` altında temel taşların (Button, Input, Card) oluşturulması.
- [x] **Layouts:**
    - [x] `AdminLayout`: Sol menü ve üst bar içeren ana düzen.
    - [x] `PosLayout`: Satış ekranı için özel, tam genişlikli düzen.
- [x] **Shared:** `DataGrid` (Tablo) ve `ImageUpload` bileşenlerinin kodlanması.

### ⚙️ Aşama 3: State & Config
- [x] `AuthContext`: Login/Logout işlemleri.
- [x] `PosContext`: Sepet mantığının (Add, Remove, Clear Cart) yazılması.
- [x] `socket.ts`: WebSocket bağlantısının kurulması.
- [x] `axios.ts`: Base URL ve token inject işlemleri.

### 🚀 Aşama 4: Modül Geliştirmeleri (Features)

#### 1. Auth & Staff
- [x] Login ekranı tasarımı ve entegrasyonu.
- [x] Personel rolleri ve yetki yönetimi.

#### 2. Catalog (Ürün Yönetimi)
- [x] Ürün listesi sayfası.
- [x] **Ürün Ekleme Sihirbazı:** Step-by-step form (Info -> Variants -> SEO).
- [x] Varyant matrisi mantığının kurulması.

#### 3. POS (Satış Ekranı)
- [x] Ürün Grid ve Arama.
- [x] Barkod okuyucu dinleyicisi (`usePosHotkeys`).
- [x] Cart Context ve Sepet UI.
- [x] Ödeme Modalı ve Satış Tamamlama.
- [x] Fiş Önizleme ve Yazdırma.

#### 4. CRM & Sales
- [x] Müşteri veritabanı ekranları.
- [x] Satış geçmişi ve sipariş detayları.
- [x] İade (Return) süreci yönetimi.

#### 5. Accounting (Muhasebe)
- [x] Gelir/Gider takibi formları.
- [x] Fatura oluşturma şablonları.
- [x] Gün sonu (Z-Raporu) ekranı.

#### 6. Marketing (Kampanya & Fiyat)
- [x] Kampanya oluşturma (İndirim, Kupon).
- [x] Özel fiyat listeleri (Müşteri grubu bazlı).
- [x] Toplu SMS/E-posta gönderimi.

#### 7. Settings (Ayarlar)
- [x] Mağaza genel ayarları.
- [x] Yazıcı ve fiş tasarımı düzenleyici.
- [x] Kullanıcı profil ve şifre işlemleri.

#### 8. Dashboard (Genel Bakış)
- [ ] Ana sayfa widget'ları (Günlük özet, Kritik stok, Çok satanlar).
- [ ] Bildirim merkezi.
