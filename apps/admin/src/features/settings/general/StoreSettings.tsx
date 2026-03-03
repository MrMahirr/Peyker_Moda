import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { Store, MapPin, Phone, Mail, Save } from 'lucide-react';

export const StoreSettings = () => {
    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-zinc-900">Mağaza Ayarları</h1>
                <p className="text-[13px] font-medium text-zinc-500 mt-1">Sistem üzerindeki genel mağaza bilgilerinizi yönetin.</p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
                <div className="bg-zinc-50/50 border-b border-zinc-100 px-6 py-4 flex items-center gap-2">
                    <Store className="w-5 h-5 text-zinc-400" />
                    <h3 className="text-[15px] font-bold text-zinc-900">Temel Bilgiler</h3>
                </div>
                
                <div className="p-6 space-y-8">
                    <div className="space-y-3">
                        <label className="text-[13px] font-bold text-zinc-700 uppercase tracking-wide">Mağaza Adı</label>
                        <Input 
                            placeholder="Peyker Moda" 
                            defaultValue="Peyker Moda"
                            className="h-12 bg-zinc-50 border-zinc-200/80 text-[15px] font-medium" 
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[13px] font-bold text-zinc-700 uppercase tracking-wide">Mağaza Logosu</label>
                        <div className="w-full max-w-sm">
                            <ImageUpload onChange={() => { }} value="" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[13px] font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400" /> Adres
                        </label>
                        <textarea
                            className="flex w-full rounded-xl border border-zinc-200/80 bg-zinc-50 px-4 py-3 text-[14px] font-medium transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 disabled:cursor-not-allowed min-h-[100px] resize-y"
                            placeholder="Açık adres bilgilerini buraya giriniz..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[13px] font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-zinc-400" /> Telefon
                            </label>
                            <Input 
                                placeholder="+90 555 555 55 55"
                                className="h-11 bg-zinc-50 border-zinc-200/80 text-[14px] font-medium" 
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[13px] font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-zinc-400" /> E-posta
                            </label>
                            <Input 
                                placeholder="info@peykermoda.com"
                                className="h-11 bg-zinc-50 border-zinc-200/80 text-[14px] font-medium" 
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200/80 flex justify-end">
                    <Button className="h-11 px-6 font-bold tracking-wide shadow-md active:scale-[0.98] transition-all">
                        <Save className="w-4 h-4 mr-2 opacity-70" />
                        Değişiklikleri Kaydet
                    </Button>
                </div>
            </div>
        </div>
    );
};
