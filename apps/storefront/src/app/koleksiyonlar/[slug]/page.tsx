"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { storeApi, Product } from "@/lib/api";
import { fadeInUp, formatPrice } from "@/lib/utils";

// Collection metadata
const collectionMeta: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  coverImage: string;
  accentColor: string;
  categorySlug?: string;
}> = {
  'kis-2025': {
    title: 'Kış 2025',
    subtitle: 'Soğuk kış günlerinde sıcacık kalın.',
    description: 'Kış koleksiyonumuz ile sezonun en trend parçalarını keşfedin.',
    coverImage: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2000',
    accentColor: 'bg-blue-500',
    categorySlug: 'giyim',
  },
  'yaz-2025': {
    title: 'Yaz 2025',
    subtitle: 'Yaz enerjisini hissedin.',
    description: 'Renkli ve hafif yaz parçaları ile sezonun tadını çıkarın.',
    coverImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2000',
    accentColor: 'bg-amber-500',
    categorySlug: 'giyim',
  },
  'ozel-seri': {
    title: 'Özel Seri',
    subtitle: 'Limitli üretim, sınırsız stil.',
    description: 'El yapımı, özenle tasarlanmış özel parçalar.',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2000',
    accentColor: 'bg-purple-500',
  },
};

export default function DynamicCollectionPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const collection = collectionMeta[slug];

  useEffect(() => {
    if (slug) {
      fetchProducts();
    }
  }, [slug]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const meta = collectionMeta[slug];
      const result = await storeApi.getProducts({
        categorySlug: meta?.categorySlug,
        limit: 8,
      });
      setProducts(result.products);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-900">
        <div className="text-center">
          <h1 className="text-4xl font-serif mb-4">Koleksiyon Bulunamadı</h1>
          <Link href="/">
            <Button>Anasayfaya Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F2] font-sans text-stone-900 selection:bg-stone-300">
      <Header />

      {/* --- DYNAMIC HERO SECTION --- */}
      <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={collection.coverImage}
            alt={collection.title}
            fill
            className="object-cover brightness-[0.6]"
            priority
          />
        </div>

        <div className="absolute top-1/4 right-1/4 opacity-10">
          <Sparkles className="w-64 h-64 text-white animate-pulse duration-[3s]" />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ fadeInUp }}
          className="relative z-10 text-center text-white px-4 max-w-4xl"
        >
          <span className="block text-sm md:text-base tracking-[0.3em] uppercase mb-4 text-stone-300 border-b border-stone-500 w-fit mx-auto pb-2">
            Peyker Moda Sunar
          </span>
          <h1 className="text-6xl md:text-9xl font-serif font-bold mb-6 drop-shadow-lg leading-tight">
            {collection.title}
          </h1>
          <p className="text-xl md:text-2xl font-light text-stone-200 mb-10 max-w-2xl mx-auto">
            {collection.subtitle}
          </p>
          <div className="animate-bounce mt-10">
            <ArrowDown className="w-8 h-8 mx-auto text-white/50" />
          </div>
        </motion.div>
      </div>

      <main>
        {/* --- EDITORIAL INTRO --- */}
        <section className="py-24 px-4 md:px-8 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-serif italic text-stone-800 mb-6">
              " {collection.description} "
            </h2>
            <div className={`w-24 h-1 ${collection.accentColor} mx-auto rounded-full`} />
          </motion.div>
        </section>

        {/* --- PRODUCT LOOKBOOK --- */}
        <section className="container mx-auto px-4 md:px-8 pb-32">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-stone-500">Bu koleksiyonda henüz ürün bulunmuyor.</p>
            </div>
          ) : (
            products.map((product, index) => (
              <div
                key={product.id}
                className={`flex flex-col md:flex-row items-center gap-8 md:gap-20 mb-24 ${index % 2 !== 0 ? "md:flex-row-reverse" : ""}`}
              >
                {/* Görsel */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className="w-full md:w-1/2 relative h-[600px] md:h-[800px] group overflow-hidden shadow-xl"
                >
                  <Image
                    src={product.images[0] || 'https://via.placeholder.com/800x1000'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                  />
                  <div className="absolute top-6 left-6 text-white/80 font-serif text-6xl md:text-8xl opacity-50 z-10">
                    {(index + 1).toString().padStart(2, "0")}
                  </div>
                </motion.div>

                {/* İçerik */}
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="w-full md:w-1/2 md:px-12 text-center md:text-left"
                >
                  <span className="text-stone-500 font-bold tracking-widest text-sm uppercase mb-2 block">
                    {product.category?.name || 'Giyim'}
                  </span>
                  <h3 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">
                    {product.name}
                  </h3>
                  <p className="text-stone-600 text-lg leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
                    {product.description || 'Kaliteli malzemelerden üretilmiş, şık ve rahat tasarım.'}
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-6">
                    <span className="text-2xl font-semibold text-stone-900">
                      {formatPrice(product.price)}
                    </span>
                    <Link href={`/urun/${product.slug}`}>
                      <Button className="bg-stone-900 text-white rounded-none px-8 py-6 hover:bg-stone-700 transition-colors group">
                        Ürünü İncele
                        <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </div>
            ))
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}