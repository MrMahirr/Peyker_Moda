import { ColumnDef } from '@tanstack/react-table';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { showDeleteConfirm } from '@/utils/swal';

// Define the type for our staff user
export type StaffUser = {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Editor' | 'Sales';
    status: 'Active' | 'Inactive';
    lastLogin: string;
};

// Mock data
const mockData: StaffUser[] = [
    {
        id: '1',
        name: 'Mahir Gündüz',
        email: 'mahir@peyker.com',
        role: 'Admin',
        status: 'Active',
        lastLogin: '2024-01-22 10:30',
    },
    {
        id: '2',
        name: 'Ayşe Yılmaz',
        email: 'ayse@peyker.com',
        role: 'Sales',
        status: 'Active',
        lastLogin: '2024-01-21 15:45',
    },
    {
        id: '3',
        name: 'Mehmet Demir',
        email: 'mehmet@peyker.com',
        role: 'Editor',
        status: 'Inactive',
        lastLogin: '2024-01-15 09:00',
    },
];

export const UserList = () => {

    const columns: ColumnDef<StaffUser>[] = [
        {
            accessorKey: 'name',
            header: 'Personel Adı',
            cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
        },
        {
            accessorKey: 'email',
            header: 'E-posta',
        },
        {
            accessorKey: 'role',
            header: 'Rol',
            cell: ({ row }) => {
                const role = row.getValue('role') as string;
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                        role === 'Sales' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                        {role}
                    </span>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Durum',
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                return (
                    <div className="flex items-center">
                        <div className={`h-2.5 w-2.5 rounded-full mr-2 ${status === 'Active' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                        {status === 'Active' ? 'Aktif' : 'Pasif'}
                    </div>
                )
            }
        },
        {
            accessorKey: 'lastLogin',
            header: 'Son Giriş',
        },
        {
            id: 'actions',
            cell: () => {
                return (
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                            onClick={() => {
                                showDeleteConfirm('Personeli Sil?', 'Bu hesaba ait erişim kapatılacak.').then((result) => {
                                    if (result.isConfirmed) {
                                        toast.success('Kullanıcı silindi (Mock)');
                                    }
                                });
                            }}
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Personel Listesi</h2>
                    <p className="text-sm text-slate-500">Sistemdeki kullanıcıları ve yetkilerini yönetin.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Personel
                </Button>
            </div>

            <DataGrid
                columns={columns}
                data={mockData}
                searchKey="name"
            />
        </div>
    );
};
