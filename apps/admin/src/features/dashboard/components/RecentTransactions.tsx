import { useState, useEffect } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { dashboardService } from '../services/dashboard.service';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { tr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface OrderData {
    id: string;
    orderNumber: string;
    customer: string;
    createdAt: string;
    totalAmount: number;
    status: string;
}

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'DELIVERED':
        case 'COMPLETED':
            return 'success';
        case 'PENDING':
        case 'PROCESSING':
            return 'warning';
        case 'CANCELLED':
        case 'RETURNED':
            return 'error';
        default:
            return 'neutral';
    }
};

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        PENDING: 'Bekliyor',
        CONFIRMED: 'Onaylandı',
        PROCESSING: 'Hazırlanıyor',
        SHIPPED: 'Kargoda',
        DELIVERED: 'Teslim Edildi',
        COMPLETED: 'Tamamlandı',
        CANCELLED: 'İptal',
        RETURNED: 'İade',
    };
    return labels[status] || status;
};

export const RecentTransactions = () => {
    const [transactions, setTransactions] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await dashboardService.getRecentOrders(5, undefined, undefined);
                console.log('Recent transactions fetched:', data);
                setTransactions(data);
            } catch (err) {
                console.error('Failed to fetch recent transactions', err);
                toast.error('Son işlemler yüklenemedi');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);
    return (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50">
                <div>
                    <h3 className="text-[16px] font-bold text-zinc-900">Son İşlemler</h3>
                    <p className="text-[13px] font-medium text-zinc-500 mt-0.5">En son yapılan satışlar ve kargo durumları.</p>
                </div>
                <button 
                    onClick={() => navigate('/sales/orders')}
                    className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                    Tümünü Gör
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-200/50 bg-white">
                            <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-widest">Sipariş No</th>
                            <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-widest">Müşteri</th>
                            <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-widest">Tarih</th>
                            <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-widest">Tutar</th>
                            <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-widest">Durum</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mx-auto" />
                                </td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-500">
                                    Henüz sipariş bulunmuyor.
                                </td>
                            </tr>
                        ) : (
                            transactions.map((tx) => {
                                const variant = getStatusVariant(tx.status);
                                return (
                                    <tr 
                                        key={tx.id} 
                                        onClick={() => navigate(`/sales/orders/${tx.id}`)}
                                        className="hover:bg-zinc-50/80 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-[13px] font-bold text-zinc-900 bg-zinc-100 px-2 py-1 rounded">
                                                {tx.orderNumber}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[14px] font-semibold text-zinc-700 group-hover:text-zinc-900 transition-colors">
                                            {tx.customer}
                                        </td>
                                        <td className="px-6 py-4 text-[13px] font-medium text-zinc-500">
                                            {format(new Date(tx.createdAt), 'dd MMM, HH:mm', { locale: tr })}
                                        </td>
                                        <td className="px-6 py-4 text-[14px] font-black font-mono text-zinc-900">
                                            ₺{Number(tx.totalAmount).toLocaleString('tr-TR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            <Badge variant={variant as any} dot={variant !== 'neutral'}>
                                                {getStatusLabel(tx.status)}
                                            </Badge>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="p-4 bg-zinc-50 border-t border-zinc-100 sm:hidden">
                <button 
                    onClick={() => navigate('/sales/orders')}
                    className="w-full inline-flex justify-center items-center gap-1.5 text-[13px] font-bold text-indigo-600 bg-indigo-50 px-3 py-2.5 rounded-lg transition-colors"
                >
                    Tümünü Gör
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
