"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Truck, MapPin, User, Phone, Mail, CheckCircle, Loader2, Lock, ShieldCheck } from 'lucide-react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/CartContext";
import { storeApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
    const router = useRouter();
    const { items, subtotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
    const [orderNumber, setOrderNumber] = useState('');
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        district: '',
        postalCode: '',
        paymentMethod: 'CASH_ON_DELIVERY' as 'CASH_ON_DELIVERY' | 'CREDIT_CARD' | 'BANK_TRANSFER',
        notes: ''
    });

    const [cardInfo, setCardInfo] = useState({
        cardHolderName: '',
        cardNumber: '',
        expireMonth: '',
        expireYear: '',
        cvc: ''
    });

    const shipping = subtotal > 1500 ? 0 : 50;
    const total = subtotal + shipping;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        if (e.target.name === 'cardNumber') {
            value = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
        } else if (e.target.name === 'expireMonth' || e.target.name === 'expireYear' || e.target.name === 'cvc') {
            value = value.replace(/\D/g, '');
        }
        setCardInfo({ ...cardInfo, [e.target.name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // 1. Create Order (Pending Payment)
            const orderResult = await storeApi.createOrder({
                items: items.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price
                })),
                customer: {
                    firstName: form.firstName,
                    lastName: form.lastName,
                    email: form.email,
                    phone: form.phone
                },
                shippingAddress: {
                    street: form.street,
                    city: form.city,
                    district: form.district,
                    postalCode: form.postalCode
                },
                paymentMethod: form.paymentMethod,
                notes: form.notes
            });

            if (form.paymentMethod === 'CASH_ON_DELIVERY') {
                // If cash, finish immediately
                setOrderNumber(orderResult.orderNumber);
                clearCart();
                setStep('success');
            } else if (form.paymentMethod === 'CREDIT_CARD') {
                // If credit card, initialize payment
                try {
                    const paymentResult = await storeApi.initializePayment({
                        orderId: orderResult.id,
                        cardInfo: {
                            ...cardInfo,
                            cardNumber: cardInfo.cardNumber.replace(/\s/g, '')
                        }
                    });

                    if (paymentResult.status === 'SUCCESS' && paymentResult.threeDSecureUrl) {
                        // Redirect to 3D Secure (or show Mock 3D Secure page)
                        window.location.href = paymentResult.threeDSecureUrl;
                    } else {
                        throw new Error('Ödeme başlatılamadı');
                    }
                } catch (paymentError: any) {
                    setError('Ödeme işlemi sırasında bir hata oluştu: ' + (paymentError.message || 'Bilinmeyen hata'));
                    // Order stays pending/cancelled depending on logic
                }
            } else {
                setOrderNumber(orderResult.orderNumber);
                clearCart();
                setStep('success');
            }

        } catch (error: any) {
            console.error('Checkout error:', error);
            setError('Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0 && step !== 'success') {
        return (
            <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
                <Header />
                <main className="container mx-auto px-4 py-32 text-center">
                    <h1 className="text-2xl font-serif font-bold mb-4">Sepetiniz boş</h1>
                    <p className="text-stone-500 mb-8">Ödeme yapmak için önce sepetinize ürün ekleyin.</p>
                    <Link href="/">
                        <Button className="bg-stone-900 hover:bg-amber-600">Alışverişe Başla</Button>
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
                <Header />
                <main className="container mx-auto px-4 py-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-8 text-center"
                    >
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-serif font-bold mb-2">Siparişiniz Alındı!</h1>
                        <p className="text-stone-500 mb-4">Siparişiniz başarıyla oluşturuldu.</p>
                        <div className="bg-stone-100 rounded-lg p-4 mb-6">
                            <p className="text-sm text-stone-600">Sipariş Numaranız</p>
                            <p className="text-2xl font-mono font-bold text-amber-600">{orderNumber}</p>
                        </div>
                        <p className="text-sm text-stone-500 mb-8">
                            Sipariş durumunuzu takip etmek için bu numarayı saklayın.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link href="/" className="flex-1">
                                <Button variant="outline" className="w-full">Ana Sayfa</Button>
                            </Link>
                            <Link href="/siparis-takip" className="flex-1">
                                <Button className="w-full bg-stone-900 hover:bg-amber-600">Siparişi Takip Et</Button>
                            </Link>
                        </div>
                    </motion.div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
            <Header />

            <main className="container mx-auto px-4 md:px-8 py-24 md:py-32">
                <div className="mb-8">
                    <Link href="/sepet" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Sepete Dön
                    </Link>
                </div>

                <h1 className="text-3xl md:text-4xl font-serif font-bold mb-8">Ödeme</h1>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" />
                        {error}
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Form Sol */}
                    <form onSubmit={handleSubmit} className="flex-1 space-y-8">
                        {/* Kişisel Bilgiler */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-amber-600" />
                                Kişisel Bilgiler
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input name="firstName" placeholder="Ad" value={form.firstName} onChange={handleChange} required />
                                <Input name="lastName" placeholder="Soyad" value={form.lastName} onChange={handleChange} required />
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                    <Input name="email" type="email" placeholder="E-posta" className="pl-10" value={form.email} onChange={handleChange} required />
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                    <Input name="phone" placeholder="Telefon" className="pl-10" value={form.phone} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>

                        {/* Adres */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-amber-600" />
                                Teslimat Adresi
                            </h2>
                            <div className="space-y-4">
                                <Input name="street" placeholder="Adres (Sokak, Kapı No)" value={form.street} onChange={handleChange} required />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input name="district" placeholder="İlçe" value={form.district} onChange={handleChange} required />
                                    <Input name="city" placeholder="Şehir" value={form.city} onChange={handleChange} required />
                                    <Input name="postalCode" placeholder="Posta Kodu" value={form.postalCode} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* Ödeme Yöntemi */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-amber-600" />
                                Ödeme Yöntemi
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {[
                                    { value: 'CASH_ON_DELIVERY', label: 'Kapıda Ödeme', icon: Truck },
                                    { value: 'CREDIT_CARD', label: 'Kredi Kartı', icon: CreditCard },
                                    { value: 'BANK_TRANSFER', label: 'Havale/EFT', icon: MapPin },
                                ].map(method => (
                                    <label
                                        key={method.value}
                                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${form.paymentMethod === method.value
                                            ? 'border-amber-500 bg-amber-50'
                                            : 'border-stone-200 hover:border-stone-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method.value}
                                            checked={form.paymentMethod === method.value}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <method.icon className={`w-5 h-5 ${form.paymentMethod === method.value ? 'text-amber-600' : 'text-stone-400'}`} />
                                        <span className={form.paymentMethod === method.value ? 'font-medium' : ''}>{method.label}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Kredi Kartı Formu */}
                            {form.paymentMethod === 'CREDIT_CARD' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-stone-50 p-5 rounded-lg border border-stone-200 space-y-4"
                                >
                                    <div className="flex items-center gap-2 text-stone-600 mb-2">
                                        <Lock className="w-4 h-4" />
                                        <span className="text-sm font-medium">Güvenli Ödeme (SSL ile Okunur)</span>
                                    </div>
                                    <Input
                                        name="cardHolderName"
                                        placeholder="Kart Üzerindeki İsim"
                                        value={cardInfo.cardHolderName}
                                        onChange={handleCardChange}
                                        required={form.paymentMethod === 'CREDIT_CARD'}
                                    />
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                        <Input
                                            name="cardNumber"
                                            placeholder="Kart Numarası"
                                            className="pl-10 font-mono"
                                            value={cardInfo.cardNumber}
                                            onChange={handleCardChange}
                                            maxLength={19}
                                            required={form.paymentMethod === 'CREDIT_CARD'}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex gap-2">
                                            <Input
                                                name="expireMonth"
                                                placeholder="AA"
                                                className="text-center"
                                                maxLength={2}
                                                value={cardInfo.expireMonth}
                                                onChange={handleCardChange}
                                                required={form.paymentMethod === 'CREDIT_CARD'}
                                            />
                                            <span className="self-center">/</span>
                                            <Input
                                                name="expireYear"
                                                placeholder="YY"
                                                className="text-center"
                                                maxLength={2}
                                                value={cardInfo.expireYear}
                                                onChange={handleCardChange}
                                                required={form.paymentMethod === 'CREDIT_CARD'}
                                            />
                                        </div>
                                        <Input
                                            name="cvc"
                                            placeholder="CVC"
                                            maxLength={3}
                                            className="text-center"
                                            value={cardInfo.cvc}
                                            onChange={handleCardChange}
                                            required={form.paymentMethod === 'CREDIT_CARD'}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {form.paymentMethod === 'CASH_ON_DELIVERY' && (
                                <p className="text-sm text-stone-500 bg-stone-50 p-4 rounded-lg">
                                    Ödemeyi siparişiniz teslim edildiğinde nakit veya kredi kartı ile kuryeye yapabilirsiniz.
                                </p>
                            )}
                        </div>

                        {/* ... diğer bölümler (Not) aynı ... */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                            <h2 className="text-lg font-semibold mb-4">Sipariş Notu (Opsiyonel)</h2>
                            <textarea
                                name="notes"
                                rows={3}
                                placeholder="Teslimat ile ilgili özel taleplerinizi yazabilirsiniz..."
                                className="w-full border border-stone-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                                value={form.notes}
                                onChange={handleChange}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-stone-900 hover:bg-amber-600 text-white h-14 text-lg font-medium shadow-lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    İşleniyor...
                                </>
                            ) : (
                                `Siparişi Tamamla - ${formatPrice(total)}`
                            )}
                        </Button>
                    </form>

                    {/* Sipariş Özeti Sağ */}
                    <div className="lg:w-[380px] flex-shrink-0">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 sticky top-32">
                            <h2 className="text-lg font-semibold mb-4">Sipariş Özeti</h2>

                            <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
                                {items.map(item => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="relative w-16 h-16 bg-stone-100 rounded-md overflow-hidden flex-shrink-0">
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{item.name}</p>
                                            <p className="text-stone-500 text-sm">{formatPrice(item.price)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-stone-100 pt-4 space-y-2">
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
                                <div className="pt-2 border-t border-stone-100 flex justify-between">
                                    <span className="font-bold">Toplam</span>
                                    <span className="font-bold text-xl text-amber-600">{formatPrice(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
