import { useEffect, useState } from 'react';
import { DataGrid } from '@/components/shared/DataGrid';
import { Badge } from '@/components/ui/Badge';
import { Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cashService } from '../services/cash.service';
import type { DuePayment } from '../types';

const formatCurrency = (v: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);
const statusLabels: Record<string, string> = { UPCOMING: 'Yaklaşan', DUE_TODAY: 'Bugün Vadeli', OVERDUE: 'Gecikmiş' };
const statusV: Record<string, 'info' | 'warning' | 'danger'> = { UPCOMING: 'info', DUE_TODAY: 'warning', OVERDUE: 'danger' };

export const DuePayments = () => {
    const [payments, setPayments] = useState<DuePayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'RECEIVABLE' | 'PAYABLE' | ''>('');

    useEffect(() => {
        (async () => {
            try { setLoading(true); setPayments(await cashService.getDuePayments(filter || undefined) || []); }
            catch { toast.error('Vade verileri yüklenemedi'); }
            finally { setLoading(false); }
        })();
    }, [filter]);

    const columns = [
        { header: 'Tür', accessorKey: 'type', cell: (info: any) => <Badge variant={info.row.original.type === 'RECEIVABLE' ? 'success' : 'danger'}>{info.row.original.type === 'RECEIVABLE' ? 'Alacak' : 'Borç'}</Badge> },
        { header: 'Firma/Kişi', accessorKey: 'entityName', cell: (info: any) => <span className="font-semibold text-[14px]">{info.row.original.entityName}</span> },
        { header: 'Tutar', accessorKey: 'amount', cell: (info: any) => <span className="font-bold font-mono text-[15px]">{formatCurrency(info.row.original.amount)}</span> },
        { header: 'Vade Tarihi', accessorKey: 'dueDate', cell: (info: any) => <span className="text-[13px]">{new Date(info.row.original.dueDate).toLocaleDateString('tr-TR')}</span> },
        { header: 'Gecikme', accessorKey: 'daysOverdue', cell: (info: any) => info.row.original.daysOverdue > 0 ? <span className="font-semibold text-red-600">{info.row.original.daysOverdue} gün</span> : <span className="text-zinc-400">—</span> },
        { header: 'Durum', accessorKey: 'status', cell: (info: any) => <Badge variant={statusV[info.row.original.status]}>{statusLabels[info.row.original.status]}</Badge> },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-zinc-900" /></div>;

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100/50"><Clock className="h-5 w-5 text-amber-600" /></div>
                <div><h2 className="text-xl font-bold text-zinc-900">Vade Takibi</h2><p className="text-[13px] text-zinc-500">Vadesi gelen ve gecikmiş ödemeleri takip edin.</p></div>
            </div>
            <div className="flex gap-2">
                {['' , 'RECEIVABLE', 'PAYABLE'].map(f => (
                    <button key={f} onClick={() => setFilter(f as typeof filter)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === f ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>
                        {f === '' ? 'Tümü' : f === 'RECEIVABLE' ? 'Alacaklar' : 'Borçlar'}
                    </button>
                ))}
            </div>
            <DataGrid data={payments} columns={columns} />
        </div>
    );
};
