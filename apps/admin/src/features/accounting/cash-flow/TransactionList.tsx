import { useState } from 'react';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => <span className="text-zinc-500 text-[13px] font-medium">{info.getValue()}</span>
        },
        {
            header: 'Tür',
            accessorKey: 'type',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: ({ row }: any) => {
                const type = row.getValue('type') as string;
                return type === 'income' ? (
                    <div className="flex items-center text-emerald-600 text-[11px] font-bold uppercase tracking-wider">
                        <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> Gelir
                    </div>
                ) : (
                    <div className="flex items-center text-red-600 text-[11px] font-bold uppercase tracking-wider">
                        <ArrowDownLeft className="h-3.5 w-3.5 mr-1" /> Gider
                    </div>
                );
            }
        },
        {
            header: 'Kategori',
            accessorKey: 'category',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => <Badge variant="neutral">{info.getValue()}</Badge>
        },
        {
            header: 'Açıklama',
            accessorKey: 'description',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => <span className="text-[14px] font-semibold text-zinc-900">{info.getValue()}</span>
        },
        {
            header: 'Tutar',
            accessorKey: 'amount',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => {
                const type = info.row.original.type;
                return (
                    <span className={`font-mono text-[15px] font-bold ${type === 'income' ? 'text-emerald-600' : 'text-zinc-900'}`}>
                        {type === 'income' ? '+' : '-'}{info.getValue().toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </span>
                )
            }
        },
        {
            header: 'İşlem Yapan',
            accessorKey: 'updatedBy',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => <span className="text-zinc-500 text-[13px] font-medium">{info.getValue()}</span>
        }
    ];

    const filteredData = MOCK_TRANSACTIONS.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="font-semibold text-[17px] text-zinc-900 tracking-tight">Kasa Hareketleri</h3>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtrele
                    </Button>
                    <Button variant="primary" size="sm">
                        <Plus className="mr-1.5 h-4 w-4" />
                        Yeni İşlem Ekle
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-zinc-50 p-2 rounded-xl border border-zinc-200/80 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                        placeholder="Açıklama veya Kategori Ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-zinc-900 placeholder:text-zinc-400 transition-all shadow-sm"
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
