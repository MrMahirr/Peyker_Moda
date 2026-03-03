import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Search, Loader2 } from 'lucide-react';
import { usePos } from '@/context/PosContext';
import { toast } from 'sonner';
import { posService, PosProduct } from '../services/pos.service';

export const PosProductGrid = () => {
    const { addToCart } = usePos();
    const [products, setProducts] = useState<PosProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('Hepsi');
    const [categories, setCategories] = useState<string[]>(['Hepsi']);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    posService.getProducts(),
                    posService.getCategories()
                ]);
                setProducts(productsData || []);
                const catNames = categoriesData?.map((c: any) => c.name) || [];
                setCategories(['Hepsi', ...catNames]);
            } catch (err) {
                console.error('POS products fetch error:', err);
                toast.error('Ürünler yüklenemedi');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.barcode?.includes(searchTerm);
        const matchesCategory = activeCategory === 'Hepsi' || product.categoryName === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const handleAddToCart = (product: PosProduct) => {
        if (product.stock <= 0) {
            toast.error('Bu ürün stokta yok!');
            return;
        }
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image
        });
        toast.success(`${product.name} sepete eklendi`, {
            duration: 1500,
            position: 'bottom-right'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white border-r border-slate-200">
            {/* Search & Categories */}
            <div className="p-4 border-b border-slate-200 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Ürün adı, barkod veya SKU ara..."
                        className="pl-9 bg-slate-50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map(product => (
                        <Card
                            key={product.id}
                            className={`cursor-pointer hover:shadow-md transition-shadow active:scale-95 duration-150 overflow-hidden group border-0 shadow-sm ${product.stock <= 0 ? 'opacity-50' : ''}`}
                            onClick={() => handleAddToCart(product)}
                        >
                            <div className="aspect-square bg-slate-200 relative">
                                <img
                                    src={product.image || 'https://via.placeholder.com/200'}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {product.stock <= 0 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="text-white font-bold">Stok Yok</span>
                                    </div>
                                )}
                                {product.stock > 0 && product.stock < 5 && (
                                    <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded">
                                        Son {product.stock}
                                    </div>
                                )}
                            </div>
                            <div className="p-3">
                                <h3 className="text-sm font-medium text-slate-900 line-clamp-2 min-h-[40px]">{product.name}</h3>
                                <div className="mt-1 flex items-center justify-between">
                                    <span className="text-indigo-600 font-bold">
                                        {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                        <p>Sonuç bulunamadı.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
