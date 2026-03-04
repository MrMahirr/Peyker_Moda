import { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, PackageX, Loader2 } from 'lucide-react';
import { dashboardService, LowStockProduct } from '../../dashboard/services/dashboard.service';

export const InventoryStats = () => {
    const [stats, setStats] = useState({ low: 0, out: 0, value: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Sadece kritik stok ve tükenenleri almak için yüksek limit kullanıyoruz
                const items = await dashboardService.getLowStock(5, 50);
                const outOfStock = items.filter((v: LowStockProduct) => v.stock <= 0).length;
                const lowStock = items.filter((v: LowStockProduct) => v.stock > 0).length;
                
                // Stok değeri için dashboard summary kullanılabilir
                const summary = await dashboardService.getSummary();

                setStats({ 
                    low: lowStock, 
                    out: outOfStock, 
                    value: summary.totalRevenue || 0 // Şimdilik revenue olarak bırakıyoruz
                });
            } catch (err) {
                console.error('Failed to fetch inventory stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-surface rounded-xl border border-zinc-200/80 p-5 flex flex-col items-center justify-center gap-2 shadow-sm h-24">
                        <Loader2 className="w-5 h-5 animate-spin text-zinc-300" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-surface rounded-xl border border-zinc-200/80 p-5 flex flex-col gap-2 shadow-sm">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Aylık Cihro Değeri</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold tracking-tight text-zinc-900">₺{Number(stats.value).toLocaleString('tr-TR')}</p>
                    <span className="text-emerald-600 font-medium text-xs flex items-center gap-0.5">
                        <TrendingUp className="w-3.5 h-3.5" /> +5.2%
                    </span>
                </div>
            </div>

            <div className="bg-surface rounded-xl border border-zinc-200/80 p-5 flex flex-col gap-2 shadow-sm">
                <div className="flex justify-between items-start">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Kritik Stok</p>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/50 text-amber-600 text-[10px] font-bold uppercase tracking-wider">
                        İşlem Gerekli
                    </span>
                </div>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold tracking-tight text-zinc-900">{stats.low}</p>
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
            </div>

            <div className="bg-surface rounded-xl border border-zinc-200/80 p-5 flex flex-col gap-2 shadow-sm">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Tükenenler</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold tracking-tight text-red-500">{stats.out}</p>
                    <PackageX className="w-5 h-5 text-red-400" />
                </div>
            </div>
        </div>
    );
};
