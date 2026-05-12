"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, Phone, Loader2, Check } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { storeApi } from "@/lib/api";

const getErrorMessage = (error: unknown, fallback: string) => {
    return error instanceof Error ? error.message : fallback;
};

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [agreed, setAgreed] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Şifreler eşleşmiyor.");
            return;
        }

        if (!agreed) {
            setError("Kullanım koşullarını kabul etmelisiniz.");
            return;
        }

        setLoading(true);

        try {
            const result = await storeApi.register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
            });

            if (result.success) {
                router.push("/giris?registered=true");
            }
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Kayıt başarısız. Lütfen tekrar deneyin."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
            <Header />

            <main className="container mx-auto px-4 py-24 md:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-lg mx-auto"
                >
                    <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">
                                Hesap Oluştur
                            </h1>
                            <p className="text-stone-500">
                                Peyker Moda ailesine katılın
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Ad</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            placeholder="Adınız"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="pl-10 h-12 bg-stone-50 border-stone-200"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Soyad</Label>
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        placeholder="Soyadınız"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="h-12 bg-stone-50 border-stone-200"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">E-posta Adresi</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="ornek@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="pl-10 h-12 bg-stone-50 border-stone-200"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefon Numarası</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="+90 555 123 4567"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="pl-10 h-12 bg-stone-50 border-stone-200"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Şifre</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="En az 8 karakter"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="pl-10 pr-10 h-12 bg-stone-50 border-stone-200"
                                        minLength={8}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="Şifrenizi tekrar girin"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="pl-10 h-12 bg-stone-50 border-stone-200"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAgreed(!agreed)}
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${agreed ? "bg-amber-600 border-amber-600" : "border-stone-300"
                                        }`}
                                >
                                    {agreed && <Check className="w-3 h-3 text-white" />}
                                </button>
                                <p className="text-sm text-stone-600">
                                    <Link href="/kullanim-kosullari" className="text-amber-600 hover:underline">Kullanım Koşulları</Link> ve{" "}
                                    <Link href="/gizlilik-politikasi" className="text-amber-600 hover:underline">Gizlilik Politikası</Link>&apos;nı
                                    okudum ve kabul ediyorum.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-stone-900 hover:bg-amber-600 text-white font-medium text-lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Kayıt yapılıyor...
                                    </>
                                ) : (
                                    "Kayıt Ol"
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-stone-500">
                                Zaten hesabınız var mı?{" "}
                                <Link href="/giris" className="text-amber-600 hover:text-amber-700 font-medium">
                                    Giriş Yap
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
