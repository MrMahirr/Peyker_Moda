import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { Plus, Edit, Trash, Layers, ListChecks } from 'lucide-react';
import { toast } from 'sonner';
import { showDeleteConfirm } from '@/utils/swal';
import { collectionsService, Collection, CreateCollectionDto } from '../services/collections.service';

export const CollectionList = () => {
    const navigate = useNavigate();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        imageUrl: '',
        isActive: true,
    });

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            const data = await collectionsService.getAll();
            setCollections(data || []);
        } catch (err) {
            console.error('Collections fetch error:', err);
            toast.error('Koleksiyonlar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', slug: '', description: '', imageUrl: '', isActive: true });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: CreateCollectionDto = {
                name: formData.name,
                slug: formData.slug || undefined,
                description: formData.description || undefined,
                imageUrl: formData.imageUrl || undefined,
                isActive: formData.isActive,
            };

            if (editingCollection) {
                await collectionsService.update(editingCollection.id, payload);
                toast.success('Koleksiyon güncellendi');
            } else {
                await collectionsService.create(payload);
                toast.success('Koleksiyon oluşturuldu');
            }
            setShowForm(false);
            setEditingCollection(null);
            resetForm();
            fetchCollections();
        } catch (err: any) {
            console.error('Collection save error:', err);
            toast.error(err.response?.data?.message?.[0] || err.response?.data?.message || 'İşlem başarısız');
        }
    };

    const handleEdit = (collection: Collection) => {
        setEditingCollection(collection);
        setFormData({
            name: collection.name,
            slug: collection.slug,
            description: collection.description || '',
            imageUrl: collection.imageUrl || '',
            isActive: collection.isActive,
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        const result = await showDeleteConfirm('Koleksiyonu Sil?', 'Koleksiyonu silmek istediğinize emin misiniz? Koleksiyondaki ürünler etkilenmez.');
        if (result.isConfirmed) {
            try {
                await collectionsService.delete(id);
                toast.success('Koleksiyon silindi');
                fetchCollections();
            } catch (err: any) {
                console.error('Delete error:', err);
                toast.error(err.response?.data?.message || 'Koleksiyon silinemedi');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <p className="text-sm font-medium text-zinc-500">Koleksiyonlar yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center sm:items-end">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Koleksiyonlar</h2>
                    <p className="text-sm text-zinc-500 mt-1">Kendi URL'i ve ürünleri olan koleksiyonlar oluşturun.</p>
                </div>
                <Button variant="primary" onClick={() => {
                    setEditingCollection(null);
                    resetForm();
                    setShowForm(true);
                }}>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Yeni Koleksiyon
                </Button>
            </div>

            {showForm && (
                <div className="bg-surface rounded-xl border border-zinc-200/80 p-6 shadow-sm">
                    <h3 className="font-semibold text-zinc-900 mb-5">{editingCollection ? 'Koleksiyon Düzenle' : 'Yeni Koleksiyon Oluştur'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Input
                                label="Koleksiyon Adı"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <Input
                                label="URL (slug)"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="Boş bırakılırsa isimden otomatik üretilir"
                            />
                        </div>
                        <Input
                            label="Açıklama"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-700">Kapak Görseli</label>
                            <ImageUpload
                                folder="collections"
                                maxFiles={1}
                                value={formData.imageUrl ? [formData.imageUrl] : []}
                                onChange={(items) => {
                                    const url = typeof items[0] === 'string' ? items[0] : items[0]?.url;
                                    setFormData({ ...formData, imageUrl: url || '' });
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="collectionIsActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="h-4 w-4 rounded border-zinc-300"
                            />
                            <label htmlFor="collectionIsActive" className="text-sm font-medium text-zinc-700">
                                Aktif
                            </label>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <Button type="submit" variant="primary">
                                {editingCollection ? 'Değişiklikleri Kaydet' : 'Oluştur'}
                            </Button>
                            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                                İptal
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-surface rounded-xl border border-zinc-200/80 overflow-hidden shadow-sm">
                {collections.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <Layers className="h-10 w-10 text-zinc-300 mb-4" />
                        <p className="text-zinc-500 font-medium">Henüz koleksiyon bulunmuyor.</p>
                    </div>
                ) : (
                    collections.map((collection) => (
                        <div
                            key={collection.id}
                            className="flex items-center justify-between py-3 px-4 hover:bg-zinc-50/50 border-b border-zinc-100/50 transition-colors group last:border-b-0"
                        >
                            <div className="flex items-center gap-3">
                                {collection.imageUrl ? (
                                    <img src={collection.imageUrl} alt={collection.name} className="h-9 w-9 rounded-lg object-cover" />
                                ) : (
                                    <div className="h-9 w-9 rounded-lg bg-zinc-100 flex items-center justify-center">
                                        <Layers className="h-4 w-4 text-zinc-400" />
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-[13px] text-zinc-800">{collection.name}</span>
                                        {!collection.isActive && (
                                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500">Pasif</span>
                                        )}
                                    </div>
                                    <span className="text-[11px] font-medium text-zinc-400">
                                        /koleksiyonlar/{collection.slug} · {collection._count?.products || 0} ürün
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-zinc-500 hover:text-amber-600 hover:bg-amber-50"
                                    onClick={() => navigate(`/catalog/collections/${collection.id}/products`)}
                                >
                                    <ListChecks className="h-3.5 w-3.5 mr-1" />
                                    Ürünleri Yönet
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-zinc-400 hover:text-amber-600 hover:bg-amber-50"
                                    onClick={() => handleEdit(collection)}
                                >
                                    <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDelete(collection.id)}
                                >
                                    <Trash className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
