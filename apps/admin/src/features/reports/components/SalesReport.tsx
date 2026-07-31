import { TrendingUp, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { reportsService, ReportPeriod, SalesStats } from '../reports.service';
import { toast } from 'sonner';

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
                toast.error("Satış istatistikleri yüklenemedi");
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

            <div className="h-80 flex flex-col bg-white border border-zinc-200/80 rounded-xl p-4 shadow-sm">
                <h3 className="text-[15px] font-bold text-zinc-800 mb-4 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-indigo-500" />
                    Ciro & Kâr Grafiği
                </h3>
                <div className="flex-1 min-h-0 relative">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                    ) : null}
                    
                    {stats?.chartData && stats.chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#71717a', fontSize: 12 }} 
                                    dy={10}
                                    tickFormatter={(val) => {
                                        const d = new Date(val);
                                        return `${d.getDate()} ${d.toLocaleString('tr-TR', { month: 'short' })}`;
                                    }}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#71717a', fontSize: 12 }}
                                    tickFormatter={(val) => `₺${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ fontWeight: 'bold', color: '#18181b', marginBottom: '4px' }}
                                    formatter={(value: number, name: string) => [
                                        formatCurrency(value), 
                                        name === 'revenue' ? 'Ciro' : 'Net Kâr'
                                    ]}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    name="revenue"
                                    stroke="#4f46e5" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="profit" 
                                    name="profit"
                                    stroke="#10b981" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorProfit)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-zinc-400 text-sm">
                            Bu dönem için gösterilecek veri bulunamadı.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

