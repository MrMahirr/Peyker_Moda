import { useState, useEffect, useCallback } from 'react';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { BadgeCheck, XCircle, FileText, Search, Filter, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { showDeleteConfirm } from '@/utils/swal';
import { RefundModal } from './RefundModal';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { returnsService, ReturnRequest } from '../services/returns.service';

export const ReturnRequests = () => {
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);

    const fetchReturns = useCallback(async () => {
        try {
            setLoading(true);
            const data = await returnsService.getAll();
            setReturns(data);
        } catch (err) {
            console.error('Returns fetch error:', err);
            toast.error('İade talepleri yüklenemedi', { className: 'font-medium' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReturns();
    }, [fetchReturns]);

    const handleApprove = (ret: ReturnRequest) => {
        setSelectedReturn(ret);
        setIsRefundModalOpen(true);
    };

    const handleReject = (ret: ReturnRequest) => {
        showDeleteConfirm('İadeyi Reddet?', `${ret.id} numaralı iade talebi reddedilecek.`).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await returnsService.reject(ret.orderId);
                    toast.info('İade talebi reddedildi.', { className: 'font-medium' });
                    fetchReturns();
                } catch {
                    toast.error('İade reddedilemedi.', { className: 'font-medium' });
                }
            }
        });
    };

    const columns = [
        {
            header: 'İade No',
            accessorKey: 'id',
            cell: ({ row }: { row: { original: ReturnRequest } }) => <span className="font-mono text-[13px] font-bold text-zinc-900">{row.original.id}</span>
        },
        {
            header: 'Sipariş No',
            accessorKey: 'orderId',
            cell: ({ row }: { row: { original: ReturnRequest } }) => <span className="font-mono text-[13px] text-zinc-500 font-medium">{row.original.orderId}</span>
        },
        {
            header: 'Müşteri',
            accessorKey: 'customer',
            cell: ({ row }: { row: { original: ReturnRequest } }) => <span className="font-semibold text-zinc-900 text-[14px]">{row.original.customer}</span>
        },
        {
            header: 'Sebep',
            accessorKey: 'reason',
            cell: ({ row }: { row: { original: ReturnRequest } }) => <span className="text-[13px] font-medium text-zinc-700">{row.original.reason}</span>
        },
        {
            header: 'Tutar',
            accessorKey: 'amount',
            cell: ({ row }: { row: { original: ReturnRequest } }) => <span className="font-bold text-[15px] font-mono text-zinc-900">{row.original.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
        },
        {
            header: 'Durum',
            accessorKey: 'status',
            cell: ({ row }: { row: { original: ReturnRequest } }) => {
                const status = row.original.status;
                let variant: 'neutral' | 'info' | 'success' | 'warning' | 'error' = 'neutral';
                if (status === 'APPROVED') variant = 'success';
                if (status === 'REJECTED') variant = 'error';
                if (status === 'PENDING') variant = 'warning';

                return (
                    <Badge variant={variant} dot>
                        {returnsService.getStatusLabel(status)}
                    </Badge>
                );
            }
        },
        {
            header: 'İşlemler',
            id: 'actions',
            cell: ({ row }: { row: { original: ReturnRequest } }) => (
                <div className="flex justify-end items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {row.original.status === 'PENDING' && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50"
                                onClick={() => handleApprove(row.original)}
                                title="Onayla"
                            >
                                <BadgeCheck className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleReject(row.original)}
                                title="Reddet"
                            >
                                <XCircle className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Detay"
                    >
                        <FileText className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    const filteredData = returns.filter(r =>
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
                <p className="text-[13px] font-medium text-zinc-500">İade talepleri yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <PageHeader title="İade Talepleri" subtitle="İade ve değişim talepleri." />
                    <p className="text-[13px] font-medium text-zinc-500 mt-1">Müşteri iade ve değişim süreçlerini yönetin.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" className="shadow-sm border border-zinc-200/80 bg-white hover:bg-zinc-50">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtrele
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-zinc-50 p-2 rounded-xl border border-zinc-200/80 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="İade No, Sipariş No veya Müşteri Ara..."
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

            <RefundModal
                isOpen={isRefundModalOpen}
                onClose={() => setIsRefundModalOpen(false)}
                data={selectedReturn}
            />
        </div>
    );
};
