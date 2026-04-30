import { useEffect, useState } from 'react';
import { DataGrid } from '@/components/shared/DataGrid';
import { Badge } from '@/components/ui/Badge';
import { CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cashService } from '../services/cash.service';
import type { Installment } from '../types';

const formatCurrency = (v: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);
const statusLabels: Record<string, string> = { ACTIVE: 'Aktif', COMPLETED: 'Tamamlandı', OVERDUE: 'Gecikmiş', CANCELLED: 'İptal' };
const statusV: Record<string, 'warning' | 'success' | 'danger' | 'neutral'> = { ACTIVE: 'warning', COMPLETED: 'success', OVERDUE: 'danger', CANCELLED: 'neutral' };

export const InstallmentTracking = () => {
    const [installments, setInstallments] = useState<Installment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try { setLoading(true); setInstallments(await cashService.getInstallments() || []); }
            catch { toast.error('Taksit verileri yüklenemedi'); }
            finally { setLoading(false); }
        })();
    }, []);

    const columns = [
        { header: 'Sipariş', accessorKey: 'orderNumber', cell: (info: any) => <span className="font-mono font-semibold text-[13px]">{info.row.original.orderNumber || info.row.original.orderId?.slice(0, 8)}</span> },
        { header: 'Müşteri', accessorKey: 'customerName', cell: (info: any) => <span className="font-semibold text-[14px] text-zinc-900">{info.row.original.customerName}</span> },
        { header: 'Toplam', accessorKey: 'totalAmount', cell: (info: any) => <span className="font-bold font-mono">{formatCurrency(info.row.original.totalAmount)}</span> },
        { header: 'Ödenen', accessorKey: 'paidAmount', cell: (info: any) => <span className="font-mono text-emerald-600">{formatCurrency(info.row.original.paidAmount)}</span> },
        { header: 'Kalan', accessorKey: 'remainingAmount', cell: (info: any) => <span className="font-mono text-red-600 font-bold">{formatCurrency(info.row.original.remainingAmount)}</span> },
        { header: 'Taksit', accessorKey: 'progress', cell: (info: any) => <span className="text-[13px] font-semibold">{info.row.original.paidInstallments}/{info.row.original.installmentCount}</span> },
        { header: 'Sonraki Vade', accessorKey: 'nextDueDate', cell: (info: any) => info.row.original.nextDueDate ? <span className="text-[13px]">{new Date(info.row.original.nextDueDate).toLocaleDateString('tr-TR')}</span> : <span className="text-zinc-400">—</span> },
        { header: 'Durum', accessorKey: 'status', cell: (info: any) => <Badge variant={statusV[info.row.original.status]}>{statusLabels[info.row.original.status]}</Badge> },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-zinc-900" /></div>;

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100/50"><CreditCard className="h-5 w-5 text-indigo-600" /></div>
                <div><h2 className="text-xl font-bold text-zinc-900">Taksit Takibi</h2><p className="text-[13px] text-zinc-500">Taksitli satışların ödeme durumlarını takip edin.</p></div>
            </div>
            <DataGrid data={installments} columns={columns} />
        </div>
    );
};
