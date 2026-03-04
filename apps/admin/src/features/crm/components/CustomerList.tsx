import { useEffect, useState } from 'react';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Eye, Edit, Trash, Mail, Phone, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { showDeleteConfirm } from '@/utils/swal';
import { customersService, Customer } from '../api/customerService';
import { Badge } from '@/components/ui/Badge';
import { CustomerFormModal } from './CustomerFormModal';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
};

export const CustomerList = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await customersService.getAll({ limit: 50 });
            setCustomers(response.data || []);
        } catch (err) {
            console.error('Customers fetch error:', err);
            toast.error('Müşteriler yüklenemedi', { className: 'font-medium' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleDelete = async (id: string) => {
        const result = await showDeleteConfirm('Müşteriyi Sil?', 'Bu işlem geri alınamaz!');
        if (result.isConfirmed) {
            try {
                await customersService.delete(id);
                setCustomers(customers.filter(c => c.id !== id));
                toast.success('Müşteri silindi', { className: 'font-medium' });
            } catch (err) {
                console.error('Delete error:', err);
                toast.error('Müşteri silinemedi', { className: 'font-medium' });
            }
        }
    };

    const columns = [
        {
            header: 'Müşteri Adı',
            accessorKey: 'firstName',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => {
                const customer = info.row.original;
                return (
                    <div className="flex flex-col py-1">
                        <span className="font-semibold text-[14px] text-zinc-900">
                            {customer.firstName} {customer.lastName}
                        </span>
                        <div className="mt-1">
                            {customer.group?.name ? (
                                <Badge variant="info" dot>{customer.group.name}</Badge>
                            ) : (
                                <Badge variant="neutral">Standart</Badge>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'İletişim Bilgileri',
            accessorKey: 'contact',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => (
                <div className="flex flex-col text-[13px] text-zinc-600 gap-1.5 justify-center py-1">
                    {info.row.original.email && (
                        <div className="flex items-center gap-1.5 font-medium">
                            <Mail className="h-3.5 w-3.5 text-zinc-400" />
                            {info.row.original.email}
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 font-medium">
                        <Phone className="h-3.5 w-3.5 text-zinc-400" />
                        {info.row.original.phone}
                    </div>
                </div>
            )
        },
        {
            header: 'Hacim',
            accessorKey: 'totalSpent',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => (
                <span className="font-bold font-mono text-[15px] text-zinc-900">
                    {formatCurrency(info.row.original.totalSpent || 0)}
                </span>
            )
        },
        {
            header: 'Siparişler',
            accessorKey: 'orderCount',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => (
                <span className="text-[13px] font-semibold text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200/80 shadow-sm">
                    {info.row.original.orderCount || 0} Adet
                </span>
            )
        },
        {
            header: 'İşlemler',
            id: 'actions',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50"
                        onClick={() => navigate(`/crm/${info.row.original.id}`)}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-amber-600 hover:bg-amber-50"
                        onClick={() => {
                            setEditingCustomer(info.row.original);
                            setIsModalOpen(true);
                        }}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50"
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
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
                <p className="text-[13px] font-medium text-zinc-500">Müşteriler yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-zinc-900">Müşteri Portföyü</h1>
                    <p className="text-[13px] font-medium text-zinc-500 mt-1">Müşteri ilişkilerinizi ve satış geçmişlerini yönetin.</p>
                </div>
                <Button 
                    className="font-semibold shadow-md active:scale-[0.98] transition-all" 
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => {
                        setEditingCustomer(null);
                        setIsModalOpen(true);
                    }}
                >
                    Yeni Müşteri
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-zinc-50 p-2 rounded-xl border border-zinc-200/80 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="İsim, E-posta veya Telefon Ara..."
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

            <CustomerFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                customerToEdit={editingCustomer}
                onSuccess={() => fetchCustomers()}
            />
        </div>
    );
};
