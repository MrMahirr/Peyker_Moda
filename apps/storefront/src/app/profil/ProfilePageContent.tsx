"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Loader2, LogOut, MapPin, Package, User } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import OrdersContent from "@/components/profile/OrdersContent";
import FavoritesContent from "@/components/profile/FavoritesContent";
import AddressesContent from "@/components/profile/AddressesContent";
import { Button } from "@/components/ui/button";
import { storeApi, StoreUser } from "@/lib/api";
import { toast } from "sonner";

const menuItems = [
  { id: "profile", label: "Profil Bilgilerim", icon: User },
  { id: "orders", label: "Siparislerim", icon: Package },
  { id: "favorites", label: "Favorilerim", icon: Heart },
  { id: "addresses", label: "Adres Bilgilerim", icon: MapPin },
] as const;

type ProfileTab = (typeof menuItems)[number]["id"];

const isProfileTab = (value: string | null): value is ProfileTab => {
  return menuItems.some((item) => item.id === value);
};

export default function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const defaultTab: ProfileTab = isProfileTab(requestedTab) ? requestedTab : "profile";

  const [activeTab, setActiveTab] = useState<ProfileTab>(defaultTab);
  const [user, setUser] = useState<StoreUser | null>(() => storeApi.getUser());
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: ""
  });

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const currentUser = await storeApi.getCurrentUser();
        if (!isMounted) return;

        if (!currentUser) {
          router.push("/giris");
          return;
        }

        setUser(currentUser);
        setFormData({
          firstName: currentUser.firstName || "",
          lastName: currentUser.lastName || "",
          phone: currentUser.phone || ""
        });
        setProfileError(null);
      } catch (error) {
        if (!isMounted) return;
        setProfileError(error instanceof Error ? error.message : "Profil bilgileri alinamadi");
      } finally {
        if (isMounted) {
          setProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const initials = useMemo(() => {
    const first = user?.firstName?.trim().charAt(0) || "";
    const last = user?.lastName?.trim().charAt(0) || "";
    return `${first}${last}`.toUpperCase() || "P";
  }, [user]);

  const handleLogout = () => {
    storeApi.logout();
    router.push("/");
  };

  const selectTab = (tab: ProfileTab) => {
    setActiveTab(tab);
    router.push(`/profil?tab=${tab}`);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setProfileError(null);
    setProfileSuccess(null);
    try {
      const updatedUser = await storeApi.updateProfile(formData);
      setUser(updatedUser);
      toast.success("Profil bilgileriniz başarıyla güncellendi.");
    } catch (error: any) {
      toast.error(error.message || "Profil güncellenirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-amber-200">
        <Header />

        <main className="container mx-auto px-4 py-24 md:px-8 md:py-32">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
            <aside className="flex-shrink-0 lg:w-72">
              <div className="sticky top-32 overflow-hidden rounded-xl border border-stone-100 bg-white shadow-sm">
                <div className="border-b border-stone-100 bg-stone-50/50 p-6 text-center">
                  <div className="relative mx-auto mb-3 h-20 w-20">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white bg-stone-900 font-serif text-2xl font-bold text-white shadow-md">
                      {initials}
                    </div>
                  </div>
                  <h2 className="font-serif text-lg font-bold">
                    {user?.firstName || "Kullanici"} {user?.lastName || ""}
                  </h2>
                  <p className="text-xs text-stone-500">{user?.email || ""}</p>
                </div>

                <nav className="p-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectTab(item.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                        activeTab === item.id
                          ? "bg-stone-900 text-white shadow-md"
                          : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  ))}
                  <div className="mx-2 my-2 border-t border-stone-100" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Cikis Yap
                  </button>
                </nav>
              </div>
            </aside>

            <div className="flex-1">
              {activeTab === "profile" && profileLoading && (
                <div className="flex h-64 items-center justify-center rounded-xl border border-stone-100 bg-white">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                </div>
              )}

              {activeTab === "profile" && !profileLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-stone-100 bg-white p-6 shadow-sm md:p-8"
                >
                  <div className="mb-6">
                    <h2 className="font-serif text-2xl font-bold text-stone-900">Profil Bilgilerim</h2>
                    <p className="mt-1 text-sm text-stone-500">Hesabiniza kayitli musteri bilgileri.</p>
                  </div>

                  <Separator className="mb-8" />

                  {profileError && (
                    <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                      {profileError}
                    </div>
                  )}

                  <form onSubmit={handleProfileUpdate}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Ad</Label>
                        <Input 
                          id="firstName" 
                          value={formData.firstName} 
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                          className="border-stone-200" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Soyad</Label>
                        <Input 
                          id="lastName" 
                          value={formData.lastName} 
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                          className="border-stone-200" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-posta Adresi</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={user?.email || ""} 
                          readOnly 
                          className="border-stone-200 bg-stone-50 cursor-not-allowed" 
                          title="E-posta adresi değiştirilemez"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon Numarasi</Label>
                        <Input 
                          id="phone" 
                          type="tel" 
                          value={formData.phone} 
                          onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                          className="border-stone-200" 
                        />
                      </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                      <Button type="submit" disabled={isSaving} className="bg-stone-900 hover:bg-amber-600 text-white min-w-[120px]">
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {isSaving ? "Kaydediliyor" : "Değişiklikleri Kaydet"}
                      </Button>
                    </div>
                  </form>
                  {profileSuccess && (
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                      {profileSuccess}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "orders" && <OrdersContent />}
              {activeTab === "favorites" && <FavoritesContent />}
              {activeTab === "addresses" && <AddressesContent />}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
