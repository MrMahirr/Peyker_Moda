import { Button } from '@/components/ui/Button';
import { Plus, FileText } from 'lucide-react';

export const PageManager = () => (
    <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-zinc-900">Sabit Sayfalar (Hakkımızda, İletişim vb.)</h2>
            <Button icon={<Plus className="w-4 h-4" />} className="font-semibold shadow-md">Yeni Sayfa Ekle</Button>
        </div>
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 rounded-2xl border border-zinc-200/80">
            <FileText className="w-12 h-12 text-zinc-300 mb-4" />
            <p className="text-[15px] font-semibold text-zinc-500">Standart sayfalar listesi</p>
        </div>
    </div>
);
