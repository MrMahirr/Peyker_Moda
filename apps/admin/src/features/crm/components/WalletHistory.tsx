import { ColumnDef } from '@tanstack/react-table';
import { DataGrid } from '@/components/shared/DataGrid';
import { Badge } from '@/components/ui/Badge';
import { Wallet } from 'lucide-react';

interface WalletMovement {
    id: string;
    date: string;
    type: 'EARN' | 'SPEND' | 'REFUND';
    description: string;
    amount: number;
    balance: number;
}

const formatPoints = (value: number) => `${value} puan`;

const DATA: WalletMovement[] = [
    { id: 'wm-1', date: '2026-03-02', type: 'EARN', description: 'Satin alma bonusi', amount: 120, balance: 420 },
    { id: 'wm-2', date: '2026-03-05', type: 'SPEND', description: 'Indirim kullanimi', amount: -80, balance: 340 },
    { id: 'wm-3', date: '2026-03-10', type: 'EARN', description: 'Dogum gunu hediyesi', amount: 50, balance: 390 },
    { id: 'wm-4', date: '2026-03-12', type: 'REFUND', description: 'Iade puan iadesi', amount: 30, balance: 420 },
];

const columns: ColumnDef<WalletMovement>[] = [
    {
        accessorKey: 'date',
        header: 'Tarih',
        cell: ({ row }) => <span className="text-[12px] text-zinc-500 font-medium">{row.original.date}</span>,
    },
    {
        accessorKey: 'description',
        header: 'Aciklama',
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-zinc-400" />
                <span className="text-[13px] font-semibold text-zinc-900">{row.original.description}</span>
            </div>
        ),
    },
    {
        accessorKey: 'type',
        header: 'Tur',
        cell: ({ row }) => {
            const type = row.original.type;
            const label = type === 'EARN' ? 'Kazanim' : type === 'SPEND' ? 'Harcama' : 'Iade';
            const variant = type === 'EARN' ? 'success' : type === 'SPEND' ? 'error' : 'info';
            return <Badge variant={variant}>{label}</Badge>;
        },
    },
    {
        accessorKey: 'amount',
        header: 'Puan',
        cell: ({ row }) => (
            <span className={`font-bold ${row.original.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatPoints(row.original.amount)}
            </span>
        ),
    },
    {
        accessorKey: 'balance',
        header: 'Bakiye',
        cell: ({ row }) => <span className="font-semibold text-zinc-900">{formatPoints(row.original.balance)}</span>,
    },
];

export const WalletHistory = () => {
    const total = DATA[DATA.length - 1]?.balance || 0;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-zinc-900">Puan Hareketleri</h3>
                <p className="text-[13px] text-zinc-500 mt-1">Musteri sadakat puan hareketlerinin listesi.</p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm">
                <div className="text-[12px] uppercase tracking-widest text-zinc-400 font-bold">Guncel Bakiye</div>
                <div className="text-2xl font-black text-zinc-900 mt-2">{formatPoints(total)}</div>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm">
                <DataGrid data={DATA} columns={columns} />
            </div>
        </div>
    );
};
