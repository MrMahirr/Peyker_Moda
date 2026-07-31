import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataGrid } from '@/components/shared/DataGrid';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Search, Wallet } from 'lucide-react';

type AccountSummary = {
    id: string;
    name: string;
    totalDebt: number;
    totalCredit: number;
    balance: number;
};

type StatementLine = {
    id: string;
    accountId: string;
    date: string;
    documentNo: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);

const accounts: AccountSummary[] = [
    { id: 'acc-1', name: 'Musteri - Ayse Demir', totalDebt: 1200, totalCredit: 600, balance: 600 },
    { id: 'acc-2', name: 'Musteri - Kaan Yilmaz', totalDebt: 400, totalCredit: 900, balance: -500 },
    { id: 'acc-3', name: 'Tedarikci - Mavi Tekstil', totalDebt: 5400, totalCredit: 2000, balance: 3400 },
];

const statements: StatementLine[] = [
    { id: 'st-1', accountId: 'acc-1', date: '2026-03-01', documentNo: 'S-1482', description: 'Satis - POS', debit: 0, credit: 600, balance: 600 },
    { id: 'st-2', accountId: 'acc-1', date: '2026-03-04', documentNo: 'S-1491', description: 'Satis - Kredi Karti', debit: 0, credit: 600, balance: 1200 },
    { id: 'st-3', accountId: 'acc-1', date: '2026-03-10', documentNo: 'T-033', description: 'Tahsilat', debit: 600, credit: 0, balance: 600 },
    { id: 'st-4', accountId: 'acc-2', date: '2026-03-05', documentNo: 'S-1502', description: 'Satis - POS', debit: 0, credit: 900, balance: 900 },
    { id: 'st-5', accountId: 'acc-2', date: '2026-03-12', documentNo: 'I-018', description: 'Iade', debit: 400, credit: 0, balance: 500 },
    { id: 'st-6', accountId: 'acc-3', date: '2026-03-02', documentNo: 'A-204', description: 'Alis Faturasi', debit: 0, credit: 2400, balance: 2400 },
    { id: 'st-7', accountId: 'acc-3', date: '2026-03-15', documentNo: 'A-215', description: 'Alis Faturasi', debit: 0, credit: 3000, balance: 5400 },
    { id: 'st-8', accountId: 'acc-3', date: '2026-03-16', documentNo: 'O-102', description: 'Odeme', debit: 2000, credit: 0, balance: 3400 },
];

export const AccountStatement = () => {
    const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
    const [search, setSearch] = useState('');

    const accountOptions = useMemo(
        () => accounts.map((a) => ({ value: a.id, label: a.name })),
        []
    );

    const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

    const filteredStatements = statements
        .filter((s) => s.accountId === selectedAccountId)
        .filter((s) =>
            s.description.toLowerCase().includes(search.toLowerCase()) ||
            s.documentNo.toLowerCase().includes(search.toLowerCase())
        );

    const columns: ColumnDef<StatementLine>[] = [
        {
            accessorKey: 'date',
            header: 'Tarih',
            cell: ({ row }) => (
                <span className="text-[12px] text-zinc-500 font-medium">{row.original.date}</span>
            ),
        },
        {
            accessorKey: 'documentNo',
            header: 'Belge No',
            cell: ({ row }) => (
                <span className="font-mono text-[12px] font-semibold text-zinc-700 bg-zinc-100 px-2 py-1 rounded-md">
                    {row.original.documentNo}
                </span>
            ),
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
            accessorKey: 'debit',
            header: 'Borc',
            cell: ({ row }) => (
                <span className="font-bold font-mono text-red-600">{formatCurrency(row.original.debit)}</span>
            ),
        },
        {
            accessorKey: 'credit',
            header: 'Alacak',
            cell: ({ row }) => (
                <span className="font-bold font-mono text-emerald-600">{formatCurrency(row.original.credit)}</span>
            ),
        },
        {
            accessorKey: 'balance',
            header: 'Bakiye',
            cell: ({ row }) => (
                <Badge variant={row.original.balance >= 0 ? 'success' : 'error'}>
                    {formatCurrency(row.original.balance)}
                </Badge>
            ),
        },
    ];

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900">Cari Ekstre</h2>
                    <p className="text-[13px] text-zinc-500 mt-1">Secilen cari hesabin detayli hareketlerini goruntuleyin.</p>
                </div>
                <div className="w-full md:w-80">
                    <Select
                        label="Cari Hesap"
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        options={accountOptions}
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Toplam Borc</p>
                    <p className="text-xl font-black text-red-600 mt-2">{formatCurrency(selectedAccount?.totalDebt || 0)}</p>
                </div>
                <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Toplam Alacak</p>
                    <p className="text-xl font-black text-emerald-600 mt-2">{formatCurrency(selectedAccount?.totalCredit || 0)}</p>
                </div>
                <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Guncel Bakiye</p>
                    <p className="text-xl font-black text-zinc-900 mt-2">{formatCurrency(selectedAccount?.balance || 0)}</p>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-zinc-50 border border-zinc-200/80 rounded-xl p-3">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="Belge no veya aciklama ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-10 pl-9 text-[13px] bg-white"
                    />
                </div>
            </div>

            <DataGrid data={filteredStatements} columns={columns} />
        </div>
    );
};
