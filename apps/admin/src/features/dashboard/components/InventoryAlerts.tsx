import { useState, useEffect } from 'react';
import { AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dashboardService, LowStockProduct } from '../services/dashboard.service';

export const InventoryAlerts = () => {
    const [alerts, setAlerts] = useState<LowStockProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const data = await dashboardService.getLowStock(5, 5); // Treshold 5, limit 5
                setAlerts(data);
            } catch (err) {
                console.error('Failed to fetch inventory alerts', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAlerts();
    }, []);

    return (
        <div className="bg-surface rounded-xl border border-zinc-200/80 flex flex-col">
            <div className="p-5 pb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-800">Stok Uyarıları</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Kritik seviyedeki ürünler</p>
                </div>
                {loading && <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />}
            </div>

            <div className="px-5 space-y-3 flex-1 overflow-y-auto">
                {!loading && alerts.length === 0 ? (
                    <div className="flex flex-col flex-1 items-center justify-center p-6 text-center">
                        <p className="text-sm text-zinc-500">Tüm stoklar yeterli seviyede.</p>
                    </div>
                ) : (
                    alerts.map((item) => {
                        const isOut = item.stock <= 0;
                        return (
                            <div
                                key={item.id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50/80 hover:bg-zinc-100/80 transition-colors"
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                    isOut ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'
                                )}>
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-zinc-700 truncate">{item.productName} ({item.size})</p>
                                    <p className={cn(
                                        "text-xs font-medium",
                                        isOut ? 'text-red-500' : 'text-amber-500'
                                    )}>
                                        {isOut ? 'Tükendi' : `${item.stock} adet kaldı`}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="p-4 mt-2">
                <button className="w-full flex items-center justify-center gap-2 text-xs font-medium text-primary hover:text-primary-dark transition-colors py-2 rounded-lg hover:bg-primary/5">
                    Tüm Envanteri Gör
                    <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
};
