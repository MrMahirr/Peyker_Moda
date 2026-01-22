import React from 'react';
import { AlertCircle } from 'lucide-react';

const MOCK_LOW_STOCK = [
    { id: 1, name: 'Keten Gömlek (Beyaz, M)', stock: 2 },
    { id: 2, name: 'Kot Pantolon (Mavi, 32)', stock: 1 },
    { id: 3, name: 'Yazlık Elbise (Kırmızı, S)', stock: 3 },
];

export const LowStockAlerts = () => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Kritik Stok</h3>
                <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">3 Ürün</span>
            </div>
            <div className="p-6 space-y-4">
                {MOCK_LOW_STOCK.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-red-600">{item.stock} ad.</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
