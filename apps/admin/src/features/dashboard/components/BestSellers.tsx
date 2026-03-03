import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { dashboardService, TopProduct } from '../services/dashboard.service';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'decimal' }).format(value) + ' ₺';
};

export const BestSellers = () => {
    const [items, setItems] = useState<TopProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await dashboardService.getTopProducts(5);
                setItems(data || []);
            } catch (err) {
                setError('Veri yüklenemedi');
                console.error('Top products fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex items-center justify-center p-6">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full">
            <div className="p-6 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Çok Satanlar (Bu Ay)</h3>
            </div>
            <div className="p-6 space-y-4">
                {items.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center">Henüz satış verisi yok</p>
                ) : (
                    items.map((item, index) => (
                        <div key={item.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <span className="text-slate-400 font-bold w-4">{index + 1}</span>
                                <div>
                                    <span className="text-sm font-medium text-slate-700 block">{item.name}</span>
                                    <span className="text-xs text-slate-500">{item.sku}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-slate-900">{formatCurrency(item.totalRevenue)}</div>
                                <div className="text-xs text-slate-500">{item.totalQuantity} adet</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
