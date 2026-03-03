import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash, Eye, Loader2 } from 'lucide-react';
import { productsService, Product } from '../services/products.service';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
};

export const ProductList = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productsService.getAll({ limit: 50 });
                setProducts(response.data || []);
            } catch (err) {
                setError('Ürünler yüklenemedi');
                console.error('Products fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
            try {
                await productsService.delete(id);
                setProducts(products.filter(p => p.id !== id));
            } catch (err) {
                console.error('Delete error:', err);
            }
        }
    };

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: 'images',
            header: 'Görsel',
            cell: ({ row }) => {
                const images = row.getValue('images') as string[] | undefined;
                const imageUrl = images?.[0] || 'https://via.placeholder.com/100';
                return (
                    <div className="h-12 w-12 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                        <img src={imageUrl} alt={row.original.name} className="h-full w-full object-cover" />
                    </div>
                );
            }
        },
        {
            accessorKey: 'name',
            header: 'Ürün Adı',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium text-slate-900">{row.getValue('name')}</div>
                    <div className="text-xs text-slate-500">{row.original.sku}</div>
                </div>
            ),
        },
        {
            accessorKey: 'category',
            header: 'Kategori',
            cell: ({ row }) => row.original.category?.name || '-',
        },
        {
            accessorKey: 'basePrice',
            header: 'Fiyat',
            cell: ({ row }) => {
                const basePrice = row.original.basePrice;
                const salePrice = row.original.salePrice;
                return (
                    <div>
                        <div className="font-medium">{formatCurrency(salePrice || basePrice)}</div>
                        {salePrice && <div className="text-xs text-slate-400 line-through">{formatCurrency(basePrice)}</div>}
                    </div>
                );
            }
        },
        {
            accessorKey: 'totalStock',
            header: 'Stok',
            cell: ({ row }) => {
                const stock = row.original.totalStock || 0;
                return (
                    <div className={stock < 10 ? 'text-red-600 font-medium' : 'text-slate-700'}>
                        {stock} adet
                    </div>
                );
            }
        },
        {
            accessorKey: 'isActive',
            header: 'Durum',
            cell: ({ row }) => {
                const isActive = row.original.isActive;
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                        {isActive ? 'Yayında' : 'Taslak'}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                return (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-indigo-600"
                            onClick={() => navigate(`/catalog/${row.original.id}`)}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-orange-600"
                            onClick={() => navigate(`/catalog/${row.original.id}/edit`)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(row.original.id)}
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Ürün Kataloğu</h2>
                    <p className="text-sm text-slate-500">Mağaza ve internet sitenizdeki ürünleri buradan yönetebilirsiniz.</p>
                </div>
                <Button
                    className="bg-slate-900 hover:bg-slate-800"
                    onClick={() => navigate('/catalog/new')}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Ürün Ekle
                </Button>
            </div>

            <DataGrid
                columns={columns}
                data={products}
                searchKey="name"
            />
        </div>
    );
};
