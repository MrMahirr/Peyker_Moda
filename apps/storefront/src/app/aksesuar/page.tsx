"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';
import Header from "@/components/layout/Header"; // Header yolu doğru olmalı
import Footer from "@/components/layout/Footer"; // Footer yolu doğru olmalı
import ProductCard from "@/components/shared/ProductCard";
import FilterSidebar from "@/components/shop/FilterSidebar";
import { accessoryProducts } from "@/lib/data";

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

export default function AccessoryPage() {
  const [sortBy, setSortBy] = useState("newest");

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-amber-200">
      <Header />

      {/* --- ACCESSORY HEADER BANNER --- */}
      {/* Navbar şeffaf olduğu için resim en üstten başlar */}
      <div className="relative h-[45vh] bg-stone-900 flex items-center justify-center overflow-hidden">
        {/* Aksesuar için özel arka plan görseli */}
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-50"
        />
        {/* Alt kısımdan yukarı doğru hafif karartma */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-stone-900/30" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center text-white px-4 mt-10"
        >
          <span className="block text-amber-400 font-medium tracking-widest text-sm mb-3 uppercase">Yeni Koleksiyon</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4 drop-shadow-md">Aksesuar Dünyası</h1>
          <p className="text-stone-200 text-lg md:text-xl font-light max-w-xl mx-auto leading-relaxed">
            Stilinizi tamamlayan en zarif dokunuşlar. Altın, gümüş ve değerli taşların modern yorumu.
          </p>
        </motion.div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-12">

        {/* --- TOOLBAR --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 sticky top-[80px] z-30 bg-stone-50/95 backdrop-blur-sm p-4 rounded-lg md:static md:bg-transparent md:p-0 border border-stone-100 md:border-none shadow-sm md:shadow-none">
          <div className="flex items-center gap-2 text-stone-600 text-sm">
            <span className="font-bold text-stone-900 font-serif text-lg">{accessoryProducts.length}</span> parça listeleniyor
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Mobile Filter */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden flex-1 border-stone-300 text-stone-700 hover:bg-stone-100 hover:text-amber-600 transition-colors">
                  <Filter className="w-4 h-4 mr-2" /> Filtrele
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <SheetHeader className="mb-6">
                  <SheetTitle className="font-serif text-2xl text-stone-900">Filtreler</SheetTitle>
                </SheetHeader>
                {/* Not: FilterSidebar içinde kategoriler giyim için ayarlı, aksesuara özel ayrı bir sidebar veya prop ile yönetilebilir. Şimdilik aynı kalabilir. */}
                <FilterSidebar />
                <div className="mt-8 pt-4 border-t border-stone-100">
                  <Button className="w-full bg-stone-900 hover:bg-amber-600 text-white transition-colors h-12 text-md">Sonuçları Göster</Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[200px] border-stone-200 bg-white shadow-sm hover:border-amber-400 transition-colors">
                <SelectValue placeholder="Sıralama" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">En Yeniler</SelectItem>
                <SelectItem value="price-asc">Fiyat: Artan</SelectItem>
                <SelectItem value="price-desc">Fiyat: Azalan</SelectItem>
                <SelectItem value="bestseller">Çok Satanlar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-12">
          {/* --- SIDEBAR (Desktop) --- */}
          <aside className="hidden md:block w-72 flex-shrink-0">
            <div className="sticky top-28 bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
              <FilterSidebar />
            </div>
          </aside>

          {/* --- PRODUCT GRID --- */}
          <div className="flex-1">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              <AnimatePresence>
                {accessoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </AnimatePresence>
            </div>

            {/* Load More */}
            <div className="mt-20 text-center">
              <Button variant="outline" className="border-stone-300 hover:border-amber-500 hover:text-amber-600 px-12 py-6 text-md tracking-wide uppercase transition-all duration-300">
                Daha Fazla Keşfet
              </Button>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}