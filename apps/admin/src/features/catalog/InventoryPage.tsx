import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InventoryStats } from './components/InventoryStats';
import { InventoryFilters } from './components/InventoryFilters';
import { InventoryTable } from './components/InventoryTable';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export const InventoryPage = () => {
    const navigate = useNavigate();

    return (
        <DashboardLayout>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Envanter & Stok</h1>
                    <p className="text-sm text-zinc-500 mt-1">Mağazada toplam <span className="font-medium text-zinc-700">1,240</span> ürün mevcut</p>
                </div>
                <Button 
                    variant="primary" 
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => navigate('/catalog/new')}
                >
                    Yeni Ürün Ekle
                </Button>
            </div>

            <div className="space-y-6">
                <InventoryStats />
                <InventoryFilters />
                <InventoryTable />
            </div>
        </DashboardLayout>
    );
};
