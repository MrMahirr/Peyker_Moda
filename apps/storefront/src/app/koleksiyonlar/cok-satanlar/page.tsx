"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Trophy, TrendingUp, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import { bestSellers as fallbackBestSellers } from "@/lib/data";
import { storeApi, Product } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { formatPrice, resolveProductImages } from "@/lib/utils";

interface DisplayProduct {
  id: number | string;
  name: string;
  price: number;
  oldPrice?: number | null;
  image: string;
  category?: string;
  tag?: string;
  rating?: number;
  reviewCount?: number;
  slug?: string;
}

export default function BestSellersPage() {
  const [products, setProducts] = useState<DisplayProduct[]>(fallbackBestSellers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const apiProducts = await storeApi.getTopProducts(10);
        if (apiProducts.length > 0) {
          setProducts(apiProducts.map((p, idx) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            oldPrice: p.compareAtPrice || null,
            image: resolveProductImages(p.images)[0] || '',
            category: p.category?.name || '',
            tag: idx === 0 ? '#1 En Çok Satan' : idx < 3 ? `#${idx + 1} Popüler` : (p.tags?.[0] || ''),
            rating: 4.5 + Math.random() * 0.5,
            reviewCount: Math.floor(50 + Math.random() * 150),
            slug: p.slug,
          })));
        }
      } catch {
        // Fallback data.ts products remain
      } finally {
        setLoading(false);
      }
    };
    fetchTopProducts();
  }, []);

  const topThree = products.slice(0, 3);
  const otherProducts = products.slice(3);

  if (loading && products === fallbackBestSellers) {
    return (
      <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-amber-200">
      <Header />

      {/* --- HERO SECTION --- */}
      <div className="relative h-[50vh] bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1569388330292-79cc1ec67270?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white px-4 mt-12"
        >
          <div className="inline-flex items-center gap-2 border border-amber-500/50 bg-amber-500/10 backdrop-blur-md px-4 py-1.5 rounded-full text-amber-400 text-sm font-bold tracking-widest mb-6">
            <Trophy className="w-4 h-4" /> EN ÇOK TERCİH EDİLENLER
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
              Sezonun İkonları
            </span>
          </h1>
          <p className="text-stone-300 text-lg md:text-xl font-light max-w-lg mx-auto">
            Binlerce kadının gardırobunda yer açtığı, puanı en yüksek favori
            parçalar.
          </p>
        </motion.div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-16">
        {/* --- TOP 3 PODIUM SECTION --- */}
        {topThree.length >= 3 && (
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-2">
              Haftanın Top 3 Listesi
            </h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
            {/* 2. Sıra (Solda) */}
            <div className="order-2 lg:order-1 relative group">
              <Link href={`/urun/${topThree[1].slug || 'product-' + topThree[1].id}`}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg border-2 border-stone-200 group-hover:border-stone-900 transition-colors">
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-stone-900 font-bold px-3 py-1 z-20 rounded-sm shadow-sm flex items-center gap-1">
                    <span className="text-2xl font-serif">2</span>
                    <span className="text-xs uppercase tracking-wider text-stone-500">
                      Numara
                    </span>
                  </div>
                  <Image
                    src={topThree[1].image}
                    alt={topThree[1].name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="font-bold text-lg group-hover:text-amber-600 transition-colors">{topThree[1].name}</h3>
                  <p className="text-stone-600">
                    {formatPrice(topThree[1].price)}
                  </p>
                </div>
              </Link>
            </div>

            {/* 1. Sıra (Ortada, Daha Büyük) */}
            <div className="order-1 lg:order-2 relative group -mt-12 lg:-mt-0">
              <Link href={`/urun/${topThree[0].slug || 'product-' + topThree[0].id}`}>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30">
                  <div className="bg-amber-500 text-white rounded-full p-3 shadow-lg shadow-amber-500/30">
                    <Trophy className="w-8 h-8" />
                  </div>
                </div>
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg border-4 border-amber-500 shadow-2xl scale-105 z-10">
                  <div className="absolute top-6 left-6 bg-amber-500 text-white font-bold px-4 py-1 z-20 rounded-sm shadow-sm flex items-center gap-1">
                    <span className="text-3xl font-serif">1</span>
                    <span className="text-xs uppercase tracking-wider text-amber-100">
                      Numara
                    </span>
                  </div>
                  <Image
                    src={topThree[0].image}
                    alt={topThree[0].name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-6 text-center">
                  <div className="flex justify-center gap-1 text-amber-500 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <h3 className="font-bold text-2xl font-serif group-hover:text-amber-600 transition-colors">
                    {topThree[0].name}
                  </h3>
                  <p className="text-xl text-amber-600 font-semibold">
                    {formatPrice(topThree[0].price)}
                  </p>
                  <Button className="mt-4 bg-stone-900 hover:bg-amber-600">
                    Hemen İncele
                  </Button>
                </div>
              </Link>
            </div>

            {/* 3. Sıra (Sağda) */}
            <div className="order-3 lg:order-3 relative group">
              <Link href={`/urun/${topThree[2].slug || 'product-' + topThree[2].id}`}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg border-2 border-stone-200 group-hover:border-stone-900 transition-colors">
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-stone-900 font-bold px-3 py-1 z-20 rounded-sm shadow-sm flex items-center gap-1">
                    <span className="text-2xl font-serif">3</span>
                    <span className="text-xs uppercase tracking-wider text-stone-500">
                      Numara
                    </span>
                  </div>
                  <Image
                    src={topThree[2].image}
                    alt={topThree[2].name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="font-bold text-lg group-hover:text-amber-600 transition-colors">{topThree[2].name}</h3>
                  <p className="text-stone-600">
                    {formatPrice(topThree[2].price)}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
        )}

        {/* --- TRENDING LIST (Diğerleri) --- */}
        {otherProducts.length > 0 && (
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-stone-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-stone-100 p-2 rounded-full">
              <TrendingUp className="w-5 h-5 text-stone-900" />
            </div>
            <h3 className="text-2xl font-serif font-bold">
              Diğer Popüler Ürünler
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {otherProducts.map((product, idx) => (
              <div key={product.id} className="relative">
                {/* Sıralama Numarası */}
                <div className="absolute -left-4 -top-4 w-10 h-10 bg-stone-900 text-white rounded-full flex items-center justify-center font-bold font-serif z-20 shadow-md">
                  {idx + 4}
                </div>
                <ProductCard product={product} />

                {/* Yıldız Değerlendirmesi */}
                <div className="flex items-center gap-1 mt-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < Math.floor(product.rating || 0) ? "fill-current" : "text-stone-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-stone-400">
                    ({product.reviewCount})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
