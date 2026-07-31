import { useEffect, useState } from 'react';
import { DataGrid } from '@/components/shared/DataGrid';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FileCheck, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cashService } from '../services/cash.service';
import type { Check } from '../types';

const formatCurrency = (v: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);

const statusLabels: Record<string, string> = { PENDING: 'Beklemede', DEPOSITED: 'Bankaya Verildi', CASHED: 'Tahsil Edildi', BOUNCED: 'Karşılıksız', CANCELLED: 'İptal' };
const statusVariants: Record<string, 'neutral' | 'warning' | 'success' | 'error' | 'info'> = { PENDING: 'warning', DEPOSITED: 'info', CASHED: 'success', BOUNCED: 'error', CANCELLED: 'neutral' };

export const CheckTracking = () => {
    const [checks, setChecks] = useState<Check[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'RECEIVED' | 'GIVEN' | ''>('');

    useEffect(() => {
        (async () => {
            try { setLoading(true); setChecks(await cashService.getChecks(filter || undefined) || []); }
            catch { toast.error('Çek/senet verileri yüklenemedi'); }
            finally { setLoading(false); }
        })();
    }, [filter]);

    const columns = [
        { header: 'Çek No', accessorKey: 'checkNumber', cell: (info: any) => <span className="font-mono font-semibold text-[13px]">{info.row.original.checkNumber}</span> },
        { header: 'Tür', accessorKey: 'type', cell: (info: any) => <Badge variant={info.row.original.type === 'RECEIVED' ? 'success' : 'error'}>{info.row.original.type === 'RECEIVED' ? 'Alınan' : 'Verilen'}</Badge> },
        { header: 'Banka', accessorKey: 'bankName' },
        { header: 'Tutar', accessorKey: 'amount', cell: (info: any) => <span className="font-bold font-mono text-[15px]">{formatCurrency(info.row.original.amount)}</span> },
        { header: 'Vade', accessorKey: 'dueDate', cell: (info: any) => <span className="text-[13px] text-zinc-600">{new Date(info.row.original.dueDate).toLocaleDateString('tr-TR')}</span> },
        { header: 'Durum', accessorKey: 'status', cell: (info: any) => <Badge variant={statusVariants[info.row.original.status]}>{statusLabels[info.row.original.status]}</Badge> },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-zinc-900" /></div>;

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900">Çek / Senet Takibi</h2>
                    <p className="text-[13px] text-zinc-500 mt-1">Alınan ve verilen çek/senetleri takip edin.</p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />} className="font-semibold shadow-md">Yeni Çek/Senet</Button>
            </div>
            <div className="flex gap-2">
                {['', 'RECEIVED', 'GIVEN'].map(f => (
                    <button key={f} onClick={() => setFilter(f as typeof filter)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === f ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>
                        {f === '' ? 'Tümü' : f === 'RECEIVED' ? 'Alınan' : 'Verilen'}
                    </button>
                ))}
            </div>
            <DataGrid data={checks} columns={columns} />
        </div>
    );
};
