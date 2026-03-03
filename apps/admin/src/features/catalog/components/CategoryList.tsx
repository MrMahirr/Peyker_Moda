import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Plus, Edit, Trash, ChevronRight, Loader2, FolderTree } from 'lucide-react';
import { toast } from 'sonner';
import { showDeleteConfirm } from '@/utils/swal';
import { categoriesService, Category } from '../services/categories.service';

export const CategoryList = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', parentId: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await categoriesService.getTree();
            setCategories(data || []);
        } catch (err) {
            console.error('Categories fetch error:', err);
            toast.error('Kategoriler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await categoriesService.update(editingCategory.id, formData);
                toast.success('Kategori güncellendi');
            } else {
                await categoriesService.create(formData);
                toast.success('Kategori oluşturuldu');
            }
            setShowForm(false);
            setEditingCategory(null);
            setFormData({ name: '', description: '', parentId: '' });
            fetchCategories();
        } catch (err) {
            console.error('Category save error:', err);
            toast.error('İşlem başarısız');
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            parentId: category.parentId || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        const result = await showDeleteConfirm('Kategoriyi Sil?', 'Alt kategoriler de silinecek!');
        if (result.isConfirmed) {
            try {
                await categoriesService.delete(id);
                toast.success('Kategori silindi');
                fetchCategories();
            } catch (err) {
                console.error('Delete error:', err);
                toast.error('Kategori silinemedi');
            }
        }
    };

    const renderCategory = (category: Category, depth: number = 0) => (
        <div key={category.id}>
            <div
                className={`flex items-center justify-between py-3 px-4 hover:bg-zinc-50/50 border-b border-zinc-100/50 transition-colors group`}
                style={{ paddingLeft: `${depth * 24 + 16}px` }}
            >
                <div className="flex items-center gap-2">
                    {category.children && category.children.length > 0 && (
                        <ChevronRight className="h-4 w-4 text-zinc-300" />
                    )}
                    <FolderTree className="h-4 w-4 text-zinc-400" />
                    <span className="font-medium text-[13px] text-zinc-800">{category.name}</span>
                    <span className="text-[11px] font-medium text-zinc-400">({category._count?.products || 0} ürün)</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-400 hover:text-amber-600 hover:bg-amber-50"
                        onClick={() => handleEdit(category)}
                    >
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(category.id)}
                    >
                        <Trash className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
            {category.children?.map(child => renderCategory(child, depth + 1))}
        </div>
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-zinc-500">Kategoriler yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center sm:items-end">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Kategoriler</h2>
                    <p className="text-sm text-zinc-500 mt-1">Ürün kategorilerini detaylı yönetin.</p>
                </div>
                <Button variant="primary" onClick={() => {
                    setEditingCategory(null);
                    setFormData({ name: '', description: '', parentId: '' });
                    setShowForm(true);
                }}>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Yeni Kategori
                </Button>
            </div>

            {showForm && (
                <div className="bg-surface rounded-xl border border-zinc-200/80 p-6 shadow-sm">
                    <h3 className="font-semibold text-zinc-900 mb-5">{editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Oluştur'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Input
                                label="Kategori Adı"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-700">Üst Kategori</label>
                                <select
                                    value={formData.parentId}
                                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                    className="w-full h-10 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                >
                                    <option value="">(Ana Kategori)</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <Input
                            label="Açıklama"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <div className="flex items-center gap-3 pt-2">
                            <Button type="submit" variant="primary">
                                {editingCategory ? 'Değişiklikleri Kaydet' : 'Oluştur'}
                            </Button>
                            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                                İptal
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-surface rounded-xl border border-zinc-200/80 overflow-hidden shadow-sm">
                {categories.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <FolderTree className="h-10 w-10 text-zinc-300 mb-4" />
                        <p className="text-zinc-500 font-medium">Henüz kategori bulunmuyor.</p>
                    </div>
                ) : (
                    categories.map(cat => renderCategory(cat))
                )}
            </div>
        </div>
    );
};
