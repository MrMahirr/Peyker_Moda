import { useEffect, useState } from 'react';
import { DataGrid } from '@/components/shared/DataGrid';
import { Badge } from '@/components/ui/Badge';
import { Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { shippingService } from '../services/shipping.service';
import type { Shipment, ShipmentStatus } from '../types';

const statusL: Record<ShipmentStatus, string> = { PREPARING: 'Hazırlanıyor', PICKED_UP: 'Alındı', IN_TRANSIT: 'Yolda', OUT_FOR_DELIVERY: 'Dağıtımda', DELIVERED: 'Teslim Edildi', RETURNED: 'İade', FAILED: 'Başarısız' };
const statusV: Record<ShipmentStatus, 'neutral' | 'info' | 'warning' | 'success' | 'error'> = { PREPARING: 'neutral', PICKED_UP: 'info', IN_TRANSIT: 'info', OUT_FOR_DELIVERY: 'warning', DELIVERED: 'success', RETURNED: 'error', FAILED: 'error' };

export const ShipmentTracking = () => {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { (async () => { try { setShipments(await shippingService.getShipments() || []); } catch { toast.error('Gönderiler yüklenemedi'); } finally { setLoading(false); } })(); }, []);

    const columns = [
        { header: 'Takip No', accessorKey: 'trackingNumber', cell: (info: any) => <span className="font-mono font-semibold text-[13px]">{info.row.original.trackingNumber}</span> },
        { header: 'Sipariş', accessorKey: 'orderNumber', cell: (info: any) => <span className="text-[13px]">{info.row.original.orderNumber || '—'}</span> },
        { header: 'Alıcı', accessorKey: 'recipientName', cell: (info: any) => <span className="font-semibold text-[14px]">{info.row.original.recipientName}</span> },
        { header: 'Kargo', accessorKey: 'carrierName' },
        { header: 'Durum', accessorKey: 'status', cell: (info: any) => <Badge variant={statusV[info.row.original.status as ShipmentStatus]}>{statusL[info.row.original.status as ShipmentStatus]}</Badge> },
        { header: 'Tarih', accessorKey: 'createdAt', cell: (info: any) => <span className="text-[13px] text-zinc-500">{new Date(info.row.original.createdAt).toLocaleDateString('tr-TR')}</span> },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-zinc-900" /></div>;

    return <div className="p-6"><DataGrid data={shipments} columns={columns} /></div>;
};
