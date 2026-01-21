import { useState } from 'react';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Download, Eye } from 'lucide-react';

const MOCK_INVOICES = [
    { id: 'FAT-2024-001', date: '2024-01-22', recipient: 'Ayşe Yılmaz', taxId: '1234567890', amount: 15400.50, status: 'Ödendi' },
    { id: 'FAT-2024-002', date: '2024-01-21', recipient: 'Mehmet Demir', taxId: '9876543210', amount: 2350.00, status: 'Bekliyor' },
    { id: 'FAT-2024-003', date: '2024-01-20', recipient: 'Öz-İplik Ltd. Şti.', taxId: '5554443322', amount: 12500.00, status: 'Ödendi' },
];

export const InvoiceList = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const columns = [
        {
            header: 'Fatura No',
            accessorKey: 'id',
            cell: (info: any) => <span className="font-mono font-medium text-indigo-600">{info.getValue()}</span>
        },
        {
            header: 'Tarih',
            accessorKey: 'date',
        },
        {
            header: 'Alıcı / Firma',
            accessorKey: 'recipient',
            cell: (info: any) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-900">{info.getValue()}</span>
                    <span className="text-xs text-slate-500">VKN: {info.row.original.taxId}</span>
                </div>
            )
        },
        {
            header: 'Tutar',
            accessorKey: 'amount',
            cell: (info: any) => <span className="font-bold text-slate-900">{info.getValue().toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
        },
        {
            header: 'Durum',
            accessorKey: 'status',
            cell: (info: any) => {
                const status = info.getValue() as string;
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status === 'Ödendi' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                        {status}
                    </span>
                );
            }
        },
        {
            header: 'İşlemler',
            id: 'actions',
            cell: () => (
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600">
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    const filteredData = MOCK_INVOICES.filter(i =>
        i.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.recipient.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-slate-800">Fatura Listesi</h3>
                <div className="flex gap-2">
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Fatura Kes
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Fatura No veya Alıcı Ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-white"
                    />
                </div>
            </div>

            <DataGrid
                data={filteredData}
                columns={columns}
            />
        </div>
    );
};
