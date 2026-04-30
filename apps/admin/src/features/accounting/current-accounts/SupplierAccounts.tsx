import { useEffect, useState } from 'react';
import { DataGrid } from '@/components/shared/DataGrid';
import { Badge } from '@/components/ui/Badge';
import { Building, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../lib/axios';
import type { CurrentAccount } from '../types';

const formatCurrency = (v: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);

export const SupplierAccounts = () => {
    const [accounts, setAccounts] = useState<CurrentAccount[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const response = await api.get('/accounting/current-accounts?type=SUPPLIER');
                setAccounts(response.data.data || []);
            } catch { toast.error('Tedarikçi cari hesapları yüklenemedi'); }
            finally { setLoading(false); }
        })();
    }, []);

    const columns = [
        {
            header: 'Tedarikçi', accessorKey: 'name',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => (
                <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-zinc-400" />
                    <span className="font-semibold text-[14px] text-zinc-900">{info.row.original.name}</span>
                </div>
            ),
        },
        {
            header: 'Borç', accessorKey: 'totalDebt',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => <span className="font-bold font-mono text-red-600">{formatCurrency(info.row.original.totalDebt)}</span>,
        },
        {
            header: 'Alacak', accessorKey: 'totalCredit',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => <span className="font-bold font-mono text-emerald-600">{formatCurrency(info.row.original.totalCredit)}</span>,
        },
        {
            header: 'Bakiye', accessorKey: 'balance',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => {
                const b = info.row.original.balance;
                return <Badge variant={b >= 0 ? 'success' : 'danger'}>{formatCurrency(b)}</Badge>;
            },
        },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-zinc-900" /></div>;

    return (
        <div className="space-y-6 p-6">
            <div>
                <h2 className="text-xl font-bold text-zinc-900">Tedarikçi Cari Hesapları</h2>
                <p className="text-[13px] text-zinc-500 mt-1">Tedarikçi borç/alacak durumlarını takip edin.</p>
            </div>
            <DataGrid data={accounts} columns={columns} />
        </div>
    );
};
