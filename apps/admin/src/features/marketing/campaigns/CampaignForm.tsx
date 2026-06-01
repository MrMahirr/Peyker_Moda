import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { campaignsService, CreateCampaignDto } from '../services/campaigns.service';
import { toast } from 'sonner';

export const CampaignForm = () => {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        startDate: '',
        endDate: '',
        discountRate: '',
        isActive: true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const dto: any = {
                name: formData.name,
                code: formData.code || undefined,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                discountType: 'PERCENTAGE',
                discountValue: parseFloat(formData.discountRate)
            };
            await campaignsService.createCampaign(dto);
            toast.success("Kampanya başarıyla kaydedildi.");
            navigate(-1);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Kampanya kaydedilirken bir hata oluştu.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-8 space-y-6 max-w-3xl">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Geri
                </Button>
                <div>
                    <PageHeader title="Yeni Kampanya" />
                    <p className="text-zinc-500">Kampanya detaylarını giriniz</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-zinc-200 space-y-6">
                <div className="space-y-4">
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

                    <Input 
                        label="İndirim Oranı (%)" 
                        type="number" 
                        min="1" 
                        max="100" 
                        placeholder="Örn: 20" 
                        value={formData.discountRate}
                        onChange={(e) => setFormData({ ...formData, discountRate: e.target.value })}
                        required
                    />

                    <div className="flex items-center gap-2 pt-2">
                        <input 
                            type="checkbox" 
                            id="isActive" 
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-4 h-4 text-primary border-zinc-300 rounded focus:ring-primary"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-zinc-700">
                            Kampanyayı aktif et
                        </label>
                    </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex justify-end gap-3">
                    <Button variant="secondary" type="button" onClick={() => navigate(-1)} disabled={isSaving}>
                        İptal
                    </Button>
                    <Button variant="primary" type="submit" disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {isSaving ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                </div>
            </form>
        </div>
    );
};
