"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Loader2, Sparkles } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import FilterSidebar from "@/components/shop/FilterSidebar";
import { storeApi, Product } from "@/lib/api";
import { resolveProductImages } from "@/lib/utils";

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

export default function AccessoriesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [headerData, setHeaderData] = useState<{title: string, subtitle?: string, imageUrl?: string} | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchHeader();
  }, [sortBy, page]);

  const fetchHeader = async () => {
    try {
      const data = await storeApi.getPageHeader('aksesuar');
      if (data && data.isActive) {
        setHeaderData(data);
      }
    } catch (error) {
      console.error('Failed to fetch header:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await storeApi.getProducts({
        categorySlug: 'aksesuar',
        page,
        limit: 12,
        sortBy,
      });
      setProducts(result.products);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-amber-200">
      <Header />

      {/* --- HEADER BANNER --- */}
      <div className="relative h-[35vh] bg-stone-900 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 transition-all duration-700" 
          style={{ backgroundImage: `url('${headerData?.imageUrl || 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=2000&auto=format&fit=crop'}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center text-white px-4"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">
            {headerData?.title || 'Aksesuarlar'}
          </h1>
          <p className="text-stone-300 text-lg md:text-xl font-light max-w-xl mx-auto">
            {headerData?.subtitle || 'Stilinizi tamamlayan özel parçalar.'}
          </p>
        </motion.div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-12">
        {/* --- TOOLBAR --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-2 text-stone-500 text-sm">
            <span className="font-semibold text-stone-900">{total}</span> ürün listeleniyor
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden flex-1 border-stone-300">
                  <Filter className="w-4 h-4 mr-2" /> Filtrele
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] overflow-y-auto">
                <SheetHeader className="mb-6">
                  <SheetTitle className="font-serif text-2xl">Filtreler</SheetTitle>
                </SheetHeader>
                <FilterSidebar />
              </SheetContent>
            </Sheet>

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
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-32">
              <FilterSidebar />
            </div>
          </aside>

          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-stone-500">Ürün bulunamadı.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                  <AnimatePresence>
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={{
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          oldPrice: product.compareAtPrice || null,
                          image: resolveProductImages(product.images)[0] || '/placeholder.svg',
                          tag: product.tags?.[0] || '',
                          slug: product.slug,
                        }}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {page < totalPages && (
                  <div className="mt-16 text-center">
                    <Button
                      variant="outline"
                      className="border-stone-300 hover:border-amber-500 px-8"
                      onClick={() => setPage(p => p + 1)}
                    >
                      Daha Fazla Göster
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}