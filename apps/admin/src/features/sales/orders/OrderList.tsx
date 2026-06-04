import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Eye, Loader2 } from 'lucide-react';
import { ordersService, Order } from '../services/orders.service';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

const STATUS_MAP: Record<string, { label: string; variant: 'neutral' | 'info' | 'success' | 'warning' | 'error' }> = {
    PENDING: { label: 'Beklemede', variant: 'warning' },
    PROCESSING: { label: 'Hazırlanıyor', variant: 'info' },
    SHIPPED: { label: 'Kargoda', variant: 'neutral' }, // Ideally purple, but neutral is fine
    DELIVERED: { label: 'Teslim Edildi', variant: 'success' },
    COMPLETED: { label: 'Tamamlandı', variant: 'success' },
    CANCELLED: { label: 'İptal Edildi', variant: 'error' },
    RETURNED: { label: 'İade Edildi', variant: 'error' },
};

const PAYMENT_MAP: Record<string, { label: string; variant: 'neutral' | 'info' | 'success' | 'warning' | 'error' }> = {
    PENDING: { label: 'Bekliyor', variant: 'warning' },
    PARTIAL: { label: 'Kısmi Ödeme', variant: 'info' },
    COMPLETED: { label: 'Ödendi', variant: 'success' },
    FAILED: { label: 'Başarısız', variant: 'error' },
    REFUNDED: { label: 'İade', variant: 'neutral' },
};

export const OrderList = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await ordersService.getAll({ limit: 50 });
                setOrders(response.data || []);
            } catch (err) {
                setError('Siparişler yüklenemedi');
                console.error('Orders fetch error:', err);
                toast.error('Siparişler yüklenirken bir hata oluştu');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const columns: ColumnDef<Order>[] = [
        {
            accessorKey: 'orderNumber',
            header: 'Sipariş No',
            cell: ({ row }) => (
                <span className="font-mono text-[13px] font-bold text-zinc-900 bg-zinc-100/80 px-2 py-1 rounded-md border border-zinc-200/50">{row.getValue('orderNumber')}</span>
            ),
        },
        {
            accessorKey: 'customer',
            header: 'Müşteri',
            cell: ({ row }) => {
                const customer = row.original.customer;
                return customer ? (
                    <div className="flex flex-col py-1">
                        <div className="font-semibold text-[14px] text-zinc-900">{customer.firstName} {customer.lastName}</div>
                        <div className="text-[11px] font-medium text-zinc-500">{customer.phone}</div>
                    </div>
                ) : <span className="text-zinc-400 font-medium">-</span>;
            },
        },
        {
            accessorKey: 'totalAmount',
            header: 'Tutar',
            cell: ({ row }) => (
                <span className="font-bold text-[15px] font-mono text-zinc-900">{formatCurrency(Number(row.original.totalAmount || 0))}</span>
            ),
        },
        {
            accessorKey: 'source',
            header: 'Satış Kanalı',
            cell: ({ row }) => {
                const source = row.original.source;
                const label = source === 'POS' ? 'Mağaza (POS)' : source === 'ONLINE' ? 'Web Sitesi' : source === 'PHONE' ? 'Telefon' : source || 'Bilinmiyor';
                return (
                    <Badge variant={source === 'ONLINE' ? 'info' : 'neutral'}>
                        {label}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Sipariş Durumu',
            cell: ({ row }) => {
                const status = row.original.status;
                const statusInfo = STATUS_MAP[status] || { label: status, variant: 'neutral' };
                return (
                    <Badge variant={statusInfo.variant} dot>
                        {statusInfo.label}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'paymentStatus',
            header: 'Ödeme',
            cell: ({ row }) => {
                const status = row.original.paymentStatus;
                const source = row.original.source;
                const statusInfo = PAYMENT_MAP[status] || { label: status, variant: 'neutral' };
                
                let label = statusInfo.label;
                if (status === 'COMPLETED' && source === 'POS') {
                    label = 'Tahsil Edildi';
                }

                return (
                    <Badge variant={statusInfo.variant}>
                        {label}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'createdAt',
            header: 'Tarih',
            cell: ({ row }) => (
                <span className="text-[13px] font-medium text-zinc-500">{formatDate(row.original.createdAt)}</span>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow-md rounded-full"
                        onClick={() => navigate(`/sales/orders/${row.original.id}`)}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
                <p className="text-[13px] font-medium text-zinc-500">Siparişler yükleniyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 bg-red-50 text-red-600 rounded-xl border border-red-200 font-medium">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black tracking-tight text-zinc-900">Sipariş Yönetimi</h2>
                <p className="text-[13px] font-medium text-zinc-500 mt-1">E-ticaret ve mağaza siparişlerinizi tek merkezden takip edin.</p>
            </div>

            <DataGrid
                columns={columns}
                data={orders}
                searchKey="orderNumber"
            />
        </div>
    );
};
