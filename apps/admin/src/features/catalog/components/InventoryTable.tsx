import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface Product {
    id: string;
    name: string;
    sku: string;
    category: string;
    stock: number;
    maxStock: number;
    price: number;
    image: string;
    status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

const mockProducts: Product[] = [
    {
        id: '1',
        name: 'İpek Çiçekli Midi Elbise',
        sku: 'DR-0012',
        category: 'Elbiseler',
        stock: 45,
        maxStock: 100,
        price: 1890.00,
        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=150&auto=format&fit=crop',
        status: 'IN_STOCK',
    },
    {
        id: '2',
        name: 'Yün Trençkot',
        sku: 'OW-4490',
        category: 'Dış Giyim',
        stock: 3,
        maxStock: 50,
        price: 2950.00,
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=150&auto=format&fit=crop',
        status: 'LOW_STOCK',
    },
    {
        id: '3',
        name: 'Altın Zincir Kolye',
        sku: 'AC-8821',
        category: 'Aksesuarlar',
        stock: 0,
        maxStock: 30,
        price: 850.00,
        image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=150&auto=format&fit=crop',
        status: 'OUT_OF_STOCK',
    },
    {
        id: '4',
        name: 'Deri Çapraz Çanta',
        sku: 'BG-1024',
        category: 'Aksesuarlar',
        stock: 12,
        maxStock: 40,
        price: 1450.50,
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=150&auto=format&fit=crop',
        status: 'LOW_STOCK',
    },
    {
        id: '5',
        name: 'Yazlık Keten Gömlek',
        sku: 'TS-3321',
        category: 'Üst Giyim',
        stock: 85,
        maxStock: 120,
        price: 590.90,
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=150&auto=format&fit=crop',
        status: 'IN_STOCK',
    },
];

export const InventoryTable = () => {
    const getStockColor = (status: Product['status']) => {
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
                    <tbody className="divide-y divide-zinc-50">
                        {mockProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors group relative">
                                <td className="p-4 pl-6">
                                    <input type="checkbox" className="rounded border-zinc-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                "w-[42px] h-[52px] rounded-md bg-cover bg-center border border-zinc-200/80",
                                                product.status === 'OUT_OF_STOCK' && "grayscale opacity-50"
                                            )}
                                            style={{ backgroundImage: `url('${product.image}')` }}
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-zinc-900">{product.name}</span>
                                            <span className="text-[11px] text-zinc-400 font-medium">SKU: {product.sku}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <Badge variant="neutral">{product.category}</Badge>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col items-center gap-1.5 w-24 mx-auto">
                                        {product.status === 'OUT_OF_STOCK' ? (
                                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Tükendi</span>
                                        ) : (
                                            <span className={cn(
                                                "text-[13px] font-bold",
                                                product.status === 'LOW_STOCK' ? "text-amber-600" : "text-zinc-700"
                                            )}>
                                                {product.stock} Adet
                                            </span>
                                        )}
                                        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden shrink-0">
                                            <div
                                                className={cn("h-full rounded-full transition-all duration-500", getStockColor(product.status))}
                                                style={{ width: `${getStockPercentage(product.stock, product.maxStock)}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-[13px] font-semibold text-zinc-900">
                                    ₺{product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="p-4 pr-6 text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 text-zinc-400 hover:text-primary hover:bg-zinc-100 rounded-md transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-md transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between p-4 px-6 border-t border-zinc-100 bg-surface text-sm">
                <p className="text-zinc-500">
                    <span className="font-semibold text-zinc-900">1-5</span> / <span className="font-semibold text-zinc-900">1,240</span> ürün gösteriliyor
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
