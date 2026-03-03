import { AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockInventory = [
    { id: 1, name: 'İpek Fular — Çiçek Desen', stock: 2, status: 'low' as const },
    { id: 2, name: 'Kadife Blazer — Midnight', stock: 0, status: 'out' as const },
    { id: 3, name: 'İnci Küpe — Damla', stock: 5, status: 'low' as const },
    { id: 4, name: 'Deri Çanta — Mini', stock: 1, status: 'low' as const },
];

export const InventoryAlerts = () => {
    return (
        <div className="bg-surface rounded-xl border border-slate-200/80 flex flex-col">
            <div className="p-5 pb-4">
                <h3 className="text-sm font-semibold text-slate-800">Stok Uyarıları</h3>
                <p className="text-xs text-slate-400 mt-0.5">Kritik seviyedeki ürünler</p>
            </div>

            <div className="px-5 space-y-3 flex-1">
                {mockInventory.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/80 hover:bg-slate-100/80 transition-colors"
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            item.status === 'out' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'
                        )}>
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{item.name}</p>
                            <p className={cn(
                                "text-xs font-medium",
                                item.status === 'out' ? 'text-red-500' : 'text-amber-500'
                            )}>
                                {item.status === 'out' ? 'Tükendi' : `${item.stock} adet kaldı`}
                            </p>
                        </div>
                    </div>
                ))}
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
