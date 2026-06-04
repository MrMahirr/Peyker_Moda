import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { ChevronLeft, Image as ImageIcon, Loader2, Package, Boxes } from 'lucide-react';
import { productsService, Product, ProductVariant } from './services/products.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const formatCurrency = (value: number, currency = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(value);
};

const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const resolveImageUrl = (src?: any) => {
    if (!src) return null;
    const urlStr = typeof src === 'string' ? src : src.url;
    if (!urlStr) return null;
    if (urlStr.startsWith('http')) return urlStr;
    const base = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
    return `${base}/uploads/${urlStr}`;
};

const formatVariantLabel = (variant: ProductVariant) => {
    const parts = [variant.color, variant.size].filter(Boolean);
    return parts.length ? parts.join(' / ') : 'Standart';
};

export const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                const data = await productsService.getById(id);
                setProduct(data);
            } catch (err) {
                console.error('Product fetch error:', err);
                toast.error('Ürün bilgileri yüklenemedi');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    useEffect(() => {
        setActiveImageIndex(0);
    }, [product?.id]);

    const images = useMemo(() => product?.images ?? [], [product]);
    const activeImage = resolveImageUrl(images[activeImageIndex]) || 'https://via.placeholder.com/640x800?text=No+Image';

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-12 text-red-600 font-medium">
                Urun bulunamadi.
            </div>
        );
    }

    const basePrice = Number(product.basePrice || 0);
    const salePrice = product.salePrice ? Number(product.salePrice) : null;
    const currency = product.currency || 'TRY';
    const variants = product.variants ?? [];
    const totalStock = product.totalStock ?? variants.reduce((sum, v) => sum + (v.stock || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <Button variant="ghost" size="sm" className="w-9 h-9 p-0" onClick={() => navigate('/catalog')}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">{product.name}</h1>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs text-zinc-400">SKU: {product.sku}</span>
                            <span className="text-xs text-zinc-400">Kategori: {product.category?.name || 'Kategorisiz'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={product.isActive ? 'success' : 'neutral'} dot>
                        {product.isActive ? 'Yayinda' : 'Taslak'}
                    </Badge>
                    {product.isFeatured && (
                        <Badge variant="info">One Cikan</Badge>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
                <div className="space-y-6">
                    <Card padding={false} className="overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_160px] gap-0">
                            <div className="bg-zinc-50">
                                <img
                                    src={activeImage}
                                    alt={product.name}
                                    className="w-full h-full object-cover min-h-[420px]"
                                />
                            </div>
                            <div className="border-l border-zinc-100 bg-white p-4 flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <ImageIcon className="w-4 h-4" />
                                    Gorseller
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {(images.length ? images : [undefined]).map((img, idx) => {
                                        const url = resolveImageUrl(img) || 'https://via.placeholder.com/120x160?text=No+Image';
                                        const isActive = idx === activeImageIndex;
                                        return (
                                            <button
                                                key={`${img ?? 'placeholder'}-${idx}`}
                                                type="button"
                                                onClick={() => setActiveImageIndex(idx)}
                                                className={cn(
                                                    "h-20 w-full rounded-lg overflow-hidden border transition-colors",
                                                    isActive ? "border-zinc-900" : "border-zinc-200 hover:border-zinc-400"
                                                )}
                                            >
                                                <img src={url} alt={`thumb-${idx}`} className="h-full w-full object-cover" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <CardHeader
                            title="Urun Aciklamasi"
                            description="Bu urune ait metin ve detaylar."
                        />
                        <p className="text-sm text-zinc-600 leading-relaxed">
                            {product.description || 'Aciklama bulunmuyor.'}
                        </p>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader title="Fiyat ve Stok" />
                        <div className="space-y-4">
                            <div className="flex items-end justify-between">
                                <div className="text-sm text-zinc-500">Guncel Fiyat</div>
                                <div className="text-2xl font-bold text-zinc-900">
                                    {formatCurrency(salePrice ?? basePrice, currency)}
                                </div>
                            </div>
                            {salePrice && (
                                <div className="flex items-center justify-between text-sm text-zinc-500">
                                    <span>Liste Fiyati</span>
                                    <span className="line-through">{formatCurrency(basePrice, currency)}</span>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-lg border border-zinc-200/80 p-3">
                                    <div className="text-zinc-500">Toplam Stok</div>
                                    <div className="text-lg font-semibold text-zinc-900">{totalStock}</div>
                                </div>
                                <div className="rounded-lg border border-zinc-200/80 p-3">
                                    <div className="text-zinc-500">Varyant</div>
                                    <div className="text-lg font-semibold text-zinc-900">{Math.max(variants.length, 1)}</div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <CardHeader title="Urun Bilgileri" />
                        <div className="space-y-3 text-sm text-zinc-600">
                            <div className="flex items-center justify-between">
                                <span>SKU</span>
                                <span className="font-medium text-zinc-900">{product.sku}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Slug</span>
                                <span className="font-medium text-zinc-900">{product.slug || '-'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Kategori</span>
                                <span className="font-medium text-zinc-900">{product.category?.name || 'Kategorisiz'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Olusturma</span>
                                <span className="font-medium text-zinc-900">{formatDate(product.createdAt)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Guncelleme</span>
                                <span className="font-medium text-zinc-900">{formatDate(product.updatedAt)}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <Card>
                <CardHeader
                    title="Varyantlar"
                    description="Urun varyantlari ve stok bilgileri."
                    action={<Package className="w-4 h-4 text-zinc-500" />}
                />
                {variants.length === 0 ? (
                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                        <Boxes className="w-4 h-4" />
                        Bu urun icin varyant tanimi yok.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-xs uppercase text-zinc-400 border-b border-zinc-200/80">
                                <tr>
                                    <th className="text-left py-2">Varyant</th>
                                    <th className="text-left py-2">SKU</th>
                                    <th className="text-right py-2">Fiyat</th>
                                    <th className="text-right py-2">Stok</th>
                                </tr>
                            </thead>
                            <tbody>
                                {variants.map((variant) => (
                                    <tr key={variant.id || variant.sku} className="border-b border-zinc-100 last:border-0">
                                        <td className="py-3 text-zinc-800 font-medium">
                                            {formatVariantLabel(variant)}
                                        </td>
                                        <td className="py-3 text-zinc-500">{variant.sku}</td>
                                        <td className="py-3 text-right font-semibold text-zinc-800">
                                            {formatCurrency(Number(variant.price ?? basePrice), currency)}
                                        </td>
                                        <td className="py-3 text-right text-zinc-600">
                                            {variant.stock ?? 0}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};
