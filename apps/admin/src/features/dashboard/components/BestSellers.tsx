import React from 'react';
import { TrendingUp } from 'lucide-react';

const MOCK_BEST_SELLERS = [
    { id: 1, name: 'Basic T-Shirt', sales: 124, revenue: '12,400 ₺' },
    { id: 2, name: 'Jean Ceket', sales: 85, revenue: '42,500 ₺' },
    { id: 3, name: 'Desenli Etek', sales: 62, revenue: '18,600 ₺' },
];

export const BestSellers = () => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full">
            <div className="p-6 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Çok Satanlar (Bu Ay)</h3>
            </div>
            <div className="p-6 space-y-4">
                {MOCK_BEST_SELLERS.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <span className="text-slate-400 font-bold w-4">{index + 1}</span>
                            <span className="text-sm font-medium text-slate-700">{item.name}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-slate-900">{item.revenue}</div>
                            <div className="text-xs text-slate-500">{item.sales} adet</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
