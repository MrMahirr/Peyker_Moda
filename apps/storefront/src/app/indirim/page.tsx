"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Clock, Tag } from 'lucide-react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import FilterSidebar from "@/components/shop/FilterSidebar";
import { discountedProducts } from "@/lib/data";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- COUNTDOWN TIMER COMPONENT ---
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, minutes: 35, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
            else {
              hours = 23;
              if (days > 0) days--;
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-4 md:gap-8 justify-center mt-8 text-white">
      {[
        { label: "GÜN", value: timeLeft.days },
        { label: "SAAT", value: timeLeft.hours },
        { label: "DAKİKA", value: timeLeft.minutes },
        { label: "SANİYE", value: timeLeft.seconds }
      ].map((item, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg flex items-center justify-center text-2xl md:text-3xl font-bold font-serif shadow-lg">
            {item.value.toString().padStart(2, '0')}
          </div>
          <span className="text-xs md:text-sm mt-2 tracking-widest opacity-80">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default function SalePage() {
  const [sortBy, setSortBy] = useState("newest");

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-rose-200">
      <Header />

      {/* --- SALE HERO BANNER --- */}
      <div className="relative h-[60vh] bg-rose-950 flex items-center justify-center overflow-hidden">
        {/* Arka plan */}
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-rose-950/50 to-stone-900/30" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white px-4 mt-8 w-full max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 bg-rose-600/90 text-white px-4 py-1.5 rounded-full text-sm font-bold tracking-wider mb-6 shadow-lg border border-rose-400/30">
            <Tag className="w-4 h-4" /> BÜYÜK SEZON FİNALİ
          </div>

          <h1 className="text-5xl md:text-8xl font-serif font-bold mb-4 drop-shadow-2xl">
            %50'ye Varan <br/><span className="text-rose-400 italic">İndirimler</span>
          </h1>

          <p className="text-rose-100 text-lg md:text-xl font-light mb-6">
            Sınırlı süre için geçerli, seçili ürünlerde kaçırılmayacak fırsatlar.
          </p>

          {/* Geri Sayım */}
          <CountdownTimer />
        </motion.div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-16">

        {/* --- TOOLBAR --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 bg-white p-4 rounded-xl border border-stone-100 shadow-sm sticky top-[85px] z-30">
          <div className="flex items-center gap-2 text-rose-700 font-medium">
            <Clock className="w-5 h-5" />
            <span>Teklifler tükenmeden yakalayın!</span>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden flex-1 border-stone-200 text-stone-700">
                  <Filter className="w-4 h-4 mr-2" /> Filtrele
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] overflow-y-auto">
                <SheetHeader className="mb-6">
                  <SheetTitle className="font-serif text-2xl">Filtreler</SheetTitle>
                </SheetHeader>
                <FilterSidebar />
                <div className="mt-8 pt-4 border-t border-stone-100">
                  <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white">Sonuçları Göster</Button>
                </div>
              </SheetContent>
            </Sheet>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[200px] border-stone-200 bg-stone-50">
                <SelectValue placeholder="Sıralama" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discount-desc">İndirim Oranı: Yüksekten Düşüğe</SelectItem>
                <SelectItem value="price-asc">Fiyat: Artan</SelectItem>
                <SelectItem value="price-desc">Fiyat: Azalan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-12">
          {/* --- SIDEBAR --- */}
          <aside className="hidden md:block w-72 flex-shrink-0">
            <div className="sticky top-32 bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
              <FilterSidebar />
            </div>
          </aside>

          {/* --- PRODUCT GRID --- */}
          <div className="flex-1">
            {/* Sale Badge Info */}
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-4 text-rose-800 text-sm">
              <span className="font-bold bg-white px-2 py-1 rounded border border-rose-200">İPUCU</span>
              Sepette ekstra %10 indirim için <strong>PEYKER10</strong> kodunu kullanabilirsiniz.
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              <AnimatePresence>
                {discountedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-20 text-center">
              <Button variant="ghost" className="text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                Tüm İndirimli Ürünleri Gör
              </Button>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}