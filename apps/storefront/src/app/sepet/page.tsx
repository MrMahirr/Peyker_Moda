"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft, ShieldCheck } from 'lucide-react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";

// Simüle edilmiş sepet verisi (Gerçekte Context veya Redux'tan gelir)
const initialCartItems = [
  {
    id: 403,
    name: "Kaşmir Karışımlı Palto",
    price: 5200,
    image: "https://images.unsplash.com/photo-1544266395-58022731885b?q=80&w=800&auto=format&fit=crop",
    color: "Camel",
    size: "M",
    quantity: 1
  },
  {
    id: 103,
    name: "Deri Omuz Çantası",
    price: 3200,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
    color: "Siyah",
    size: "Standart",
    quantity: 1
  },
  {
    id: 304,
    name: "Gold Detaylı Kemer",
    price: 650,
    image: "https://images.unsplash.com/photo-1616147416348-73b37805903b?q=80&w=800&auto=format&fit=crop",
    color: "Gold",
    size: "S/M",
    quantity: 2
  }
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems);

  // Miktar Güncelleme
  const updateQuantity = (id: number, change: number) => {
    setCartItems(items =>
      items.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // Ürün Silme
  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  // Toplam Hesaplama
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 1500 ? 0 : 50; // 1500 TL üzeri kargo bedava
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-amber-200">
      <Header />

      <main className="container mx-auto px-4 md:px-8 py-24 md:py-32">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-8">Alışveriş Sepetim ({cartItems.length})</h1>

        {cartItems.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-12">

            {/* --- SEPET LİSTESİ (SOL) --- */}
            <div className="flex-1 space-y-6">
              <AnimatePresence mode='popLayout'>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex flex-col sm:flex-row gap-6 bg-white p-6 rounded-xl shadow-sm border border-stone-100"
                  >
                    {/* Ürün Görseli */}
                    <div className="relative w-full sm:w-32 aspect-[3/4] sm:aspect-square bg-stone-100 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Ürün Bilgileri */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-serif text-lg font-bold text-stone-900">{item.name}</h3>
                          <p className="text-stone-500 text-sm mt-1">Renk: {item.color} | Beden: {item.size}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-stone-400 hover:text-rose-500 transition-colors p-1"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex justify-between items-end mt-4 sm:mt-0">
                        {/* Miktar Arttır/Azalt */}
                        <div className="flex items-center border border-stone-200 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-2 hover:bg-stone-50 text-stone-600 disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-2 hover:bg-stone-50 text-stone-600"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Fiyat */}
                        <p className="font-medium text-lg">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
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
                <div className="flex gap-2 mb-6">
                  <Input placeholder="İndirim kodu" className="bg-stone-50 border-stone-200" />
                  <Button variant="outline" className="border-stone-300 text-stone-600">Uygula</Button>
                </div>

                <Button className="w-full bg-stone-900 hover:bg-amber-600 text-white h-14 text-lg font-medium shadow-lg hover:shadow-xl transition-all mb-4">
                  Ödemeye Geç
                </Button>

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