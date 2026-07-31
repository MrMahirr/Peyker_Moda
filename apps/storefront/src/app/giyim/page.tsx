"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import FilterSidebar from "@/components/shop/FilterSidebar";
import { storeApi, Product } from "@/lib/api";
import { resolveProductImages } from "@/lib/utils";

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

const DEFAULT_PRICE_RANGE: [number, number] = [0, 5000];

const getFilterPriceRange = (products: Product[]): [number, number] => {
  const maxPrice = products.reduce((max, product) => {
    const price = Number(product.price || 0);
    return Number.isFinite(price) ? Math.max(max, price) : max;
  }, 0);

  return [
    0,
    maxPrice > 0 ? Math.ceil(maxPrice / 100) * 100 : DEFAULT_PRICE_RANGE[1],
  ];
};

export default function ClothingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filterSourceProducts, setFilterSourceProducts] = useState<Product[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [headerData, setHeaderData] = useState<{
    title: string;
    subtitle?: string;
    imageUrl?: string;
  } | null>(null);

  // Filter State
  const [filters, setFilters] = useState<{
    sizes: string[];
    colors: string[];
    priceRange: [number, number];
  }>({
    sizes: [],
    colors: [],
    priceRange: DEFAULT_PRICE_RANGE,
  });

  const filterPriceRange = useMemo(
    () => getFilterPriceRange(filterSourceProducts),
    [filterSourceProducts],
  );

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const hasFilterSource = filterSourceProducts.length > 0;
      const minPrice =
        hasFilterSource && filters.priceRange[0] > filterPriceRange[0]
          ? filters.priceRange[0]
          : undefined;
      const maxPrice =
        hasFilterSource && filters.priceRange[1] < filterPriceRange[1]
          ? filters.priceRange[1]
          : undefined;

      const result = await storeApi.getProducts({
        categorySlug: "giyim",
        page,
        limit: 12,
        sortBy,
        sizes: filters.sizes,
        colors: filters.colors,
        minPrice,
        maxPrice,
      });
      setProducts(result.products);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [sortBy, page, filters, filterPriceRange, filterSourceProducts.length]);

  const fetchFilterSourceProducts = useCallback(async () => {
    try {
      const result = await storeApi.getProducts({
        categorySlug: "giyim",
        limit: 1000,
        sortBy: "newest",
      });
      setFilterSourceProducts(result.products);
    } catch (error) {
      console.error("Failed to fetch filter source products:", error);
    }
  }, []);

  const fetchHeader = async () => {
    try {
      const data = await storeApi.getPageHeader("giyim");
      if (data && data.isActive) {
        setHeaderData(data);
      }
    } catch (error) {
      console.error("Failed to fetch header:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchHeader();
    fetchFilterSourceProducts();
  }, [fetchFilterSourceProducts]);

  useEffect(() => {
    if (filterSourceProducts.length === 0) return;

    setFilters((currentFilters) => {
      const isDefaultPriceRange =
        currentFilters.priceRange[0] === DEFAULT_PRICE_RANGE[0] &&
        currentFilters.priceRange[1] === DEFAULT_PRICE_RANGE[1];

      if (!isDefaultPriceRange) {
        return currentFilters;
      }

      return {
        ...currentFilters,
        priceRange: filterPriceRange,
      };
    });
  }, [filterPriceRange, filterSourceProducts.length]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-amber-200">
      <Header />

      {/* --- HEADER BANNER --- */}
      <div className="relative h-[35vh] bg-stone-900 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 transition-all duration-700"
          style={{
            backgroundImage: `url('${headerData?.imageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop"}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center text-white px-4"
        >
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">
            {headerData?.title || "Giyim Koleksiyonu"}
          </h1>
          <p className="text-stone-300 text-lg md:text-xl font-light max-w-xl mx-auto">
            {headerData?.subtitle ||
              "Sezonun en trend parçalarını ve zamansız tasarımlarını keşfedin."}
          </p>
        </motion.div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-12">
        {/* --- TOOLBAR --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 sticky top-[80px] z-30 bg-stone-50/95 backdrop-blur-sm p-4 rounded-lg md:static md:bg-transparent md:p-0">
          <div className="flex items-center gap-2 text-stone-500 text-sm">
            <span className="font-semibold text-stone-900">{total}</span> ürün
            listeleniyor
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
                <FilterSidebar
                  onFilterChange={handleFilterChange}
                  categorySlug="giyim"
                  products={filterSourceProducts}
                />
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
                <SelectItem value="price_asc">Fiyat: Artan</SelectItem>
                <SelectItem value="price_desc">Fiyat: Azalan</SelectItem>
                <SelectItem value="popular">Popüler</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-10">
          {/* --- SIDEBAR (Desktop) --- */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-32">
              <FilterSidebar
                onFilterChange={handleFilterChange}
                categorySlug="giyim"
                products={filterSourceProducts}
              />
            </div>
          </aside>

          {/* --- PRODUCT GRID --- */}
          <div className="flex-1">
            {loading && products.length === 0 ? (
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
                          image:
                            resolveProductImages(product.images)[0] ||
                            "/placeholder.svg",
                          tag: product.tags?.[0] || "",
                          slug: product.slug,
                          stock: product.stock,
                          variants: product.variants,
                        }}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Load More Button */}
                {page < totalPages && (
                  <div className="mt-16 text-center">
                    <Button
                      variant="outline"
                      className="border-stone-300 hover:border-amber-500 hover:text-amber-600 px-8"
                      onClick={handleLoadMore}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Daha Fazla Göster"
                      )}
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
