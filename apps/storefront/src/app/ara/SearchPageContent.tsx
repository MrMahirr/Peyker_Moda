"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2, Search, X } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { storeApi, Product } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/CartContext";

export default function SearchPageContent() {
    const router = useRouter();
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
        setQuery(initialQuery);
        if (initialQuery) {
            searchProducts(initialQuery);
            return;
        }

        setProducts([]);
        setSearched(false);
    }, [initialQuery, searchProducts]);

    const updateSearchUrl = (searchQuery: string) => {
        const trimmedQuery = searchQuery.trim();
        router.push(trimmedQuery ? `/ara?q=${encodeURIComponent(trimmedQuery)}` : "/ara");
    };

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        searchProducts(query);
        updateSearchUrl(query);
    };

    const clearSearch = () => {
        setQuery("");
        setProducts([]);
        setSearched(false);
        router.push("/ara");
    };

    const handlePopularSearch = (term: string) => {
        setQuery(term);
        searchProducts(term);
        updateSearchUrl(term);
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
                <div className="mx-auto mb-12 max-w-2xl">
                    <h1 className="mb-8 text-center font-serif text-3xl font-bold md:text-4xl">
                        Urun Ara
                    </h1>

                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                        <Input
                            type="text"
                            placeholder="Urun adi, kategori veya ozellik ara..."
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            className="h-14 rounded-full border-stone-200 bg-white pl-12 pr-12 text-lg shadow-sm focus-visible:ring-amber-500"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                                aria-label="Aramayi temizle"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </form>

                    {!searched && (
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                            <span className="text-sm text-stone-500">Populer aramalar:</span>
                            {["elbise", "kaban", "canta", "aksesuar", "indirim"].map((term) => (
                                <button
                                    key={term}
                                    type="button"
                                    onClick={() => handlePopularSearch(term)}
                                    className="rounded-full border border-stone-200 bg-white px-3 py-1 text-sm transition-colors hover:border-amber-500 hover:text-amber-600"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                    </div>
                )}

                {searched && !loading && (
                    <>
                        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                            <p className="text-stone-600">
                                <span className="font-semibold text-stone-900">&quot;{query}&quot;</span> icin{" "}
                                <span className="font-semibold text-stone-900">{products.length}</span> sonuc bulundu
                            </p>

                            <div className="flex items-center gap-4">
                                <select
                                    value={sortBy}
                                    onChange={(event) => setSortBy(event.target.value)}
                                    className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <option value="newest">En Yeni</option>
                                    <option value="price-asc">Fiyat: Dusukten Yuksege</option>
                                    <option value="price-desc">Fiyat: Yuksekten Dusuge</option>
                                    <option value="name">Isme Gore (A-Z)</option>
                                </select>
                            </div>
                        </div>

                        {sortedProducts.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
                                {sortedProducts.map((product, index) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group"
                                    >
                                        <Link href={`/urun/${product.slug}`}>
                                            <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-lg bg-stone-100">
                                                <Image
                                                    src={product.images[0] || "/placeholder.svg"}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                {product.compareAtPrice && product.compareAtPrice > product.price && (
                                                    <span className="absolute left-2 top-2 rounded bg-rose-500 px-2 py-1 text-xs text-white">
                                                        %{Math.round((1 - product.price / product.compareAtPrice) * 100)} Indirim
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                        <div className="space-y-1">
                                            <p className="text-xs uppercase tracking-wide text-stone-500">
                                                {product.category?.name || "Giyim"}
                                            </p>
                                            <Link href={`/urun/${product.slug}`}>
                                                <h3 className="line-clamp-2 font-medium text-stone-900 transition-colors group-hover:text-amber-600">
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
                                                className="mt-2 w-full bg-stone-900 text-white hover:bg-amber-600"
                                                onClick={() => addItem({
                                                    id: product.id,
                                                    productId: product.id,
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
                            <div className="py-20 text-center">
                                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-stone-100">
                                    <Search className="h-10 w-10 text-stone-300" />
                                </div>
                                <h3 className="mb-2 font-serif text-xl font-bold text-stone-900">
                                    Sonuc bulunamadi
                                </h3>
                                <p className="mx-auto max-w-md text-stone-500">
                                    &quot;{query}&quot; aramasi icin sonuc bulunamadi. Farkli anahtar kelimelerle tekrar deneyin.
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
