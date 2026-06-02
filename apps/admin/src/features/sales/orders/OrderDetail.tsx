import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ChevronLeft, Loader2, Package, User, CreditCard, Truck } from 'lucide-react';
import { ordersService, Order } from '../services/orders.service';
import Swal from 'sweetalert2';

import { shippingService } from '../../shipping/services/shipping.service';

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
    const [carriers, setCarriers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const [orderData, carriersData] = await Promise.all([
                    ordersService.getById(id),
                    shippingService.getCarriers().catch(() => [])
                ]);
                setOrder(orderData);
                setCarriers(carriersData);
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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
                    <Button variant="ghost" size="sm" className="w-9 h-9 p-0" onClick={() => navigate('/sales/orders')}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">
                            Sipariş #{order.orderNumber}
                        </h1>
                        <p className="text-sm text-zinc-500 flex items-center gap-2">
                            {formatDate(order.createdAt)}
                            <span className="text-zinc-300">•</span>
                            <Badge variant={order.source === 'ONLINE' ? 'info' : 'neutral'} className="text-[10px] px-1.5 py-0">
                                {order.source === 'POS' ? 'Mağaza Satışı (POS)' : order.source === 'ONLINE' ? 'Web Sitesi Satışı' : order.source || 'Bilinmiyor'}
                            </Badge>
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {order.status === 'SHIPPED' && order.cargoTrackingCode && order.source !== 'POS' && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100">
                            <Truck className="h-4 w-4" />
                            <span>{order.cargoProvider}: {order.cargoTrackingCode}</span>
                        </div>
                    )}
                    {(order.status === 'PROCESSING' || order.status === 'CONFIRMED') && order.source !== 'POS' && (
                        <Button
                            variant="primary"
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={async () => {
                                const optionsHtml = carriers.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
                                const selectHtml = carriers.length > 0
                                    ? `<select id="swal-input1" class="swal2-select" style="display: flex; width: 100%; box-sizing: border-box; max-width: 100%; margin: 1em auto;">
                                         <option value="" disabled selected>Kargo Firması Seçin</option>
                                         ${optionsHtml}
                                       </select>`
                                    : '<input id="swal-input1" class="swal2-input" placeholder="Kargo Firması (Örn: Yurtiçi Kargo)">';

                                const { value: formValues } = await Swal.fire({
                                    title: 'Siparişi Kargoya Ver',
                                    html:
                                        selectHtml +
                                        '<input id="swal-input2" class="swal2-input" placeholder="Takip Numarası">',
                                    focusConfirm: false,
                                    showCancelButton: true,
                                    confirmButtonText: 'Kargoya Ver',
                                    cancelButtonText: 'İptal',
                                    preConfirm: () => {
                                        const provider = (document.getElementById('swal-input1') as HTMLInputElement | HTMLSelectElement).value;
                                        const tracking = (document.getElementById('swal-input2') as HTMLInputElement).value;
                                        if (!provider || !tracking) {
                                            Swal.showValidationMessage('Kargo firması ve takip numarası zorunludur');
                                        }
                                        return { provider, tracking };
                                    }
                                });

                                if (!formValues) return;
                                
                                setUpdating(true);
                                try {
                                    const updated = await ordersService.shipOrder(order.id, {
                                        cargoProvider: formValues.provider,
                                        cargoTrackingCode: formValues.tracking
                                    });
                                    setOrder(updated);
                                    Swal.fire('Başarılı!', 'Sipariş kargoya verildi ve müşteriye bildirildi.', 'success');
                                } catch (err: any) {
                                    Swal.fire('Hata!', err.response?.data?.message || 'Kargo işlemi başarısız oldu.', 'error');
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
                        disabled={updating || order.status === 'CANCELLED' || (order.source !== 'POS' && order.status === 'SHIPPED')}
                        className="px-3 py-2 border rounded-lg text-sm"
                    >
                        {order.source === 'POS' ? (
                            <>
                                <option value="COMPLETED">Tamamlandı</option>
                                <option value="RETURNED">İade Edildi</option>
                                <option value="CANCELLED">İptal Edildi</option>
                            </>
                        ) : (
                            <>
                                <option value="PENDING">Beklemede</option>
                                <option value="PROCESSING">Hazırlanıyor</option>
                                <option value="SHIPPED">Kargoda</option>
                                <option value="DELIVERED">Teslim Edildi</option>
                                <option value="CANCELLED">İptal Edildi</option>
                                <option value="RETURNED">İade Edildi</option>
                            </>
                        )}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Items */}
                <div className="lg:col-span-2">
                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="w-5 h-5 text-zinc-600" />
                            <h3 className="font-semibold">Ürünler</h3>
                        </div>
                        <div className="space-y-4">
                            {order.items?.map((item, idx) => {
                                const productName = item.variant?.product?.name || 'Ürün';
                                const variantInfo = [item.variant?.color, item.variant?.size].filter(Boolean).join(' - ') || 'Varyant belirtilmemiş';
                                return (
                                <div key={idx} className="flex justify-between items-center py-3 border-b last:border-0">
                                    <div>
                                        <div className="font-medium">{productName}</div>
                                        <div className="text-sm text-zinc-500">{variantInfo}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{formatCurrency(Number(item.total))}</div>
                                        <div className="text-sm text-zinc-500">{item.quantity} x {formatCurrency(Number(item.unitPrice))}</div>
                                    </div>
                                </div>
                                );
                            }) || <p className="text-zinc-500">Ürün bilgisi yok</p>}
                        </div>
                        <div className="mt-4 pt-4 border-t space-y-2">
                            <div className="flex justify-between"><span>Ara Toplam</span><span>{formatCurrency(Number(order.subtotal))}</span></div>
                            {Number(order.discountAmount) > 0 && <div className="flex justify-between text-emerald-600"><span>İndirim</span><span>-{formatCurrency(Number(order.discountAmount))}</span></div>}
                            <div className="flex justify-between font-bold text-lg"><span>Toplam</span><span>{formatCurrency(Number(order.totalAmount))}</span></div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer */}
                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="w-5 h-5 text-zinc-600" />
                            <h3 className="font-semibold">Müşteri</h3>
                        </div>
                        {order.customer ? (
                            <div className="space-y-2 text-sm">
                                <p className="font-medium">{order.customer.firstName} {order.customer.lastName}</p>
                                <p className="text-zinc-600">{order.customer.phone}</p>
                                {order.customer.email && <p className="text-zinc-600">{order.customer.email}</p>}
                            </div>
                        ) : <p className="text-zinc-500 text-sm">Müşteri bilgisi yok</p>}
                    </Card>

                    {/* Shipping - Sadece POS değilse göster */}
                    {order.source !== 'POS' && (
                        <Card className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Truck className="w-5 h-5 text-zinc-600" />
                                <h3 className="font-semibold">Teslimat Adresi</h3>
                            </div>
                            <p className="text-sm text-zinc-600">
                                {typeof order.shippingAddress === 'object' && order.shippingAddress !== null
                                    ? `${(order.shippingAddress as any).address || ''} ${(order.shippingAddress as any).district || ''}/${(order.shippingAddress as any).city || ''}`.trim() || 'Adres bilgisi yok'
                                    : order.shippingAddress || 'Adres bilgisi yok'}
                            </p>
                        </Card>
                    )}

                    {/* Payment */}
                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="w-5 h-5 text-zinc-600" />
                            <h3 className="font-semibold">Ödeme</h3>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm">
                                Durum: <span className={`font-medium ${order.paymentStatus === 'COMPLETED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {order.paymentStatus === 'COMPLETED' ? (order.source === 'POS' ? 'Tahsil Edildi' : 'Ödendi') : order.paymentStatus === 'PARTIAL' ? 'Kısmi Ödeme' : 'Bekliyor'}
                                </span>
                            </p>
                            {order.payments && order.payments.length > 0 && (
                                <p className="text-sm">
                                    Yöntem: <span className="font-medium text-zinc-700">
                                        {order.payments[0].method === 'CASH' ? 'Nakit' :
                                         order.payments[0].method === 'CREDIT_CARD' ? 'Kredi Kartı' :
                                         order.payments[0].method === 'DEBIT_CARD' ? 'Banka Kartı' :
                                         order.payments[0].method === 'BANK_TRANSFER' ? 'Havale/EFT' : 'Diğer'}
                                    </span>
                                </p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
