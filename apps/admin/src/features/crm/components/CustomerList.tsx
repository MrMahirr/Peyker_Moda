import { useEffect, useState } from 'react';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Eye, Edit, Trash, Mail, Phone, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { showDeleteConfirm } from '@/utils/swal';
import { customersService, Customer } from '../api/customerService';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
};

export const CustomerList = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await customersService.getAll({ limit: 50 });
                setCustomers(response.data || []);
            } catch (err) {
                console.error('Customers fetch error:', err);
                toast.error('Müşteriler yüklenemedi');
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    const handleDelete = async (id: string) => {
        const result = await showDeleteConfirm('Müşteriyi Sil?', 'Bu işlem geri alınamaz!');
        if (result.isConfirmed) {
            try {
                await customersService.delete(id);
                setCustomers(customers.filter(c => c.id !== id));
                toast.success('Müşteri silindi');
            } catch (err) {
                console.error('Delete error:', err);
                toast.error('Müşteri silinemedi');
            }
        }
    };

    const columns = [
        {
            header: 'Müşteri Adı',
            accessorKey: 'firstName',
            cell: (info: any) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-900">
                        {info.row.original.firstName} {info.row.original.lastName}
                    </span>
                    <span className="text-xs text-slate-500">{info.row.original.group?.name || 'Standart'}</span>
                </div>
            )
        },
        {
            header: 'İletişim',
            accessorKey: 'contact',
            cell: (info: any) => (
                <div className="flex flex-col text-sm text-slate-600 gap-1">
                    {info.row.original.email && (
                        <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {info.row.original.email}
                        </div>
                    )}
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
                    {formatCurrency(info.row.original.totalSpent || 0)}
                </span>
            )
        },
        {
            header: 'Sipariş',
            accessorKey: 'orderCount',
            cell: (info: any) => (
                <span className="text-slate-600">{info.row.original.orderCount || 0} sipariş</span>
            )
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
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-amber-600"
                        onClick={() => navigate(`/crm/${info.row.original.id}/edit`)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-red-500"
                        onClick={() => handleDelete(info.row.original.id)}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    const filteredData = customers.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

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
