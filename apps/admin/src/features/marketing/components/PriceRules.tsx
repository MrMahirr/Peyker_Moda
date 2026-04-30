import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataGrid } from '@/components/shared/DataGrid';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TrendingUp } from 'lucide-react';

interface PriceRule {
    id: string;
    name: string;
    scope: string;
    discount: string;
    isActive: boolean;
}

const INITIAL_RULES: PriceRule[] = [
    { id: 'pr-1', name: 'VIP Musteri', scope: 'VIP grup', discount: '%10', isActive: true },
    { id: 'pr-2', name: 'Toptan Fiyat', scope: 'Toptan grup', discount: '%5', isActive: true },
    { id: 'pr-3', name: 'Sezon Sonu', scope: 'Tumu', discount: '%30', isActive: false },
];

export const PriceRules = () => {
    const [rules, setRules] = useState<PriceRule[]>(INITIAL_RULES);

    const toggleRule = (id: string) => {
        setRules((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)));
    };

    const columns: ColumnDef<PriceRule>[] = [
        { accessorKey: 'name', header: 'Kural' },
        { accessorKey: 'scope', header: 'Kapsam' },
        { accessorKey: 'discount', header: 'Indirim' },
        {
            accessorKey: 'isActive',
            header: 'Durum',
            cell: ({ row }) => (
                <Badge variant={row.original.isActive ? 'success' : 'neutral'}>
                    {row.original.isActive ? 'Aktif' : 'Pasif'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-500 hover:text-emerald-600"
                        onClick={() => toggleRule(row.original.id)}
                    >
                        {row.original.isActive ? 'Kapat' : 'Ac'}
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100/50">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-zinc-900">Fiyat Kurallari</h2>
                    <p className="text-[13px] text-zinc-500">Segment bazli fiyat ve indirim kurallarini yonetin.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm">
                <DataGrid data={rules} columns={columns} />
            </div>
        </div>
    );
};
