import { useEffect, useState } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import { ordersService } from '../../sales/services/orders.service';
import { toast } from 'sonner';

export const DeliveryReport = () => {
    const [stats, setStats] = useState({ delivered: 0, returned: 0, inTransit: 0, avgDeliveryDays: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await ordersService.getAll();
                const orders = response.data;
                const delivered = orders.filter(o => o.status === 'DELIVERED').length;
                const returned = orders.filter(o => o.status === 'RETURNED' || o.paymentStatus === 'REFUNDED').length;
                const inTransit = orders.filter(o => o.status === 'SHIPPED').length;
                setStats({ delivered, returned, inTransit, avgDeliveryDays: 3 }); // avg is dummy for now
            } catch {
                toast.error('Rapor yüklenemedi');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-zinc-900" /></div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 rounded-xl"><BarChart3 className="h-5 w-5 text-emerald-600" /></div>
                <div><h2 className="text-lg font-bold text-zinc-900">Teslimat Raporu</h2><p className="text-[13px] text-zinc-500">Teslim edilen ve iade edilen kargo istatistikleri.</p></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Teslim Edilen', value: stats.delivered, color: 'emerald' },
                    { label: 'İade / İptal', value: stats.returned, color: 'red' },
                    { label: 'Yolda', value: stats.inTransit, color: 'blue' },
                    { label: 'Ort. Teslimat', value: `${stats.avgDeliveryDays} Gün`, color: 'amber' }
                ].map(s => (
                    <div key={s.label} className={`bg-${s.color}-50 rounded-xl p-4 border border-${s.color}-100/50`}>
                        <p className={`text-[12px] font-semibold text-${s.color}-700`}>{s.label}</p>
                        <p className={`text-2xl font-black mt-1 text-${s.color}-600`}>{s.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
