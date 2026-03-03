import { TrendingUp, AlertTriangle, PackageX } from 'lucide-react';

export const InventoryStats = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-surface rounded-xl border border-zinc-200/80 p-5 flex flex-col gap-2 shadow-sm">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Toplam Stok Değeri</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold tracking-tight text-zinc-900">₺45.200</p>
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
                    <p className="text-3xl font-bold tracking-tight text-zinc-900">12</p>
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
            </div>

            <div className="bg-surface rounded-xl border border-zinc-200/80 p-5 flex flex-col gap-2 shadow-sm">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Tükenenler</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold tracking-tight text-red-500">4</p>
                    <PackageX className="w-5 h-5 text-red-400" />
                </div>
            </div>
        </div>
    );
};
