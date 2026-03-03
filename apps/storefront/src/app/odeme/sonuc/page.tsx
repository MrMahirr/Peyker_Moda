"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, Home, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PaymentResultPage() {
    const searchParams = useSearchParams();
    const status = searchParams.get('status');
    const orderId = searchParams.get('orderId');
    const message = searchParams.get('message');

    // Simulating checking status if not provided directly (optional enhancement)
    const [isLoading, setIsLoading] = useState(false);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
            </div>
        );
    }

    const isSuccess = status === 'success';

    return (
        <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
            <Header />
            <main className="container mx-auto px-4 py-32 flex items-center justify-center min-h-[60vh]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-stone-100"
                >
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {isSuccess ? (
                            <CheckCircle className="w-12 h-12" />
                        ) : (
                            <XCircle className="w-12 h-12" />
                        )}
                    </div>

                    <h1 className="text-3xl font-serif font-bold mb-3">
                        {isSuccess ? 'Ödeme Başarılı!' : 'Ödeme Başarısız!'}
                    </h1>

                    <p className="text-stone-500 mb-8 text-lg">
                        {isSuccess
                            ? 'Siparişiniz başarıyla alındı ve ödemeniz onaylandı.'
                            : (message || 'Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.')}
                    </p>

                    {isSuccess && orderId && (
                        <div className="bg-stone-50 rounded-xl p-6 mb-8 border border-stone-200">
                            <p className="text-sm text-stone-500 uppercase tracking-wide font-medium mb-1">Sipariş Numarası</p>
                            <p className="text-3xl font-mono font-bold text-stone-900 tracking-wider">#{orderId.slice(0, 8).toUpperCase()}</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        {isSuccess ? (
                            <>
                                <Link href="/siparis-takip" className="w-full">
                                    <Button className="w-full h-12 text-lg bg-stone-900 hover:bg-amber-600">
                                        Siparişi Takip Et <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                                <Link href="/" className="w-full">
                                    <Button variant="outline" className="w-full h-12 text-lg">
                                        Alışverişe Devam Et
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/odeme" className="w-full">
                                    <Button className="w-full h-12 text-lg bg-stone-900 hover:bg-amber-600">
                                        Tekrar Dene
                                    </Button>
                                </Link>
                                <Link href="/sepet" className="w-full">
                                    <Button variant="outline" className="w-full h-12 text-lg">
                                        Sepete Dön
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}
