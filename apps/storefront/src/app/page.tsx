"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import CollectionsSection from "@/components/home/CollectionsSection";
import ProductSection from "@/components/home/ProductSection";
import { storeApi, Product } from "@/lib/api";
import { resolveProductImages } from "@/lib/utils";
import { useSaleProducts } from "@/hooks/useSaleProducts";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const { saleProducts, loadingSaleProducts } = useSaleProducts();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Featured products - newest items
      const featured = await storeApi.getProducts({
        limit: 8,
        sortBy: "newest",
      });

      setFeaturedProducts(featured.products);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Transform API products to ProductSection format
  const transformProducts = (products: Product[]) => {
    return products.map((p) => {
      const imgs = resolveProductImages(p.images);
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        oldPrice: p.compareAtPrice || null,
        image: imgs[0] || "/placeholder.svg",
        tag: p.tags?.[0] || "",
        slug: p.slug,
        stock: p.stock,
        variants: p.variants,
      };
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-amber-200">
      <Header />

      <main>
        <HeroSection />

        <CollectionsSection />

        <ProductSection
          title="Öne Çıkan Parçalar"
          subtitle="Bu sezonun en çok tercih edilen ikonik tasarımları."
          products={transformProducts(featuredProducts)}
          bgColor="bg-stone-50/50"
          loading={loading}
        />

        {(!loadingSaleProducts && saleProducts.length > 0) && (
          <ProductSection
            title="Sezon İndirimleri"
            subtitle="Favori parçalarınızda kaçırılmayacak fırsatlar."
            products={transformProducts(saleProducts)}
            isSale={true}
            loading={loadingSaleProducts}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
