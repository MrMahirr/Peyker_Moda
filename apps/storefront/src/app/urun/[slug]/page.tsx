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
import { formatPrice, resolveProductImages } from "@/lib/utils";

export default function ProductDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { addItem } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');

    useEffect(() => {
        if (slug) {
            fetchProduct();
        }
    }, [slug]);

    useEffect(() => {
        if (product) {
            const sizes = Array.from(new Set(product.variants?.map(v => v.attributes?.size || v.attributes?.beden || v.attributes?.Beden || v.attributes?.Size || (v as any).size).filter(Boolean))) as string[];
            const colors = Array.from(new Set(product.variants?.map(v => v.attributes?.color || v.attributes?.renk || v.attributes?.Renk || v.attributes?.Color || (v as any).color).filter(Boolean))) as string[];
            if (sizes.length > 0) setSelectedSize(sizes[0]);
            if (colors.length > 0) setSelectedColor(colors[0]);
        }
    }, [product]);

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

        // Find matching variant
        const selectedVariant = product.variants?.find(v => {
            const sizeAttr = v.attributes?.size || v.attributes?.beden || v.attributes?.Beden || v.attributes?.Size || (v as any).size;
            const colorAttr = v.attributes?.color || v.attributes?.renk || v.attributes?.Renk || v.attributes?.Color || (v as any).color;
            return (sizeAttr === selectedSize || !sizeAttr) && (colorAttr === selectedColor || !colorAttr);
        });

        const resolvedImages = resolveProductImages(product.images);
        const cartItemId = selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id;
        const variantDesc = [selectedSize, selectedColor].filter(Boolean).join(' / ');

        addItem({
            id: cartItemId,
            productId: product.id,
            variantId: selectedVariant?.id,
            name: product.name,
            price: selectedVariant?.price || product.price,
            image: resolvedImages[0] || '',
            variant: variantDesc || undefined,
            quantity: quantity,
        });

        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const handleAddFavorite = async () => {
        if (!product) return;
        const success = await storeApi.addFavorite(product.id);
        if (success) {
            alert('Favorilere eklendi!');
        } else {
            alert('Favorilere eklemek için giriş yapmalısınız.');
        }
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

    const resolvedImages = resolveProductImages(product.images);

    const discountPercent = product.compareAtPrice
        ? Math.round((1 - product.price / product.compareAtPrice) * 100)
        : 0;

    const availableSizes = Array.from(new Set(product.variants?.map(v => v.attributes?.size || v.attributes?.beden || v.attributes?.Beden || v.attributes?.Size || (v as any).size).filter(Boolean))) as string[];
    const availableColors = Array.from(new Set(product.variants?.map(v => v.attributes?.color || v.attributes?.renk || v.attributes?.Renk || v.attributes?.Color || (v as any).color).filter(Boolean))) as string[];

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
                            {resolvedImages[selectedImage] ? (
                                <Image
                                    src={resolvedImages[selectedImage]}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-400">Görsel Yok</div>
                            )}
                            {discountPercent > 0 && (
                                <span className="absolute top-4 left-4 bg-rose-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    %{discountPercent} İndirim
                                </span>
                            )}
                        </motion.div>

                        {/* Thumbnails */}
                        {resolvedImages.length > 1 && (
                            <div className="flex gap-3">
                                {resolvedImages.map((img, idx) => (
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

                        {/* Variants Selector */}
                        {availableSizes.length > 0 && (
                            <div className="space-y-3">
                                <span className="text-sm font-medium text-stone-700">Beden:</span>
                                <div className="flex flex-wrap gap-2">
                                    {availableSizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`min-w-[48px] h-12 px-4 border rounded-md text-sm font-medium transition-all ${
                                                selectedSize === size
                                                    ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-sm font-bold'
                                                    : 'border-stone-200 hover:border-stone-400 bg-white text-stone-800'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {availableColors.length > 0 && (
                            <div className="space-y-3">
                                <span className="text-sm font-medium text-stone-700">Renk:</span>
                                <div className="flex flex-wrap gap-2">
                                    {availableColors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`h-12 px-5 border rounded-md text-sm font-medium transition-all ${
                                                selectedColor === color
                                                    ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-sm font-bold'
                                                    : 'border-stone-200 hover:border-stone-400 bg-white text-stone-800'
                                            }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
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
                            <Button variant="outline" size="lg" className="h-14 px-4 border-stone-300" onClick={handleAddFavorite}>
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
