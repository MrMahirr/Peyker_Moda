import { useState, useEffect, useCallback } from 'react';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Search, Plus, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

import { Loader2 } from 'lucide-react';
import { transactionsService, Transaction } from '../services/transactions.service';
import { TransactionModal } from './TransactionModal';

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

export const TransactionList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await transactionsService.getAll({ limit: 50 });
            setTransactions(response.data || []);
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const columns = [
        {
            header: 'Tarih',
            accessorKey: 'transactionDate',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => <span className="text-zinc-500 text-[13px] font-medium">{formatDate(info.getValue())}</span>
        },
        {
            header: 'Tür',
            accessorKey: 'type',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: ({ row }: any) => {
                const type = row.getValue('type') as string;
                return type === 'INCOME' ? (
                    <div className="flex items-center text-emerald-600 text-[11px] font-bold uppercase tracking-wider">
                        <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> Gelir
                    </div>
                ) : (
                    <div className="flex items-center text-red-600 text-[11px] font-bold uppercase tracking-wider">
                        <ArrowDownLeft className="h-3.5 w-3.5 mr-1" /> Gider
                    </div>
                );
            }
        },
        {
            header: 'Kategori',
            accessorKey: 'category',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => <Badge variant="neutral">{info.getValue()}</Badge>
        },
        {
            header: 'Açıklama',
            accessorKey: 'description',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => <span className="text-[14px] font-semibold text-zinc-900">{info.getValue()}</span>
        },
        {
            header: 'Tutar',
            accessorKey: 'amount',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => {
                const type = info.row.original.type;
                const amt = Number(info.getValue());
                return (
                    <span className={`font-mono text-[15px] font-bold ${type === 'INCOME' ? 'text-emerald-600' : 'text-zinc-900'}`}>
                        {type === 'INCOME' ? '+' : '-'}{amt.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </span>
                )
            }
        },
        {
            header: 'İşlem Yapan',
            accessorKey: 'updatedBy',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => {
                const user = info.row.original.user;
                return <span className="text-zinc-500 text-[13px] font-medium">{user ? `${user.firstName} ${user.lastName}` : 'Sistem'}</span>;
            }
        }
    ];

    const filteredData = transactions.filter(t =>
        (t.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (t.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    if (loading && transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
                <p className="text-[13px] font-medium text-zinc-500">Kasa hareketleri yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="font-semibold text-[17px] text-zinc-900 tracking-tight">Kasa Hareketleri</h3>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtrele
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Yeni İşlem Ekle
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-zinc-50 p-2 rounded-xl border border-zinc-200/80 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                        placeholder="Açıklama veya Kategori Ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-zinc-900 placeholder:text-zinc-400 transition-all shadow-sm"
                    />
                </div>
            </div>

            <DataGrid
                data={filteredData}
                columns={columns}
            />

            <TransactionModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchTransactions}
            />
        </div>
    );
};

