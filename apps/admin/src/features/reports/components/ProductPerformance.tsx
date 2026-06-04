import { useEffect, useState } from 'react';
import { PackageSearch, TrendingUp } from 'lucide-react';
import { reportsService, ReportPeriod, ProductPerformance as ProductPerformanceData } from '../reports.service';
import { toast } from 'sonner';

export const ProductPerformance = () => {
    const [period, setPeriod] = useState<ReportPeriod>('this_month');
    const [data, setData] = useState<ProductPerformanceData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await reportsService.getProductPerformance(period);
                setData(result);
            } catch (error) {
                console.error("Failed to fetch product performance", error);
                toast.error("Ürün performansı yüklenemedi");
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
                <h2 className="text-lg font-bold text-zinc-900">En Çok Satan Ürünler & Kategoriler</h2>
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
            
            <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-zinc-200/80 rounded-xl overflow-hidden">
                    <div className="bg-zinc-50 p-3 border-b border-zinc-200/80 font-semibold text-[13px] text-zinc-700 flex justify-between">
                        <span>Top 5 Kategori</span>
                        <span className="text-zinc-500 font-medium">Satış Adedi</span>
                    </div>
                    {loading ? (
                        <div className="p-8 text-center text-zinc-400">Yükleniyor...</div>
                    ) : data?.topCategories.length ? (
                        <div className="divide-y divide-zinc-100">
                            {data.topCategories.map((category, index) => (
                                <div key={category.id} className="p-3 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                                            {index + 1}
                                        </div>
                                        <span className="text-sm font-medium text-zinc-800">{category.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-zinc-900">{category.quantity} adet</div>
                                        <div className="text-xs text-zinc-500">{formatCurrency(category.revenue)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-zinc-400 flex flex-col items-center">
                            <PackageSearch className="w-8 h-8 opacity-20 mb-2" />
                            <p>Veri bulunamadı</p>
                        </div>
                    )}
                </div>

                <div className="border border-zinc-200/80 rounded-xl overflow-hidden">
                    <div className="bg-zinc-50 p-3 border-b border-zinc-200/80 font-semibold text-[13px] text-zinc-700 flex justify-between">
                        <span>En Çok Satan Ürünler</span>
                        <span className="text-zinc-500 font-medium">Satış Adedi</span>
                    </div>
                    {loading ? (
                        <div className="p-8 text-center text-zinc-400">Yükleniyor...</div>
                    ) : data?.topProducts.length ? (
                        <div className="divide-y divide-zinc-100">
                            {data.topProducts.map((product, index) => (
                                <div key={product.id} className="p-3 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">
                                            {index + 1}
                                        </div>
                                        <span className="text-sm font-medium text-zinc-800 line-clamp-1">{product.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-zinc-900">{product.quantity} adet</div>
                                        <div className="text-xs text-zinc-500">{formatCurrency(product.revenue)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-zinc-400 flex flex-col items-center">
                            <TrendingUp className="w-8 h-8 opacity-20 mb-2" />
                            <p>Veri bulunamadı</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
