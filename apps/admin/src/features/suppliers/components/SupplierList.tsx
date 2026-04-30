import { Button } from '@/components/ui/Button';
import { Plus, Building } from 'lucide-react';

export const SupplierList = () => (
    <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-zinc-900">Tedarikçi Listesi</h2>
            <Button icon={<Plus className="w-4 h-4" />} className="font-semibold shadow-md">Yeni Tedarikçi</Button>
        </div>
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 rounded-2xl border border-zinc-200/80">
            <Building className="w-12 h-12 text-zinc-300 mb-4" />
            <p className="text-[15px] font-semibold text-zinc-500">Tedarikçi bulunamadı</p>
            <p className="text-[13px] text-zinc-400 mt-1">Sisteme yeni bir tedarikçi ekleyin.</p>
        </div>
    </div>
);
