import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Truck, Plus, Trash, Loader2, Power } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { shippingService } from '../services/shipping.service';
import type { Carrier } from '../types';

export const CarrierList = () => {
    const [carriers, setCarriers] = useState<Carrier[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCarriers = async () => {
        try { 
            setCarriers(await shippingService.getCarriers() || []); 
        } catch { 
            toast.error('Kargo firmaları yüklenemedi'); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchCarriers(); }, []);

    const handleAddCarrier = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Kargo Firması Ekle',
            html:
                '<input id="swal-input1" class="swal2-input" placeholder="Firma Adı (Örn: Yurtiçi Kargo)">' +
                '<input id="swal-input2" class="swal2-input" placeholder="Kısa Kod (Örn: YURTICI)">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Ekle',
            cancelButtonText: 'İptal',
            preConfirm: () => {
                const name = (document.getElementById('swal-input1') as HTMLInputElement).value;
                const code = (document.getElementById('swal-input2') as HTMLInputElement).value;
                if (!name || !code) {
                    Swal.showValidationMessage('Firma adı ve kodu zorunludur');
                }
                return { name, code: code.toUpperCase() };
            }
        });

        if (formValues) {
            try {
                await shippingService.createCarrier({ name: formValues.name, code: formValues.code as any, isActive: true });
                toast.success('Firma eklendi');
                fetchCarriers();
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Firma eklenemedi');
            }
        }
    };

    const handleDelete = async (id: string, name: string) => {
        const { isConfirmed } = await Swal.fire({
            title: 'Emin misiniz?',
            text: `${name} silinecek, onaylıyor musunuz?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Evet, Sil',
            cancelButtonText: 'İptal',
            confirmButtonColor: '#ef4444'
        });
        
        if (!isConfirmed) return;
        
        try {
            await shippingService.deleteCarrier(id);
            toast.success('Firma silindi');
            fetchCarriers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Firma silinemedi');
        }
    };

    const handleToggleActive = async (carrier: Carrier) => {
        const actionText = carrier.isActive ? 'pasif' : 'aktif';
        const { isConfirmed } = await Swal.fire({
            title: 'Emin misiniz?',
            text: `${carrier.name} firmasını ${actionText} duruma getirmek istiyor musunuz?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Evet, Güncelle',
            cancelButtonText: 'İptal',
            confirmButtonColor: carrier.isActive ? '#f59e0b' : '#10b981'
        });

        if (!isConfirmed) return;
        
        try {
            await shippingService.updateCarrier(carrier.id, { isActive: !carrier.isActive });
            toast.success('Firma durumu güncellendi');
            fetchCarriers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Firma durumu güncellenemedi');
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-zinc-900" /></div>;

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-zinc-900">Kargo Firmaları</h2>
                <Button onClick={handleAddCarrier} icon={<Plus className="w-4 h-4" />} className="font-semibold shadow-md">Firma Ekle</Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
                {carriers.map(c => (
                    <div key={c.id} className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-blue-50 rounded-xl"><Truck className="h-5 w-5 text-blue-600" /></div>
                            <div><h3 className="font-bold text-zinc-900">{c.name}</h3><span className="text-[11px] font-mono text-zinc-400">{c.code}</span></div>
                            <div className="ml-auto flex items-center gap-2">
                                <Badge variant={c.isActive ? 'success' : 'neutral'}>{c.isActive ? 'Aktif' : 'Pasif'}</Badge>
                                <button onClick={() => handleToggleActive(c)} title={c.isActive ? 'Pasif Yap' : 'Aktif Yap'} className={`p-1.5 rounded-lg transition-colors ${c.isActive ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}>
                                    <Power className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(c.id, c.name)} title="Sil" className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
