import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/shared/ImageUpload';

export const StoreSettings = () => {
    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Mağaza Ayarları</h1>
                <p className="text-slate-500">Genel mağaza bilgilerinizi yönetin</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-6 max-w-2xl">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Temel Bilgiler</h3>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Mağaza Adı</label>
                        <Input placeholder="Peyker Moda" defaultValue="Peyker Moda" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Mağaza Logosu</label>
                        <div className="w-full">
                            <ImageUpload onChange={() => { }} value="" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Adres</label>
                        <textarea
                            className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                            placeholder="Adres giriniz..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Telefon</label>
                            <Input placeholder="+90 555 555 55 55" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">E-posta</label>
                            <Input placeholder="info@peykermoda.com" />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button>
                        Değişiklikleri Kaydet
                    </Button>
                </div>
            </div>
        </div>
    );
};
