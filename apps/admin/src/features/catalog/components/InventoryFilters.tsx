import React from 'react';
import { Search, Filter, ArrowUpDown, CheckSquare, ChevronDown } from 'lucide-react';

export const InventoryFilters = () => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-2">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white placeholder:text-slate-400"
                            placeholder="Search products..."
                            type="text"
                        />
                    </div>

                    {/* Filter Chips */}
                    <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
                        <button className="flex h-9 items-center gap-2 rounded-lg bg-primary/10 text-primary px-4 text-sm font-bold border border-primary/20 whitespace-nowrap">
                            All Products
                        </button>
                        <button className="flex h-9 items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 px-4 text-sm font-medium text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap">
                            Dresses
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        <button className="flex h-9 items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 px-4 text-sm font-medium text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap">
                            Outerwear
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        <button className="flex h-9 items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 px-4 text-sm font-medium text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap">
                            Accessories
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Toolbar Actions */}
                <div className="flex gap-2">
                    <button className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                        <Filter className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                        <ArrowUpDown className="w-5 h-5" />
                    </button>
                    <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1 self-center"></div>
                    <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors">
                        <CheckSquare className="w-5 h-5" />
                        <span>Bulk Actions</span>
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
