import { BarChart3 } from 'lucide-react';

export const DeliveryReport = () => (
    <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl"><BarChart3 className="h-5 w-5 text-emerald-600" /></div>
            <div><h2 className="text-lg font-bold text-zinc-900">Teslimat Raporu</h2><p className="text-[13px] text-zinc-500">Teslim edilen ve iade edilen kargo istatistikleri.</p></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{ label: 'Teslim Edilen', value: '—', color: 'emerald' }, { label: 'İade Edilen', value: '—', color: 'red' }, { label: 'Yolda', value: '—', color: 'blue' }, { label: 'Ort. Teslimat', value: '—', color: 'amber' }].map(s => (
                <div key={s.label} className={`bg-${s.color}-50 rounded-xl p-4 border border-${s.color}-100/50`}>
                    <p className={`text-[12px] font-semibold text-${s.color}-700`}>{s.label}</p>
                    <p className={`text-2xl font-black mt-1 text-${s.color}-600`}>{s.value}</p>
                </div>
            ))}
        </div>
    </div>
);
