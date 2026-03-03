import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { showDeleteConfirm } from '@/utils/swal';
import { staffService, User } from '../services/staff.service';

export const UserList = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await staffService.getAll();
            setUsers(data || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Kullanıcılar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const result = await showDeleteConfirm('Personeli Sil?', 'Bu hesaba ait erişim kapatılacak.');
        if (result.isConfirmed) {
            try {
                await staffService.delete(id);
                setUsers(prev => prev.filter(u => u.id !== id));
                toast.success('Kullanıcı silindi');
            } catch (error) {
                toast.error('Silme işlemi başarısız');
            }
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await staffService.toggleStatus(id, !currentStatus);
            setUsers(prev => prev.map(u =>
                u.id === id ? { ...u, isActive: !currentStatus } : u
            ));
            toast.success(!currentStatus ? 'Kullanıcı aktifleştirildi' : 'Kullanıcı pasifleştirildi');
        } catch (error) {
            toast.error('Durum değiştirilemedi');
        }
    };

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'firstName',
            header: 'Personel Adı',
            cell: ({ row }) => (
                <div className="font-medium">
                    {row.original.firstName} {row.original.lastName}
                </div>
            ),
        },
        {
            accessorKey: 'email',
            header: 'E-posta',
        },
        {
            accessorKey: 'role',
            header: 'Rol',
            cell: ({ row }) => {
                const role = row.original.role;
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${staffService.getRoleColor(role)}`}>
                        {staffService.getRoleLabel(role)}
                    </span>
                );
            },
        },
        {
            accessorKey: 'isActive',
            header: 'Durum',
            cell: ({ row }) => {
                const isActive = row.original.isActive;
                return (
                    <button
                        onClick={() => handleToggleStatus(row.original.id, isActive)}
                        className="flex items-center cursor-pointer hover:opacity-70"
                    >
                        <div className={`h-2.5 w-2.5 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                        {isActive ? 'Aktif' : 'Pasif'}
                    </button>
                );
            }
        },
        {
            accessorKey: 'createdAt',
            header: 'Kayıt Tarihi',
            cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('tr-TR'),
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                return (
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                            onClick={() => handleDelete(row.original.id)}
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

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
                data={users}
                searchKey="firstName"
            />
        </div>
    );
};
