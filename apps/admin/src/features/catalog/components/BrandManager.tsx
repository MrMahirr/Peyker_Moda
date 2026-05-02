import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Tag, Plus, Trash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { showDeleteConfirm } from '@/utils/swal';
import { stockService } from '../services/stock.service';
import type { Brand } from '../types/stock.types';
import { PageHeader } from '@/components/shared/PageHeader';

export const BrandManager = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [newBrandName, setNewBrandName] = useState('');

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const data = await stockService.getBrands();
            setBrands(data || []);
        } catch (err) {
            console.error('Brands fetch error:', err);
            toast.error('Markalar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBrands(); }, []);

    const handleAdd = async () => {
        if (!newBrandName.trim()) return;
        try {
            await stockService.createBrand({ name: newBrandName.trim() });
            setNewBrandName('');
            toast.success('Marka eklendi');
            fetchBrands();
        } catch (err) {
            console.error('Add brand error:', err);
            toast.error('Marka eklenemedi');
        }
    };

    const handleDelete = async (id: string) => {
        const result = await showDeleteConfirm('Markayı Sil?', 'Bu marka silinecek.');
        if (result.isConfirmed) {
            try {
                await stockService.deleteBrand(id);
                setBrands(brands.filter(b => b.id !== id));
                toast.success('Marka silindi');
            } catch (err) {
                console.error('Delete error:', err);
                toast.error('Marka silinemedi');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
                <p className="text-[13px] font-medium text-zinc-500">Markalar yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <PageHeader title="Marka Yönetimi" />
                <p className="text-[13px] font-medium text-zinc-500 mt-1">Ürünlerinize ait markaları yönetin.</p>
            </div>

            <div className="flex gap-3 bg-zinc-50 p-3 rounded-xl border border-zinc-200/80 shadow-sm">
                <Input
                    placeholder="Yeni marka adı..."
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    className="flex-1 h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium px-4"
                />
                <Button onClick={handleAdd} icon={<Plus className="w-4 h-4" />} className="font-semibold">
                    Ekle
                </Button>
            </div>

            <div className="flex flex-wrap gap-3">
                {brands.map((brand) => (
                    <div
                        key={brand.id}
                        className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <Tag className="h-4 w-4 text-zinc-400" />
                        <span className="font-semibold text-[14px] text-zinc-800">{brand.name}</span>
                        {brand.productCount !== undefined && (
                            <Badge variant="neutral">{brand.productCount} ürün</Badge>
                        )}
                        <button
                            onClick={() => handleDelete(brand.id)}
                            className="ml-1 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all"
                        >
                            <Trash className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
