"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft, ShieldCheck, Loader2, CheckCircle, XCircle, Tag } from 'lucide-react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/CartContext";
import { storeApi } from "@/lib/api";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, itemCount } = useCart();

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponResult, setCouponResult] = useState<{
    valid: boolean;
    discount: number;
    discountType: 'percentage' | 'fixed';
    message: string;
  } | null>(null);

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const result = await storeApi.validateCoupon(couponCode);
      setCouponResult(result);
    } catch (error) {
      setCouponResult({
        valid: false,
        discount: 0,
        discountType: 'percentage',
        message: 'Kupon doğrulanamadı'
      });
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponResult(null);
  };

  // Calculate discount
  const discountAmount = couponResult?.valid
    ? couponResult.discountType === 'percentage'
      ? Math.round(subtotal * (couponResult.discount / 100))
      : couponResult.discount
    : 0;

  // Calculate totals
  const shipping = subtotal > 1500 ? 0 : 50;
  const total = subtotal - discountAmount + shipping;

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-amber-200">
      <Header />

      <main className="container mx-auto px-4 md:px-8 py-24 md:py-32">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-8">Alışveriş Sepetim ({itemCount})</h1>

        {items.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-12">

            {/* --- SEPET ÜRÜNLER (SOL) --- */}
            <div className="flex-1 space-y-6">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                    className="bg-white rounded-xl p-5 shadow-sm border border-stone-100 flex gap-5 relative group"
                  >
                    {/* Ürün Resmi */}
                    <div className="relative w-24 h-32 md:w-32 md:h-40 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>

                    {/* Ürün Bilgisi */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-lg mb-1 pr-8">{item.name}</h3>
                        {item.variant && (
                          <p className="text-sm text-stone-500">Varyant: {item.variant}</p>
                        )}
                      </div>

                      {/* Miktar & Fiyat */}
                      <div className="flex items-center justify-between mt-4">
                        {/* Miktar Seçici */}
                        <div className="flex items-center border border-stone-200 rounded-full overflow-hidden shadow-sm">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-stone-50 text-stone-600"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-stone-50 text-stone-600"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Fiyat */}
                        <p className="font-medium text-lg">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>

                    {/* Silme Butonu */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-4 right-4 p-2 text-stone-400 hover:text-rose-600 transition-colors rounded-full hover:bg-rose-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* --- SİPARİŞ ÖZETİ (SAĞ) --- */}
            <div className="lg:w-[400px] flex-shrink-0">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-100 sticky top-32">
                <h2 className="text-xl font-serif font-bold mb-6">Sipariş Özeti</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-stone-600">
                    <span>Ara Toplam</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  {/* Discount Row */}
                  {couponResult?.valid && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        İndirim ({couponCode})
                      </span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-stone-600">
                    <span>Kargo</span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">Bedava</span>
                    ) : (
                      <span>{formatPrice(shipping)}</span>
                    )}
                  </div>
                  <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                    <span className="font-bold text-lg text-stone-900">Toplam</span>
                    <span className="font-bold text-2xl text-amber-600">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* İndirim Kodu Alanı */}
                <div className="mb-6">
                  {!couponResult?.valid ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="İndirim kodu"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="bg-stone-50 border-stone-200 uppercase"
                        disabled={couponLoading}
                      />
                      <Button
                        variant="outline"
                        className="border-stone-300 text-stone-600 min-w-[80px]"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                      >
                        {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Uygula'}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                      <span className="flex items-center gap-2 text-green-700 font-medium">
                        <CheckCircle className="w-4 h-4" />
                        {couponCode} uygulandı
                      </span>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-green-600 hover:text-green-800"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {couponResult && !couponResult.valid && (
                    <p className="text-sm text-rose-500 mt-2 flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      {couponResult.message}
                    </p>
                  )}
                </div>

                <Link href="/odeme">
                  <Button className="w-full bg-stone-900 hover:bg-amber-600 text-white h-14 text-lg font-medium shadow-lg hover:shadow-xl transition-all mb-4">
                    Ödemeye Geç <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>

                <div className="flex items-center justify-center gap-2 text-stone-400 text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Güvenli Ödeme & Şifreli Alışveriş</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          // --- BOŞ SEPET DURUMU ---
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-6 text-stone-300">
              <ShoppingBag className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-2 text-stone-800">Sepetinizde ürün bulunmuyor.</h2>
            <p className="text-stone-500 mb-8 max-w-md">
              Yeni sezonun en şık parçalarını keşfetmek için koleksiyonlarımıza göz atabilirsiniz.
            </p>
            <Link href="/">
              <Button className="bg-stone-900 hover:bg-amber-600 text-white px-8 py-6 h-auto text-lg gap-2">
                <ArrowLeft className="w-5 h-5" /> Alışverişe Dön
              </Button>
            </Link>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}