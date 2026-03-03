"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Pencil, Trash2, Home, Building2, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Address {
    id: string;
    title: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    postalCode: string;
    isDefault: boolean;
    type: "home" | "work";
}

// Mock addresses
const mockAddresses: Address[] = [
    {
        id: "1",
        title: "Ev Adresim",
        fullName: "Peyker Yılmaz",
        phone: "+90 555 123 4567",
        address: "Atatürk Mah. Cumhuriyet Cad. No: 123 D: 5",
        city: "İstanbul",
        district: "Kadıköy",
        postalCode: "34710",
        isDefault: true,
        type: "home"
    },
    {
        id: "2",
        title: "İş Adresim",
        fullName: "Peyker Yılmaz",
        phone: "+90 555 987 6543",
        address: "İş Merkezi, Merkez Mah. Şehit Yolu Sok. No: 45 Kat: 3",
        city: "İstanbul",
        district: "Şişli",
        postalCode: "34381",
        isDefault: false,
        type: "work"
    }
];

export default function AddressesContent() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Address>>({
        title: "",
        fullName: "",
        phone: "",
        address: "",
        city: "",
        district: "",
        postalCode: "",
        type: "home"
    });

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setAddresses(mockAddresses);
            setLoading(false);
        }, 500);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            // Update existing
            setAddresses(prev =>
                prev.map(addr =>
                    addr.id === editingId ? { ...addr, ...formData } as Address : addr
                )
            );
        } else {
            // Add new
            const newAddress: Address = {
                ...formData,
                id: Date.now().toString(),
                isDefault: addresses.length === 0
            } as Address;
            setAddresses(prev => [...prev, newAddress]);
        }

        resetForm();
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            title: "",
            fullName: "",
            phone: "",
            address: "",
            city: "",
            district: "",
            postalCode: "",
            type: "home"
        });
    };

    const handleEdit = (address: Address) => {
        setFormData(address);
        setEditingId(address.id);
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        setAddresses(prev => prev.filter(addr => addr.id !== id));
    };

    const setAsDefault = (id: string) => {
        setAddresses(prev =>
            prev.map(addr => ({
                ...addr,
                isDefault: addr.id === id
            }))
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-stone-900">
                    Adres Bilgilerim
                </h2>
                {!showForm && (
                    <Button
                        onClick={() => setShowForm(true)}
                        className="bg-stone-900 hover:bg-amber-600 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Adres
                    </Button>
                )}
            </div>

            {/* Address Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 mb-6"
                    >
                        <h3 className="text-lg font-bold mb-4">
                            {editingId ? "Adresi Düzenle" : "Yeni Adres Ekle"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Adres Başlığı</Label>
                                    <Input
                                        id="title"
                                        placeholder="Örn: Ev Adresim"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Adres Tipi</Label>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: "home" })}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${formData.type === "home"
                                                    ? "border-amber-500 bg-amber-50 text-amber-700"
                                                    : "border-stone-200 text-stone-600 hover:border-stone-300"
                                                }`}
                                        >
                                            <Home className="w-4 h-4" />
                                            Ev
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: "work" })}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${formData.type === "work"
                                                    ? "border-amber-500 bg-amber-50 text-amber-700"
                                                    : "border-stone-200 text-stone-600 hover:border-stone-300"
                                                }`}
                                        >
                                            <Building2 className="w-4 h-4" />
                                            İş
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Ad Soyad</Label>
                                    <Input
                                        id="fullName"
                                        placeholder="Ad Soyad"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Telefon</Label>
                                    <Input
                                        id="phone"
                                        placeholder="+90 555 123 4567"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Açık Adres</Label>
                                <Input
                                    id="address"
                                    placeholder="Mahalle, sokak, bina no, daire no"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">İl</Label>
                                    <Input
                                        id="city"
                                        placeholder="İstanbul"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="district">İlçe</Label>
                                    <Input
                                        id="district"
                                        placeholder="Kadıköy"
                                        value={formData.district}
                                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="postalCode">Posta Kodu</Label>
                                    <Input
                                        id="postalCode"
                                        placeholder="34000"
                                        value={formData.postalCode}
                                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="bg-stone-900 hover:bg-amber-600 text-white">
                                    {editingId ? "Güncelle" : "Kaydet"}
                                </Button>
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    İptal
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Address List */}
            {addresses.length === 0 && !showForm ? (
                <div className="bg-white rounded-xl p-12 shadow-sm border border-stone-100 text-center">
                    <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-10 h-10 text-stone-300" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">
                        Kayıtlı adresiniz yok
                    </h3>
                    <p className="text-stone-500 mb-6">
                        Siparişlerinizi daha hızlı tamamlamak için adres ekleyin.
                    </p>
                    <Button
                        onClick={() => setShowForm(true)}
                        className="bg-stone-900 hover:bg-amber-600 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Adres Ekle
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                        <motion.div
                            key={address.id}
                            layout
                            className={`bg-white rounded-xl p-5 shadow-sm border-2 transition-colors relative ${address.isDefault ? "border-amber-400" : "border-stone-100"
                                }`}
                        >
                            {address.isDefault && (
                                <span className="absolute -top-2 left-4 bg-amber-500 text-white text-xs px-2 py-0.5 rounded">
                                    Varsayılan
                                </span>
                            )}

                            <div className="flex items-start gap-3 mb-4">
                                <div className={`p-2 rounded-lg ${address.type === "home" ? "bg-blue-50" : "bg-purple-50"}`}>
                                    {address.type === "home" ? (
                                        <Home className="w-5 h-5 text-blue-600" />
                                    ) : (
                                        <Building2 className="w-5 h-5 text-purple-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-stone-900">{address.title}</h4>
                                    <p className="text-sm text-stone-500">{address.fullName}</p>
                                </div>
                            </div>

                            <p className="text-sm text-stone-600 mb-2">{address.address}</p>
                            <p className="text-sm text-stone-600 mb-2">
                                {address.district}, {address.city} {address.postalCode}
                            </p>
                            <p className="text-sm text-stone-500 mb-4">{address.phone}</p>

                            <div className="flex gap-2 pt-3 border-t border-stone-100">
                                {!address.isDefault && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setAsDefault(address.id)}
                                        className="flex-1 text-amber-600 border-amber-200 hover:bg-amber-50"
                                    >
                                        <Check className="w-4 h-4 mr-1" />
                                        Varsayılan Yap
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(address)}
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(address.id)}
                                    className="text-rose-500 hover:bg-rose-50 border-rose-200"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
