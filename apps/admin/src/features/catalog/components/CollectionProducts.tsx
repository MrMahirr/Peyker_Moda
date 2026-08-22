import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Loader2, Search, Package } from 'lucide-react';
import { toast } from 'sonner';
import { collectionsService, Collection } from '../services/collections.service';
import { productsService, Product } from '../services/products.service';

export const CollectionProducts = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [collection, setCollection] = useState<Collection | null>(null);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (id) fetchData(id);
    }, [id]);

    const fetchData = async (collectionId: string) => {
        setLoading(true);
        try {
            const [collectionData, productsData] = await Promise.all([
                collectionsService.getById(collectionId),
                productsService.getAll({ limit: 500 }),
            ]);
            setCollection(collectionData);
            setSelected((collectionData.products || []).map((p) => p.id));
            setAllProducts(productsData.data || []);
        } catch (err) {
            console.error('Collection products fetch error:', err);
            toast.error('Ürünler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const groups = useMemo(() => {
        const term = search.trim().toLowerCase();
        const filtered = term
            ? allProducts.filter((p) => p.name.toLowerCase().includes(term))
            : allProducts;

        const byCategory = new Map<string, { label: string; products: Product[] }>();
        for (const product of filtered) {
            const key = product.category?.id || 'uncategorized';
            const label = product.category?.name || 'Kategorisiz';
            if (!byCategory.has(key)) byCategory.set(key, { label, products: [] });
            byCategory.get(key)!.products.push(product);
        }
        return Array.from(byCategory.values()).sort((a, b) => a.label.localeCompare(b.label));
    }, [allProducts, search]);

    const toggleProduct = (productId: string) => {
        setSelected((prev) =>
            prev.includes(productId) ? prev.filter((p) => p !== productId) : [...prev, productId],
        );
    };

    const toggleGroup = (groupProducts: Product[]) => {
        const ids = groupProducts.map((p) => p.id);
        const allSelected = ids.every((pid) => selected.includes(pid));
        setSelected((prev) =>
            allSelected
                ? prev.filter((pid) => !ids.includes(pid))
                : Array.from(new Set([...prev, ...ids])),
        );
    };

    const handleSave = async () => {
        if (!id) return;
        setSaving(true);
        try {
            await collectionsService.setProducts(id, selected);
            toast.success('Koleksiyon ürünleri güncellendi');
            navigate('/catalog/collections');
        } catch (err) {
            console.error('Save products error:', err);
            toast.error('Kaydedilemedi');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-zinc-500">Yükleniyor...</p>
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="p-12 text-center text-zinc-500">Koleksiyon bulunamadı.</div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate('/catalog/collections')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                        {collection.name} — Ürünleri Yönet
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1">
                        Bu koleksiyonda görünmesini istediğiniz ürünleri seçin.
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="Ürün ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="text-sm font-medium text-zinc-600">{selected.length} ürün seçili</div>
            </div>

            <div className="space-y-3">
                {groups.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center bg-surface rounded-xl border border-zinc-200/80">
                        <Package className="h-10 w-10 text-zinc-300 mb-4" />
                        <p className="text-zinc-500 font-medium">Ürün bulunamadı.</p>
                    </div>
                ) : (
                    groups.map((group) => {
                        const ids = group.products.map((p) => p.id);
                        const selectedCount = ids.filter((pid) => selected.includes(pid)).length;
                        const allSelected = selectedCount === ids.length;

                        return (
                            <div key={group.label} className="bg-surface rounded-xl border border-zinc-200/80 p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={() => toggleGroup(group.products)}
                                            className="h-4 w-4 rounded border-zinc-300"
                                        />
                                        {group.label}
                                    </label>
                                    <span className="text-xs font-medium text-zinc-400">
                                        {selectedCount}/{ids.length}
                                    </span>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {group.products.map((product) => (
                                        <label
                                            key={product.id}
                                            className="flex items-center gap-2 text-[13px] text-zinc-700 py-1"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selected.includes(product.id)}
                                                onChange={() => toggleProduct(product.id)}
                                                className="h-4 w-4 rounded border-zinc-300"
                                            />
                                            {product.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="flex items-center gap-3 sticky bottom-4">
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
                <Button variant="secondary" onClick={() => navigate('/catalog/collections')}>
                    İptal
                </Button>
            </div>
        </div>
    );
};
