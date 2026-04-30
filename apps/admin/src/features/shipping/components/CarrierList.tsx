import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Truck, Plus, Edit, Trash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { shippingService } from '../services/shipping.service';
import type { Carrier } from '../types';

export const CarrierList = () => {
    const [carriers, setCarriers] = useState<Carrier[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { (async () => { try { setCarriers(await shippingService.getCarriers() || []); } catch { toast.error('Kargo firmaları yüklenemedi'); } finally { setLoading(false); } })(); }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-zinc-900" /></div>;

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-zinc-900">Kargo Firmaları</h2>
                <Button icon={<Plus className="w-4 h-4" />} className="font-semibold shadow-md">Firma Ekle</Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
                {carriers.map(c => (
                    <div key={c.id} className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-blue-50 rounded-xl"><Truck className="h-5 w-5 text-blue-600" /></div>
                            <div><h3 className="font-bold text-zinc-900">{c.name}</h3><span className="text-[11px] font-mono text-zinc-400">{c.code}</span></div>
                            <Badge variant={c.isActive ? 'success' : 'neutral'} className="ml-auto">{c.isActive ? 'Aktif' : 'Pasif'}</Badge>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
