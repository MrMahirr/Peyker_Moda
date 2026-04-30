import { TrendingUp, CalendarDays } from 'lucide-react';

export const SalesReport = () => (
    <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-zinc-900">Satış & Ciro Grafikleri</h2>
            <select className="h-10 px-3 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-semibold">
                <option>Bu Ay</option>
                <option>Geçen Ay</option>
                <option>Son 3 Ay</option>
                <option>Bu Yıl</option>
            </select>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[{ label: 'Toplam Ciro', value: '0,00 ₺', color: 'blue' }, { label: 'Net Kâr', value: '0,00 ₺', color: 'emerald' }, { label: 'Satış Adedi', value: '0', color: 'amber' }, { label: 'İade Oranı', value: '%0', color: 'red' }].map(s => (
                <div key={s.label} className={`bg-${s.color}-50 rounded-xl p-4 border border-${s.color}-100/50`}>
                    <p className={`text-[12px] font-semibold text-${s.color}-700`}>{s.label}</p>
                    <p className={`text-2xl font-black mt-1 text-${s.color}-600`}>{s.value}</p>
                </div>
            ))}
        </div>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
            <div className="text-center text-zinc-400">
                <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-[13px] font-semibold">Grafik Verisi Yükleniyor...</p>
            </div>
        </div>
    </div>
);
