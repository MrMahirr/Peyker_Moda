import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Building, Edit2, Trash2 } from 'lucide-react';
import { suppliersService } from '../suppliers.service';
import { Supplier } from '../types';
import { SupplierModal } from './SupplierModal';

export const SupplierList = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const data = await suppliersService.findAll();
            setSuppliers(data);
        } catch (error) {
            console.error("Failed to fetch suppliers", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleAdd = () => {
        setEditingSupplier(null);
        setIsModalOpen(true);
    };

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu tedarikçiyi silmek istediğinizden emin misiniz?')) return;
        try {
            await suppliersService.remove(id);
            fetchSuppliers();
        } catch (error) {
            console.error("Failed to delete supplier", error);
            alert("Silme işlemi başarısız.");
        }
    };

    const handleSave = async (data: any) => {
        if (editingSupplier) {
            await suppliersService.update(editingSupplier.id, data);
        } else {
            await suppliersService.create(data);
        }
        fetchSuppliers();
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-zinc-900">Tedarikçi Listesi</h2>
                <Button onClick={handleAdd} icon={<Plus className="w-4 h-4" />} className="font-semibold shadow-md">
                    Yeni Tedarikçi
                </Button>
            </div>
            
            {loading ? (
                <div className="py-20 text-center text-zinc-400">Yükleniyor...</div>
            ) : suppliers.length > 0 ? (
                <div className="overflow-x-auto border border-zinc-200/80 rounded-xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200/80 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                <th className="p-4">Firma Adı</th>
                                <th className="p-4">Yetkili</th>
                                <th className="p-4">İletişim</th>
                                <th className="p-4">Durum</th>
                                <th className="p-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200/80">
                            {suppliers.map(supplier => (
                                <tr key={supplier.id} className="hover:bg-zinc-50/50 transition-colors">
                                    <td className="p-4 font-medium text-zinc-900">{supplier.name}</td>
                                    <td className="p-4 text-zinc-600">{supplier.contactName || '-'}</td>
                                    <td className="p-4">
                                        <div className="text-zinc-600 text-sm">{supplier.email || '-'}</div>
                                        <div className="text-zinc-500 text-xs">{supplier.phone || '-'}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${supplier.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                            {supplier.isActive ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleEdit(supplier)} className="p-2 text-zinc-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(supplier.id)} className="p-2 text-zinc-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 ml-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 rounded-2xl border border-zinc-200/80">
                    <Building className="w-12 h-12 text-zinc-300 mb-4" />
                    <p className="text-[15px] font-semibold text-zinc-500">Tedarikçi bulunamadı</p>
                    <p className="text-[13px] text-zinc-400 mt-1">Sisteme yeni bir tedarikçi ekleyin.</p>
                </div>
            )}

            <SupplierModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                supplier={editingSupplier}
            />
        </div>
    );
};
