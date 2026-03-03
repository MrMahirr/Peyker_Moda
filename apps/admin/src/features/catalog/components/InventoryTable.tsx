import React from 'react';
import { MoreVertical, Edit, Trash2, Copy, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
    id: string;
    name: string;
    sku: string;
    category: string;
    stock: number;
    maxStock: number;
    price: number;
    image: string;
    status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

const mockProducts: Product[] = [
    {
        id: '1',
        name: 'Silk Floral Midi Dress',
        sku: 'DR-0012',
        category: 'Dresses',
        stock: 45,
        maxStock: 100,
        price: 189.00,
        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=150&auto=format&fit=crop',
        status: 'IN_STOCK',
    },
    {
        id: '2',
        name: 'Wool Trench Coat',
        sku: 'OW-4490',
        category: 'Outerwear',
        stock: 3,
        maxStock: 50,
        price: 295.00,
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=150&auto=format&fit=crop',
        status: 'LOW_STOCK',
    },
    {
        id: '3',
        name: 'Gold Link Necklace',
        sku: 'AC-8821',
        category: 'Accessories',
        stock: 0,
        maxStock: 30,
        price: 85.00,
        image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=150&auto=format&fit=crop',
        status: 'OUT_OF_STOCK',
    },
    {
        id: '4',
        name: 'Leather Crossbody Bag',
        sku: 'BG-1024',
        category: 'Accessories',
        stock: 12,
        maxStock: 40,
        price: 145.50,
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=150&auto=format&fit=crop',
        status: 'LOW_STOCK',
    },
    {
        id: '5',
        name: 'Summer Linen Shirt',
        sku: 'TS-3321',
        category: 'Tops',
        stock: 85,
        maxStock: 120,
        price: 59.90,
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=150&auto=format&fit=crop',
        status: 'IN_STOCK',
    },
];

export const InventoryTable = () => {
    const getStockColor = (status: Product['status']) => {
        switch (status) {
            case 'IN_STOCK': return 'bg-green-500';
            case 'LOW_STOCK': return 'bg-amber-500';
            case 'OUT_OF_STOCK': return 'bg-red-500';
            default: return 'bg-slate-500';
        }
    };

    const getStockPercentage = (current: number, max: number) => {
        return Math.min(100, Math.max(0, (current / max) * 100));
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th className="p-4 w-10">
                                <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" />
                            </th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Stock Level</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {mockProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                <td className="p-4">
                                    <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" />
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                "w-12 h-12 rounded-lg bg-cover bg-center border border-slate-200 dark:border-slate-700",
                                                product.status === 'OUT_OF_STOCK' && "grayscale opacity-70"
                                            )}
                                            style={{ backgroundImage: `url('${product.image}')` }}
                                        ></div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{product.name}</span>
                                            <span className="text-xs text-slate-500">SKU: {product.sku}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
                                        {product.category}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex flex-col items-center gap-1 w-24 mx-auto">
                                        {product.status === 'OUT_OF_STOCK' ? (
                                            <span className="text-xs font-bold text-red-600 px-2 py-0.5 bg-red-50 dark:bg-red-900/20 rounded uppercase">Out of Stock</span>
                                        ) : (
                                            <span className={cn(
                                                "text-sm font-bold",
                                                product.status === 'LOW_STOCK' ? "text-amber-600" : "text-slate-900 dark:text-white"
                                            )}>
                                                {product.stock} units
                                            </span>
                                        )}
                                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full transition-all duration-500", getStockColor(product.status))}
                                                style={{ width: `${getStockPercentage(product.stock, product.maxStock)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 font-bold text-sm text-slate-900 dark:text-white">
                                    ${product.price.toFixed(2)}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <p className="text-sm text-slate-500">Showing <span className="font-bold text-slate-900 dark:text-white">1-5</span> of <span className="font-bold text-slate-900 dark:text-white">1,240</span> products</p>
                <div className="flex gap-2">
                    <button className="px-3 py-1 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-500 text-sm hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50" disabled>Previous</button>
                    <button className="px-3 py-1 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-500 text-sm hover:bg-white dark:hover:bg-slate-800">Next</button>
                </div>
            </div>
        </div>
    );
};
