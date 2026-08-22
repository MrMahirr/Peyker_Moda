"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { storeApi } from "@/lib/api";
import { toast } from "sonner";

interface GoogleCredentialResponse {
    credential: string;
}

interface GoogleAccounts {
    accounts: {
        id: {
            initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
            renderButton: (parent: HTMLElement | null, options: Record<string, string | number>) => void;
        };
    };
}

type GoogleWindow = Window & { google?: GoogleAccounts };

const getErrorMessage = (error: unknown, fallback: string) => {
    return error instanceof Error ? error.message : fallback;
};

import { Suspense } from "react";

function LoginPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl');
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "336940869300-g5itv0o638k40fptbe3hctp6f5d7fdfd.apps.googleusercontent.com";

    const initializeGoogle = () => {
        if (!clientId) return;

        const google = (window as GoogleWindow).google;
        if (typeof window !== "undefined" && google) {
            try {
                google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleGoogleCallback,
                });
                const container = document.getElementById("google-signin-btn");
                // Google's button needs an exact pixel width; measure the actual
                // container instead of hardcoding one, so it never overflows on
                // narrow viewports. 200/400 are Google's documented min/max.
                const measuredWidth = container?.clientWidth || 382;
                const width = Math.max(200, Math.min(measuredWidth, 400));
                google.accounts.id.renderButton(
                    container,
                    {
                        theme: "outline",
                        size: "large",
                        width,
                        logo_alignment: "center",
                        text: "signin_with",
                        locale: "tr"
                    }
                );
            } catch (err) {
                console.error("Failed to initialize Google Auth:", err);
            }
        }
    };

    useEffect(() => {
        if (clientId && typeof window !== "undefined" && (window as GoogleWindow).google) {
            initializeGoogle();
        }
    }, [clientId]);

    const handleGoogleCallback = async (response: GoogleCredentialResponse) => {
        setError("");
        setLoading(true);
        try {
            const result = await storeApi.loginGoogle(response.credential);
            if (result.accessToken) {
                localStorage.setItem("accessToken", result.accessToken);
                localStorage.setItem("user", JSON.stringify(result.user));
                toast.success("Başarıyla giriş yapıldı!");
                setTimeout(() => {
                    window.location.href = "/profil";
                }, 1000);
            }
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Google ile giriş başarısız. Lütfen tekrar deneyin."));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await storeApi.login(email, password);
            if (result.accessToken) {
                localStorage.setItem("accessToken", result.accessToken);
                localStorage.setItem("user", JSON.stringify(result.user));
                toast.success("Başarıyla giriş yapıldı!");
                setTimeout(() => {
                    window.location.href = returnUrl || "/profil";
                }, 1000);
            }
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Giriş başarısız. Lütfen bilgilerinizi kontrol edin."));
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
                    className="max-w-md mx-auto"
                >
                    <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">
                                Hoş Geldiniz
                            </h1>
                            <p className="text-stone-500">
                                Hesabınıza giriş yapın
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-posta Adresi</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="ornek@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 h-12 bg-stone-50 border-stone-200"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="password">Şifre</Label>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10 h-12 bg-stone-50 border-stone-200"
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

                            <Button
                                type="submit"
                                className="w-full h-12 bg-stone-900 hover:bg-amber-600 text-white font-medium text-lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Giriş yapılıyor...
                                    </>
                                ) : (
                                    "Giriş Yap"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-stone-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-stone-400">veya</span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <div id="google-signin-btn" className="w-full max-w-[382px]"></div>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-stone-500">
                                Hesabınız yok mu?{" "}
                                <Link href="/kayit" className="text-amber-600 hover:text-amber-700 font-medium">
                                    Kayıt Ol
                                </Link>
                            </p>
                        </div>

                    </div>
                </motion.div>
            </main>

            <Footer />
            
            <Script
                src="https://accounts.google.com/gsi/client"
                onLoad={initializeGoogle}
                strategy="lazyOnload"
            />
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-stone-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>}>
            <LoginPageContent />
        </Suspense>
    );
}
