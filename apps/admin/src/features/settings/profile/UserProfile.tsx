import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Lock, Save } from 'lucide-react';

export const UserProfile = () => {
    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Profil Ayarları</h1>
                <p className="text-slate-500">Kişisel bilgilerinizi ve şifrenizi güncelleyin</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Info */}
                <div className="bg-white p-6 rounded-lg border border-slate-200">
                    <div className="flex items-center space-x-2 border-b pb-4 mb-4">
                        <User className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-medium text-slate-900">Kişisel Bilgiler</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-2xl font-bold border border-slate-200">
                                A
                            </div>
                            <Button variant="outline" size="sm">Fotoğraf Değiştir</Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Ad</label>
                                <Input defaultValue="Ahmet" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Soyad</label>
                                <Input defaultValue="Yılmaz" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">E-posta</label>
                            <Input defaultValue="ahmet@peykermoda.com" disabled />
                        </div>

                        <div className="pt-2 flex justify-end">
                            <Button>
                                <Save className="w-4 h-4 mr-2" />
                                Bilgileri Kaydet
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Password Change */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 h-fit">
                    <div className="flex items-center space-x-2 border-b pb-4 mb-4">
                        <Lock className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-medium text-slate-900">Şifre Değiştir</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Mevcut Şifre</label>
                            <Input type="password" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Yeni Şifre</label>
                            <Input type="password" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Yeni Şifre (Tekrar)</label>
                            <Input type="password" />
                        </div>

                        <div className="pt-2 flex justify-end">
                            <Button variant="outline">
                                Şifreyi Güncelle
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
