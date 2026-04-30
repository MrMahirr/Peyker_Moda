import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Send, Save } from 'lucide-react';
import { toast } from 'sonner';
import { shippingService } from '../services/shipping.service';

export const ShipmentCreate = () => {
    const [formData, setFormData] = useState({ orderId: '', carrierId: '', recipientName: '', recipientPhone: '', recipientAddress: '', weight: '', });

    const handleSubmit = async () => {
        try {
            await shippingService.createShipment({ ...formData, weight: formData.weight ? Number(formData.weight) : undefined });
            toast.success('Gönderi oluşturuldu');
        } catch { toast.error('Gönderi oluşturulamadı'); }
    };

    return (
        <div className="space-y-6 p-6">
            <h2 className="text-lg font-bold text-zinc-900">Yeni Gönderi Oluştur</h2>
            <div className="grid md:grid-cols-2 gap-4">
                <Input placeholder="Sipariş ID" value={formData.orderId} onChange={e => setFormData({...formData, orderId: e.target.value})} className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium px-4" />
                <Input placeholder="Alıcı Adı" value={formData.recipientName} onChange={e => setFormData({...formData, recipientName: e.target.value})} className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium px-4" />
                <Input placeholder="Telefon" value={formData.recipientPhone} onChange={e => setFormData({...formData, recipientPhone: e.target.value})} className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium px-4" />
                <Input placeholder="Ağırlık (kg)" type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium px-4" />
                <Input placeholder="Adres" value={formData.recipientAddress} onChange={e => setFormData({...formData, recipientAddress: e.target.value})} className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium px-4 md:col-span-2" />
            </div>
            <Button icon={<Send className="w-4 h-4" />} className="font-semibold shadow-md" onClick={handleSubmit}>Gönderi Oluştur</Button>
        </div>
    );
};
