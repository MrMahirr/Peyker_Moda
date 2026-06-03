import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Search, Plus, ArrowUpRight, ArrowDownLeft, Filter, Wallet, CreditCard, Eye, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';
import { showDeleteConfirm } from '@/utils/swal';

import { Loader2 } from 'lucide-react';
import { transactionsService, Transaction } from '../services/transactions.service';
import { TransactionModal } from './TransactionModal';

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

export const TransactionList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterType, setFilterType] = useState<string>('ALL');
    const [filterMethod, setFilterMethod] = useState<string>('ALL');

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await transactionsService.getAll({ limit: 200 }); // Daha iyi filtreleme için limit artırıldı
            setTransactions(response.data || []);
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const result = await showDeleteConfirm('Bu kasa hareketini silmek istediğinize emin misiniz?', 'Bu işlem geri alınamaz.');
        if (result.isConfirmed) {
            try {
                await transactionsService.delete(id);
                toast.success('İşlem başarıyla silindi.', { className: 'font-medium' });
                fetchTransactions();
            } catch (err) {
                console.error("Silme işlemi başarısız:", err);
                toast.error('İşlem silinirken bir hata oluştu.', { className: 'font-medium' });
            }
        }
    };

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
            header: 'Ödeme / Kategori',
            accessorKey: 'category',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => {
                const isCash = info.row.original.paymentMethod === 'CASH';
                return (
                    <div className="flex items-center gap-2">
                        <Badge variant="neutral" className="flex items-center gap-1">
                            {isCash ? <Wallet className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
                            {isCash ? 'Nakit' : 'Banka'}
                        </Badge>
                        {info.getValue() && <Badge variant="outline">{info.getValue()}</Badge>}
                    </div>
                );
            }
        },
        {
            header: 'Açıklama',
            accessorKey: 'description',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => <span className="text-[14px] font-semibold text-zinc-900">{info.getValue() || '-'}</span>
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
        },
        {
            header: '',
            accessorKey: 'actions',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => (
                <div className="flex justify-end gap-1">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/accounting/transactions/${info.row.original.id}`);
                        }}
                        title="Detayı Görüntüle"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={(e) => handleDelete(e, info.row.original.id)}
                        title="İşlemi Sil"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    const filteredData = transactions.filter(t => {
        const matchesSearch = (t.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                              (t.category?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        
        const matchesType = filterType === 'ALL' || t.type === filterType;
        
        let matchesMethod = true;
        if (filterMethod === 'CASH') {
            matchesMethod = t.paymentMethod === 'CASH';
        } else if (filterMethod === 'BANK') {
            matchesMethod = t.paymentMethod !== 'CASH';
        }

        return matchesSearch && matchesType && matchesMethod;
    });

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
                    <Button 
                        variant={isFilterOpen ? "primary" : "secondary"} 
                        size="sm"
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                        <Filter className="mr-2 h-4 w-4" />
                        Filtrele
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Yeni İşlem Ekle
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-4">
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

                {isFilterOpen && (
                    <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-xl border border-zinc-200/80 shadow-sm animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">İşlem Tipi</label>
                            <select 
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full sm:w-48 h-9 px-3 bg-zinc-50 border border-zinc-200/80 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="ALL">Tümü</option>
                                <option value="INCOME">Sadece Gelirler</option>
                                <option value="EXPENSE">Sadece Giderler</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Ödeme Yöntemi</label>
                            <select 
                                value={filterMethod}
                                onChange={(e) => setFilterMethod(e.target.value)}
                                className="w-full sm:w-48 h-9 px-3 bg-zinc-50 border border-zinc-200/80 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="ALL">Tümü</option>
                                <option value="CASH">Nakit Kasa</option>
                                <option value="BANK">Banka İşlemleri</option>
                            </select>
                        </div>
                        {(filterType !== 'ALL' || filterMethod !== 'ALL') && (
                            <div className="mt-5">
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                        setFilterType('ALL');
                                        setFilterMethod('ALL');
                                    }}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                    Filtreleri Temizle
                                </Button>
                            </div>
                        )}
                    </div>
                )}
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

