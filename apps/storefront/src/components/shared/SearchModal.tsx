"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { storeApi, Product } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (query.trim().length >= 2) {
                searchProducts(query);
            } else {
                setResults([]);
                setSearched(false);
            }
        }, 300);

        return () => clearTimeout(debounce);
    }, [query]);

    const searchProducts = async (searchQuery: string) => {
        setLoading(true);
        setSearched(true);
        try {
            const result = await storeApi.getProducts({ search: searchQuery, limit: 6 });
            setResults(result.products);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/ara?q=${encodeURIComponent(query)}`);
            onClose();
        }
    };

    const handleProductClick = () => {
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="w-full max-w-2xl mx-auto mt-20 bg-white rounded-2xl shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Search Input */}
                    <form onSubmit={handleSubmit} className="p-4 border-b border-stone-100">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                            <Input
                                ref={inputRef}
                                type="text"
                                placeholder="Ürün ara..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="pl-12 pr-12 h-14 text-lg bg-stone-50 border-0 rounded-xl focus-visible:ring-amber-500"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Results */}
                    <div className="max-h-[60vh] overflow-y-auto">
                        {loading && (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                            </div>
                        )}

                        {!loading && searched && results.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-stone-500">"{query}" için sonuç bulunamadı</p>
                            </div>
                        )}

                        {!loading && results.length > 0 && (
                            <div className="p-4">
                                <div className="space-y-3">
                                    {results.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/urun/${product.slug}`}
                                            onClick={handleProductClick}
                                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-stone-50 transition-colors group"
                                        >
                                            <div className="relative w-16 h-20 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={product.images[0] || "/placeholder.svg"}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-stone-500 uppercase">
                                                    {product.category?.name || "Giyim"}
                                                </p>
                                                <h4 className="font-medium text-stone-900 truncate group-hover:text-amber-600 transition-colors">
                                                    {product.name}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="font-semibold text-stone-900">
                                                        {formatPrice(product.price)}
                                                    </span>
                                                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                                                        <span className="text-sm text-stone-400 line-through">
                                                            {formatPrice(product.compareAtPrice)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-stone-300 group-hover:text-amber-600 transition-colors" />
                                        </Link>
                                    ))}
                                </div>

                                {/* View All Results */}
                                <button
                                    onClick={handleSubmit}
                                    className="w-full mt-4 py-3 text-center text-amber-600 font-medium hover:bg-amber-50 rounded-xl transition-colors"
                                >
                                    Tüm sonuçları gör ({results.length}+)
                                </button>
                            </div>
                        )}

                        {/* Popular Searches */}
                        {!searched && (
                            <div className="p-4">
                                <p className="text-sm text-stone-500 mb-3">Popüler aramalar</p>
                                <div className="flex flex-wrap gap-2">
                                    {["elbise", "kaban", "çanta", "triko", "pantolon", "aksesuar"].map((term) => (
                                        <button
                                            key={term}
                                            onClick={() => setQuery(term)}
                                            className="px-4 py-2 bg-stone-100 rounded-full text-sm hover:bg-amber-100 hover:text-amber-700 transition-colors"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-stone-100 bg-stone-50">
                        <p className="text-xs text-stone-400 text-center">
                            ESC tuşu ile kapatın • Enter ile tüm sonuçları görün
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
