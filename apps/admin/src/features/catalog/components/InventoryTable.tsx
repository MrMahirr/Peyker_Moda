import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { productsService, Product } from '../services/products.service';
import { toast } from 'sonner';

const calculateStatus = (stock: number = 0) => {
    if (stock <= 0) return 'OUT_OF_STOCK';
    if (stock <= 5) return 'LOW_STOCK';
    return 'IN_STOCK';
};

export const InventoryTable = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await productsService.getAll({ limit: 10 });
                setProducts(res.data);
                setTotal(res.meta.total);
            } catch (err) {
                console.error('Failed to fetch products', err);
                toast.error('Envanter tablosu yüklenemedi');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const getStockColor = (status: string) => {
        switch (status) {
            case 'IN_STOCK': return 'bg-emerald-500';
            case 'LOW_STOCK': return 'bg-amber-500';
            case 'OUT_OF_STOCK': return 'bg-red-500';
            default: return 'bg-zinc-300';
        }
    };

    const getStockPercentage = (current: number, max: number) => {
        return Math.min(100, Math.max(0, (current / max) * 100));
    };

    return (
        <div className="bg-surface rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-zinc-50/50 border-b border-zinc-100">
                        <tr>
                            <th className="p-4 w-12 pl-6">
                                <input type="checkbox" className="rounded border-zinc-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                            </th>
                            <th className="p-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Ürün</th>
                            <th className="p-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Kategori</th>
                            <th className="p-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-center">Stok Durumu</th>
                            <th className="p-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Fiyat</th>
                            <th className="p-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-right pr-6">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 relative">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="h-64 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mx-auto" />
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="h-48 text-center text-sm text-zinc-500">
                                    Henüz ürün bulunmuyor.
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => {
                                const stockStatus = calculateStatus(product.totalStock);
                                const defaultImage = product.images && product.images.length > 0 
                                    ? (product.images[0].startsWith('http') ? product.images[0] : `${(import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api'}/uploads/${product.images[0]}`) 
                                    : '/peyker-moda-kapak3.png'; // Default placeholder

                                return (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-zinc-50/50 transition-colors group relative cursor-pointer"
                                        onClick={() => navigate(`/catalog/${product.id}`)}
                                    >
                                        <td className="p-4 pl-6">
                                            <input
                                                type="checkbox"
                                                className="rounded border-zinc-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                                onClick={(event) => event.stopPropagation()}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={cn(
                                                        "w-[42px] h-[52px] rounded-md bg-cover bg-center border border-zinc-200/80",
                                                        stockStatus === 'OUT_OF_STOCK' && "grayscale opacity-50"
                                                    )}
                                                    style={{ backgroundImage: `url('${defaultImage}')` }}
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-zinc-900 line-clamp-1">{product.name}</span>
                                                    <span className="text-[11px] text-zinc-400 font-medium">SKU: {product.sku}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="neutral">{product.category?.name || 'Kategorisiz'}</Badge>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col items-center gap-1.5 w-24 mx-auto">
                                                {stockStatus === 'OUT_OF_STOCK' ? (
                                                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Tükendi</span>
                                                ) : (
                                                    <span className={cn(
                                                        "text-[13px] font-bold",
                                                        stockStatus === 'LOW_STOCK' ? "text-amber-600" : "text-zinc-700"
                                                    )}>
                                                        {product.totalStock || 0} Adet
                                                    </span>
                                                )}
                                                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden shrink-0">
                                                    <div
                                                        className={cn("h-full rounded-full transition-all duration-500", getStockColor(stockStatus))}
                                                        style={{ width: `${getStockPercentage(product.totalStock || 0, 100)}%` }} // Defaulting max visually to 100
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-[13px] font-semibold text-zinc-900">
                                            ₺{Number(product.basePrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    className="p-1.5 text-zinc-400 hover:text-primary hover:bg-zinc-100 rounded-md transition-colors"
                                                    onClick={(event) => event.stopPropagation()}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                    onClick={(event) => event.stopPropagation()}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-md transition-colors"
                                                    onClick={(event) => event.stopPropagation()}
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between p-4 px-6 border-t border-zinc-100 bg-surface text-sm">
                <p className="text-zinc-500">
                    <span className="font-semibold text-zinc-900">1-{products.length}</span> / <span className="font-semibold text-zinc-900">{total}</span> ürün gösteriliyor
                </p>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-500 text-[13px] font-medium hover:bg-zinc-50 disabled:opacity-50 transition-colors" disabled>
                        Önceki
                    </button>
                    <button className="px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 text-[13px] font-medium hover:bg-zinc-50 transition-colors">
                        Sonraki
                    </button>
                </div>
            </div>
        </div>
    );
};
