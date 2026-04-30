import { useEffect, useState } from 'react';
import { DataGrid } from '@/components/shared/DataGrid';
import { BarChart3, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { staffService } from '../services/staff.service';
import type { StaffPerformance } from '../types';

const fmt = (v: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);

export const PerformanceTracking = () => {
    const [performance, setPerformance] = useState<StaffPerformance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try { setLoading(true); setPerformance(await staffService.getPerformance() || []); }
            catch { toast.error('Performans verileri yüklenemedi'); }
            finally { setLoading(false); }
        })();
    }, []);

    const columns = [
        { header: 'Personel', accessorKey: 'staffName', cell: (info: any) => <span className="font-semibold text-[14px]">{info.row.original.staffName}</span> },
        { header: 'Sipariş Sayısı', accessorKey: 'totalOrders', cell: (info: any) => <span className="font-semibold">{info.row.original.totalOrders}</span> },
        { header: 'Toplam Satış', accessorKey: 'totalSales', cell: (info: any) => <span className="font-bold font-mono text-emerald-600">{fmt(info.row.original.totalSales)}</span> },
        { header: 'Ort. Sipariş Tutarı', accessorKey: 'averageOrderValue', cell: (info: any) => <span className="font-mono text-zinc-600">{fmt(info.row.original.averageOrderValue)}</span> },
        { header: 'İade Sayısı', accessorKey: 'returnedOrders', cell: (info: any) => <span className="text-red-500 font-semibold">{info.row.original.returnedOrders}</span> },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-zinc-900" /></div>;

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-xl"><BarChart3 className="h-5 w-5 text-blue-600" /></div>
                <div><h2 className="text-xl font-bold text-zinc-900">Personel Performansı</h2><p className="text-[13px] text-zinc-500">Satış temsilcisi performans analizleri.</p></div>
            </div>
            <DataGrid data={performance} columns={columns} />
        </div>
    );
};
