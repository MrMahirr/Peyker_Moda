import { useEffect, useMemo, useState } from 'react';
import { showDeleteConfirm } from '@/utils/swal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import {
    Loader2,
    Pencil,
    Plus,
    Tag,
    Trash,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    priceListsService,
    type CreatePriceListDto,
    type PriceList,
    type PriceListAdjustmentType,
    type PriceListMetadata,
    type PriceListScopeType,
} from '../services/price-lists.service';
import { PageHeader } from '@/components/shared/PageHeader';

const emptyForm: CreatePriceListDto = {
    name: '',
    description: '',
    customerGroupId: '',
    scopeType: 'ALL_PRODUCTS',
    categoryId: '',
    productId: '',
    adjustmentType: 'PERCENTAGE_DISCOUNT',
    amount: 0,
    priority: 1,
    isActive: true,
    startsAt: '',
    endsAt: '',
};

const scopeOptions = [
    { value: 'ALL_PRODUCTS', label: 'Tum urunler' },
    { value: 'CATEGORY', label: 'Kategori bazli' },
    { value: 'PRODUCT', label: 'Urun bazli' },
];

const adjustmentOptions = [
    { value: 'PERCENTAGE_DISCOUNT', label: 'Yuzdesel indirim' },
    { value: 'FIXED_DISCOUNT', label: 'Tutar indirimi' },
    { value: 'FIXED_PRICE', label: 'Sabit fiyat' },
];

const statusVariantMap: Record<PriceList['effectiveStatus'], 'success' | 'warning' | 'error' | 'neutral'> = {
    ACTIVE: 'success',
    INACTIVE: 'neutral',
    SCHEDULED: 'warning',
    EXPIRED: 'error',
};

const statusLabelMap: Record<PriceList['effectiveStatus'], string> = {
    ACTIVE: 'Aktif',
    INACTIVE: 'Pasif',
    SCHEDULED: 'Zamanlanmis',
    EXPIRED: 'Suresi dolmus',
};

export const PriceListManager = () => {
    const [priceLists, setPriceLists] = useState<PriceList[]>([]);
    const [metadata, setMetadata] = useState<PriceListMetadata>({
        customerGroups: [],
        categories: [],
        products: [],
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreatePriceListDto>(emptyForm);

    useEffect(() => {
        void loadData();
    }, []);

    const nextPriority = useMemo(() => {
        if (priceLists.length === 0) {
            return 1;
        }

        return Math.max(...priceLists.map((priceList) => priceList.priority)) + 1;
    }, [priceLists]);

    const scopeTargetOptions = useMemo(() => {
        if (formData.scopeType === 'CATEGORY') {
            return metadata.categories.map((category) => ({
                value: category.id,
                label: category.name,
            }));
        }

        if (formData.scopeType === 'PRODUCT') {
            return metadata.products.map((product) => ({
                value: product.id,
                label: `${product.name} (${product.sku})`,
            }));
        }

        return [];
    }, [formData.scopeType, metadata.categories, metadata.products]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [lists, meta] = await Promise.all([
                priceListsService.getAll(),
                priceListsService.getMetadata(),
            ]);
            setPriceLists(lists);
            setMetadata(meta);
        } catch {
            toast.error('Fiyat listesi verileri yuklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            ...emptyForm,
            priority: nextPriority,
        });
        setShowForm(false);
    };

    const openCreateForm = () => {
        setEditingId(null);
        setFormData({
            ...emptyForm,
            priority: nextPriority,
        });
        setShowForm(true);
    };

    const openEditForm = (priceList: PriceList) => {
        setEditingId(priceList.id);
        setFormData({
            name: priceList.name,
            description: priceList.description ?? '',
            customerGroupId: priceList.customerGroupId ?? '',
            scopeType: priceList.scopeType,
            categoryId: priceList.categoryId ?? '',
            productId: priceList.productId ?? '',
            adjustmentType: priceList.adjustmentType,
            amount: priceList.amount,
            priority: priceList.priority,
            isActive: priceList.isActive,
            startsAt: priceList.startsAt ? toDateTimeInputValue(priceList.startsAt) : '',
            endsAt: priceList.endsAt ? toDateTimeInputValue(priceList.endsAt) : '',
        });
        setShowForm(true);
    };

    const handleScopeChange = (scopeType: PriceListScopeType) => {
        setFormData((current) => ({
            ...current,
            scopeType,
            categoryId: '',
            productId: '',
        }));
    };

    const buildPayload = (): CreatePriceListDto | null => {
        if (!formData.name.trim()) {
            toast.error('Liste adi zorunludur');
            return null;
        }

        if (formData.amount <= 0) {
            toast.error('Tutar sifirdan buyuk olmalidir');
            return null;
        }

        if (formData.scopeType === 'CATEGORY' && !formData.categoryId) {
            toast.error('Kategori secilmelidir');
            return null;
        }

        if (formData.scopeType === 'PRODUCT' && !formData.productId) {
            toast.error('Urun secilmelidir');
            return null;
        }

        return {
            name: formData.name.trim(),
            description: formData.description?.trim() || undefined,
            customerGroupId: formData.customerGroupId || undefined,
            scopeType: formData.scopeType,
            categoryId:
                formData.scopeType === 'CATEGORY' ? formData.categoryId || undefined : undefined,
            productId:
                formData.scopeType === 'PRODUCT' ? formData.productId || undefined : undefined,
            adjustmentType: formData.adjustmentType,
            amount: Number(formData.amount),
            priority: Number(formData.priority) || 1,
            isActive: formData.isActive ?? true,
            startsAt: formData.startsAt ? toIsoDateTime(formData.startsAt) : undefined,
            endsAt: formData.endsAt ? toIsoDateTime(formData.endsAt) : undefined,
        };
    };

    const handleSave = async () => {
        const payload = buildPayload();

        if (!payload) {
            return;
        }

        try {
            setSaving(true);

            if (editingId) {
                const updated = await priceListsService.update(editingId, payload);
                setPriceLists((current) =>
                    current
                        .map((priceList) => (priceList.id === editingId ? updated : priceList))
                        .sort((left, right) => left.priority - right.priority),
                );
                toast.success('Fiyat listesi guncellendi');
            } else {
                const created = await priceListsService.create(payload);
                setPriceLists((current) =>
                    [...current, created].sort((left, right) => left.priority - right.priority),
                );
                toast.success('Fiyat listesi eklendi');
            }

            resetForm();
        } catch {
            toast.error('Fiyat listesi kaydedilemedi');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (priceList: PriceList) => {
        try {
            const updated = await priceListsService.update(priceList.id, {
                isActive: !priceList.isActive,
            });
            setPriceLists((current) =>
                current.map((item) => (item.id === priceList.id ? updated : item)),
            );
            toast.success('Durum guncellendi');
        } catch {
            toast.error('Durum guncellenemedi');
        }
    };

    const handleDelete = async (id: string) => {
        const result = await showDeleteConfirm('Fiyat Listesini Sil?', 'Bu fiyat listesi kalıcı olarak silinecektir.');
        if (result.isConfirmed) {
            try {
                await priceListsService.delete(id);
                setPriceLists((current) => current.filter((priceList) => priceList.id !== id));
                toast.success('Fiyat listesi silindi');
            } catch {
                toast.error('Fiyat listesi silinemedi');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <PageHeader title="Fiyat Listeleri" />
                    <p className="text-zinc-500">Musteri segmentlerine ozel fiyat ve indirim listeleri.</p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />} onClick={openCreateForm}>
                    Yeni Liste
                </Button>
            </div>

            <Modal
                isOpen={showForm}
                onClose={resetForm}
                title={editingId ? 'Fiyat Listesi Guncelle' : 'Yeni Fiyat Listesi'}
                description={editingId ? 'Fiyat listesi detaylarini guncelleyin.' : 'Musterilerinize ozel fiyat ve indirimler tanimlayin.'}
                size="lg"
            >
                <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Input
                            label="Liste Adi"
                            value={formData.name}
                            onChange={(event) =>
                                setFormData((current) => ({ ...current, name: event.target.value }))
                            }
                        />
                        <Select
                            label="Musteri Grubu"
                            value={formData.customerGroupId ?? ''}
                            onChange={(event) =>
                                setFormData((current) => ({
                                    ...current,
                                    customerGroupId: event.target.value,
                                }))
                            }
                            options={[
                                { value: '', label: 'Tum musteriler' },
                                ...metadata.customerGroups.map((group) => ({
                                    value: group.id,
                                    label: group.name,
                                })),
                            ]}
                        />
                        <Select
                            label="Kapsam"
                            value={formData.scopeType}
                            onChange={(event) =>
                                handleScopeChange(event.target.value as PriceListScopeType)
                            }
                            options={scopeOptions}
                        />
                        <Select
                            label="Fiyatlama Tipi"
                            value={formData.adjustmentType}
                            onChange={(event) =>
                                setFormData((current) => ({
                                    ...current,
                                    adjustmentType: event.target.value as PriceListAdjustmentType,
                                }))
                            }
                            options={adjustmentOptions}
                        />

                        {formData.scopeType !== 'ALL_PRODUCTS' ? (
                            <Select
                                label={formData.scopeType === 'CATEGORY' ? 'Kategori' : 'Urun'}
                                value={
                                    formData.scopeType === 'CATEGORY'
                                        ? formData.categoryId ?? ''
                                        : formData.productId ?? ''
                                }
                                onChange={(event) =>
                                    setFormData((current) => ({
                                        ...current,
                                        categoryId:
                                            current.scopeType === 'CATEGORY' ? event.target.value : '',
                                        productId:
                                            current.scopeType === 'PRODUCT' ? event.target.value : '',
                                    }))
                                }
                                options={scopeTargetOptions}
                            />
                        ) : null}

                        <Input
                            label={
                                formData.adjustmentType === 'PERCENTAGE_DISCOUNT'
                                    ? 'Indirim Yuzdesi'
                                    : 'Tutar'
                            }
                            type="number"
                            min={0.01}
                            step={0.01}
                            value={String(formData.amount)}
                            onChange={(event) =>
                                setFormData((current) => ({
                                    ...current,
                                    amount: Number(event.target.value) || 0,
                                }))
                            }
                        />
                        <Input
                            label="Oncelik"
                            type="number"
                            min={1}
                            step={1}
                            value={String(formData.priority ?? 1)}
                            onChange={(event) =>
                                setFormData((current) => ({
                                    ...current,
                                    priority: Number(event.target.value) || 1,
                                }))
                            }
                        />
                        <Input
                            label="Baslangic"
                            type="datetime-local"
                            value={formData.startsAt ?? ''}
                            onChange={(event) =>
                                setFormData((current) => ({
                                    ...current,
                                    startsAt: event.target.value,
                                }))
                            }
                        />
                        <Input
                            label="Bitis"
                            type="datetime-local"
                            value={formData.endsAt ?? ''}
                            onChange={(event) =>
                                setFormData((current) => ({
                                    ...current,
                                    endsAt: event.target.value,
                                }))
                            }
                        />
                    </div>

                    <Textarea
                        label="Aciklama"
                        value={formData.description ?? ''}
                        onChange={(event) =>
                            setFormData((current) => ({ ...current, description: event.target.value }))
                        }
                    />

                    <div className="flex items-center gap-2 pt-2 bg-zinc-50 p-4 rounded-xl border border-zinc-200/50">
                        <input
                            type="checkbox"
                            checked={formData.isActive ?? true}
                            onChange={(event) =>
                                setFormData((current) => ({
                                    ...current,
                                    isActive: event.target.checked,
                                }))
                            }
                            className="w-5 h-5 text-blue-600 border-zinc-300 rounded focus:ring-blue-600 cursor-pointer"
                        />
                        <label className="text-[14px] font-semibold text-zinc-800 cursor-pointer" onClick={() => setFormData((c) => ({ ...c, isActive: !c.isActive }))}>
                            Liste aktif
                        </label>
                    </div>

                    <div className="pt-6 border-t border-zinc-100 flex justify-end gap-3">
                        <Button variant="secondary" type="button" onClick={resetForm} disabled={saving} className="font-semibold">
                            Iptal
                        </Button>
                        <Button variant="primary" onClick={handleSave} loading={saving} className="font-bold min-w-[140px]">
                            {editingId ? 'Guncelle' : 'Kaydet'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {priceLists.length === 0 ? (
                <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
                    <p className="text-zinc-500">Henuz hic fiyat listesi olusturulmamis.</p>
                    <Button variant="secondary" className="mt-4" onClick={openCreateForm}>
                        Ilk Listeyi Olustur
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {priceLists.map((priceList) => (
                        <div
                            key={priceList.id}
                            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold text-zinc-900">{priceList.name}</p>
                                        <Badge variant={statusVariantMap[priceList.effectiveStatus]} dot>
                                            {statusLabelMap[priceList.effectiveStatus]}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-[12px]">
                                        <Badge variant="info">{priceList.scopeLabel}</Badge>
                                        <Badge variant="neutral">
                                            {priceList.customerGroupName ?? 'Tum musteriler'}
                                        </Badge>
                                        <Badge variant="warning">{priceList.adjustmentLabel}</Badge>
                                    </div>
                                    <div className="text-[13px] text-zinc-500">
                                        <p>Hedef: {priceList.targetName ?? 'Tum urunler'}</p>
                                        <p>Oncelik: {priceList.priority}</p>
                                        {priceList.description ? <p>{priceList.description}</p> : null}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => void handleToggleActive(priceList)}
                                    >
                                        <Tag className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openEditForm(priceList)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => void handleDelete(priceList.id)}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const toDateTimeInputValue = (value: string) => {
    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
};

const toIsoDateTime = (value: string) => new Date(value).toISOString();
