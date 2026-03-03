import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, AlertTriangle, PackageX } from 'lucide-react';
import { cn } from '@/lib/utils';

export const InventoryStats = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Inventory Value */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Inventory Value</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight font-display">$45,200.00</p>
                    <span className="text-green-600 text-sm font-bold flex items-center gap-0.5">
                        <TrendingUp className="w-4 h-4" /> 5.2%
                    </span>
                </div>
            </div>

            {/* Low Stock Items */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Low Stock Items</p>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold uppercase flex items-center gap-1">
                        Action Required
                    </span>
                </div>
                <div className="flex items-baseline gap-2">
                    <p className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight font-display">12</p>
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
            </div>

            {/* Out of Stock */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Out of Stock</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-red-500 text-3xl font-bold tracking-tight font-display">4</p>
                    <PackageX className="w-5 h-5 text-red-400" />
                </div>
            </div>
        </div>
    );
};
