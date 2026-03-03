"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, X, Loader2, Filter, ChevronDown, SlidersHorizontal } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { storeApi, Product } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/CartContext";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || "";

    const [query, setQuery] = useState(initialQuery);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [sortBy, setSortBy] = useState("newest");
    const { addItem } = useCart();

    const searchProducts = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setProducts([]);
            setSearched(false);
            return;
        }

        setLoading(true);
        setSearched(true);
        try {
            const result = await storeApi.getProducts({ search: searchQuery, limit: 24 });
            setProducts(result.products);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (initialQuery) {
            searchProducts(initialQuery);
        }
    }, [initialQuery, searchProducts]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchProducts(query);
        // Update URL
        window.history.pushState(null, "", `/ara?q=${encodeURIComponent(query)}`);
    };

    const sortedProducts = [...products].sort((a, b) => {
        switch (sortBy) {
            case "price-asc":
                return a.price - b.price;
            case "price-desc":
                return b.price - a.price;
            case "name":
                return a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });

    return (
        <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
            <Header />

            <main className="container mx-auto px-4 py-24 md:py-32">
                {/* Search Header */}
                <div className="max-w-2xl mx-auto mb-12">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-center mb-8">
                        Ürün Ara
                    </h1>

                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <Input
                            type="text"
                            placeholder="Ürün adı, kategori veya özellik ara..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-12 pr-12 h-14 text-lg bg-white border-stone-200 rounded-full shadow-sm focus-visible:ring-amber-500"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => {
                                    setQuery("");
                                    setProducts([]);
                                    setSearched(false);
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </form>

                    {/* Popular Searches */}
                    {!searched && (
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                            <span className="text-sm text-stone-500">Popüler aramalar:</span>
                            {["elbise", "kaban", "çanta", "aksesuar", "indirim"].map((term) => (
                                <button
                                    key={term}
                                    onClick={() => {
                                        setQuery(term);
                                        searchProducts(term);
                                    }}
                                    className="px-3 py-1 text-sm bg-white border border-stone-200 rounded-full hover:border-amber-500 hover:text-amber-600 transition-colors"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                    </div>
                )}

                {/* Results */}
                {searched && !loading && (
                    <>
                        {/* Results Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <p className="text-stone-600">
                                <span className="font-semibold text-stone-900">"{query}"</span> için{" "}
                                <span className="font-semibold text-stone-900">{products.length}</span> sonuç bulundu
                            </p>

                            <div className="flex items-center gap-4">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <option value="newest">En Yeni</option>
                                    <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
                                    <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
                                    <option value="name">İsme Göre (A-Z)</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {sortedProducts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                {sortedProducts.map((product, index) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group"
                                    >
                                        <Link href={`/urun/${product.slug}`}>
                                            <div className="relative aspect-[3/4] bg-stone-100 rounded-lg overflow-hidden mb-3">
                                                <Image
                                                    src={product.images[0] || "https://via.placeholder.com/400x500"}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                {product.compareAtPrice && product.compareAtPrice > product.price && (
                                                    <span className="absolute top-2 left-2 bg-rose-500 text-white text-xs px-2 py-1 rounded">
                                                        %{Math.round((1 - product.price / product.compareAtPrice) * 100)} İndirim
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                        <div className="space-y-1">
                                            <p className="text-xs text-stone-500 uppercase tracking-wide">
                                                {product.category?.name || "Giyim"}
                                            </p>
                                            <Link href={`/urun/${product.slug}`}>
                                                <h3 className="font-medium text-stone-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                                                    {product.name}
                                                </h3>
                                            </Link>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-stone-900">
                                                    {formatPrice(product.price)}
                                                </span>
                                                {product.compareAtPrice && product.compareAtPrice > product.price && (
                                                    <span className="text-sm text-stone-400 line-through">
                                                        {formatPrice(product.compareAtPrice)}
                                                    </span>
                                                )}
                                            </div>
                                            <Button
                                                size="sm"
                                                className="w-full mt-2 bg-stone-900 hover:bg-amber-600 text-white"
                                                onClick={() => addItem({
                                                    id: product.id,
                                                    name: product.name,
                                                    price: product.price,
                                                    image: product.images[0] || "",
                                                })}
                                            >
                                                Sepete Ekle
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-10 h-10 text-stone-300" />
                                </div>
                                <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">
                                    Sonuç bulunamadı
                                </h3>
                                <p className="text-stone-500 max-w-md mx-auto">
                                    "{query}" araması için sonuç bulunamadı. Farklı anahtar kelimelerle tekrar deneyin.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}
