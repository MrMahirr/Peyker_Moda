import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, Loader2, Percent, DollarSign } from 'lucide-react';
import { campaignsService } from '../services/campaigns.service';
import { toast } from 'sonner';

interface CampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CampaignModal: React.FC<CampaignModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isSaving, setIsSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        startDate: '',
        endDate: '',
        type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
        discountValue: '',
        isActive: true
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: '',
                code: '',
                startDate: '',
                endDate: '',
                type: 'PERCENTAGE',
                discountValue: '',
                isActive: true
            });
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await campaignsService.createCampaign({
                name: formData.name,
                code: formData.code || undefined,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                discountType: formData.type,
                discountValue: parseFloat(formData.discountValue),
                isActive: formData.isActive
            });
            toast.success("Kampanya başarıyla kaydedildi.", { className: 'font-medium py-3 px-4 shadow-xl' });
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Kampanya kaydedilirken bir hata oluştu.", { className: 'font-medium' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Yeni Kampanya Oluştur"
            description="Müşterileriniz için yeni bir indirim fırsatı veya kampanya tanımlayın."
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                    <Input 
                        label="Kampanya Adı" 
                        placeholder="Örn: Yaz İndirimi 2026" 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <Input 
                        label="İndirim Kodu (İsteğe Bağlı)" 
                        placeholder="Örn: YAZ20" 
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Başlangıç Tarihi" 
                            type="date" 
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            required
                        />
                        <Input 
                            label="Bitiş Tarihi" 
                            type="date" 
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-zinc-700">İndirim Türü</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'PERCENTAGE' })}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-semibold transition-all ${
                                    formData.type === 'PERCENTAGE' 
                                        ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-600/20' 
                                        : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                                }`}
                            >
                                <Percent className="w-4 h-4" />
                                Yüzdelik İndirim (%)
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'FIXED_AMOUNT' })}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-semibold transition-all ${
                                    formData.type === 'FIXED_AMOUNT' 
                                        ? 'bg-amber-50 border-amber-200 text-amber-700 ring-1 ring-amber-600/20' 
                                        : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                                }`}
                            >
                                <DollarSign className="w-4 h-4" />
                                Net Fiyat İndirimi (₺)
                            </button>
                        </div>
                    </div>

                    <Input 
                        label={formData.type === 'PERCENTAGE' ? "İndirim Oranı (%)" : "İndirim Tutarı (₺)"} 
                        type="number" 
                        min="1" 
                        max={formData.type === 'PERCENTAGE' ? "100" : undefined} 
                        placeholder={formData.type === 'PERCENTAGE' ? "Örn: 20" : "Örn: 500"} 
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        required
                    />

                    <div className="flex items-center gap-2 pt-2 bg-zinc-50 p-4 rounded-xl border border-zinc-200/50">
                        <input 
                            type="checkbox" 
                            id="isActive" 
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-5 h-5 text-blue-600 border-zinc-300 rounded focus:ring-blue-600"
                        />
                        <label htmlFor="isActive" className="text-[14px] font-semibold text-zinc-800 cursor-pointer">
                            Kampanyayı hemen aktif et
                        </label>
                    </div>
                </div>

                <div className="pt-6 border-t border-zinc-100 flex justify-end gap-3">
                    <Button variant="secondary" type="button" onClick={onClose} disabled={isSaving} className="font-semibold">
                        İptal
                    </Button>
                    <Button variant="primary" type="submit" disabled={isSaving} className="font-bold min-w-[140px]">
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {isSaving ? "Kaydediliyor..." : "Kampanyayı Başlat"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
