import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://peykermoda.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/profil',
        '/profil/',
        '/sepet',
        '/sepet/',
        '/odeme',
        '/odeme/',
        '/siparis-takip',
        '/siparis-takip/',
        '/api/',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
