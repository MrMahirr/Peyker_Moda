import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Image, Plus, Pencil, Trash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { bannersService, type CreateBannerDto } from '../services/banners.service';
import type { Banner } from '../types';

const emptyForm: CreateBannerDto = {
    title: '',
    imageUrl: '',
    linkUrl: '',
    position: 1,
    isActive: true,
};

export const BannerManager = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateBannerDto>(emptyForm);

    useEffect(() => {
        void loadBanners();
    }, []);

    const nextPosition = useMemo(() => {
        if (banners.length === 0) {
            return 1;
        }

        return Math.max(...banners.map((banner) => banner.position)) + 1;
    }, [banners]);

    const loadBanners = async () => {
        try {
            setLoading(true);
            setBanners(await bannersService.getAll());
        } catch {
            toast.error('Banner verileri yuklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            ...emptyForm,
            position: nextPosition,
        });
        setShowForm(false);
    };

    const openCreateForm = () => {
        setEditingId(null);
        setFormData({
            ...emptyForm,
            position: nextPosition,
        });
        setShowForm(true);
    };

    const openEditForm = (banner: Banner) => {
        setEditingId(banner.id);
        setFormData({
            title: banner.title,
            imageUrl: banner.imageUrl,
            linkUrl: banner.linkUrl ?? '',
            position: banner.position,
            isActive: banner.isActive,
        });
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!formData.title.trim() || !formData.imageUrl.trim()) {
            toast.error('Baslik ve gorsel URL zorunludur');
            return;
        }

        try {
            setSaving(true);

            if (editingId) {
                const updatedBanner = await bannersService.update(editingId, formData);
                setBanners((current) =>
                    current
                        .map((banner) => (banner.id === editingId ? updatedBanner : banner))
                        .sort((left, right) => left.position - right.position),
                );
                toast.success('Banner guncellendi');
            } else {
                const createdBanner = await bannersService.create(formData);
                setBanners((current) =>
                    [...current, createdBanner].sort((left, right) => left.position - right.position),
                );
                toast.success('Banner eklendi');
            }

            resetForm();
        } catch {
            toast.error('Banner kaydedilemedi');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await bannersService.delete(id);
            setBanners((current) => current.filter((banner) => banner.id !== id));
            toast.success('Banner silindi');
        } catch {
            toast.error('Banner silinemedi');
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900">Vitrin / Banner Yonetimi</h2>
                    <p className="text-[13px] text-zinc-500 mt-1">Web sitesi vitrin bannerlarini duzenleyin.</p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />} className="font-semibold shadow-md" onClick={openCreateForm}>
                    Yeni Banner
                </Button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-zinc-900">
                        {editingId ? 'Banner Guncelle' : 'Yeni Banner'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Baslik"
                            value={formData.title}
                            onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                        />
                        <Input
                            label="Gorsel URL"
                            value={formData.imageUrl}
                            onChange={(event) => setFormData((current) => ({ ...current, imageUrl: event.target.value }))}
                        />
                        <Input
                            label="Link URL"
                            value={formData.linkUrl ?? ''}
                            onChange={(event) => setFormData((current) => ({ ...current, linkUrl: event.target.value }))}
                        />
                        <Input
                            label="Pozisyon"
                            type="number"
                            min={1}
                            value={String(formData.position ?? 1)}
                            onChange={(event) =>
                                setFormData((current) => ({
                                    ...current,
                                    position: Number(event.target.value) || 1,
                                }))
                            }
                        />
                    </div>
                    <label className="flex items-center gap-2 text-[13px] font-medium text-zinc-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isActive ?? true}
                            onChange={(event) =>
                                setFormData((current) => ({ ...current, isActive: event.target.checked }))
                            }
                            className="rounded border-zinc-300"
                        />
                        Banner aktif
                    </label>
                    <div className="flex gap-2">
                        <Button onClick={handleSave} loading={saving} className="font-semibold">
                            {editingId ? 'Guncelle' : 'Kaydet'}
                        </Button>
                        <Button variant="ghost" onClick={resetForm} className="font-semibold">
                            Iptal
                        </Button>
                    </div>
                </div>
            )}

            {banners.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 rounded-2xl border border-zinc-200/80">
                    <Image className="w-12 h-12 text-zinc-300 mb-4" />
                    <p className="text-[15px] font-semibold text-zinc-500">Henuz banner eklenmemis</p>
                    <p className="text-[13px] text-zinc-400 mt-1">Sitenizin ana sayfasina banner ekleyin.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {banners.map((banner) => (
                        <div key={banner.id} className="flex items-center gap-4 bg-white rounded-xl border border-zinc-200/80 p-4 shadow-sm">
                            <div className="w-24 h-14 rounded-lg bg-zinc-100 overflow-hidden shrink-0">
                                {banner.imageUrl ? (
                                    <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                                ) : null}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[14px] text-zinc-900">{banner.title}</p>
                                <div className="flex gap-3 text-[12px] text-zinc-500 mt-1">
                                    <span>Pozisyon: {banner.position}</span>
                                    <span>{banner.isActive ? 'Aktif' : 'Pasif'}</span>
                                </div>
                                {banner.linkUrl ? (
                                    <p className="text-[12px] text-zinc-400 truncate mt-1">{banner.linkUrl}</p>
                                ) : null}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openEditForm(banner)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => void handleDelete(banner.id)}>
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
