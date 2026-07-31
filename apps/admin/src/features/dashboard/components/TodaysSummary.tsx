import { TrendingUp, ShoppingBag, Users, DollarSign } from 'lucide-react';

export const TodaysSummary = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ title: 'Bugünkü Satış', value: '0,00 ₺', icon: DollarSign, color: 'emerald' }, { title: 'Siparişler', value: '0', icon: ShoppingBag, color: 'blue' }, { title: 'Ziyaretçi', value: '0', icon: Users, color: 'violet' }, { title: 'Dönüşüm', value: '%0', icon: TrendingUp, color: 'amber' }].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2.5 bg-${item.color}-50 rounded-xl`}><item.icon className={`h-5 w-5 text-${item.color}-600`} /></div>
                    <p className="text-[13px] font-semibold text-zinc-500">{item.title}</p>
                </div>
                <p className="text-2xl font-black text-zinc-900">{item.value}</p>
            </div>
        ))}
    </div>
);
