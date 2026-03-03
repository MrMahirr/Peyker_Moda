import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { showDeleteConfirm } from '@/utils/swal';
import { staffService, User } from '../services/staff.service';
import { Badge } from '@/components/ui/Badge';

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
            toast.error('Kullanıcılar yüklenemedi', { className: 'font-medium' });
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
                toast.success('Kullanıcı silindi', { className: 'font-medium' });
            } catch (error) {
                toast.error('Silme işlemi başarısız', { className: 'font-medium' });
            }
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await staffService.toggleStatus(id, !currentStatus);
            setUsers(prev => prev.map(u =>
                u.id === id ? { ...u, isActive: !currentStatus } : u
            ));
            toast.success(!currentStatus ? 'Kullanıcı aktifleştirildi' : 'Kullanıcı pasifleştirildi', { className: 'font-medium py-3 px-4 shadow-xl' });
        } catch (error) {
            toast.error('Durum değiştirilemedi', { className: 'font-medium' });
        }
    };

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'firstName',
            header: 'Personel',
            cell: ({ row }) => (
                <div className="flex flex-col py-1">
                    <span className="font-semibold text-[14px] text-zinc-900">
                        {row.original.firstName} {row.original.lastName}
                    </span>
                    <span className="text-[12px] font-medium text-zinc-500 mt-0.5">{row.original.email}</span>
                </div>
            ),
        },
        {
            accessorKey: 'role',
            header: 'Rol & Yetki',
            cell: ({ row }) => {
                const role = row.original.role;
                return (
                    <Badge variant={role === 'admin' ? 'info' : 'neutral'} dot>
                        {staffService.getRoleLabel(role)}
                    </Badge>
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
                        className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                    >
                        {isActive ? (
                            <Badge variant="success">Aktif Çalışan</Badge>
                        ) : (
                            <Badge variant="error" className="opacity-80">Pasif</Badge>
                        )}
                    </button>
                );
            }
        },
        {
            accessorKey: 'createdAt',
            header: 'Kayıt Tarihi',
            cell: ({ row }) => <span className="text-[13px] font-medium text-zinc-500">{new Date(row.original.createdAt).toLocaleDateString('tr-TR')}</span>,
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                return (
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-amber-600 hover:bg-amber-50">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50"
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
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
                <p className="text-[13px] font-medium text-zinc-500">Personel listesi yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="bg-surface rounded-2xl border border-zinc-200/80 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-[17px] font-semibold tracking-tight text-zinc-900">Sistem Kullanıcıları</h2>
                </div>
                <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
                    Yeni Personel Ekle
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
