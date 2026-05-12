"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Percent, Loader2, Tag } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import { storeApi, Product } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("discount");

  useEffect(() => {
    fetchSaleProducts();
  }, [sortBy]);

  const fetchSaleProducts = async () => {
    setLoading(true);
    try {
      const result = await storeApi.getProducts({
        onSale: true,
        limit: 24,
        sortBy,
      });
      setProducts(result.products);
    } catch (error) {
      console.error('Failed to fetch sale products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-amber-200">
      <Header />

      {/* --- SALE BANNER --- */}
      <div className="relative h-[40vh] bg-gradient-to-br from-rose-600 to-amber-500 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 text-white/30 text-9xl font-bold">%</div>
          <div className="absolute bottom-10 right-10 text-white/30 text-9xl font-bold">%</div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center text-white px-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Tag className="w-8 h-8" />
            <Percent className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">
            Sezon İndirimleri
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-light max-w-xl mx-auto">
            %50&apos;ye varan indirimlerle favori parçalarınızı yakalayın!
          </p>
        </motion.div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-12">
        {/* --- TOOLBAR --- */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2 text-stone-500 text-sm">
            <span className="font-semibold text-stone-900">{products.length}</span> indirimli ürün
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] border-stone-300 bg-white">
              <SelectValue placeholder="Sıralama" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="discount">En Yüksek İndirim</SelectItem>
              <SelectItem value="price-asc">Fiyat: Artan</SelectItem>
              <SelectItem value="price-desc">Fiyat: Azalan</SelectItem>
              <SelectItem value="newest">En Yeniler</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* --- PRODUCT GRID --- */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-500">Şu anda indirimli ürün bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            <AnimatePresence>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: parseInt(product.id) || 0,
                    name: product.name,
                    price: product.price,
                    oldPrice: product.compareAtPrice || null,
                    image: product.images[0] || '/placeholder.svg',
                    tag: product.compareAtPrice
                      ? `%${Math.round((1 - product.price / product.compareAtPrice) * 100)} İndirim`
                      : '',
                    slug: product.slug,
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
