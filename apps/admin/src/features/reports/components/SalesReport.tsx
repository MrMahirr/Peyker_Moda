import { TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { reportsService, ReportPeriod, SalesStats } from '../reports.service';

export const SalesReport = () => {
    const [period, setPeriod] = useState<ReportPeriod>('this_month');
    const [stats, setStats] = useState<SalesStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await reportsService.getSalesStats(period);
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch sales stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [period]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-zinc-900">Satış & Ciro Grafikleri</h2>
                <select 
                    className="h-10 px-3 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-semibold"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
                >
                    <option value="this_month">Bu Ay</option>
                    <option value="last_month">Geçen Ay</option>
                    <option value="last_3_months">Son 3 Ay</option>
                    <option value="this_year">Bu Yıl</option>
                </select>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Toplam Ciro', value: stats ? formatCurrency(stats.totalRevenue) : '...', color: 'blue' },
                    { label: 'Net Kâr', value: stats ? formatCurrency(stats.netProfit) : '...', color: 'emerald' },
                    { label: 'Satış Adedi', value: stats ? stats.salesCount.toString() : '...', color: 'amber' },
                    { label: 'İade Oranı', value: stats ? `%${stats.returnRate.toFixed(1)}` : '...', color: 'red' }
                ].map(s => (
                    <div key={s.label} className={`bg-${s.color}-50 rounded-xl p-4 border border-${s.color}-100/50`}>
                        <p className={`text-[12px] font-semibold text-${s.color}-700`}>{s.label}</p>
                        <p className={`text-2xl font-black mt-1 text-${s.color}-600`}>{loading ? '...' : s.value}</p>
                    </div>
                ))}
            </div>

            <div className="h-64 flex items-center justify-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                <div className="text-center text-zinc-400">
                    <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-[13px] font-semibold">Gelişmiş grafikler yakında eklenecektir.</p>
                </div>
            </div>
        </div>
    );
};

