import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { BarChart3, Loader2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../lib/axios';
import type { CustomerAnalysis } from '../types';

const fmt = (v: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);
const riskV: Record<string, 'success' | 'warning' | 'error'> = { LOW: 'success', MEDIUM: 'warning', HIGH: 'error' };
const riskL: Record<string, string> = { LOW: 'Düşük', MEDIUM: 'Orta', HIGH: 'Yüksek' };

interface Props { customerId: string; }

export const CustomerAnalytics = ({ customerId }: Props) => {
    const [data, setData] = useState<CustomerAnalysis | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { (async () => { try { const r = await api.get(`/customers/${customerId}/analytics`); setData(r.data.data); } catch { toast.error('Analiz verileri yüklenemedi'); } finally { setLoading(false); } })(); }, [customerId]);

    if (loading) return <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>;
    if (!data) return <p className="text-[13px] text-zinc-400 text-center py-6">Analiz verisi bulunamadı</p>;

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-zinc-900 flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Müşteri Analizi</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-zinc-200/80 p-4">
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase">Yaşam Boyu Değer</p>
                    <p className="text-lg font-black text-zinc-900 mt-1">{fmt(data.lifetimeValue)}</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200/80 p-4">
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase">Ort. Sipariş</p>
                    <p className="text-lg font-black text-zinc-900 mt-1">{fmt(data.averageOrderValue)}</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200/80 p-4">
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase">Alışveriş Sıklığı</p>
                    <p className="text-lg font-black text-zinc-900 mt-1">{data.purchaseFrequency} gün</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200/80 p-4">
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase">Kayıp Riski</p>
                    <Badge variant={riskV[data.churnRisk]} className="mt-1">{riskL[data.churnRisk]}</Badge>
                </div>
            </div>
            {data.lastPurchaseDate && <p className="text-[12px] text-zinc-500">Son alışveriş: {new Date(data.lastPurchaseDate).toLocaleDateString('tr-TR')}</p>}
            {data.favoriteCategory && <p className="text-[12px] text-zinc-500">Favori kategori: <span className="font-semibold">{data.favoriteCategory}</span></p>}
        </div>
    );
};
