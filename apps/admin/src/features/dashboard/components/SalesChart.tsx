import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { dashboardService } from '../services/dashboard.service';
import { Loader2 } from 'lucide-react';

export const SalesChart = () => {
    const [data, setData] = useState<{ name: string; gelir: number; gider: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChart = async () => {
            try {
                const res = await dashboardService.getSalesChart('day');
                const chartData = res.labels.map((label, idx) => ({
                    name: label,
                    gelir: res.data[idx],
                    gider: 0, // Gider verisi backend'den gelmediği takdirde 0
                }));
                setData(chartData);
            } catch (err) {
                console.error('Failed to fetch sales chart', err);
            } finally {
                setLoading(false);
            }
        };
        fetchChart();
    }, []);

    return (
        <div className="lg:col-span-2 bg-surface rounded-xl border border-zinc-200/80 flex flex-col">
            <div className="p-5 pb-0 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-800">Satış Analizi</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Son 7 günlük gelir ve gider</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-xs text-zinc-500">Gelir</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="text-xs text-zinc-500">Gider</span>
                    </div>
                </div>
            </div>

            <div className="p-5 pt-3 h-[300px] w-full relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorGelir" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorGider" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 12px rgb(0 0 0 / 0.06)',
                                padding: '10px 14px',
                                fontSize: '12px',
                            }}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={(value: any) => [`₺${Number(value).toLocaleString('tr-TR')}`, '']}
                            labelStyle={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="gelir"
                            stroke="#7c3aed"
                            fillOpacity={1}
                            fill="url(#colorGelir)"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="gider"
                            stroke="#f59e0b"
                            fillOpacity={1}
                            fill="url(#colorGider)"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};
