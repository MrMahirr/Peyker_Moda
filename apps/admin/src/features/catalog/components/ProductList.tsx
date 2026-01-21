import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash, Eye } from 'lucide-react';

export type Product = {
    id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    stock: number;
    status: 'Published' | 'Draft' | 'Out of Stock';
    image: string;
};

const mockProducts: Product[] = [
    {
        id: '1',
        name: 'Yazlık Çiçekli Elbise',
        sku: 'ELB-2024-001',
        category: 'Elbise',
        price: 899.90,
        stock: 150,
        status: 'Published',
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=100&h=100&fit=crop',
    },
    {
        id: '2',
        name: 'Kot Ceket - Vintage',
        sku: 'CKT-2024-055',
        category: 'Dış Giyim',
        price: 1250.00,
        stock: 45,
        status: 'Published',
        image: 'https://images.unsplash.com/photo-1551537482-f20963253ecb?w=100&h=100&fit=crop',
    },
    {
        id: '3',
        name: 'Basic Beyaz Tişört',
        sku: 'TSH-2024-102',
        category: 'Üst Giyim',
        price: 299.90,
        stock: 0,
        status: 'Out of Stock',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    },
    {
        id: '4',
        name: 'Kumaş Pantolon - Siyah',
        sku: 'PNT-2024-301',
        category: 'Alt Giyim',
        price: 599.90,
        stock: 80,
        status: 'Draft',
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=100&h=100&fit=crop',
    }
];

export const ProductList = () => {
    const navigate = useNavigate();

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: 'image',
            header: 'Görsel',
            cell: ({ row }) => (
                <div className="h-12 w-12 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={row.getValue('image')} alt={row.getValue('name')} className="h-full w-full object-cover" />
                </div>
            )
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
        },
        {
            accessorKey: 'price',
            header: 'Fiyat',
            cell: ({ row }) => {
                const price = parseFloat(row.getValue('price'));
                return <div className="font-medium">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price)}</div>;
            }
        },
        {
            accessorKey: 'stock',
            header: 'Stok',
            cell: ({ row }) => {
                const stock = row.getValue('stock') as number;
                return (
                    <div className={stock < 10 ? 'text-red-600 font-medium' : 'text-slate-700'}>
                        {stock} adet
                    </div>
                )
            }
        },
        {
            accessorKey: 'status',
            header: 'Durum',
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                let colorClass = 'bg-slate-100 text-slate-800';

                if (status === 'Published') colorClass = 'bg-emerald-100 text-emerald-800';
                if (status === 'Out of Stock') colorClass = 'bg-red-100 text-red-800';
                if (status === 'Draft') colorClass = 'bg-amber-100 text-amber-800';

                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                        {status === 'Published' ? 'Yayında' : status === 'Out of Stock' ? 'Tükendi' : 'Taslak'}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            cell: () => {
                return (
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-indigo-600">
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-orange-600">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

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
                data={mockProducts}
                searchKey="name"
            />
        </div>
    );
};
