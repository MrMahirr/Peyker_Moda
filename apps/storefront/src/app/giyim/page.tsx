"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, SlidersHorizontal, ChevronDown } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import FilterSidebar from "@/components/shop/FilterSidebar";
import { allProducts } from "@/lib/data";

// Shadcn Components
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
import { Separator } from "@/components/ui/separator";

export default function ClothingPage() {
  const [sortBy, setSortBy] = useState("newest");

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-amber-200">
      <Header />

      {/* --- HEADER BANNER --- */}
      <div className="relative h-[35vh] bg-stone-900 flex items-center justify-center overflow-hidden  ">
        {/* Arka plan görseli (blur efektli) */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center text-white px-4"
        >
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">
            Giyim Koleksiyonu
          </h1>
          <p className="text-stone-300 text-lg md:text-xl font-light max-w-xl mx-auto">
            Sezonun en trend parçalarını ve zamansız tasarımlarını keşfedin.
          </p>
        </motion.div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-12">
        {/* --- TOOLBAR (Mobile Filter & Sort) --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 sticky top-[80px] z-30 bg-stone-50/95 backdrop-blur-sm p-4 rounded-lg md:static md:bg-transparent md:p-0">
          <div className="flex items-center gap-2 text-stone-500 text-sm">
            <span className="font-semibold text-stone-900">
              {allProducts.length}
            </span>{" "}
            ürün listeleniyor
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Mobile Filter Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="md:hidden flex-1 border-stone-300 text-stone-700"
                >
                  <Filter className="w-4 h-4 mr-2" /> Filtrele
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[300px] sm:w-[400px] overflow-y-auto"
              >
                <SheetHeader className="mb-6">
                  <SheetTitle className="font-serif text-2xl">
                    Filtreler
                  </SheetTitle>
                </SheetHeader>
                <FilterSidebar />
                <div className="mt-8 pt-4 border-t border-stone-100">
                  <Button className="w-full bg-stone-900 hover:bg-amber-600 text-white">
                    Sonuçları Göster
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px] border-stone-300 bg-white">
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

        <div className="flex gap-10">
          {/* --- SIDEBAR (Desktop) --- */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-32">
              <FilterSidebar />
            </div>
          </aside>

          {/* --- PRODUCT GRID --- */}
          <div className="flex-1">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              <AnimatePresence>
                {allProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </AnimatePresence>
            </div>

            {/* Load More Button (Opsiyonel) */}
            <div className="mt-16 text-center">
              <Button
                variant="outline"
                className="border-stone-300 hover:border-amber-500 hover:text-amber-600 px-8"
              >
                Daha Fazla Göster
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
