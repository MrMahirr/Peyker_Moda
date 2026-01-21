import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Search } from 'lucide-react';
import { usePos } from '@/context/PosContext';
import { toast } from 'sonner';

// Mock Product Data (In real app, fetch from API)
const MOCK_PRODUCTS = [
    { id: '1', name: 'Yazlık Çiçekli Elbise', price: 899.90, image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop', category: 'Elbise' },
    { id: '2', name: 'Kot Ceket', price: 1250.00, image: 'https://images.unsplash.com/photo-1551537482-f20963253ecb?w=200&h=200&fit=crop', category: 'Dış Giyim' },
    { id: '3', name: 'Beyaz Tişört', price: 299.90, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop', category: 'Üst Giyim' },
    { id: '4', name: 'Siyah Kumaş Pantolon', price: 599.90, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=200&h=200&fit=crop', category: 'Alt Giyim' },
    { id: '5', name: 'Desenli Gömlek', price: 450.00, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&h=200&fit=crop', category: 'Üst Giyim' },
    { id: '6', name: 'Jean Pantolon', price: 700.00, image: 'https://images.unsplash.com/photo-1542272617-08f086375082?w=200&h=200&fit=crop', category: 'Alt Giyim' },
    { id: '7', name: 'Güneş Gözlüğü', price: 350.00, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=200&fit=crop', category: 'Aksesuar' },
    { id: '8', name: 'Deri Çanta', price: 1500.00, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&h=200&fit=crop', category: 'Aksesuar' },
];

const CATEGORIES = ['Hepsi', 'Elbise', 'Üst Giyim', 'Alt Giyim', 'Dış Giyim', 'Aksesuar'];

export const PosProductGrid = () => {
    const { addToCart } = usePos();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('Hepsi');

    const filteredProducts = MOCK_PRODUCTS.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'Hepsi' || product.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

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
                    {CATEGORIES.map(cat => (
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
                            className="cursor-pointer hover:shadow-md transition-shadow active:scale-95 duration-150 overflow-hidden group border-0 shadow-sm"
                            onClick={() => {
                                addToCart(product);
                                toast.success(`${product.name} sepete eklendi`, {
                                    duration: 1500,
                                    position: 'bottom-right'
                                });
                            }}
                        >
                            <div className="aspect-square bg-slate-200 relative">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
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
