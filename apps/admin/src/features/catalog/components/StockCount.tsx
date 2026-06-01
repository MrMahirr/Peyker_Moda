import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ClipboardCheck, Plus, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { stockService } from '../services/stock.service';
import type { StockCount as StockCountType } from '../types/stock.types';
import { PageHeader } from '@/components/shared/PageHeader';

const statusLabels: Record<string, string> = {
    DRAFT: 'Taslak',
    IN_PROGRESS: 'Devam Ediyor',
    COMPLETED: 'Tamamlandı',
    CANCELLED: 'İptal Edildi',
};

const statusVariants: Record<string, 'neutral' | 'warning' | 'success' | 'error'> = {
    DRAFT: 'neutral',
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'error',
};

export const StockCount = () => {
    const [counts, setCounts] = useState<StockCountType[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCounts = async () => {
        try {
            setLoading(true);
            const data = await stockService.getStockCounts();
            setCounts(data || []);
        } catch (err) {
            console.error('Stock counts fetch error:', err);
            toast.error('Sayım verileri yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCounts();
    }, []);

    const handleNewCount = async () => {
        try {
            await stockService.createStockCount({ notes: 'Yeni sayım' });
            toast.success('Yeni sayım oluşturuldu');
            fetchCounts();
        } catch (err) {
            console.error('Create count error:', err);
            toast.error('Sayım oluşturulamadı');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
                <p className="text-[13px] font-medium text-zinc-500">Sayım verileri yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <PageHeader title="Stok Sayımı" />
                    <p className="text-[13px] font-medium text-zinc-500 mt-1">Fiziksel sayım yapın ve stok düzeltmeleri uygulayın.</p>
                </div>
                <Button
                    className="font-semibold shadow-md active:scale-[0.98] transition-all"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={handleNewCount}
                >
                    Yeni Sayım Başlat
                </Button>
            </div>

            {counts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 rounded-2xl border border-zinc-200/80">
                    <ClipboardCheck className="w-12 h-12 text-zinc-300 mb-4" />
                    <p className="text-[15px] font-semibold text-zinc-500">Henüz sayım kaydı yok</p>
                    <p className="text-[13px] text-zinc-400 mt-1">Yeni bir stok sayımı başlatarak envanter kontrolü yapın.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {counts.map((count) => (
                        <div
                            key={count.id}
                            className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-zinc-100 rounded-xl">
                                        <ClipboardCheck className="h-5 w-5 text-zinc-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-zinc-900">Sayım #{count.id.slice(0, 8)}</h3>
                                        <p className="text-[13px] text-zinc-500 mt-0.5">
                                            {new Date(count.createdAt).toLocaleDateString('tr-TR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant={statusVariants[count.status]}>
                                        {statusLabels[count.status]}
                                    </Badge>
                                    <div className="flex items-center gap-2 text-[13px] font-medium">
                                        {count.items?.length || 0} ürün
                                    </div>
                                    {count.status === 'IN_PROGRESS' && (
                                        <Button size="sm" className="font-semibold">Devam Et</Button>
                                    )}
                                </div>
                            </div>
                            {count.items && count.items.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-zinc-100 grid grid-cols-3 gap-4 text-[13px]">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                                        <span className="text-zinc-600">Eşleşen: {count.items.filter(i => i.difference === 0).length}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        <span className="text-zinc-600">Fark Bulunan: {count.items.filter(i => i.difference !== 0).length}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
