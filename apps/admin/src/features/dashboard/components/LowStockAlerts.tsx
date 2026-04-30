import { AlertTriangle, ChevronRight } from 'lucide-react';

export const LowStockAlerts = () => (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-zinc-900 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /> Kritik Stok Uyarıları</h3>
            <button className="text-[12px] font-semibold text-primary hover:underline flex items-center">Tümünü Gör <ChevronRight className="h-3 w-3 ml-1" /></button>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            </div>
            <p className="text-[14px] font-semibold text-zinc-700">Stoklar iyi durumda</p>
            <p className="text-[12px] text-zinc-500 mt-1">Kritik seviyeye düşen ürün bulunmuyor.</p>
        </div>
    </div>
);
