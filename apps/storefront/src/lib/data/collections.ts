// --- KOLEKSİYON VERİTABANI SİMÜLASYONU ---
// Gerçekte burası veritabanından gelecek.
// Anahtar (Key) = URL'deki isim (slug)
type CollectionDbProduct = {
  id: number;
  name: string;
  price: number;
  oldPrice: number | null;
  image: string;
  description: string;
  category: string;
};

type CollectionDbEntry = {
  meta: {
    title: string;
    subtitle: string;
    description: string;
    coverImage: string;
    accentColor: string;
  };
  products: CollectionDbProduct[];
};
export const collectionsDB: Record<string, CollectionDbEntry> = {
  "kis-2025": {
    meta: {
      title: "2025 Kış Koleksiyonu",
      subtitle: "Soğuk günlerin sıcak ve zarif dokunuşu.",
      description:
        "Doğanın dinginliğinden ilham alan, kaşmir dokular ve toprak tonlarının hakim olduğu yeni sezon seçkisi.",
      coverImage:
        "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=2000&auto=format&fit=crop",
      accentColor: "bg-amber-600",
    },
    products: [
      {
        id: 501,
        name: "Kaşmir Oversize Palto",
        price: 8500,
        oldPrice: null,
        image:
          "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=800&auto=format&fit=crop",
        description: "Soğuk havalarda stilinizden ödün vermeyin.",
        category: "Dış Giyim",
      },
      {
        id: 502,
        name: "Yünlü Triko Takım",
        price: 3200,
        oldPrice: null,
        image:
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop",
        description: "Ev konforunu sokağa taşıyan şıklık.",
        category: "Triko",
      },
      // ... Diğer kış ürünleri
    ],
  },
  "yeni-gelenler": {
    meta: {
      title: "Yeni Gelenler",
      subtitle: "Sezonun en taze parçaları burada.",
      description: "Podyumlardan sokağa taşınan en yeni trendler.",
      coverImage:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&auto=format&fit=crop",
      accentColor: "bg-rose-600",
    },
    products: [
      // Yeni gelen ürünler buraya eklenebilir
      {
        id: 301,
        name: "Drapeli Saten Elbise",
        price: 3250,
        oldPrice: null,
        image:
          "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop",
        category: "Elbise",
        description: "Gece davetlerinin vazgeçilmezi.",
      },
    ],
  },
};
