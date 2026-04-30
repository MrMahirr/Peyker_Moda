import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { FileText, Loader2, Pencil, Plus, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { cmsService, type CreateCustomPageDto } from '../services/cms.service';
import type { CustomPage } from '../types';

const emptyForm: CreateCustomPageDto = {
    title: '',
    slug: '',
    content: '',
    isPublished: false,
    isSystem: false,
};

export const PageManager = () => {
    const [pages, setPages] = useState<CustomPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
    const [formData, setFormData] = useState<CreateCustomPageDto>(emptyForm);

    useEffect(() => {
        void loadPages();
    }, []);

    const loadPages = async () => {
        try {
            setLoading(true);
            setPages(await cmsService.getPages());
        } catch {
            toast.error('Sayfa verileri yuklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditingPage(null);
        setFormData(emptyForm);
        setIsOpen(true);
    };

    const openEdit = (page: CustomPage) => {
        setEditingPage(page);
        setFormData({
            title: page.title,
            slug: page.slug,
            content: page.content,
            isPublished: page.isPublished,
            isSystem: page.isSystem,
        });
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setEditingPage(null);
        setFormData(emptyForm);
    };

    const handleSave = async () => {
        if (!formData.title.trim() || !formData.content.trim()) {
            toast.error('Baslik ve icerik zorunludur');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                title: formData.title.trim(),
                slug: formData.slug?.trim() || undefined,
                content: formData.content.trim(),
                isPublished: formData.isPublished,
                isSystem: formData.isSystem,
            };

            if (editingPage) {
                const updated = await cmsService.updatePage(editingPage.id, payload);
                setPages((current) => current.map((page) => (page.id === updated.id ? updated : page)));
                toast.success('Sayfa guncellendi');
            } else {
                const created = await cmsService.createPage(payload);
                setPages((current) => [...current, created].sort((left, right) => left.title.localeCompare(right.title)));
                toast.success('Sayfa eklendi');
            }

            closeModal();
        } catch {
            toast.error('Sayfa kaydedilemedi');
        } finally {
            setSaving(false);
        }
    };

    const handleTogglePublish = async (page: CustomPage) => {
        try {
            const updated = await cmsService.updatePage(page.id, {
                isPublished: !page.isPublished,
            });
            setPages((current) => current.map((item) => (item.id === updated.id ? updated : item)));
            toast.success('Yayin durumu guncellendi');
        } catch {
            toast.error('Yayin durumu guncellenemedi');
        }
    };

    const handleDelete = async (page: CustomPage) => {
        try {
            await cmsService.deletePage(page.id);
            setPages((current) => current.filter((item) => item.id !== page.id));
            toast.success('Sayfa silindi');
        } catch {
            toast.error(page.isSystem ? 'Sistem sayfasi silinemez' : 'Sayfa silinemedi');
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
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-zinc-900">Sabit Sayfalar</h2>
                <Button icon={<Plus className="w-4 h-4" />} className="font-semibold shadow-md" onClick={openCreate}>
                    Yeni Sayfa Ekle
                </Button>
            </div>
            {pages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 rounded-2xl border border-zinc-200/80">
                    <FileText className="w-12 h-12 text-zinc-300 mb-4" />
                    <p className="text-[15px] font-semibold text-zinc-500">Standart sayfa kaydi bulunmuyor</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {pages.map((page) => (
                        <div key={page.id} className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold text-zinc-900">{page.title}</p>
                                        <Badge variant={page.isPublished ? 'success' : 'neutral'} dot>
                                            {page.isPublished ? 'Yayinda' : 'Taslak'}
                                        </Badge>
                                        {page.isSystem ? <Badge variant="warning">Sistem</Badge> : null}
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-[12px] text-zinc-400">
                                        <span>Slug: {page.slug}</span>
                                        <span>{new Date(page.updatedAt).toLocaleString('tr-TR')}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button variant="ghost" size="sm" onClick={() => void handleTogglePublish(page)}>
                                        {page.isPublished ? 'Taslak' : 'Yayinla'}
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => openEdit(page)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => void handleDelete(page)} disabled={page.isSystem}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isOpen}
                onClose={closeModal}
                title={editingPage ? 'Sayfayi Duzenle' : 'Yeni Sayfa'}
                description="Kurumsal veya sabit sayfa icerigini yonetin."
                size="xl"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Baslik"
                            value={formData.title}
                            onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                        />
                        <Input
                            label="Slug"
                            value={formData.slug ?? ''}
                            onChange={(event) => setFormData((current) => ({ ...current, slug: event.target.value }))}
                            placeholder="bos birakilabilir"
                        />
                    </div>
                    <Textarea
                        label="Icerik"
                        className="min-h-[260px]"
                        value={formData.content}
                        onChange={(event) => setFormData((current) => ({ ...current, content: event.target.value }))}
                    />
                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 text-[13px] font-medium text-zinc-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isPublished ?? false}
                                onChange={(event) => setFormData((current) => ({ ...current, isPublished: event.target.checked }))}
                                className="rounded border-zinc-300"
                            />
                            Sayfayi yayinla
                        </label>
                        <label className="flex items-center gap-2 text-[13px] font-medium text-zinc-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isSystem ?? false}
                                onChange={(event) => setFormData((current) => ({ ...current, isSystem: event.target.checked }))}
                                className="rounded border-zinc-300"
                                disabled={editingPage?.isSystem}
                            />
                            Sistem sayfasi
                        </label>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                        <Button type="button" variant="secondary" onClick={closeModal} disabled={saving}>
                            Iptal
                        </Button>
                        <Button type="button" loading={saving} onClick={() => void handleSave()}>
                            {editingPage ? 'Guncelle' : 'Kaydet'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
