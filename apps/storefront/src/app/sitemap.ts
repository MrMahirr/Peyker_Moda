export const dynamic = 'force-dynamic';
import { MetadataRoute } from 'next';
import { storeApi } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://peykermoda.com';

  const sitemapItems: MetadataRoute.Sitemap = [];

  // 1. Static Pages
  const staticRoutes = [
    '',
    '/giyim',
    '/aksesuar',
    '/indirim',
    '/koleksiyonlar/cok-satanlar',
    '/koleksiyonlar/yeni-gelenler',
    '/gizlilik-politikasi',
    '/kullanim-kosullari',
  ];

  staticRoutes.forEach((route) => {
    sitemapItems.push({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: route === '' ? 'daily' : 'weekly',
      priority: route === '' ? 1.0 : 0.8,
    });
  });

  // 2. Categories
  try {
    const categories = await storeApi.getCategories();
    categories.forEach((category) => {
      if (category.slug) {
        sitemapItems.push({
          url: `${siteUrl}/koleksiyonlar/${category.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    });
  } catch (error) {
    console.error('Sitemap: Kategori çekilirken hata:', error);
  }

  // 3. Products
  try {
    // Fetch a large number of products for sitemap. 
    // If the store grows significantly, this should be paginated or streamed.
    const productData = await storeApi.getProducts({ limit: 1000 });
    productData.products.forEach((product) => {
      if (product.slug) {
        sitemapItems.push({
          url: `${siteUrl}/urun/${product.slug}`,
          lastModified: new Date(product.createdAt || new Date()),
          changeFrequency: 'daily',
          priority: 0.9,
        });
      }
    });
  } catch (error) {
    console.error('Sitemap: Ürünler çekilirken hata:', error);
  }

  return sitemapItems;
}
