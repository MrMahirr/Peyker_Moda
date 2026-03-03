import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Eye, Loader2 } from 'lucide-react';
import { ordersService, Order } from '../services/orders.service';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Beklemede', color: 'bg-amber-100 text-amber-800' },
    PROCESSING: { label: 'Hazırlanıyor', color: 'bg-blue-100 text-blue-800' },
    SHIPPED: { label: 'Kargoda', color: 'bg-purple-100 text-purple-800' },
    DELIVERED: { label: 'Teslim Edildi', color: 'bg-emerald-100 text-emerald-800' },
    CANCELLED: { label: 'İptal', color: 'bg-red-100 text-red-800' },
};

const PAYMENT_MAP: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Bekliyor', color: 'bg-amber-100 text-amber-800' },
    PAID: { label: 'Ödendi', color: 'bg-emerald-100 text-emerald-800' },
    FAILED: { label: 'Başarısız', color: 'bg-red-100 text-red-800' },
    REFUNDED: { label: 'İade', color: 'bg-slate-100 text-slate-800' },
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
                <span className="font-mono font-medium text-indigo-600">{row.getValue('orderNumber')}</span>
            ),
        },
        {
            accessorKey: 'customer',
            header: 'Müşteri',
            cell: ({ row }) => {
                const customer = row.original.customer;
                return customer ? (
                    <div>
                        <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                        <div className="text-xs text-slate-500">{customer.phone}</div>
                    </div>
                ) : <span className="text-slate-400">-</span>;
            },
        },
        {
            accessorKey: 'total',
            header: 'Tutar',
            cell: ({ row }) => (
                <span className="font-medium">{formatCurrency(row.original.total)}</span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Sipariş Durumu',
            cell: ({ row }) => {
                const status = row.original.status;
                const statusInfo = STATUS_MAP[status] || { label: status, color: 'bg-slate-100' };
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                    </span>
                );
            },
        },
        {
            accessorKey: 'paymentStatus',
            header: 'Ödeme',
            cell: ({ row }) => {
                const status = row.original.paymentStatus;
                const statusInfo = PAYMENT_MAP[status] || { label: status, color: 'bg-slate-100' };
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                    </span>
                );
            },
        },
        {
            accessorKey: 'createdAt',
            header: 'Tarih',
            cell: ({ row }) => (
                <span className="text-sm text-slate-600">{formatDate(row.original.createdAt)}</span>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-indigo-600"
                    onClick={() => navigate(`/sales/orders/${row.original.id}`)}
                >
                    <Eye className="h-4 w-4" />
                </Button>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-12 text-red-600">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Siparişler</h2>
                <p className="text-sm text-slate-500">Tüm siparişleri buradan yönetebilirsiniz.</p>
            </div>

            <DataGrid
                columns={columns}
                data={orders}
                searchKey="orderNumber"
            />
        </div>
    );
};
