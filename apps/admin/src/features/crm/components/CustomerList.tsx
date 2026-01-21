import { useState } from 'react';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Eye, Edit, Trash, Mail, Phone, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { showDeleteConfirm } from '@/utils/swal';

// Mock Customer Data
const MOCK_CUSTOMERS = [
    { id: '1', name: 'Ayşe Yılmaz', email: 'ayse@example.com', phone: '0555 123 45 67', totalSpent: 15400.50, lastVisit: '2024-01-20', group: 'VIP' },
    { id: '2', name: 'Mehmet Demir', email: 'mehmet@example.com', phone: '0532 987 65 43', totalSpent: 2350.00, lastVisit: '2024-01-15', group: 'Standart' },
    { id: '3', name: 'Zeynep Kaya', email: 'zeynep@example.com', phone: '0544 333 22 11', totalSpent: 8900.25, lastVisit: '2024-01-18', group: 'Sadık' },
    { id: '4', name: 'Ali Vural', email: 'ali@example.com', phone: '0505 555 55 55', totalSpent: 450.00, lastVisit: '2023-12-30', group: 'Yeni' },
    { id: '5', name: 'Fatma Çelik', email: 'fatma@example.com', phone: '0530 111 22 33', totalSpent: 12000.00, lastVisit: '2024-01-21', group: 'VIP' },
];

export const CustomerList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const columns = [
        {
            header: 'Müşteri Adı',
            accessorKey: 'name',
            cell: (info: any) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-900">{info.getValue()}</span>
                    <span className="text-xs text-slate-500">{info.row.original.group}</span>
                </div>
            )
        },
        {
            header: 'İletişim',
            accessorKey: 'contact',
            cell: (info: any) => (
                <div className="flex flex-col text-sm text-slate-600 gap-1">
                    <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-slate-400" />
                        {info.row.original.email}
                    </div>
                    <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {info.row.original.phone}
                    </div>
                </div>
            )
        },
        {
            header: 'Toplam Harcama',
            accessorKey: 'totalSpent',
            cell: (info: any) => (
                <span className="font-semibold text-indigo-600">
                    {info.getValue().toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
            )
        },
        {
            header: 'Son Ziyaret',
            accessorKey: 'lastVisit',
        },
        {
            header: 'İşlemler',
            id: 'actions',
            cell: (info: any) => (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                        onClick={() => navigate(`/crm/${info.row.original.id}`)}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-amber-600">
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-red-500"
                        onClick={() => {
                            showDeleteConfirm('Müşteriyi Sil?', 'Bu işlem geri alınamaz!').then((result) => {
                                if (result.isConfirmed) {
                                    toast.success('Müşteri silindi (Mock)');
                                }
                            });
                        }}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    const filteredData = MOCK_CUSTOMERS.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Müşteri Listesi</h1>
                    <p className="text-slate-500">Müşterilerinizi yönetin ve satışlarını takip edin.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Müşteri
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="İsim, E-posta veya Telefon ile ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-slate-50"
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
