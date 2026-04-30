import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash, Eye, Loader2 } from 'lucide-react';
import { productsService, Product } from '../services/products.service';
import { Badge } from '@/components/ui/Badge';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
};

export const ProductList = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await productsService.getAll({ limit: 50 });
            setProducts(response.data || []);
        } catch (err) {
            setError('Ürünler yüklenemedi');
            console.error('Products fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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

    const togglePublish = async (id: string, isActive: boolean) => {
        setUpdatingId(id);
        try {
            const updated = await productsService.update(id, { isActive: !isActive });
            setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
        } catch (err) {
            console.error('Publish toggle error:', err);
        } finally {
            setUpdatingId(null);
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
                    <div className="h-[52px] w-[42px] rounded-md overflow-hidden bg-zinc-50 border border-zinc-200/80">
                        <img src={imageUrl} alt={row.original.name} className="h-full w-full object-cover" />
                    </div>
                );
            }
        },
        {
            accessorKey: 'name',
            header: 'Ürün Adı',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-zinc-900">{row.getValue('name')}</span>
                    <span className="text-[11px] text-zinc-400 font-medium">SKU: {row.original.sku}</span>
                </div>
            ),
        },
        {
            accessorKey: 'category',
            header: 'Kategori',
            cell: ({ row }) => (
                <Badge variant="neutral">{row.original.category?.name || 'Kategorisiz'}</Badge>
            ),
        },
        {
            accessorKey: 'basePrice',
            header: 'Fiyat',
            cell: ({ row }) => {
                const basePrice = row.original.basePrice;
                const salePrice = row.original.salePrice;
                return (
                    <div className="flex flex-col">
                        <span className="text-[13px] font-semibold text-zinc-900">{formatCurrency(salePrice || basePrice)}</span>
                        {salePrice && <span className="text-[11px] text-zinc-400 line-through font-medium">{formatCurrency(basePrice)}</span>}
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
                    <span className={stock < 10 ? 'text-[13px] font-bold text-red-600' : 'text-[13px] font-semibold text-zinc-700'}>
                        {stock} Adet
                    </span>
                );
            }
        },
        {
            accessorKey: 'isActive',
            header: 'Durum',
            cell: ({ row }) => {
                const isActive = row.original.isActive;
                return (
                    <Badge variant={isActive ? 'success' : 'neutral'} dot>
                        {isActive ? 'Yayında' : 'Taslak'}
                    </Badge>
                );
            },
        },
        {
            id: 'publish',
            header: 'Yayin',
            cell: ({ row }) => {
                const isActive = row.original.isActive;
                const isUpdating = updatingId === row.original.id;
                return (
                    <Button
                        variant={isActive ? 'secondary' : 'primary'}
                        size="sm"
                        className={isActive ? 'text-amber-700 border-amber-200/60 bg-amber-50 hover:bg-amber-100' : ''}
                        onClick={(event) => {
                            event.stopPropagation();
                            togglePublish(row.original.id, isActive);
                        }}
                        disabled={isUpdating}
                    >
                        {isUpdating ? 'Isleniyor...' : isActive ? 'Yayindan Al' : 'Yayinda'}
                    </Button>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                return (
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-zinc-400 hover:text-primary hover:bg-zinc-50"
                            onClick={(event) => {
                                event.stopPropagation();
                                navigate(`/catalog/${row.original.id}`);
                            }}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-zinc-400 hover:text-amber-600 hover:bg-amber-50"
                            onClick={(event) => {
                                event.stopPropagation();
                                navigate(`/catalog/${row.original.id}/edit`);
                            }}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                            onClick={(event) => {
                                event.stopPropagation();
                                handleDelete(row.original.id);
                            }}
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
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-zinc-500">Ürünler yükleniyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-600 font-medium">
                {error}
            </div>
        );
    }

    return (
        <div className="bg-surface rounded-xl border border-zinc-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-base font-semibold text-zinc-900">Ürün Kataloğu</h2>
                    <p className="text-xs font-medium text-zinc-500 mt-0.5">Tüm ürünlerinizi buradan yönetebilirsiniz.</p>
                </div>
                <Button
                    variant="primary"
                    size="sm"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => navigate('/catalog/new')}
                >
                    Yeni Ürün
                </Button>
            </div>

            <DataGrid
                columns={columns}
                data={products}
                searchKey="name"
                onRowClick={(row) => navigate(`/catalog/${row.id}`)}
            />

        </div>
    );
};
