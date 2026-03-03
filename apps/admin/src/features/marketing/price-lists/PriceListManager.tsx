import React from 'react';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export const PriceListManager = () => {
    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Fiyat Listeleri</h1>
                    <p className="text-zinc-500">Müşteri gruplarına özel fiyatlar</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Liste
                </Button>
            </div>

            <div className="bg-white p-12 text-center rounded-lg border border-zinc-200">
                <p className="text-zinc-500">Henüz hiç fiyat listesi oluşturulmamış.</p>
                <Button variant="outline" className="mt-4">
                    İlk Listeyi Oluştur
                </Button>
            </div>
        </div>
    );
};
