import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { Store, MapPin, Phone, Mail, Save, Loader2 } from 'lucide-react';
import { settingsService } from '../services/settings.service';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';

interface StoreSettingsForm {
    storeName: string;
    storeAddress: string;
    storePhone: string;
    storeEmail: string;
}

export const StoreSettings = () => {
    const [form, setForm] = useState<StoreSettingsForm>({
        storeName: '',
        storeAddress: '',
        storePhone: '',
        storeEmail: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadSettings = async () => {
            try {
                const data = await settingsService.getSettings();
                if (isMounted) {
                    setForm({
                        storeName: data.storeName || '',
                        storeAddress: data.storeAddress || '',
                        storePhone: data.storePhone || '',
                        storeEmail: data.storeEmail || '',
                    });
                }
            } catch (err) {
                console.error('Settings fetch error:', err);
                toast.error('Magaza ayarlari yuklenemedi.', { className: 'font-medium' });
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadSettings();
        return () => {
            isMounted = false;
        };
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await settingsService.updateSettings({
                storeName: form.storeName,
                storeAddress: form.storeAddress,
                storePhone: form.storePhone,
                storeEmail: form.storeEmail,
            });
            setForm({
                storeName: updated.storeName || '',
                storeAddress: updated.storeAddress || '',
                storePhone: updated.storePhone || '',
                storeEmail: updated.storeEmail || '',
            });
            toast.success('Ayarlar kaydedildi.', { className: 'font-medium' });
        } catch (err) {
            console.error('Settings save error:', err);
            toast.error('Ayarlar kaydedilemedi.', { className: 'font-medium' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-900" />
                <span className="text-sm font-medium text-zinc-500">Ayarlar yukleniyor...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <PageHeader title="Mağaza Ayarları" />
                <p className="text-[13px] font-medium text-zinc-500 mt-1">Sistem uzerindeki genel magaza bilgilerinizi yonetin.</p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
                <div className="bg-zinc-50/50 border-b border-zinc-100 px-6 py-4 flex items-center gap-2">
                    <Store className="w-5 h-5 text-zinc-400" />
                    <h3 className="text-[15px] font-bold text-zinc-900">Temel Bilgiler</h3>
                </div>

                <div className="p-6 space-y-8">
                    <div className="space-y-3">
                        <label className="text-[13px] font-bold text-zinc-700 uppercase tracking-wide">Magaza Adi</label>
                        <Input
                            placeholder="Peyker Moda"
                            value={form.storeName}
                            onChange={(e) => setForm((prev) => ({ ...prev, storeName: e.target.value }))}
                            className="h-12 bg-zinc-50 border-zinc-200/80 text-[15px] font-medium"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[13px] font-bold text-zinc-700 uppercase tracking-wide">Magaza Logosu</label>
                        <div className="w-full max-w-sm">
                            <ImageUpload onChange={() => { }} value="" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[13px] font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400" /> Adres
                        </label>
                        <textarea
                            className="flex w-full rounded-xl border border-zinc-200/80 bg-zinc-50 px-4 py-3 text-[14px] font-medium transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 disabled:cursor-not-allowed min-h-[100px] resize-y"
                            placeholder="Acik adres bilgilerini buraya giriniz..."
                            value={form.storeAddress}
                            onChange={(e) => setForm((prev) => ({ ...prev, storeAddress: e.target.value }))}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[13px] font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-zinc-400" /> Telefon
                            </label>
                            <Input
                                placeholder="+90 555 555 55 55"
                                value={form.storePhone}
                                onChange={(e) => setForm((prev) => ({ ...prev, storePhone: e.target.value }))}
                                className="h-11 bg-zinc-50 border-zinc-200/80 text-[14px] font-medium"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[13px] font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-zinc-400" /> E-posta
                            </label>
                            <Input
                                placeholder="info@peykermoda.com"
                                value={form.storeEmail}
                                onChange={(e) => setForm((prev) => ({ ...prev, storeEmail: e.target.value }))}
                                className="h-11 bg-zinc-50 border-zinc-200/80 text-[14px] font-medium"
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200/80 flex justify-end">
                    <Button
                        className="h-11 px-6 font-bold tracking-wide shadow-md active:scale-[0.98] transition-all"
                        onClick={handleSave}
                        loading={saving}
                    >
                        <Save className="w-4 h-4 mr-2 opacity-70" />
                        Degisiklikleri Kaydet
                    </Button>
                </div>
            </div>
        </div>
    );
};
