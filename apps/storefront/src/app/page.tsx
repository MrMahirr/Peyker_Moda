"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ShoppingBag, Search, Menu, ArrowRight, Heart, X } from 'lucide-react';

// Shadcn UI Bileşenleri
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const categories = [
  { name: "Elbiseler", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop" },
  { name: "Dış Giyim", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop" },
  { name: "Aksesuarlar", image: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=800&auto=format&fit=crop" },
  { name: "Ayakkabılar", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop" },
];

const products = [
  { id: 1, name: "İpek Saten Midi Elbise", price: "2.450 ₺", image: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?q=80&w=800&auto=format&fit=crop", tag: "Yeni" },
  { id: 2, name: "Oversize Kaşe Kaban", price: "4.800 ₺", image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=800&auto=format&fit=crop", tag: "" },
  { id: 3, name: "Triko Kazak Bej", price: "1.200 ₺", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop", tag: "Çok Satan" },
  { id: 4, name: "Pileli Mini Etek", price: "950 ₺", image: "https://images.unsplash.com/photo-1582142388613-2d1e2e4244db?q=80&w=800&auto=format&fit=crop", tag: "" },
];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-rose-200">
      <motion.nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-white/80 backdrop-blur-md border-stone-200 py-3' : 'bg-transparent border-transparent py-6'}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
          <Link href="/" className={`text-2xl md:text-3xl font-serif font-bold tracking-tighter transition-colors ${isScrolled ? 'text-stone-900' : 'text-white'}`}>
            PEYKER<span className="text-rose-500">.</span>
          </Link>
          <div className={`hidden md:flex gap-8 text-sm font-medium tracking-wide ${isScrolled ? 'text-stone-600' : 'text-stone-200'}`}>
            {['Koleksiyon', 'Yeni Gelenler', 'İndirim', 'Hakkımızda'].map((item) => (
              <Link key={item} href="#" className="hover:text-rose-500 transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-500 transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>
          <div className={`flex items-center gap-4 ${isScrolled ? 'text-stone-900' : 'text-white'}`}>
            <Search className="w-5 h-5 cursor-pointer hover:text-rose-500 transition-colors" />
            <div className="relative cursor-pointer hover:text-rose-500 transition-colors">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">0</span>
            </div>
            <Menu className="w-6 h-6 md:hidden cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
          </div>
        </div>
      </motion.nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white p-6 md:hidden flex flex-col gap-6 animate-in slide-in-from-right">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-serif font-bold">PEYKER.</span>
            <X className="w-6 h-6 cursor-pointer" onClick={() => setMobileMenuOpen(false)} />
          </div>
          <nav className="flex flex-col gap-4 text-lg">
            {['Koleksiyon', 'Yeni Gelenler', 'İndirim', 'Hakkımızda'].map((item) => (
              <Link key={item} href="#" className="border-b pb-2 border-stone-100">{item}</Link>
            ))}
          </nav>
        </div>
      )}

      <section className="relative h-[95vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop"
            alt="Hero Background"
            fill
            className="object-cover brightness-[0.75]"
            priority
          />
        </div>
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-white mt-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.span variants={fadeInUp} className="inline-block px-4 py-1.5 bg-rose-500/20 backdrop-blur-md border border-rose-500/30 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
              2025 Sonbahar / Kış
            </motion.span>
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-8xl font-serif font-bold leading-none mb-6">
              Zarafetinizi <br />
              <span className="italic font-light text-rose-200">Yeniden</span> Keşfedin.
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-stone-200 mb-10 max-w-lg font-light leading-relaxed">
              Modern kesimler, zamansız tasarımlar ve en kaliteli kumaşlarla hazırlanan yeni koleksiyonumuz şimdi yayında.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-white text-stone-900 hover:bg-stone-200 rounded-none px-10 h-14 text-md font-medium tracking-wide">
                ALIŞVERİŞE BAŞLA
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10 rounded-none px-10 h-14 text-md font-medium tracking-wide">
                KOLEKSİYONU İNCELE
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3">Kategorilere Göz Atın</h2>
              <p className="text-stone-500">Stilinizi tamamlayacak parçaları keşfedin.</p>
            </div>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative group cursor-pointer overflow-hidden aspect-[3/4]"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-6 left-6 text-white z-10">
                  <h3 className="text-xl md:text-2xl font-serif flex items-center gap-2">
                    {cat.name} <ArrowRight className="w-5 h-5 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-stone-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">Öne Çıkan Parçalar</h2>
              <p className="text-stone-500">Bu sezonun en çok tercih edilenleri.</p>
            </div>
            <Link href="#" className="hidden md:flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium underline-offset-4 hover:underline transition-all">
              Tümünü Gör <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-none shadow-none bg-transparent group overflow-hidden">
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-200 mb-4 rounded-sm">
                    {product.tag && (
                      <Badge className="absolute top-3 left-3 bg-white text-stone-900 hover:bg-white z-20 rounded-sm shadow-sm">
                        {product.tag}
                      </Badge>
                    )}
                    <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20 hover:bg-rose-500 hover:text-white">
                      <Heart className="w-4 h-4" />
                    </button>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute bottom-4 left-4 right-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                      <Button className="w-full bg-white/95 backdrop-blur-sm text-stone-900 hover:bg-stone-900 hover:text-white shadow-lg transition-colors">Sepete Ekle</Button>
                    </div>
                  </div>
                  <CardContent className="p-0 text-center md:text-left">
                    <h3 className="font-medium text-lg mb-1 group-hover:text-rose-600 transition-colors cursor-pointer">{product.name}</h3>
                    <p className="text-stone-500 font-medium">{product.price}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- NEWSLETTER --- */}
      <section className="py-24 bg-stone-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Peyker Moda Dünyasına Katılın</h2>
            <p className="text-stone-400 mb-8 text-lg">Yeni koleksiyonlardan, özel indirimlerden ve stil önerilerinden ilk siz haberdar olun. İlk alışverişinize özel %10 indirim kazanın.</p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="E-posta adresiniz"
                className="bg-white/10 border-white/10 text-white placeholder:text-stone-500 focus-visible:ring-rose-500 h-12"
              />
              <Button className="bg-rose-600 hover:bg-rose-700 h-12 px-8 text-white font-medium">
                Abone Ol
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="bg-white pt-20 pb-10 border-t border-stone-100 text-stone-600">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <p>&copy; 2025 Peyker Moda.</p>
        </div>
      </footer>
    </div>
  );
}