import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { PermissionTree, PermissionGroup } from './PermissionTree';
import { toast } from 'sonner';
import { staffService, RoleInput } from '../services/staff.service';
import type { Permission } from '../types';

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    permissions: Permission[];
    onSuccess: () => void;
    initialRole?: any; // Role type
}

const titleCase = (value: string) =>
    value
        .split('-')
        .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
        .join(' ');

const normalizeRoleKey = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

export const RoleModal = ({ isOpen, onClose, permissions, onSuccess, initialRole }: RoleModalProps) => {
    const [name, setName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialRole) {
                setName(initialRole.name);
                setDisplayName(initialRole.name);
                setDescription(initialRole.description || '');
                const permStrings = initialRole.permissions.map((pid: string) => {
                    const p = permissions.find((x) => x.id === pid);
                    return p ? p.name : null;
                }).filter(Boolean) as string[];
                setSelectedPermissions(permStrings);
            } else {
                setName('');
                setDisplayName('');
                setDescription('');
                setSelectedPermissions([]);
            }
        }
    }, [isOpen, initialRole, permissions]);

    const permissionGroups = useMemo<PermissionGroup[]>(() => {
        const map = new Map<string, { id: string; label: string }[]>();

        permissions.forEach((perm) => {
            const [resource, action] = perm.name.split(':');
            if (!resource || !action) return;
            const label = `${resource}:${action}`;
            if (!map.has(resource)) {
                map.set(resource, []);
            }
            map.get(resource)?.push({ id: perm.name, label });
        });

        return Array.from(map.entries())
            .map(([resource, perms]) => ({
                id: resource,
                label: titleCase(resource),
                permissions: perms.sort((a, b) => a.label.localeCompare(b.label, 'tr')),
            }))
            .sort((a, b) => a.label.localeCompare(b.label, 'tr'));
    }, [permissions]);

    const handleSubmit = async () => {
        if (!displayName.trim()) {
            toast.error('Rol adi zorunludur.', { className: 'font-medium' });
            return;
        }
        const normalizedName = name.trim() ? normalizeRoleKey(name) : normalizeRoleKey(displayName);
        if (!normalizedName) {
            toast.error('Rol anahtari gecersiz.', { className: 'font-medium' });
            return;
        }

        const permissionPayload = selectedPermissions
            .map((perm) => {
                const [resource, action] = perm.split(':');
                if (!resource || !action) return null;
                return { resource, action };
            })
            .filter(Boolean) as RoleInput['permissions'];

        try {
            setSaving(true);
            if (initialRole) {
                // Sadece izinleri güncelle veya displayName vs.
                await staffService.updateRole(initialRole.id, {
                    displayName: displayName.trim(),
                    description: description.trim() || undefined,
                });
                await staffService.assignPermissions(initialRole.id, permissionPayload);
                toast.success('Rol başarıyla güncellendi', { className: 'font-medium' });
            } else {
                await staffService.createRole({
                    name: normalizedName,
                    displayName: displayName.trim(),
                    description: description.trim() || undefined,
                    permissions: permissionPayload,
                });
                toast.success('Yeni rol oluşturuldu', { className: 'font-medium' });
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'İşlem başarısız', { className: 'font-medium' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            title={initialRole ? "Rolü Düzenle" : "Yeni Rol Ekle"}
            description="Rol detaylarini ve izinlerini belirleyin."
        >
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
                <div className="grid md:grid-cols-2 gap-4">
                    <Input
                        label="Rol Anahtari"
                        placeholder="ornek: editor"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={!!initialRole} // Düzenlerken anahtar değiştirilemez
                    />
                    <Input
                        label="Rol Adi"
                        placeholder="Ornek: Editor"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />
                </div>

                <Textarea
                    label="Aciklama"
                    placeholder="Rolun sorumluluklarini kisaca yazin."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <div className="bg-zinc-50 border border-zinc-200/70 rounded-2xl p-4">
                    {permissionGroups.length === 0 ? (
                        <p className="text-sm text-zinc-500">
                            Izin listesi bulunamadi. Once mevcut roller veya izinler olusturulmali.
                        </p>
                    ) : (
                        <PermissionTree
                            groups={permissionGroups}
                            value={selectedPermissions}
                            onChange={setSelectedPermissions}
                        />
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="secondary" onClick={onClose} disabled={saving}>
                        Iptal
                    </Button>
                    <Button onClick={handleSubmit} loading={saving} className="font-semibold">
                        Kaydet
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
