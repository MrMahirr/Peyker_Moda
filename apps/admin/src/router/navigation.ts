export const navigation = [
  {
    title: "Dashboard",
    path: "/",
    icon: "dashboard",
  },
  {
    title: "Personel",
    path: "/staff",
    icon: "users",
  },
  {
    title: "Katalog",
    path: "/catalog",
    icon: "shirt",
    children: [
      { title: "Ürünler", path: "/catalog" },
      { title: "Kategoriler", path: "/catalog/categories" },
      { title: "Koleksiyonlar", path: "/catalog/collections" },
      { title: "Yeni Ürün", path: "/catalog/new" },
    ],
  },

  {
    title: "Siparişler",
    path: "/sales/orders",
    icon: "package",
  },
  {
    title: "Müşteriler",
    path: "/crm",
    icon: "user-check",
  },
  {
    title: "İade Talepleri",
    path: "/returns",
    icon: "refresh-ccw",
  },
  {
    title: "Muhasebe",
    path: "/accounting",
    icon: "banknote",
  },
  {
    title: "Analiz & İstatistik",
    path: "/reports",
    icon: "bar-chart-2",
  },
  {
    title: "Pazarlama",
    path: "/marketing",
    icon: "megaphone",
    children: [
      { title: "Kampanyalar", path: "/marketing/campaigns" },
      { title: "Fiyat Listeleri", path: "/marketing/price-lists" },
      { title: "Toplu Mesaj", path: "/marketing/bulk-messages" },
    ],
  },

  {
    title: "Kargo & Lojistik",
    path: "/shipping",
    icon: "truck",
  },
  {
    title: "Tedarikçiler",
    path: "/suppliers",
    icon: "building",
  },
  {
    title: "CMS (İçerik)",
    path: "/cms",
    icon: "file-text",
  },
  {
    title: "Ayarlar",
    path: "/settings",
    icon: "settings",
    children: [
      { title: "Genel", path: "/settings/general" },
      { title: "Fiş/Yazıcı", path: "/settings/printer" },
      { title: "Profilim", path: "/settings/profile" },
    ],
  },
];
