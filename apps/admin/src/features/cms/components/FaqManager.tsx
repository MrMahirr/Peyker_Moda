import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { HelpCircle, Loader2, Pencil, Plus, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { cmsService, type CreateFaqItemDto } from '../services/cms.service';
import type { FaqItem } from '../types';

const emptyForm: CreateFaqItemDto = {
    question: '',
    answer: '',
    category: 'Genel',
    order: 1,
    isActive: true,
};

export const FaqManager = () => {
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
    const [formData, setFormData] = useState<CreateFaqItemDto>(emptyForm);

    useEffect(() => {
        void loadFaqs();
    }, []);

    const loadFaqs = async () => {
        try {
            setLoading(true);
            setFaqs(await cmsService.getFaqs());
        } catch {
            toast.error('SSS verileri yuklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const getNextOrder = () => {
        if (faqs.length === 0) {
            return 1;
        }

        return Math.max(...faqs.map((faq) => faq.order)) + 1;
    };

    const openCreate = () => {
        setEditingFaq(null);
        setFormData({
            ...emptyForm,
            order: getNextOrder(),
        });
        setIsOpen(true);
    };

    const openEdit = (faq: FaqItem) => {
        setEditingFaq(faq);
        setFormData({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            order: faq.order,
            isActive: faq.isActive,
        });
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setEditingFaq(null);
        setFormData(emptyForm);
    };

    const handleSave = async () => {
        if (!formData.question?.trim() || !formData.answer?.trim()) {
            toast.error('Soru ve cevap zorunludur');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                question: formData.question.trim(),
                answer: formData.answer.trim(),
                category: formData.category?.trim() || 'Genel',
                order: Number(formData.order) || 1,
                isActive: formData.isActive,
            };

            if (editingFaq) {
                const updated = await cmsService.updateFaq(editingFaq.id, payload);
                setFaqs((current) =>
                    current
                        .map((faq) => (faq.id === updated.id ? updated : faq))
                        .sort((left, right) => left.order - right.order),
                );
                toast.success('SSS kaydi guncellendi');
            } else {
                const created = await cmsService.createFaq(payload);
                setFaqs((current) => [...current, created].sort((left, right) => left.order - right.order));
                toast.success('SSS kaydi eklendi');
            }

            closeModal();
        } catch {
            toast.error('SSS kaydi kaydedilemedi');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (faq: FaqItem) => {
        try {
            const updated = await cmsService.updateFaq(faq.id, {
                isActive: !faq.isActive,
            });
            setFaqs((current) => current.map((item) => (item.id === updated.id ? updated : item)));
            toast.success('Durum guncellendi');
        } catch {
            toast.error('Durum guncellenemedi');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await cmsService.deleteFaq(id);
            setFaqs((current) => current.filter((faq) => faq.id !== id));
            toast.success('SSS kaydi silindi');
        } catch {
            toast.error('SSS kaydi silinemedi');
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
                <h2 className="text-lg font-bold text-zinc-900">Sikca Sorulan Sorular</h2>
                <Button icon={<Plus className="w-4 h-4" />} className="font-semibold shadow-md" onClick={openCreate}>
                    Yeni Soru Ekle
                </Button>
            </div>
            {faqs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 rounded-2xl border border-zinc-200/80">
                    <HelpCircle className="w-12 h-12 text-zinc-300 mb-4" />
                    <p className="text-[15px] font-semibold text-zinc-500">SSS kaydi bulunmuyor</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {faqs.map((faq) => (
                        <div key={faq.id} className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold text-zinc-900">{faq.question}</p>
                                        <Badge variant={faq.isActive ? 'success' : 'neutral'} dot>
                                            {faq.isActive ? 'Aktif' : 'Pasif'}
                                        </Badge>
                                        <Badge variant="info">{faq.category}</Badge>
                                    </div>
                                    <p className="text-[13px] text-zinc-500">{faq.answer}</p>
                                    <div className="text-[12px] text-zinc-400">Sira: {faq.order}</div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button variant="ghost" size="sm" onClick={() => void handleToggleActive(faq)}>
                                        {faq.isActive ? 'Pasif' : 'Aktif'}
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => openEdit(faq)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => void handleDelete(faq.id)}>
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
                title={editingFaq ? 'SSS Kaydini Duzenle' : 'Yeni SSS Kaydi'}
                description="Soru, cevap ve gorunurluk ayarlarini yonetin."
                size="lg"
            >
                <div className="space-y-4">
                    <Input
                        label="Soru"
                        value={formData.question ?? ''}
                        onChange={(event) => setFormData((current) => ({ ...current, question: event.target.value }))}
                    />
                    <Textarea
                        label="Cevap"
                        value={formData.answer ?? ''}
                        onChange={(event) => setFormData((current) => ({ ...current, answer: event.target.value }))}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Kategori"
                            value={formData.category ?? ''}
                            onChange={(event) => setFormData((current) => ({ ...current, category: event.target.value }))}
                        />
                        <Input
                            label="Sira"
                            type="number"
                            min={1}
                            value={String(formData.order ?? 1)}
                            onChange={(event) =>
                                setFormData((current) => ({
                                    ...current,
                                    order: Number(event.target.value) || 1,
                                }))
                            }
                        />
                    </div>
                    <label className="flex items-center gap-2 text-[13px] font-medium text-zinc-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isActive ?? true}
                            onChange={(event) => setFormData((current) => ({ ...current, isActive: event.target.checked }))}
                            className="rounded border-zinc-300"
                        />
                        Kayit aktif
                    </label>
                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                        <Button type="button" variant="secondary" onClick={closeModal} disabled={saving}>
                            Iptal
                        </Button>
                        <Button type="button" loading={saving} onClick={() => void handleSave()}>
                            {editingFaq ? 'Guncelle' : 'Kaydet'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
