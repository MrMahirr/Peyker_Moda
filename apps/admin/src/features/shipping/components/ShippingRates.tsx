import { MapPin } from 'lucide-react';

export const ShippingRates = () => (
    <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-50 rounded-xl"><MapPin className="h-5 w-5 text-violet-600" /></div>
            <div><h2 className="text-lg font-bold text-zinc-900">Kargo Ücret Tarifeleri</h2><p className="text-[13px] text-zinc-500">Bölge ve ağırlığa göre kargo ücretlerini belirleyin.</p></div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 rounded-2xl border border-zinc-200/80">
            <MapPin className="w-12 h-12 text-zinc-300 mb-4" />
            <p className="text-[15px] font-semibold text-zinc-500">Kargo ücreti tarife yönetimi</p>
            <p className="text-[13px] text-zinc-400 mt-1">Kargo firmalarına ait ücret tarifelerini buradan yönetin.</p>
        </div>
    </div>
);
