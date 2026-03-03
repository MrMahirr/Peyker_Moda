import React from 'react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export const CampaignForm = () => {
    const navigate = useNavigate();

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Geri
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Yeni Kampanya</h1>
                    <p className="text-zinc-500">Kampanya detaylarını giriniz</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-zinc-200">
                <p className="text-zinc-500 italic">Form yapısı henüz oluşturulmadı.</p>
            </div>
        </div>
    );
};
