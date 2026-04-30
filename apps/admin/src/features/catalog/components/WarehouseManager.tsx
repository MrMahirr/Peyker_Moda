import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Warehouse as WarehouseIcon, Plus, Edit, Trash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { showDeleteConfirm } from '@/utils/swal';
import { stockService } from '../services/stock.service';
import type { Warehouse } from '../types/stock.types';

export const WarehouseManager = () => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<Warehouse | null>(null);
    const [formData, setFormData] = useState({ name: '', address: '', phone: '' });

    const fetchWarehouses = async () => {
        try {
            setLoading(true);
            const data = await stockService.getWarehouses();
            setWarehouses(data || []);
        } catch (err) {
            console.error('Warehouses fetch error:', err);
            toast.error('Depolar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const handleSubmit = async () => {
        try {
            if (editItem) {
                await stockService.updateWarehouse(editItem.id, formData);
                toast.success('Depo güncellendi');
            } else {
                await stockService.createWarehouse(formData);
                toast.success('Depo oluşturuldu');
            }
            setShowForm(false);
            setEditItem(null);
            setFormData({ name: '', address: '', phone: '' });
            fetchWarehouses();
        } catch (err) {
            console.error('Save warehouse error:', err);
            toast.error('Depo kaydedilemedi');
        }
    };

    const handleDelete = async (id: string) => {
        const result = await showDeleteConfirm('Depoyu Sil?', 'Bu depo silinecek. Emin misiniz?');
        if (result.isConfirmed) {
            try {
                await stockService.deleteWarehouse(id);
                setWarehouses(warehouses.filter(w => w.id !== id));
                toast.success('Depo silindi');
            } catch (err) {
                console.error('Delete error:', err);
                toast.error('Depo silinemedi');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
                <p className="text-[13px] font-medium text-zinc-500">Depolar yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-zinc-900">Depo / Mağaza Yönetimi</h1>
                    <p className="text-[13px] font-medium text-zinc-500 mt-1">Stok lokasyonlarınızı ve depo bilgilerinizi yönetin.</p>
                </div>
                <Button
                    className="font-semibold shadow-md active:scale-[0.98] transition-all"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => { setEditItem(null); setFormData({ name: '', address: '', phone: '' }); setShowForm(true); }}
                >
                    Yeni Depo
                </Button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-zinc-900">{editItem ? 'Depo Düzenle' : 'Yeni Depo Ekle'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            placeholder="Depo Adı"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium px-4"
                        />
                        <Input
                            placeholder="Adres"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium px-4"
                        />
                        <Input
                            placeholder="Telefon"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium px-4"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleSubmit} className="font-semibold">{editItem ? 'Güncelle' : 'Kaydet'}</Button>
                        <Button variant="ghost" onClick={() => setShowForm(false)} className="font-semibold">İptal</Button>
                    </div>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {warehouses.map((wh) => (
                    <div key={wh.id} className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-zinc-100 rounded-xl">
                                    <WarehouseIcon className="h-5 w-5 text-zinc-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900">{wh.name}</h3>
                                    {wh.address && <p className="text-[12px] text-zinc-500 mt-0.5">{wh.address}</p>}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {wh.isDefault && <Badge variant="info">Varsayılan</Badge>}
                                <Button
                                    variant="ghost" size="sm"
                                    className="h-8 w-8 p-0 text-zinc-400 hover:text-amber-600 hover:bg-amber-50"
                                    onClick={() => { setEditItem(wh); setFormData({ name: wh.name, address: wh.address || '', phone: wh.phone || '' }); setShowForm(true); }}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost" size="sm"
                                    className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDelete(wh.id)}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
