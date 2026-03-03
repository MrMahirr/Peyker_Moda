"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, Truck, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { storeApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

interface OrderStatus {
    id: string;
    orderNumber: string;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    total: number;
    createdAt: string;
    items?: Array<{ name: string; quantity: number; price: number }>;
    shippingAddress?: string;
    trackingNumber?: string;
}

const STATUS_CONFIG = {
    PENDING: { label: 'Beklemede', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    PROCESSING: { label: 'Hazırlanıyor', icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    SHIPPED: { label: 'Kargoda', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-100' },
    DELIVERED: { label: 'Teslim Edildi', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    CANCELLED: { label: 'İptal Edildi', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
};

const STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const;

export default function OrderTrackingPage() {
    const [orderNumber, setOrderNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<OrderStatus | null>(null);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setOrder(null);

        try {
            const result = await storeApi.trackOrder(orderNumber, phone);
            if (result) {
                setOrder(result as OrderStatus);
            } else {
                setError('Sipariş bulunamadı. Lütfen bilgilerinizi kontrol edin.');
            }
        } catch (err) {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    const getStepIndex = (status: string) => STEPS.indexOf(status as any);

    return (
        <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
            <Header />

            <main className="container mx-auto px-4 md:px-8 py-24 md:py-32">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-center">Sipariş Takibi</h1>
                    <p className="text-stone-500 text-center mb-8">
                        Sipariş numaranız ve telefon numaranızla siparişinizin durumunu öğrenin.
                    </p>

                    {/* Arama Formu */}
                    <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 mb-8">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Sipariş Numarası</label>
                                <Input
                                    placeholder="Örn: ORD-2024-001"
                                    value={orderNumber}
                                    onChange={(e) => setOrderNumber(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Telefon Numarası</label>
                                <Input
                                    placeholder="5XX XXX XX XX"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-stone-900 hover:bg-amber-600 h-12"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Aranıyor...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-4 h-4 mr-2" />
                                        Sipariş Sorgula
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>

                    {/* Hata Mesajı */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Sipariş Durumu */}
                    {order && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-stone-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-stone-500">Sipariş Numarası</p>
                                        <p className="text-xl font-mono font-bold text-stone-900">{order.orderNumber}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-stone-500">Toplam</p>
                                        <p className="text-xl font-bold text-amber-600">{formatPrice(order.total)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="p-6 border-b border-stone-100 bg-stone-50">
                                {(() => {
                                    const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                                    const Icon = config.icon;
                                    return (
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.bg} ${config.color}`}>
                                            <Icon className="w-5 h-5" />
                                            <span className="font-medium">{config.label}</span>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Progress Steps */}
                            {order.status !== 'CANCELLED' && (
                                <div className="p-6 border-b border-stone-100">
                                    <div className="flex items-center justify-between">
                                        {STEPS.map((step, index) => {
                                            const config = STATUS_CONFIG[step];
                                            const Icon = config.icon;
                                            const isActive = index <= getStepIndex(order.status);
                                            const isCurrent = step === order.status;

                                            return (
                                                <div key={step} className="flex-1 flex flex-col items-center relative">
                                                    {index > 0 && (
                                                        <div
                                                            className={`absolute top-5 right-1/2 w-full h-0.5 -z-10 ${index <= getStepIndex(order.status) ? 'bg-amber-500' : 'bg-stone-200'
                                                                }`}
                                                        />
                                                    )}
                                                    <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive
                                                                ? isCurrent
                                                                    ? 'bg-amber-500 text-white'
                                                                    : 'bg-green-500 text-white'
                                                                : 'bg-stone-200 text-stone-400'
                                                            }`}
                                                    >
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <span className={`text-xs mt-2 ${isActive ? 'text-stone-900 font-medium' : 'text-stone-400'}`}>
                                                        {config.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Kargo Takip */}
                            {order.trackingNumber && (
                                <div className="p-6 border-b border-stone-100">
                                    <p className="text-sm text-stone-500 mb-1">Kargo Takip Numarası</p>
                                    <p className="font-mono font-medium text-stone-900">{order.trackingNumber}</p>
                                </div>
                            )}

                            {/* Tarih */}
                            <div className="p-6">
                                <p className="text-sm text-stone-500">
                                    Sipariş Tarihi: {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
