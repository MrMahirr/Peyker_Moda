import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Store, Save } from 'lucide-react';
import { toast } from 'sonner';

export const StoreSettings = () => {
    const [formData, setFormData] = useState({ name: 'Peyker Moda', email: 'iletisim@peykermoda.com', phone: '+90 555 123 4567', address: 'İstanbul, Türkiye', currency: 'TRY', taxNumber: '1234567890', taxOffice: 'Beyoğlu' });

    const handleSave = () => { toast.success('Mağaza ayarları kaydedildi'); };

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-zinc-100 rounded-xl"><Store className="h-5 w-5 text-zinc-600" /></div>
                <div><h2 className="text-xl font-bold text-zinc-900">Mağaza Ayarları</h2><p className="text-[13px] text-zinc-500">Genel mağaza ve fatura bilgileri.</p></div>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="text-[13px] font-semibold text-zinc-700 block mb-1">Mağaza Adı</label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px]" /></div>
                    <div><label className="text-[13px] font-semibold text-zinc-700 block mb-1">E-Posta</label><Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px]" /></div>
                    <div><label className="text-[13px] font-semibold text-zinc-700 block mb-1">Telefon</label><Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px]" /></div>
                    <div><label className="text-[13px] font-semibold text-zinc-700 block mb-1">Para Birimi</label><Input value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px]" /></div>
                    <div className="md:col-span-2"><label className="text-[13px] font-semibold text-zinc-700 block mb-1">Adres</label><textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full h-20 bg-white border border-zinc-200/80 rounded-lg p-3 text-[13px] resize-none" /></div>
                    <div><label className="text-[13px] font-semibold text-zinc-700 block mb-1">Vergi Numarası</label><Input value={formData.taxNumber} onChange={e => setFormData({...formData, taxNumber: e.target.value})} className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px]" /></div>
                    <div><label className="text-[13px] font-semibold text-zinc-700 block mb-1">Vergi Dairesi</label><Input value={formData.taxOffice} onChange={e => setFormData({...formData, taxOffice: e.target.value})} className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px]" /></div>
                </div>
                <div className="flex justify-end pt-4"><Button icon={<Save className="w-4 h-4" />} className="font-semibold shadow-md" onClick={handleSave}>Değişiklikleri Kaydet</Button></div>
            </div>
        </div>
    );
};
