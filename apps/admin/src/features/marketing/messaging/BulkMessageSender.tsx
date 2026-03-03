import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Send } from 'lucide-react';

export const BulkMessageSender = () => {
    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Toplu Mesaj Gönderimi</h1>
                <p className="text-zinc-500">Müşterilere SMS veya E-posta gönderin</p>
            </div>

            <div className="max-w-2xl space-y-4 bg-white p-6 rounded-lg border border-zinc-200">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">Başlık</label>
                    <Input placeholder="Kampanya Başlığı" />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">Mesaj İçeriği</label>
                    <textarea
                        className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]"
                        placeholder="Mesajınızı buraya yazın..."
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <Button>
                        <Send className="w-4 h-4 mr-2" />
                        Gönder
                    </Button>
                </div>
            </div>
        </div>
    );
};
