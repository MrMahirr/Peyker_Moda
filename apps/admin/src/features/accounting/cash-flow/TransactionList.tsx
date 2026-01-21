import { useState } from 'react';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';

const MOCK_TRANSACTIONS = [
    { id: 'TRX-5001', type: 'income', category: 'Satış', description: 'Nakit Satış (#12345)', amount: 450.00, date: '2024-01-22 14:30', updatedBy: 'Kasa-1' },
    { id: 'TRX-5002', type: 'expense', category: 'Tedarik', description: 'Kumaş Alımı (Öz-İplik)', amount: 12500.00, date: '2024-01-22 10:00', updatedBy: 'Mahir G.' },
    { id: 'TRX-5003', type: 'income', category: 'Tahsilat', description: 'Cari Tahsilat (Ayşe Yılmaz)', amount: 2500.00, date: '2024-01-21 16:45', updatedBy: 'Muhasebe' },
    { id: 'TRX-5004', type: 'expense', category: 'Gider', description: 'Yemek Gideri', amount: 350.00, date: '2024-01-21 12:30', updatedBy: 'Kasa-1' },
    { id: 'TRX-5005', type: 'income', category: 'Satış', description: 'Kredi Kartı Satış (#12344)', amount: 1890.00, date: '2024-01-21 11:15', updatedBy: 'Kasa-1' },
];

export const TransactionList = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const columns = [
        {
            header: 'Tarih',
            accessorKey: 'date',
            cell: (info: any) => <span className="text-slate-500 text-xs">{info.getValue()}</span>
        },
        {
            header: 'Tür',
            accessorKey: 'type',
            cell: (info: any) => {
                const type = info.getValue() as string;
                return type === 'income' ? (
                    <div className="flex items-center text-green-600 text-xs font-bold uppercase tracking-wider">
                        <ArrowUpRight className="h-3 w-3 mr-1" /> Gelir
                    </div>
                ) : (
                    <div className="flex items-center text-red-600 text-xs font-bold uppercase tracking-wider">
                        <ArrowDownLeft className="h-3 w-3 mr-1" /> Gider
                    </div>
                );
            }
        },
        {
            header: 'Kategori',
            accessorKey: 'category',
            cell: (info: any) => <span className="font-medium text-slate-700">{info.getValue()}</span>
        },
        {
            header: 'Açıklama',
            accessorKey: 'description',
        },
        {
            header: 'Tutar',
            accessorKey: 'amount',
            cell: (info: any) => {
                const type = info.row.original.type;
                return (
                    <span className={`font-mono font-bold ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {type === 'income' ? '+' : '-'}{info.getValue().toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </span>
                )
            }
        },
        {
            header: 'İşlem Yapan',
            accessorKey: 'updatedBy',
            cell: (info: any) => <span className="text-slate-500 text-xs">{info.getValue()}</span>
        }
    ];

    const filteredData = MOCK_TRANSACTIONS.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-slate-800">Son Hareketler</h3>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtrele
                    </Button>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni İşlem Ekle
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Açıklama veya Kategori Ara..."
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
