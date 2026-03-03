import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { dashboardService, LowStockProduct } from '../services/dashboard.service';

export const LowStockAlerts = () => {
    const [items, setItems] = useState<LowStockProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await dashboardService.getLowStock(10, 5);
                setItems(data || []);
            } catch (err) {
                setError('Veri yüklenemedi');
                console.error('Low stock fetch error:', err);
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
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Kritik Stok</h3>
                <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                    {items.length} Ürün
                </span>
            </div>
            <div className="p-6 space-y-4">
                {items.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center">Kritik stok yok 🎉</p>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                    <AlertCircle className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-slate-700 block">
                                        {item.productName}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {item.size} / {item.color}
                                    </span>
                                </div>
                            </div>
                            <span className="text-sm font-bold text-red-600">{item.stock} ad.</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
