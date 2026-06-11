"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Truck, MapPin, User, Phone, Mail, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/CartContext";
import { storeApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export default function CheckoutPage() {
    const router = useRouter();
    const { items, subtotal, clearCart, coupon } = useCart();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
    const [orderNumber, setOrderNumber] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Address & Auth State
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('new');
    const [saveNewAddress, setSaveNewAddress] = useState(false);
    const [newAddressTitle, setNewAddressTitle] = useState('Ev');
    const [isPageLoading, setIsPageLoading] = useState(true);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        district: '',
        postalCode: '',
        paymentMethod: 'CASH' as 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER',
        notes: ''
    });

    const [cardInfo, setCardInfo] = useState({
        cardHolderName: '',
        cardNumber: '',
        expireMonth: '',
        expireYear: '',
        cvc: ''
    });

    const discountAmount = coupon?.valid
        ? coupon.discountType === 'percentage'
            ? Math.round(subtotal * (coupon.discount / 100))
            : coupon.discount
        : 0;

    const shipping = subtotal > 1500 ? 0 : 50;
    const total = subtotal - discountAmount + shipping;

    useEffect(() => {
        const checkAuthAndLoadData = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                toast.info('Ödeme sayfasına erişmek için giriş yapmalısınız.');
                router.push('/giris?returnUrl=/odeme');
                return;
            }

            try {
                // Load User
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    setForm(prev => ({
                        ...prev,
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        email: user.email || '',
                        phone: user.phone || ''
                    }));
                }

                // Load Addresses
                const addresses = await storeApi.getAddresses();
                setSavedAddresses(addresses);
                if (addresses.length > 0) {
                    setSelectedAddressId(addresses[0].id);
                    const addr = addresses[0];
                    setForm(prev => ({
                        ...prev,
                        street: addr.address || '',
                        city: addr.city || '',
                        district: addr.district || '',
                        postalCode: addr.postalCode || ''
                    }));
                }
            } catch (err) {
                console.error("Bilgiler yüklenirken hata:", err);
            } finally {
                setIsPageLoading(false);
            }
        };

        checkAuthAndLoadData();
    }, [router]);

    const handleAddressSelect = (id: string | 'new') => {
        setSelectedAddressId(id);
        if (id !== 'new') {
            const addr = savedAddresses.find(a => a.id === id);
            if (addr) {
                setForm(prev => ({
                    ...prev,
                    street: addr.address || '',
                    city: addr.city || '',
                    district: addr.district || '',
                    postalCode: addr.postalCode || ''
                }));
            }
        } else {
            setForm(prev => ({
                ...prev,
                street: '',
                city: '',
                district: '',
                postalCode: ''
            }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (validationErrors[e.target.name]) {
            setValidationErrors(prev => ({ ...prev, [e.target.name]: '' }));
        }
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
        setValidationErrors({});
        
        // Manual validation
        const errors: Record<string, string> = {};
        if (!form.firstName.trim()) errors.firstName = "Ad zorunludur";
        if (!form.lastName.trim()) errors.lastName = "Soyad zorunludur";
        if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errors.email = "Geçerli bir e-posta adresi giriniz";
        if (!form.phone.trim()) errors.phone = "Telefon numarası zorunludur";
        
        if (!form.street.trim()) errors.street = "Adres detayları zorunludur";
        if (!form.district.trim()) errors.district = "İlçe zorunludur";
        if (!form.city.trim()) errors.city = "Şehir zorunludur";
        
        if (selectedAddressId === 'new' && saveNewAddress && !newAddressTitle.trim()) {
            errors.newAddressTitle = "Adres başlığı zorunludur";
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            toast.error("Lütfen formu kontrol edip eksik alanları doldurunuz.");
            return;
        }

        setLoading(true);

        try {
            // 1. Save new address if requested
            if (selectedAddressId === 'new' && saveNewAddress) {
                await storeApi.addAddress({
                    title: newAddressTitle || 'Yeni Adres',
                    fullName: `${form.firstName} ${form.lastName}`,
                    phone: form.phone,
                    address: form.street,
                    city: form.city,
                    district: form.district,
                    postalCode: form.postalCode,
                    type: 'home'
                });
            }

            // 2. Create Order (Pending Payment)
            const orderResult = await storeApi.createOrder({
                items: items.map(item => ({
                    variantId: item.variantId || item.id,
                    quantity: item.quantity
                })),
                shippingAddress: {
                    fullName: `${form.firstName} ${form.lastName}`,
                    phone: form.phone,
                    email: form.email,
                    address: form.street,
                    city: form.city,
                    district: form.district,
                    postalCode: form.postalCode
                },
                paymentMethod: form.paymentMethod,
                notes: form.notes,
                couponCode: coupon?.valid ? coupon.code : undefined
            });

            if (form.paymentMethod === 'CASH') {
                // If cash, finish immediately
                setOrderNumber(orderResult.orderNumber);
                clearCart();
                toast.success('Siparişiniz başarıyla oluşturuldu!');
                setStep('success');
            } else {
                setOrderNumber(orderResult.orderNumber);
                clearCart();
                toast.success('Siparişiniz başarıyla oluşturuldu!');
                setStep('success');
            }

        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyiniz.");
            toast.error("Sipariş oluşturulurken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    if (isPageLoading) {
        return (
            <div className="min-h-screen bg-stone-50 font-sans text-stone-900 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />
                <p className="text-stone-500">Bilgileriniz yükleniyor...</p>
            </div>
        );
    }

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
                                <div>
                                    <Input name="firstName" placeholder="Ad" value={form.firstName} onChange={handleChange} className={validationErrors.firstName ? "border-rose-500" : ""} />
                                    {validationErrors.firstName && <span className="text-xs text-rose-500 mt-1 block">{validationErrors.firstName}</span>}
                                </div>
                                <div>
                                    <Input name="lastName" placeholder="Soyad" value={form.lastName} onChange={handleChange} className={validationErrors.lastName ? "border-rose-500" : ""} />
                                    {validationErrors.lastName && <span className="text-xs text-rose-500 mt-1 block">{validationErrors.lastName}</span>}
                                </div>
                                <div>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                        <Input name="email" type="email" placeholder="E-posta" className={`pl-10 ${validationErrors.email ? "border-rose-500" : ""}`} value={form.email} onChange={handleChange} />
                                    </div>
                                    {validationErrors.email && <span className="text-xs text-rose-500 mt-1 block">{validationErrors.email}</span>}
                                </div>
                                <div>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                        <Input name="phone" placeholder="Telefon" className={`pl-10 ${validationErrors.phone ? "border-rose-500" : ""}`} value={form.phone} onChange={handleChange} />
                                    </div>
                                    {validationErrors.phone && <span className="text-xs text-rose-500 mt-1 block">{validationErrors.phone}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Adres */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-amber-600" />
                                Teslimat Adresi
                            </h2>

                            {savedAddresses.length > 0 && (
                                <div className="mb-6 space-y-3">
                                    <Label className="text-stone-500">Kayıtlı Adreslerinizden Seçin</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {savedAddresses.map(addr => (
                                            <div 
                                                key={addr.id}
                                                onClick={() => handleAddressSelect(addr.id)}
                                                className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' : 'border-stone-200 hover:border-stone-300'}`}
                                            >
                                                <div className="font-medium flex justify-between items-center mb-1">
                                                    <span>{addr.title}</span>
                                                    {selectedAddressId === addr.id && <CheckCircle className="w-4 h-4 text-amber-600" />}
                                                </div>
                                                <p className="text-sm text-stone-500 line-clamp-2">{addr.address}, {addr.district}/{addr.city}</p>
                                            </div>
                                        ))}
                                        <div 
                                            onClick={() => handleAddressSelect('new')}
                                            className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center justify-center ${selectedAddressId === 'new' ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' : 'border-stone-200 hover:border-stone-300'}`}
                                        >
                                            <span className="font-medium">+ Yeni Adres Ekle</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <Input name="street" placeholder="Adres (Sokak, Kapı No)" value={form.street} onChange={handleChange} disabled={selectedAddressId !== 'new' && savedAddresses.length > 0} className={validationErrors.street ? "border-rose-500" : ""} />
                                    {validationErrors.street && <span className="text-xs text-rose-500 mt-1 block">{validationErrors.street}</span>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Input name="district" placeholder="İlçe" value={form.district} onChange={handleChange} disabled={selectedAddressId !== 'new' && savedAddresses.length > 0} className={validationErrors.district ? "border-rose-500" : ""} />
                                        {validationErrors.district && <span className="text-xs text-rose-500 mt-1 block">{validationErrors.district}</span>}
                                    </div>
                                    <div>
                                        <Input name="city" placeholder="Şehir" value={form.city} onChange={handleChange} disabled={selectedAddressId !== 'new' && savedAddresses.length > 0} className={validationErrors.city ? "border-rose-500" : ""} />
                                        {validationErrors.city && <span className="text-xs text-rose-500 mt-1 block">{validationErrors.city}</span>}
                                    </div>
                                    <div>
                                        <Input name="postalCode" placeholder="Posta Kodu" value={form.postalCode} onChange={handleChange} disabled={selectedAddressId !== 'new' && savedAddresses.length > 0} />
                                    </div>
                                </div>
                            </div>

                            {selectedAddressId === 'new' && (
                                <div className="mt-6 pt-4 border-t border-stone-100">
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setSaveNewAddress(!saveNewAddress)}
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${saveNewAddress ? "bg-amber-600 border-amber-600" : "border-stone-300"}`}
                                        >
                                            {saveNewAddress && <CheckCircle className="w-3 h-3 text-white" />}
                                        </button>
                                        <Label className="cursor-pointer" onClick={() => setSaveNewAddress(!saveNewAddress)}>
                                            Bu adresi sonraki alışverişlerim için kaydet
                                        </Label>
                                    </div>
                                    {saveNewAddress && (
                                        <div className="mt-3 ml-8">
                                            <Input 
                                                placeholder="Adres Başlığı (örn: Ev, İş)" 
                                                value={newAddressTitle} 
                                                onChange={(e) => {
                                                    setNewAddressTitle(e.target.value);
                                                    if (validationErrors.newAddressTitle) {
                                                        setValidationErrors(prev => ({ ...prev, newAddressTitle: '' }));
                                                    }
                                                }}
                                                className={`max-w-xs ${validationErrors.newAddressTitle ? "border-rose-500" : ""}`}
                                            />
                                            {validationErrors.newAddressTitle && <span className="text-xs text-rose-500 mt-1 block">{validationErrors.newAddressTitle}</span>}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Ödeme Yöntemi */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-amber-600" />
                                Ödeme Yöntemi
                            </h2>
                            <div className="grid grid-cols-1 gap-4 mb-6">
                                {[
                                    { value: 'CASH', label: 'Kapıda Ödeme', icon: Truck },
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

                            {form.paymentMethod === 'CASH' && (
                                <p className="text-sm text-stone-500 bg-stone-50 p-4 rounded-lg">
                                    Ödemeyi siparişiniz teslim edildiğinde nakit veya kredi kartı ile kuryeye yapabilirsiniz.
                                </p>
                            )}
                        </div>

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
                                {coupon?.valid && (
                                    <div className="flex justify-between text-green-600">
                                        <span className="flex items-center gap-1">
                                            İndirim ({coupon.code})
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
