"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import ProductSection from "@/components/home/ProductSection";
import { storeApi, Product } from "@/lib/api";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Featured products - newest items
      const featured = await storeApi.getProducts({
        limit: 8,
        sortBy: 'newest',
      });

      // Sale products - on sale items
      const sale = await storeApi.getProducts({
        onSale: true,
        limit: 8,
      });

      setFeaturedProducts(featured.products);
      setSaleProducts(sale.products);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Transform API products to ProductSection format
  const transformProducts = (products: Product[]) => {
    return products.map(p => ({
      id: parseInt(p.id) || 0,
      name: p.name,
      price: p.price,
      oldPrice: p.compareAtPrice || null,
      image: p.images[0] || 'https://via.placeholder.com/400',
      tag: p.tags?.[0] || '',
      slug: p.slug,
    }));
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-amber-200">
      <Header />

      <main>
        <HeroSection />

        <CategoriesSection />

        <ProductSection
          title="Öne Çıkan Parçalar"
          subtitle="Bu sezonun en çok tercih edilen ikonik tasarımları."
          products={transformProducts(featuredProducts)}
          bgColor="bg-stone-50/50"
          loading={loading}
        />

        <ProductSection
          title="Sezon İndirimleri"
          subtitle="Favori parçalarınızda kaçırılmayacak fırsatlar."
          products={transformProducts(saleProducts)}
          isSale={true}
          loading={loading}
        />
      </main>

      <Footer />
    </div>
  );
}
