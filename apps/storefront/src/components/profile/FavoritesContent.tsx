"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/CartContext";

interface FavoriteItem {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    image: string;
    category?: string;
    inStock: boolean;
}

// Mock favorites - in production, this would come from API/localStorage
const mockFavorites: FavoriteItem[] = [
    {
        id: "1",
        name: "Kaşmir Karışımlı Palto",
        slug: "kasmir-karisimli-palto",
        price: 5200,
        compareAtPrice: 6500,
        image: "https://images.unsplash.com/photo-1544266395-58022731885b?q=80&w=800",
        category: "Giyim",
        inStock: true
    },
    {
        id: "2",
        name: "Deri Omuz Çantası",
        slug: "deri-omuz-cantasi",
        price: 3200,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800",
        category: "Aksesuar",
        inStock: true
    },
    {
        id: "3",
        name: "Minimal Gold Kolye",
        slug: "minimal-gold-kolye",
        price: 890,
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800",
        category: "Aksesuar",
        inStock: false
    }
];

export default function FavoritesContent() {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { addItem } = useCart();

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setFavorites(mockFavorites);
            setLoading(false);
        }, 500);
    }, []);

    const removeFromFavorites = (id: string) => {
        setFavorites(prev => prev.filter(item => item.id !== id));
    };

    const handleAddToCart = (item: FavoriteItem) => {
        addItem({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    if (favorites.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-12 shadow-sm border border-stone-100 text-center"
            >
                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-10 h-10 text-stone-300" />
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">
                    Henüz favoriniz yok
                </h3>
                <p className="text-stone-500 mb-6 max-w-md mx-auto">
                    Beğendiğiniz ürünleri favorilere ekleyerek daha sonra kolayca ulaşabilirsiniz.
                </p>
                <Link href="/">
                    <Button className="bg-stone-900 hover:bg-amber-600 text-white">
                        Ürünleri Keşfet
                    </Button>
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-stone-900">
                    Favorilerim ({favorites.length})
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((item) => (
                    <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-xl overflow-hidden shadow-sm border border-stone-100 group"
                    >
                        <Link href={`/urun/${item.slug}`}>
                            <div className="relative aspect-[3/4] bg-stone-100">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                {item.compareAtPrice && item.compareAtPrice > item.price && (
                                    <span className="absolute top-3 left-3 bg-rose-500 text-white text-xs px-2 py-1 rounded">
                                        %{Math.round((1 - item.price / item.compareAtPrice) * 100)} İndirim
                                    </span>
                                )}
                                {!item.inStock && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="bg-white text-stone-900 px-4 py-2 rounded-lg font-medium">
                                            Tükendi
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Link>

                        <div className="p-4">
                            <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">
                                {item.category}
                            </p>
                            <Link href={`/urun/${item.slug}`}>
                                <h3 className="font-medium text-stone-900 mb-2 line-clamp-2 hover:text-amber-600 transition-colors">
                                    {item.name}
                                </h3>
                            </Link>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="font-semibold text-lg text-stone-900">
                                    {formatPrice(item.price)}
                                </span>
                                {item.compareAtPrice && item.compareAtPrice > item.price && (
                                    <span className="text-sm text-stone-400 line-through">
                                        {formatPrice(item.compareAtPrice)}
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    className="flex-1 bg-stone-900 hover:bg-amber-600 text-white"
                                    onClick={() => handleAddToCart(item)}
                                    disabled={!item.inStock}
                                >
                                    <ShoppingBag className="w-4 h-4 mr-2" />
                                    Sepete Ekle
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="border-stone-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200"
                                    onClick={() => removeFromFavorites(item.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
