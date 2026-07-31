import { SupplierList } from './components/SupplierList';
import { PageHeader } from '@/components/shared/PageHeader';

export const SuppliersPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
                <div>
                    <PageHeader title="Tedarikçi Yönetimi" subtitle="Tedarikçi ve cari hesap yönetimi." />
                    <p className="text-sm font-medium text-zinc-500 mt-1">Ürün tedarik ettiğiniz firmaları ve kişileri yönetin.</p>
                </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm min-h-[400px]">
                <SupplierList />
            </div>
        </div>
    );
};
