"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PaymentResultContent() {
    const searchParams = useSearchParams();
    const status = searchParams.get("status");
    const orderId = searchParams.get("orderId");
    const message = searchParams.get("message");
    const isSuccess = status === "success";

    return (
        <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
            <Header />
            <main className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-32">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg rounded-2xl border border-stone-100 bg-white p-8 text-center shadow-xl"
                >
                    <div className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full ${isSuccess ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                        {isSuccess ? (
                            <CheckCircle className="h-12 w-12" />
                        ) : (
                            <XCircle className="h-12 w-12" />
                        )}
                    </div>

                    <h1 className="mb-3 font-serif text-3xl font-bold">
                        {isSuccess ? "Odeme Basarili!" : "Odeme Basarisiz!"}
                    </h1>

                    <p className="mb-8 text-lg text-stone-500">
                        {isSuccess
                            ? "Siparisiniz basariyla alindi ve odemeniz onaylandi."
                            : (message || "Odeme islemi sirasinda bir hata olustu. Lutfen tekrar deneyin.")}
                    </p>

                    {isSuccess && orderId && (
                        <div className="mb-8 rounded-xl border border-stone-200 bg-stone-50 p-6">
                            <p className="mb-1 text-sm font-medium uppercase tracking-wide text-stone-500">Siparis Numarasi</p>
                            <p className="font-mono text-3xl font-bold tracking-wider text-stone-900">#{orderId.slice(0, 8).toUpperCase()}</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        {isSuccess ? (
                            <>
                                <Link href="/siparis-takip" className="w-full">
                                    <Button className="h-12 w-full bg-stone-900 text-lg hover:bg-amber-600">
                                        Siparisi Takip Et <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="/" className="w-full">
                                    <Button variant="outline" className="h-12 w-full text-lg">
                                        Alisverise Devam Et
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/odeme" className="w-full">
                                    <Button className="h-12 w-full bg-stone-900 text-lg hover:bg-amber-600">
                                        Tekrar Dene
                                    </Button>
                                </Link>
                                <Link href="/sepet" className="w-full">
                                    <Button variant="outline" className="h-12 w-full text-lg">
                                        Sepete Don
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
