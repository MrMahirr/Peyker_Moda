import { useEffect, useState } from 'react';
import { MapPin, Plus, Loader2 } from 'lucide-react';
import { shippingService } from '../services/shipping.service';
import type { ShippingRate } from '../types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';

export const ShippingRates = () => {
    const [rates, setRates] = useState<ShippingRate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRates = async () => {
            try { setRates(await shippingService.getRates() || []); } 
            catch { toast.error('Tarifeler yüklenemedi'); } 
            finally { setLoading(false); }
        };
        fetchRates();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-zinc-900" /></div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-violet-50 rounded-xl"><MapPin className="h-5 w-5 text-violet-600" /></div>
                    <div><h2 className="text-lg font-bold text-zinc-900">Kargo Ücret Tarifeleri</h2><p className="text-[13px] text-zinc-500">Bölge ve ağırlığa göre kargo ücretlerini belirleyin.</p></div>
                </div>
                <Button icon={<Plus className="w-4 h-4" />} className="font-semibold shadow-md">Tarife Ekle</Button>
            </div>
            {rates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 rounded-2xl border border-zinc-200/80">
                    <MapPin className="w-12 h-12 text-zinc-300 mb-4" />
                    <p className="text-[15px] font-semibold text-zinc-500">Henüz tarife eklenmemiş</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-3 gap-4">
                    {rates.map(r => (
                        <div key={r.id} className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-zinc-900">{r.carrierName || 'Kargo'} - {r.zone}</h3>
                            <p className="text-[13px] text-zinc-500 mt-1">{r.minWeight}kg - {r.maxWeight}kg: <strong className="text-violet-600">{r.price} TL</strong></p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
