import { useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataGrid } from '@/components/shared/DataGrid';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SlidersHorizontal, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';

type UpdateTarget = 'price' | 'stock' | 'status';

type UpdateMode = 'set' | 'increase' | 'decrease' | 'increase_percent' | 'decrease_percent';

type ProductPreview = {
    id: string;
    name: string;
    price: number;
    stock: number;
    status: 'active' | 'inactive';
    nextPrice: number;
    nextStock: number;
    nextStatus: 'active' | 'inactive';
};

const TARGET_OPTIONS: { value: UpdateTarget; label: string }[] = [
    { value: 'price', label: 'Fiyat' },
    { value: 'stock', label: 'Stok' },
    { value: 'status', label: 'Durum' },
];

const MODE_OPTIONS: Record<UpdateTarget, { value: UpdateMode; label: string }[]> = {
    price: [
        { value: 'set', label: 'Fiyat Belirle' },
        { value: 'increase', label: 'Tutar Artir' },
        { value: 'decrease', label: 'Tutar Azalt' },
        { value: 'increase_percent', label: 'Yuzde Artir' },
        { value: 'decrease_percent', label: 'Yuzde Azalt' },
    ],
    stock: [
        { value: 'set', label: 'Stok Belirle' },
        { value: 'increase', label: 'Stok Artir' },
        { value: 'decrease', label: 'Stok Azalt' },
        { value: 'increase_percent', label: 'Yuzde Artir' },
        { value: 'decrease_percent', label: 'Yuzde Azalt' },
    ],
    status: [{ value: 'set', label: 'Durum Degistir' }],
};

const STATUS_OPTIONS = [
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Pasif' },
];

const MOCK_PRODUCTS = [
    { id: 'PRD-1001', name: 'Slim Fit Gomlek', price: 799, stock: 12, status: 'active' as const },
    { id: 'PRD-1002', name: 'Keten Pantolon', price: 1099, stock: 8, status: 'active' as const },
    { id: 'PRD-1003', name: 'Uzun Triko Elbise', price: 1299, stock: 4, status: 'inactive' as const },
];

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);

export const BulkUpdate = () => {
    const [target, setTarget] = useState<UpdateTarget>('price');
    const [mode, setMode] = useState<UpdateMode>('set');
    const [value, setValue] = useState('');
    const [statusValue, setStatusValue] = useState<'active' | 'inactive'>('active');

    useEffect(() => {
        if (!MODE_OPTIONS[target].find((m) => m.value === mode)) {
            setMode(MODE_OPTIONS[target][0].value);
        }
    }, [target, mode]);

    const previewData: ProductPreview[] = useMemo(() => {
        const numericValue = Number(value);
        return MOCK_PRODUCTS.map((p) => {
            let nextPrice = p.price;
            let nextStock = p.stock;
            let nextStatus = p.status;

            if (target === 'price' && !Number.isNaN(numericValue)) {
                switch (mode) {
                    case 'set':
                        nextPrice = numericValue;
                        break;
                    case 'increase':
                        nextPrice = p.price + numericValue;
                        break;
                    case 'decrease':
                        nextPrice = Math.max(0, p.price - numericValue);
                        break;
                    case 'increase_percent':
                        nextPrice = p.price * (1 + numericValue / 100);
                        break;
                    case 'decrease_percent':
                        nextPrice = p.price * (1 - numericValue / 100);
                        break;
                }
            }

            if (target === 'stock' && !Number.isNaN(numericValue)) {
                switch (mode) {
                    case 'set':
                        nextStock = Math.max(0, Math.round(numericValue));
                        break;
                    case 'increase':
                        nextStock = p.stock + Math.round(numericValue);
                        break;
                    case 'decrease':
                        nextStock = Math.max(0, p.stock - Math.round(numericValue));
                        break;
                    case 'increase_percent':
                        nextStock = Math.max(0, Math.round(p.stock * (1 + numericValue / 100)));
                        break;
                    case 'decrease_percent':
                        nextStock = Math.max(0, Math.round(p.stock * (1 - numericValue / 100)));
                        break;
                }
            }

            if (target === 'status') {
                nextStatus = statusValue;
            }

            return {
                ...p,
                nextPrice,
                nextStock,
                nextStatus,
            };
        });
    }, [target, mode, value, statusValue]);

    const modeOptions = useMemo(
        () => MODE_OPTIONS[target].map((option) => ({ value: option.value, label: option.label })),
        [target]
    );

    const columns: ColumnDef<ProductPreview>[] = [
        {
            accessorKey: 'name',
            header: 'Urun',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-[13px] text-zinc-900">{row.original.name}</span>
                    <span className="text-[11px] text-zinc-500 font-mono">{row.original.id}</span>
                </div>
            ),
        },
        {
            accessorKey: 'price',
            header: 'Fiyat / Yeni',
            cell: ({ row }) => (
                <div className="text-[12px]">
                    <div className="text-zinc-500">{formatCurrency(row.original.price)}</div>
                    <div className="font-bold text-zinc-900">{formatCurrency(row.original.nextPrice)}</div>
                </div>
            ),
        },
        {
            accessorKey: 'stock',
            header: 'Stok / Yeni',
            cell: ({ row }) => (
                <div className="text-[12px]">
                    <div className="text-zinc-500">{row.original.stock}</div>
                    <div className="font-bold text-zinc-900">{row.original.nextStock}</div>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Durum / Yeni',
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    <Badge variant={row.original.status === 'active' ? 'success' : 'neutral'}>
                        {row.original.status === 'active' ? 'Aktif' : 'Pasif'}
                    </Badge>
                    <Badge variant={row.original.nextStatus === 'active' ? 'success' : 'neutral'}>
                        {row.original.nextStatus === 'active' ? 'Aktif' : 'Pasif'}
                    </Badge>
                </div>
            ),
        },
    ];

    const handleApply = () => {
        toast.success('Toplu guncelleme taslagi hazirlandi', { className: 'font-medium' });
    };

    return (
        <div className="space-y-6">
            <div>
                <PageHeader title="Toplu Güncelleme" />
                <p className="text-[13px] font-medium text-zinc-500 mt-1">Secili urunlerde fiyat, stok veya durum degistirin.</p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-zinc-100 rounded-xl">
                        <SlidersHorizontal className="h-5 w-5 text-zinc-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900">Guncelleme Ayarlari</h3>
                        <p className="text-[13px] text-zinc-500">Hangi alani nasil guncellemek istediginizi secin.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <Select
                        label="Hedef Alan"
                        options={TARGET_OPTIONS}
                        value={target}
                        onChange={(e) => setTarget(e.target.value as UpdateTarget)}
                    />
                    <Select
                        label="Islem"
                        options={modeOptions}
                        value={mode}
                        onChange={(e) => setMode(e.target.value as UpdateMode)}
                    />
                    {target === 'status' ? (
                        <Select
                            label="Yeni Durum"
                            options={STATUS_OPTIONS}
                            value={statusValue}
                            onChange={(e) => setStatusValue(e.target.value as 'active' | 'inactive')}
                        />
                    ) : (
                        <Input
                            label="Deger"
                            type="number"
                            placeholder="0"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                        />
                    )}
                </div>

                <div className="flex justify-end">
                    <Button icon={<Wand2 className="h-4 w-4" />} className="font-semibold shadow-md" onClick={handleApply}>
                        Onizleme Uygula
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm">
                <h3 className="text-[15px] font-bold text-zinc-900 mb-4">Onizleme</h3>
                <DataGrid data={previewData} columns={columns} />
            </div>
        </div>
    );
};
