import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InventoryStats } from './components/InventoryStats';
import { InventoryFilters } from './components/InventoryFilters';
import { InventoryTable } from './components/InventoryTable';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const InventoryPage = () => {
    const navigate = useNavigate();

    return (
        <DashboardLayout>
            {/* Page Heading */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex flex-col gap-1">
                    <h2 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight font-display">Inventory & Stock</h2>
                    <p className="text-slate-500 text-sm font-medium">1,240 Total Products available in store</p>
                </div>
                <button
                    onClick={() => navigate('/catalog/new')}
                    className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Product</span>
                </button>
            </div>

            <div className="space-y-6">
                <InventoryStats />
                <InventoryFilters />
                <InventoryTable />
            </div>
        </DashboardLayout>
    );
};
