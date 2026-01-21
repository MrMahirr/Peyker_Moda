import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Eye, FileText } from 'lucide-react';

const MOCK_SALES = [
    { id: '1001', date: '2024-01-20 14:30', total: 1250.00, items: 3, status: 'Tamamlandı' },
    { id: '1002', date: '2024-01-15 11:00', total: 450.50, items: 1, status: 'Tamamlandı' },
    { id: '1003', date: '2023-12-30 16:45', total: 3200.00, items: 5, status: 'İade Edildi' },
    { id: '1004', date: '2023-12-10 10:15', total: 890.00, items: 2, status: 'Tamamlandı' },
];

export const SalesHistory = () => {
    const columns = [
        {
            header: 'Sipariş No',
            accessorKey: 'id',
            cell: (info: any) => <span className="font-mono font-medium">#{info.getValue()}</span>
        },
        {
            header: 'Tarih',
            accessorKey: 'date',
        },
        {
            header: 'Adet',
            accessorKey: 'items',
            cell: (info: any) => <span>{info.getValue()} ürün</span>
        },
        {
            header: 'Durum',
            accessorKey: 'status',
            cell: (info: any) => {
                const status = info.getValue() as string;
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status === 'Tamamlandı' ? 'bg-green-100 text-green-800' :
                            status === 'İade Edildi' ? 'bg-red-100 text-red-800' :
                                'bg-slate-100 text-slate-800'
                        }`}>
                        {status}
                    </span>
                );
            }
        },
        {
            header: 'Toplam',
            accessorKey: 'total',
            cell: (info: any) => (
                <span className="font-bold text-slate-900">
                    {info.getValue().toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
            )
        },
        {
            header: 'İşlemler',
            id: 'actions',
            cell: () => (
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600">
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900" title="Fiş Görüntüle">
                        <FileText className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Satış Geçmişi</h3>
            <DataGrid
                data={MOCK_SALES}
                columns={columns}
            />
        </div>
    );
};
