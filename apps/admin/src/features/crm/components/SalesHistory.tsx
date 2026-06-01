import { useEffect, useState } from 'react';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Eye, FileText, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import api from '../../../lib/axios';

interface SaleRecord {
    id: string;
    date: string;
    total: number;
    items: number;
    status: string;
}

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'error' | 'neutral' }> = {
    DELIVERED: { label: 'Tamamlandı', variant: 'success' },
    CANCELLED: { label: 'İptal', variant: 'error' },
    RETURNED: { label: 'İade Edildi', variant: 'error' },
    PENDING: { label: 'Bekliyor', variant: 'neutral' },
    PROCESSING: { label: 'İşleniyor', variant: 'neutral' },
    SHIPPED: { label: 'Kargoda', variant: 'neutral' },
};

interface SalesHistoryProps {
    customerId: string;
}

export const SalesHistory = ({ customerId }: SalesHistoryProps) => {
    const [sales, setSales] = useState<SaleRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const response = await api.get(`/orders?customerId=${customerId}&limit=20`);
                const orders = response.data?.data?.data || response.data?.data || [];
                setSales(orders.map((order: any) => ({
                    id: order.orderNumber || order.id,
                    date: new Date(order.createdAt).toLocaleString('tr-TR'),
                    total: order.total || 0,
                    items: order.items?.length || 0,
                    status: order.status || 'PENDING',
                })));
            } catch (err) {
                console.error('Sales history fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (customerId) {
            fetchSales();
        }
    }, [customerId]);

    const columns = [
        {
            header: 'Sipariş No',
            accessorKey: 'id',
            cell: ({ row }: { row: { original: SaleRecord } }) => <span className="font-mono font-medium">#{row.original.id}</span>
        },
        {
            header: 'Tarih',
            accessorKey: 'date',
        },
        {
            header: 'Adet',
            accessorKey: 'items',
            cell: ({ row }: { row: { original: SaleRecord } }) => <span>{row.original.items} ürün</span>
        },
        {
            header: 'Durum',
            accessorKey: 'status',
            cell: ({ row }: { row: { original: SaleRecord } }) => {
                const info = STATUS_MAP[row.original.status] || { label: row.original.status, variant: 'neutral' as const };
                return <Badge variant={info.variant} dot>{info.label}</Badge>;
            }
        },
        {
            header: 'Toplam',
            accessorKey: 'total',
            cell: ({ row }: { row: { original: SaleRecord } }) => (
                <span className="font-bold text-zinc-900">
                    {row.original.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
            )
        },
        {
            header: 'İşlemler',
            id: 'actions',
            cell: () => (
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-500 hover:text-indigo-600">
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-900" title="Fiş Görüntüle">
                        <FileText className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32 gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                <span className="text-sm text-zinc-500">Satış geçmişi yükleniyor...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900">Satış Geçmişi</h3>
            {sales.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 text-sm">Bu müşteriye ait sipariş bulunamadı.</div>
            ) : (
                <DataGrid
                    data={sales}
                    columns={columns}
                />
            )}
        </div>
    );
};
