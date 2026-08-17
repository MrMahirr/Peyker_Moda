import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataGrid } from '@/components/shared/DataGrid';
import { Badge } from '@/components/ui/Badge';
import { ArrowDownCircle, ArrowUpCircle, ArrowRightLeft, Search, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { stockService } from '../services/stock.service';
import type { StockMovement, StockMovementType } from '../types/stock.types';
import { PageHeader } from '@/components/shared/PageHeader';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'decimal' }).format(value);

const movementTypeLabels: Record<StockMovementType, string> = {
    IN: 'Giriş',
    OUT: 'Çıkış',
    TRANSFER: 'Transfer',
    ADJUSTMENT: 'Düzeltme',
    RETURN: 'İade',
};

const movementTypeBadge: Record<StockMovementType, 'success' | 'error' | 'info' | 'warning' | 'neutral'> = {
    IN: 'success',
    OUT: 'error',
    TRANSFER: 'info',
    ADJUSTMENT: 'warning',
    RETURN: 'neutral',
};

export const StockMovements = () => {
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<StockMovementType | ''>('');

    const fetchMovements = async () => {
        try {
            setLoading(true);
            const response = await stockService.getMovements({
                limit: 50,
                type: filterType || undefined,
                search: searchTerm || undefined,
            });
            setMovements(response.data || []);
        } catch (err) {
            console.error('Stock movements fetch error:', err);
            toast.error('Stok hareketleri yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovements();
    }, [filterType]);

    const columns = [
        {
            header: 'Tür',
            accessorKey: 'type',
             
            cell: (info: any) => {
                const type = info.row.original.type as StockMovementType;
                const Icon = type === 'IN' || type === 'RETURN' ? ArrowDownCircle
                    : type === 'OUT' ? ArrowUpCircle : ArrowRightLeft;
                return (
                    <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <Badge variant={movementTypeBadge[type]}>{movementTypeLabels[type]}</Badge>
                    </div>
                );
            },
        },
        {
            header: 'Ürün / Varyant',
            accessorKey: 'productName',
             
            cell: (info: any) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-[14px] text-zinc-900">{info.row.original.productName}</span>
                    <span className="text-[12px] text-zinc-500">{info.row.original.variantName}</span>
                </div>
            ),
        },
        {
            header: 'Miktar',
            accessorKey: 'quantity',
             
            cell: (info: any) => {
                const mov = info.row.original;
                const isPositive = mov.type === 'IN' || mov.type === 'RETURN';
                return (
                    <span className={`font-bold font-mono text-[15px] ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : '-'}{formatCurrency(mov.quantity)}
                    </span>
                );
            },
        },
        {
            header: 'Önceki → Yeni',
            accessorKey: 'previousStock',
             
            cell: (info: any) => (
                <span className="text-[13px] font-medium text-zinc-600">
                    {info.row.original.previousStock} → {info.row.original.newStock}
                </span>
            ),
        },
        {
            header: 'Açıklama',
            accessorKey: 'reason',
             
            cell: (info: any) => (
                <span className="text-[13px] text-zinc-500">{info.row.original.reason || '—'}</span>
            ),
        },
        {
            header: 'İşlemi Yapan',
            accessorKey: 'user',
             
            cell: (info: any) => {
                const user = info.row.original.user;
                return user ? (
                    <span className="text-[13px] font-medium text-zinc-700">{user.firstName} {user.lastName}</span>
                ) : <span className="text-zinc-400">—</span>;
            },
        },
        {
            header: 'Tarih',
            accessorKey: 'createdAt',
             
            cell: (info: any) => (
                <span className="text-[13px] text-zinc-500">
                    {new Date(info.row.original.createdAt).toLocaleDateString('tr-TR')}
                </span>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
                <p className="text-[13px] font-medium text-zinc-500">Stok hareketleri yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <PageHeader title="Stok Hareketleri" />
                    <p className="text-[13px] font-medium text-zinc-500 mt-1">Tüm stok giriş, çıkış ve transfer işlemlerini takip edin.</p>
                </div>
                <Button
                    className="font-semibold shadow-md active:scale-[0.98] transition-all"
                    icon={<Plus className="w-4 h-4" />}
                >
                    Yeni Hareket
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-zinc-50 p-2 rounded-xl border border-zinc-200/80 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="Ürün adı veya SKU ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchMovements()}
                        className="w-full h-10 pl-10 pr-4 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-zinc-900 placeholder:text-zinc-400 transition-all shadow-sm"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as StockMovementType | '')}
                    className="h-10 px-3 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                >
                    <option value="">Tüm Hareketler</option>
                    <option value="IN">Giriş</option>
                    <option value="OUT">Çıkış</option>
                    <option value="TRANSFER">Transfer</option>
                    <option value="ADJUSTMENT">Düzeltme</option>
                    <option value="RETURN">İade</option>
                </select>
            </div>

            <DataGrid data={movements} columns={columns} />
        </div>
    );
};
