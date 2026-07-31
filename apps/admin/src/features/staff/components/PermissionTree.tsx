import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

export interface PermissionNode {
    id: string;
    label: string;
    description?: string;
}

export interface PermissionGroup {
    id: string;
    label: string;
    permissions: PermissionNode[];
}

interface PermissionTreeProps {
    groups?: PermissionGroup[];
    value?: string[];
    onChange?: (value: string[]) => void;
}

const DEFAULT_GROUPS: PermissionGroup[] = [
    {
        id: 'catalog',
        label: 'Katalog',
        permissions: [
            { id: 'catalog.view', label: 'Urunleri goruntule' },
            { id: 'catalog.create', label: 'Urun ekle' },
            { id: 'catalog.update', label: 'Urun guncelle' },
            { id: 'catalog.delete', label: 'Urun sil' },
        ],
    },
    {
        id: 'orders',
        label: 'Siparisler',
        permissions: [
            { id: 'orders.view', label: 'Siparisleri goruntule' },
            { id: 'orders.update', label: 'Durum guncelle' },
            { id: 'orders.refund', label: 'Iade islemi' },
        ],
    },
    {
        id: 'crm',
        label: 'Musteriler',
        permissions: [
            { id: 'crm.view', label: 'Musteri listesi' },
            { id: 'crm.update', label: 'Musteri guncelle' },
            { id: 'crm.note', label: 'Musteri notu' },
        ],
    },
    {
        id: 'accounting',
        label: 'Muhasebe',
        permissions: [
            { id: 'accounting.view', label: 'Raporlari goruntule' },
            { id: 'accounting.edit', label: 'Kasa islemleri' },
        ],
    },
];

export const PermissionTree = ({ groups = DEFAULT_GROUPS, value, onChange }: PermissionTreeProps) => {
    const [selected, setSelected] = useState<string[]>(value || []);

    useEffect(() => {
        if (value) {
            setSelected(value);
        }
    }, [value]);

    const togglePermission = (id: string) => {
        setSelected((prev) => {
            const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
            onChange?.(next);
            return next;
        });
    };

    const toggleGroup = (group: PermissionGroup) => {
        setSelected((prev) => {
            const groupIds = group.permissions.map((p) => p.id);
            const isAllSelected = groupIds.every((id) => prev.includes(id));
            const next = isAllSelected
                ? prev.filter((id) => !groupIds.includes(id))
                : Array.from(new Set([...prev, ...groupIds]));
            onChange?.(next);
            return next;
        });
    };

    const groupState = (group: PermissionGroup) => {
        const ids = group.permissions.map((p) => p.id);
        const selectedCount = ids.filter((id) => selected.includes(id)).length;
        return {
            all: selectedCount === ids.length,
            partial: selectedCount > 0 && selectedCount < ids.length,
            count: selectedCount,
        };
    };

    const totalSelected = useMemo(() => selected.length, [selected]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-zinc-900">Yetki Agaci</h3>
                    <p className="text-[13px] text-zinc-500">Rol icin modullere gore izinleri secin.</p>
                </div>
                <div className="text-[12px] text-zinc-500 font-medium">{totalSelected} izin secili</div>
            </div>

            <div className="space-y-3">
                {groups.map((group) => {
                    const state = groupState(group);
                    return (
                        <div key={group.id} className="bg-white rounded-xl border border-zinc-200/80 p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                                    <input
                                        type="checkbox"
                                        checked={state.all}
                                        onChange={() => toggleGroup(group)}
                                        className="h-4 w-4 rounded border-zinc-300"
                                    />
                                    {group.label}
                                </label>
                                <span className={cn('text-xs font-medium', state.partial ? 'text-amber-600' : 'text-zinc-400')}>
                                    {state.count}/{group.permissions.length}
                                </span>
                            </div>

                            <div className="mt-3 grid md:grid-cols-2 gap-2">
                                {group.permissions.map((perm) => (
                                    <label key={perm.id} className="flex items-center gap-2 text-[13px] text-zinc-700">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(perm.id)}
                                            onChange={() => togglePermission(perm.id)}
                                            className="h-4 w-4 rounded border-zinc-300"
                                        />
                                        {perm.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
