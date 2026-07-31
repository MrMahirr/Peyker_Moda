import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Shield, Plus, Loader2, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { staffService } from '../services/staff.service';
import type { Role, Permission } from '../types';
import { RoleModal } from './RoleModal';

const RESOURCE_LABELS: Record<string, string> = {
    products: 'Urun',
    categories: 'Kategori',
    variants: 'Varyant',
    orders: 'Siparis',
    customers: 'Musteri',
    'customer-groups': 'Musteri grubu',
    transactions: 'Islem',
    invoices: 'Fatura',
    campaigns: 'Kampanya',
    coupons: 'Kupon',
    pos: 'POS',
    dashboard: 'Gosterge Paneli',
    users: 'Kullanici',
    roles: 'Rol',
    settings: 'Ayarlar',
    media: 'Medya',
    'audit-logs': 'Denetim Kaydi',
    cms: 'CMS',
    cargo: 'Kargo',
};

const ACTION_LABELS: Record<string, string> = {
    create: 'olusturma',
    read: 'goruntuleme',
    update: 'guncelleme',
    delete: 'silme',
};

const titleCase = (value: string) =>
    value
        .split('-')
        .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
        .join(' ');

export const RoleManager = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | undefined>();
    const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});

    const openCreateModal = () => {
        setEditingRole(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (role: Role) => {
        setEditingRole(role);
        setIsModalOpen(true);
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [r, p] = await Promise.all([staffService.getRoles(), staffService.getPermissions()]);
            setRoles(r || []);
            setPermissions(p || []);
        } catch {
            toast.error('Yetki/Rol verileri yuklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const getPermissionLabel = (permId: string) => {
        const perm = permissions.find((x) => x.id === permId);
        const raw = perm?.name || permId;
        if (!raw.includes(':')) return raw;
        const [resource, action] = raw.split(':');
        const resourceLabel = RESOURCE_LABELS[resource] || titleCase(resource);
        const actionLabel = ACTION_LABELS[action] || action;
        return `${resourceLabel} ${actionLabel} izni`;
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-zinc-900" /></div>;

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div><h2 className="text-xl font-bold text-zinc-900">Rol & Yetki Yonetimi</h2><p className="text-[13px] text-zinc-500 mt-1">Personel rollerini ve erisim yetkilerini yonetin.</p></div>
                <Button icon={<Plus className="w-4 h-4" />} className="font-semibold shadow-md" onClick={openCreateModal}>Yeni Rol</Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
                {roles.map(role => (
                    <div key={role.id} className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-red-50 rounded-xl"><Shield className="h-5 w-5 text-red-600" /></div>
                                <div><h3 className="font-bold text-zinc-900">{role.name}</h3><span className="text-[11px] text-zinc-500">{role.description}</span></div>
                            </div>
                            <div className="flex items-center gap-2">
                                {role.isSystem && <Badge variant="neutral">Sistem</Badge>}
                                <button 
                                    onClick={() => openEditModal(role)}
                                    title="Rolü Düzenle"
                                    className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-[12px] text-zinc-500">{role.permissions.length} izin</span>
                            <button
                                onClick={() => setExpandedRoles((prev) => ({ ...prev, [role.id]: !prev[role.id] }))}
                                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-zinc-600 hover:text-zinc-900"
                            >
                                Yetkiler
                                {expandedRoles[role.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                        </div>

                        {expandedRoles[role.id] && (
                            <div className="mt-4 space-y-2">
                                {role.permissions.map((p) => (
                                    <div key={p} className="text-[12px] text-zinc-700 bg-zinc-50 border border-zinc-200/70 px-3 py-2 rounded-lg">
                                        {getPermissionLabel(p)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <RoleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                permissions={permissions}
                onSuccess={loadData}
                initialRole={editingRole}
            />
        </div>
    );
};
