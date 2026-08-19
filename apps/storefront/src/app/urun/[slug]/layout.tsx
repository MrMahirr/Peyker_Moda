export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { storeApi } from '@/lib/api';
import { resolveProductImages } from '@/lib/utils';

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await storeApi.getProductBySlug(resolvedParams.slug);

  if (!product) {
    return {
      title: 'Ürün Bulunamadı | Peyker Moda',
      description: 'Aradığınız ürün bulunamadı.',
    };
  }

  const resolvedImages = resolveProductImages(product.images);
  const imageUrl = resolvedImages[0] || 'https://peykermoda.com/og-image.png';

  return {
    title: `${product.name} | Peyker Moda`,
    description: product.description || `Peyker Moda'nın yeni sezon koleksiyonundan ${product.name} ürününü keşfedin.`,
    alternates: {
      canonical: `https://peykermoda.com/urun/${resolvedParams.slug}`,
    },
    openGraph: {
      title: `${product.name} | Peyker Moda`,
      description: product.description || `Peyker Moda'nın yeni sezon koleksiyonundan ${product.name} ürününü keşfedin.`,
      url: `https://peykermoda.com/urun/${resolvedParams.slug}`,
      siteName: 'Peyker Moda',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 1200,
          alt: product.name,
        },
      ],
      locale: 'tr_TR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Peyker Moda`,
      description: product.description || `Peyker Moda'nın yeni sezon koleksiyonundan ${product.name} ürününü keşfedin.`,
      images: [imageUrl],
    },
  };
}

export default async function ProductLayout({ children, params }: Props) {
  const resolvedParams = await params;
  const product = await storeApi.getProductBySlug(resolvedParams.slug);

  let jsonLd = null;

  if (product) {
    const resolvedImages = resolveProductImages(product.images);
    const inStock = product.stock > 0;

    jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": resolvedImages,
      "description": product.description || `Peyker Moda'nın yeni sezon koleksiyonundan ${product.name}.`,
      "sku": product.sku,
      "brand": {
        "@type": "Brand",
        "name": "Peyker Moda"
      },
      "offers": {
        "@type": "Offer",
        "url": `https://peykermoda.com/urun/${resolvedParams.slug}`,
        "priceCurrency": "TRY",
        "price": product.price,
        "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "itemCondition": "https://schema.org/NewCondition"
      }
    };
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
