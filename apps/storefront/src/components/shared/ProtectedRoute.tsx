"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { storeApi } from "@/lib/api";

interface ProtectedRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export default function ProtectedRoute({ children, redirectTo = "/giris" }: ProtectedRouteProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const isLoggedIn = storeApi.isLoggedIn();

            if (!isLoggedIn) {
                // Store the current URL for redirect after login
                const currentPath = window.location.pathname + window.location.search;
                sessionStorage.setItem("redirectAfterLogin", currentPath);
                router.push(redirectTo);
            } else {
                setIsAuthenticated(true);
            }
            setIsLoading(false);
        };

        checkAuth();
    }, [router, redirectTo]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-4" />
                    <p className="text-stone-500">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
