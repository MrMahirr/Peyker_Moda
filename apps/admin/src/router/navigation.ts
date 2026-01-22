export const navigation = [
    {
        title: 'Dashboard',
        path: '/',
        icon: 'dashboard',
    },
    {
        title: 'Personel',
        path: '/staff',
        icon: 'users',
    },
    {
        title: 'Katalog',
        path: '/catalog',
        icon: 'shirt',
    },
    {
        title: 'Satış Ekranı (POS)',
        path: '/pos',
        icon: 'shopping-cart',
    },
    {
        title: 'İade Talepleri',
        path: '/returns',
        icon: 'refresh-ccw',
    },
    {
        title: 'Muhasebe',
        path: '/accounting',
        icon: 'banknote',
    },
    {
        title: 'Pazarlama',
        path: '/marketing',
        icon: 'megaphone',
        children: [
            { title: 'Kampanyalar', path: '/marketing/campaigns' },
            { title: 'Fiyat Listeleri', path: '/marketing/price-lists' },
            { title: 'Toplu Mesaj', path: '/marketing/bulk-messages' }
        ]
    },
    {
        title: 'Ayarlar',
        path: '/settings',
        icon: 'settings',
        children: [
            { title: 'Genel', path: '/settings/general' },
            { title: 'Fiş/Yazıcı', path: '/settings/printer' },
            { title: 'Profilim', path: '/settings/profile' }
        ]
    }
];
