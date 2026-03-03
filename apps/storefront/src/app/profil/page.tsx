"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Package, Heart, MapPin, LogOut, Camera, Settings, CreditCard } from 'lucide-react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import OrdersContent from "@/components/profile/OrdersContent";
import FavoritesContent from "@/components/profile/FavoritesContent";
import AddressesContent from "@/components/profile/AddressesContent";
import { storeApi } from "@/lib/api";

const menuItems = [
  { id: 'profile', label: 'Profil Bilgilerim', icon: User },
  { id: 'orders', label: 'Siparişlerim', icon: Package },
  { id: 'favorites', label: 'Favorilerim', icon: Heart },
  { id: 'addresses', label: 'Adres Bilgilerim', icon: MapPin },
  { id: 'payment', label: 'Kayıtlı Kartlarım', icon: CreditCard },
];

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
    // Get user data
    setUser(storeApi.getUser());
  }, [searchParams]);

  const handleLogout = () => {
    storeApi.logout();
    router.push('/');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-amber-200">
        <Header />

        <main className="container mx-auto px-4 md:px-8 py-24 md:py-32">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

            {/* --- SIDEBAR MENU --- */}
            <aside className="lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden sticky top-32">
                <div className="p-6 text-center border-b border-stone-100 bg-stone-50/50">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <Image
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
                      alt="Profil Resmi"
                      fill
                      className="object-cover rounded-full border-2 border-white shadow-md"
                    />
                    <button className="absolute bottom-0 right-0 bg-stone-900 text-white p-1.5 rounded-full hover:bg-amber-600 transition-colors">
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>
                  <h2 className="font-serif font-bold text-lg">{user?.firstName || 'Kullanıcı'} {user?.lastName || ''}</h2>
                  <p className="text-xs text-stone-500">{user?.email || ''}</p>
                </div>

                <nav className="p-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        // URL'i güncelle (Sayfa yenilenmeden)
                        window.history.pushState(null, '', `?tab=${item.id}`);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === item.id
                        ? 'bg-stone-900 text-white shadow-md'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                        }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  ))}
                  <div className="my-2 border-t border-stone-100 mx-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Çıkış Yap
                  </button>
                </nav>
              </div>
            </aside>

            {/* --- CONTENT AREA --- */}
            <div className="flex-1">

              {/* PROFIL SEKMESI */}
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-stone-100 p-6 md:p-8"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-stone-900">Profil Bilgilerim</h2>
                      <p className="text-stone-500 text-sm mt-1">Kişisel bilgilerinizi buradan güncelleyebilirsiniz.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="border-stone-200"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {isEditing ? 'İptal Et' : 'Düzenle'}
                    </Button>
                  </div>

                  <Separator className="mb-8" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ad</Label>
                      <Input id="name" defaultValue="Peyker" disabled={!isEditing} className="bg-stone-50 border-stone-200" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="surname">Soyad</Label>
                      <Input id="surname" defaultValue="Yılmaz" disabled={!isEditing} className="bg-stone-50 border-stone-200" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-posta Adresi</Label>
                      <Input id="email" type="email" defaultValue="peyker@ornek.com" disabled={!isEditing} className="bg-stone-50 border-stone-200" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon Numarası</Label>
                      <Input id="phone" type="tel" defaultValue="+90 555 123 45 67" disabled={!isEditing} className="bg-stone-50 border-stone-200" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthdate">Doğum Tarihi</Label>
                      <Input id="birthdate" type="date" disabled={!isEditing} className="bg-stone-50 border-stone-200" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Cinsiyet</Label>
                      <select
                        id="gender"
                        disabled={!isEditing}
                        className="flex h-10 w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="female">Kadın</option>
                        <option value="male">Erkek</option>
                        <option value="other">Diğer</option>
                      </select>
                    </div>
                  </div>

                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-8 flex justify-end gap-3"
                    >
                      <Button variant="ghost" onClick={() => setIsEditing(false)}>Vazgeç</Button>
                      <Button className="bg-amber-600 hover:bg-amber-700 text-white px-8">Değişiklikleri Kaydet</Button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* SİPARİŞLERİM SEKMESİ */}
              {activeTab === 'orders' && (
                <OrdersContent />
              )}

              {/* FAVORİLERİM SEKMESİ */}
              {activeTab === 'favorites' && (
                <FavoritesContent />
              )}

              {/* ADRES BİLGİLERİM SEKMESİ */}
              {activeTab === 'addresses' && (
                <AddressesContent />
              )}

              {/* DİĞER SEKMELER (Payment) */}
              {activeTab === 'payment' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-sm border border-stone-100 p-12 text-center"
                >
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                    <Settings className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">Bu alan yapım aşamasında</h3>
                  <p className="text-stone-500 max-w-sm mx-auto">
                    Kayıtlı kartlar özelliği çok yakında eklenecek.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}