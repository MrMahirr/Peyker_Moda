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
                className={`flex items-center justify-between py-3 px-4 hover:bg-slate-50 border-b border-slate-100`}
                style={{ paddingLeft: `${depth * 24 + 16}px` }}
            >
                <div className="flex items-center gap-2">
                    {category.children && category.children.length > 0 && (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                    <FolderTree className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium text-slate-900">{category.name}</span>
                    <span className="text-xs text-slate-400">({category._count?.products || 0} ürün)</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-amber-600"
                        onClick={() => handleEdit(category)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-red-500"
                        onClick={() => handleDelete(category.id)}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            {category.children?.map(child => renderCategory(child, depth + 1))}
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Kategoriler</h2>
                    <p className="text-sm text-slate-500">Ürün kategorilerini yönetin</p>
                </div>
                <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => {
                        setEditingCategory(null);
                        setFormData({ name: '', description: '', parentId: '' });
                        setShowForm(true);
                    }}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Kategori
                </Button>
            </div>

            {showForm && (
                <Card className="p-6">
                    <h3 className="font-semibold mb-4">{editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Kategori Adı"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <select
                                value={formData.parentId}
                                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                className="px-3 py-2 border rounded-lg text-sm"
                            >
                                <option value="">Üst Kategori (Yok)</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <Input
                            label="Açıklama"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <div className="flex gap-2">
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                                {editingCategory ? 'Güncelle' : 'Oluştur'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                İptal
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card className="overflow-hidden">
                {categories.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <FolderTree className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p>Henüz kategori bulunmuyor</p>
                    </div>
                ) : (
                    categories.map(cat => renderCategory(cat))
                )}
            </Card>
        </div>
    );
};
