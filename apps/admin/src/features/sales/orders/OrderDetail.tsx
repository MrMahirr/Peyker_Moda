import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ChevronLeft, Loader2, Package, User, CreditCard, Truck } from 'lucide-react';
import { ordersService, Order } from '../services/orders.service';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

const STATUS_OPTIONS = [
    { value: 'PENDING', label: 'Beklemede' },
    { value: 'PROCESSING', label: 'Hazırlanıyor' },
    { value: 'SHIPPED', label: 'Kargoda' },
    { value: 'DELIVERED', label: 'Teslim Edildi' },
];

export const OrderDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;
            try {
                const data = await ordersService.getById(id);
                setOrder(data);
            } catch (err) {
                console.error('Order fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleStatusChange = async (newStatus: string) => {
        if (!id || !order) return;
        setUpdating(true);
        try {
            const updated = await ordersService.updateStatus(id, newStatus);
            setOrder(updated);
        } catch (err) {
            console.error('Status update error:', err);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!order) {
        return <div className="text-center py-12 text-red-600">Sipariş bulunamadı</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/sales/orders')}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Sipariş #{order.orderNumber}
                        </h1>
                        <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {order.status === 'SHIPPED' && order.cargoTrackingCode && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100">
                            <Truck className="h-4 w-4" />
                            <span>{order.cargoProvider}: {order.cargoTrackingCode}</span>
                        </div>
                    )}
                    {(order.status === 'PROCESSING' || order.status === 'CONFIRMED') && (
                        <Button
                            variant="default"
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={async () => {
                                if (!confirm('Sipariş kargoya verilecek ve müşteriye bildirim gidecek. Onaylıyor musunuz?')) return;
                                setUpdating(true);
                                try {
                                    const updated = await ordersService.shipOrder(order.id);
                                    setOrder(updated);
                                    alert('Sipariş başarıyla kargoya verildi!');
                                } catch (err) {
                                    alert('Kargo işlemi başarısız');
                                    console.error(err);
                                } finally {
                                    setUpdating(false);
                                }
                            }}
                            disabled={updating}
                        >
                            <Truck className="h-4 w-4 mr-2" />
                            Kargoya Ver
                        </Button>
                    )}
                    <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={updating || order.status === 'CANCELLED' || order.status === 'SHIPPED'}
                        className="px-3 py-2 border rounded-lg text-sm"
                    >
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Items */}
                <div className="lg:col-span-2">
                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="w-5 h-5 text-slate-600" />
                            <h3 className="font-semibold">Ürünler</h3>
                        </div>
                        <div className="space-y-4">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-3 border-b last:border-0">
                                    <div>
                                        <div className="font-medium">{item.productName}</div>
                                        <div className="text-sm text-slate-500">{item.variantInfo}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{formatCurrency(item.total)}</div>
                                        <div className="text-sm text-slate-500">{item.quantity} x {formatCurrency(item.unitPrice)}</div>
                                    </div>
                                </div>
                            )) || <p className="text-slate-500">Ürün bilgisi yok</p>}
                        </div>
                        <div className="mt-4 pt-4 border-t space-y-2">
                            <div className="flex justify-between"><span>Ara Toplam</span><span>{formatCurrency(order.subtotal)}</span></div>
                            {order.discount > 0 && <div className="flex justify-between text-emerald-600"><span>İndirim</span><span>-{formatCurrency(order.discount)}</span></div>}
                            <div className="flex justify-between font-bold text-lg"><span>Toplam</span><span>{formatCurrency(order.total)}</span></div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer */}
                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="w-5 h-5 text-slate-600" />
                            <h3 className="font-semibold">Müşteri</h3>
                        </div>
                        {order.customer ? (
                            <div className="space-y-2 text-sm">
                                <p className="font-medium">{order.customer.firstName} {order.customer.lastName}</p>
                                <p className="text-slate-600">{order.customer.phone}</p>
                                {order.customer.email && <p className="text-slate-600">{order.customer.email}</p>}
                            </div>
                        ) : <p className="text-slate-500 text-sm">Müşteri bilgisi yok</p>}
                    </Card>

                    {/* Shipping */}
                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Truck className="w-5 h-5 text-slate-600" />
                            <h3 className="font-semibold">Teslimat Adresi</h3>
                        </div>
                        <p className="text-sm text-slate-600">{order.shippingAddress || 'Adres bilgisi yok'}</p>
                    </Card>

                    {/* Payment */}
                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="w-5 h-5 text-slate-600" />
                            <h3 className="font-semibold">Ödeme</h3>
                        </div>
                        <p className="text-sm">
                            Durum: <span className={`font-medium ${order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {order.paymentStatus === 'PAID' ? 'Ödendi' : 'Bekliyor'}
                            </span>
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
};
