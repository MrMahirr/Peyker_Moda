import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RotateCcw, Save, Search } from 'lucide-react';

export const ReturnInvoice = () => {
    const [orderNumber, setOrderNumber] = useState('');
    const [reason, setReason] = useState('');

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-red-50 rounded-xl border border-red-100/50"><RotateCcw className="h-5 w-5 text-red-600" /></div>
                <div>
                    <h2 className="text-xl font-bold text-zinc-900">İade Faturası</h2>
                    <p className="text-[13px] text-zinc-500">İade işlemleri için fatura düzenleyin.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm space-y-4">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Orijinal sipariş numarası ile ara..."
                            value={orderNumber}
                            onChange={e => setOrderNumber(e.target.value)}
                            className="h-10 pl-10 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium"
                        />
                    </div>
                    <Button className="font-semibold">Ara</Button>
                </div>

                <div className="border-2 border-dashed border-zinc-200 rounded-xl p-12 text-center">
                    <RotateCcw className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                    <p className="text-[14px] font-semibold text-zinc-500">Sipariş numarası girerek iade faturası oluşturun</p>
                    <p className="text-[12px] text-zinc-400 mt-1">Orijinal sipariş bulunduğunda iade edilecek ürünleri seçebilirsiniz.</p>
                </div>

                <div>
                    <label className="text-[13px] font-semibold text-zinc-700 block mb-2">İade Nedeni</label>
                    <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="İade nedenini belirtiniz..."
                        className="w-full h-24 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                </div>

                <div className="flex justify-end"><Button icon={<Save className="w-4 h-4" />} className="font-semibold shadow-md" disabled>İade Faturası Oluştur</Button></div>
            </div>
        </div>
    );
};
