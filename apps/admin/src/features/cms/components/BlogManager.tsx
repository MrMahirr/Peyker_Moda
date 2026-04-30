import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Loader2, Pencil, Plus, Rss, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { cmsService, type CreateBlogPostDto } from '../services/cms.service';
import type { BlogPost } from '../types';

const emptyForm: CreateBlogPostDto = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    isPublished: false,
};

export const BlogManager = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [formData, setFormData] = useState<CreateBlogPostDto>(emptyForm);

    useEffect(() => {
        void loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            setLoading(true);
            setPosts(await cmsService.getBlogPosts());
        } catch {
            toast.error('Blog verileri yuklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditingPost(null);
        setFormData(emptyForm);
        setIsOpen(true);
    };

    const openEdit = (post: BlogPost) => {
        setEditingPost(post);
        setFormData({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            image: post.image ?? '',
            isPublished: post.isPublished,
        });
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setEditingPost(null);
        setFormData(emptyForm);
    };

    const handleSave = async () => {
        if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
            toast.error('Baslik, ozet ve icerik zorunludur');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                ...formData,
                title: formData.title.trim(),
                excerpt: formData.excerpt.trim(),
                content: formData.content.trim(),
                slug: formData.slug?.trim() || undefined,
                image: formData.image?.trim() || undefined,
            };

            if (editingPost) {
                const updated = await cmsService.updateBlogPost(editingPost.id, payload);
                setPosts((current) => current.map((post) => (post.id === updated.id ? updated : post)));
                toast.success('Blog yazisi guncellendi');
            } else {
                const created = await cmsService.createBlogPost(payload);
                setPosts((current) => [created, ...current]);
                toast.success('Blog yazisi eklendi');
            }

            closeModal();
        } catch {
            toast.error('Blog yazisi kaydedilemedi');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await cmsService.deleteBlogPost(id);
            setPosts((current) => current.filter((post) => post.id !== id));
            toast.success('Blog yazisi silindi');
        } catch {
            toast.error('Blog yazisi silinemedi');
        }
    };

    const handleTogglePublish = async (post: BlogPost) => {
        try {
            const updated = await cmsService.updateBlogPost(post.id, {
                isPublished: !post.isPublished,
            });
            setPosts((current) => current.map((item) => (item.id === updated.id ? updated : item)));
            toast.success('Yayin durumu guncellendi');
        } catch {
            toast.error('Yayin durumu guncellenemedi');
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
                <h2 className="text-lg font-bold text-zinc-900">Blog Yazilari</h2>
                <Button icon={<Plus className="w-4 h-4" />} className="font-semibold shadow-md" onClick={openCreate}>
                    Yeni Yazi Ekle
                </Button>
            </div>
            {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 rounded-2xl border border-zinc-200/80">
                    <Rss className="w-12 h-12 text-zinc-300 mb-4" />
                    <p className="text-[15px] font-semibold text-zinc-500">Henuz blog yazisi eklenmemis</p>
                    <p className="text-[13px] text-zinc-400 mt-1">Musterilerinizi bilgilendirmek icin icerikler olusturun.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {posts.map((post) => (
                        <div key={post.id} className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold text-zinc-900">{post.title}</p>
                                        <Badge variant={post.isPublished ? 'success' : 'neutral'} dot>
                                            {post.isPublished ? 'Yayinda' : 'Taslak'}
                                        </Badge>
                                    </div>
                                    <p className="text-[13px] text-zinc-500">{post.excerpt}</p>
                                    <div className="flex flex-wrap gap-3 text-[12px] text-zinc-400">
                                        <span>Slug: {post.slug}</span>
                                        <span>Yazar: {post.authorName ?? 'Sistem'}</span>
                                        <span>{new Date(post.updatedAt).toLocaleString('tr-TR')}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button variant="ghost" size="sm" onClick={() => void handleTogglePublish(post)}>
                                        {post.isPublished ? 'Taslak' : 'Yayinla'}
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => openEdit(post)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => void handleDelete(post.id)}>
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
                title={editingPost ? 'Blog Yazisini Duzenle' : 'Yeni Blog Yazisi'}
                description="Blog icerigini ve yayin durumunu yonetin."
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
                    <Input
                        label="Kapak Gorseli URL"
                        value={formData.image ?? ''}
                        onChange={(event) => setFormData((current) => ({ ...current, image: event.target.value }))}
                    />
                    <Textarea
                        label="Ozet"
                        value={formData.excerpt}
                        onChange={(event) => setFormData((current) => ({ ...current, excerpt: event.target.value }))}
                    />
                    <Textarea
                        label="Icerik"
                        className="min-h-[220px]"
                        value={formData.content}
                        onChange={(event) => setFormData((current) => ({ ...current, content: event.target.value }))}
                    />
                    <label className="flex items-center gap-2 text-[13px] font-medium text-zinc-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isPublished ?? false}
                            onChange={(event) => setFormData((current) => ({ ...current, isPublished: event.target.checked }))}
                            className="rounded border-zinc-300"
                        />
                        Yaziyi yayinla
                    </label>
                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                        <Button type="button" variant="secondary" onClick={closeModal} disabled={saving}>
                            Iptal
                        </Button>
                        <Button type="button" loading={saving} onClick={() => void handleSave()}>
                            {editingPost ? 'Guncelle' : 'Kaydet'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
