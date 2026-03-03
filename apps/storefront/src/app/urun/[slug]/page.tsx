"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, ChevronLeft, Loader2, Minus, Plus, Truck, Shield, RotateCcw } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { storeApi, Product } from "@/lib/api";
import { useCart } from "@/lib/CartContext";
import { formatPrice } from "@/lib/utils";

export default function ProductDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { addItem } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    useEffect(() => {
        if (slug) {
            fetchProduct();
        }
    }, [slug]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const data = await storeApi.getProductBySlug(slug);
            setProduct(data);
        } catch (error) {
            console.error('Failed to fetch product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;

        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0] || '',
        });

        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50">
                <Header />
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
                </div>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-stone-50">
                <Header />
                <div className="container mx-auto px-4 py-32 text-center">
                    <h1 className="text-2xl font-serif font-bold mb-4">Ürün bulunamadı</h1>
                    <Link href="/">
                        <Button>Ana Sayfaya Dön</Button>
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const discountPercent = product.compareAtPrice
        ? Math.round((1 - product.price / product.compareAtPrice) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
            <Header />

            <main className="container mx-auto px-4 md:px-8 py-8 md:py-16">
                {/* Breadcrumb */}
                <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-8">
                    <ChevronLeft className="w-4 h-4" />
                    Geri Dön
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Images */}
                    <div className="space-y-4">
                        <motion.div
                            key={selectedImage}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative aspect-[3/4] bg-stone-100 rounded-2xl overflow-hidden"
                        >
                            <Image
                                src={product.images[selectedImage] || 'https://via.placeholder.com/600x800'}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                            />
                            {discountPercent > 0 && (
                                <span className="absolute top-4 left-4 bg-rose-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    %{discountPercent} İndirim
                                </span>
                            )}
                        </motion.div>

                        {/* Thumbnails */}
                        {product.images.length > 1 && (
                            <div className="flex gap-3">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-amber-500' : 'border-transparent hover:border-stone-300'
                                            }`}
                                    >
                                        <Image src={img} alt="" fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            {product.category && (
                                <p className="text-amber-600 text-sm font-medium mb-2">{product.category.name}</p>
                            )}
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900">
                                {product.name}
                            </h1>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold text-stone-900">
                                {formatPrice(product.price)}
                            </span>
                            {product.compareAtPrice && (
                                <span className="text-xl text-stone-400 line-through">
                                    {formatPrice(product.compareAtPrice)}
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <p className="text-stone-600 leading-relaxed">
                                {product.description}
                            </p>
                        )}

                        {/* Quantity */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-stone-700">Adet:</span>
                            <div className="flex items-center border border-stone-200 rounded-lg">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="p-3 hover:bg-stone-50"
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-12 text-center font-medium">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="p-3 hover:bg-stone-50"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Stock */}
                        {product.stock > 0 ? (
                            <p className="text-green-600 text-sm">✓ Stokta mevcut ({product.stock} adet)</p>
                        ) : (
                            <p className="text-red-600 text-sm">✗ Stokta yok</p>
                        )}

                        {/* Add to Cart */}
                        <div className="flex gap-4">
                            <Button
                                size="lg"
                                className={`flex-1 h-14 text-lg font-medium transition-all ${added
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-stone-900 hover:bg-amber-600'
                                    }`}
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                            >
                                <ShoppingBag className="w-5 h-5 mr-2" />
                                {added ? 'Sepete Eklendi!' : 'Sepete Ekle'}
                            </Button>
                            <Button variant="outline" size="lg" className="h-14 px-4 border-stone-300">
                                <Heart className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-200">
                            <div className="text-center">
                                <Truck className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                                <p className="text-xs text-stone-600">Ücretsiz Kargo</p>
                                <p className="text-xs text-stone-400">1500₺ üzeri</p>
                            </div>
                            <div className="text-center">
                                <RotateCcw className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                                <p className="text-xs text-stone-600">Kolay İade</p>
                                <p className="text-xs text-stone-400">14 gün içinde</p>
                            </div>
                            <div className="text-center">
                                <Shield className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                                <p className="text-xs text-stone-600">Güvenli Ödeme</p>
                                <p className="text-xs text-stone-400">256-bit SSL</p>
                            </div>
                        </div>

                        {/* SKU */}
                        <p className="text-xs text-stone-400">
                            SKU: {product.sku}
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
