"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowDown, Sparkles, Loader2 } from 'lucide-react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import { newArrivals as fallbackArrivals } from "@/lib/data";
import { storeApi, Product } from "@/lib/api";
import { resolveProductImages } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DisplayProduct {
  id: number | string;
  name: string;
  price: number;
  oldPrice?: number | null;
  image: string;
  category?: string;
  tag?: string;
  slug?: string;
}

// Kayan yazı için animasyon varyantı
const marqueeVariants = {
  animate: {
    x: [0, -1000],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 20,
        ease: "linear",
      },
    },
  },
};

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<DisplayProduct[]>(fallbackArrivals);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const apiProducts = await storeApi.getNewArrivals(8);
        if (apiProducts.length > 0) {
          setProducts(apiProducts.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            oldPrice: p.compareAtPrice || null,
            image: resolveProductImages(p.images)[0] || '',
            category: p.category?.name || '',
            tag: p.tags?.[0] || 'Yeni',
            slug: p.slug,
          })));
        }
      } catch {
        // Fallback data.ts products remain
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-amber-200">
      <Header />

      {/* --- EDITORIAL HERO SECTION --- */}
      <div className="relative w-full h-screen flex flex-col md:flex-row bg-[#FDFBF7] overflow-hidden">

        {/* Sol Taraf: Metin ve Başlık */}
        <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-8 md:px-20 pt-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-12 h-[1px] bg-amber-500"></span>
              <span className="text-amber-600 font-bold tracking-widest text-xs uppercase">2025 Koleksiyonu</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-serif font-bold leading-[0.9] mb-6 text-stone-900">
              YENİ <br />
              <span className="italic font-light text-stone-400">GELENLER</span>
            </h1>

            <p className="text-stone-600 text-lg max-w-md font-light leading-relaxed mb-8">
              Podyumlardan sokağa taşınan en taze trendler.
              Bu hafta dolabınıza modern bir dokunuş yapın.
            </p>

            <Button className="bg-stone-900 text-white rounded-none px-10 py-6 text-lg hover:bg-amber-600 transition-colors w-fit">
              Koleksiyonu Keşfet
            </Button>
          </motion.div>

          {/* Dekoratif Daire */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Sağ Taraf: Büyük Görsel */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-full relative">
          <Image
            src="/peyker-moda-kapak1.png"
            alt="New Season Fashion"
            fill
            className="object-cover"
            priority
          />
          {/* Görsel üzeri hafif gradyan */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#FDFBF7]/20 md:to-[#FDFBF7]" />
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1, duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 md:left-20 md:translate-x-0 hidden md:flex flex-col items-center gap-2 text-stone-400"
        >
          <span className="text-xs tracking-widest uppercase writing-mode-vertical">Aşağı Kaydır</span>
          <ArrowDown className="w-4 h-4" />
        </motion.div>
      </div>

      {/* --- MARQUEE (KAYAN YAZI) --- */}
      <div className="bg-amber-500 py-3 overflow-hidden border-y border-amber-600 relative z-20">
        <motion.div
          className="flex whitespace-nowrap"
          variants={{marqueeVariants}}
          animate="animate"
        >
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 mx-4 text-white font-bold tracking-widest text-sm uppercase">
              <span>Yeni Sezon</span>
              <Sparkles className="w-4 h-4" />
              <span>Ücretsiz Kargo</span>
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>Şimdi Keşfet</span>
              <Sparkles className="w-4 h-4" />
            </div>
          ))}
        </motion.div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-20">

        {/* --- SPOTLIGHT SECTION (İlk 2 ürün büyük) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {products.slice(0, 2).map((product) => (
            <div key={product.id} className="relative group overflow-hidden h-[600px]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />

              <div className="absolute bottom-8 left-8 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <span className="bg-white text-black text-xs font-bold px-3 py-1 uppercase tracking-widest mb-3 inline-block">Editörün Seçimi</span>
                <h3 className="text-4xl font-serif font-bold mb-2">{product.name}</h3>
                <p className="text-lg opacity-90 mb-4">{product.category}</p>
                <Button variant="link" className="text-white p-0 h-auto text-lg hover:text-amber-400 border-b border-white pb-1 rounded-none">
                  İncele
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* --- STANDARD GRID (Diğer Ürünler) --- */}
        <div className="flex items-center gap-4 my-16">
          <h2 className="text-3xl font-serif font-bold text-stone-900 whitespace-nowrap">Haftanın Trendleri</h2>
          <div className="h-[1px] w-full bg-stone-200"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {products.slice(2).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* --- NEWSLETTER CTA --- */}
        <div className="mt-32 bg-stone-900 text-white rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4">İlk Bilen Siz Olun</h3>
            <p className="text-stone-400 mb-8 font-light">
              Yeni koleksiyonlar eklendiğinde bildirim almak için bültenimize abone olun.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-1 bg-white/10 border border-white/20 rounded-md px-4 py-3 text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
              />
              <Button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 rounded-md">
                Abone Ol
              </Button>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}