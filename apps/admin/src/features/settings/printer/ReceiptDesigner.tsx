import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Ticket, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { settingsService } from '../services/settings.service';
import { PageHeader } from '@/components/shared/PageHeader';

export const ReceiptDesigner = () => {
    const [headerText, setHeaderText] = useState('Peyker Moda');
    const [footerText, setFooterText] = useState('Tesekkur ederiz, yine bekleriz.');
    const [address, setAddress] = useState('Bagdat Cad. No:123\nKadikoy / Istanbul');
    const [phone, setPhone] = useState('(555) 123 45 67');
    const [taxRate, setTaxRate] = useState('10'); // Stored as string for input
    const [showLogo, setShowLogo] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadSettings = async () => {
            try {
                const data = await settingsService.getSettings();
                if (!isMounted) return;

                setHeaderText(data.receiptHeader || data.storeName || 'Peyker Moda');
                setFooterText(data.receiptFooter || 'Tesekkur ederiz, yine bekleriz.');
                setAddress(data.receiptAddress || data.storeAddress || '');
                setPhone(data.receiptPhone || data.storePhone || '');
                setTaxRate(String(data.receiptTaxRate ?? data.taxRate ?? 0));
                setShowLogo(data.receiptShowLogo ?? true);
            } catch (err) {
                console.error('Receipt settings fetch error:', err);
                toast.error('Yazici ayarlari yuklenemedi.', { className: 'font-medium' });
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

    // Mock calculations based on tax rate
    const { subTotal, taxAmount, total } = useMemo(() => {
        const rate = parseFloat(taxRate) || 0;
        // Example base amount is 1650 pure, but let's assume items include tax or exclude tax logic.
        // Let's assume the mock items total (1650) is the subtotal (base).
        const baseAmount = 1650;
        const tax = (baseAmount * rate) / 100;
        const finalTotal = baseAmount + tax;

        return {
            subTotal: baseAmount.toFixed(2),
            taxAmount: tax.toFixed(2),
            total: finalTotal.toFixed(2)
        };
    }, [taxRate]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await settingsService.updateSettings({
                receiptHeader: headerText,
                receiptFooter: footerText,
                receiptAddress: address,
                receiptPhone: phone,
                receiptTaxRate: Number(taxRate) || 0,
                receiptShowLogo: showLogo,
            });
            toast.success('Yazici ayarlari kaydedildi.', { className: 'font-medium' });
        } catch (err) {
            console.error('Receipt settings save error:', err);
            toast.error('Yazici ayarlari kaydedilemedi.', { className: 'font-medium' });
        } finally {
            setSaving(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-center h-64 gap-3">
                    <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
                    <span className="text-sm font-medium text-zinc-500">Yazici ayarlari yukleniyor...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <PageHeader title="Fiş Tasarımı" />
                    <p className="text-zinc-500">Musteri fislerinin gorunumunu ozellestirin</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="secondary" onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" />
                        Test Yazdir
                    </Button>
                    <Button onClick={handleSave} loading={saving}>Kaydet</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor Settings */}
                <div className="space-y-6 bg-white p-6 rounded-lg border border-zinc-200 h-fit">
                    <h3 className="font-medium text-zinc-900">Tasarim Ayarlari</h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Baslik Metni</label>
                            <Input value={headerText} onChange={(e) => setHeaderText(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Adres</label>
                            <textarea
                                className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Telefon</label>
                            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">KDV Orani (%)</label>
                            <Input
                                type="number"
                                value={taxRate}
                                onChange={(e) => setTaxRate(e.target.value)}
                                min="0" max="100"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Altbilgi Metni (Footer)</label>
                            <Input value={footerText} onChange={(e) => setFooterText(e.target.value)} />
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <input
                                type="checkbox"
                                id="showLogo"
                                checked={showLogo}
                                onChange={(e) => setShowLogo(e.target.checked)}
                                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600"
                            />
                            <label htmlFor="showLogo" className="text-sm font-medium text-zinc-700">Logoyu Goster</label>
                        </div>
                    </div>
                </div>

                {/* Live Preview */}
                <div className="bg-zinc-100 p-8 rounded-lg border border-zinc-200 flex justify-center">
                    <div id="printable-receipt" className="bg-white w-[300px] shadow-sm p-4 text-xs font-mono space-y-4">
                        <div className="text-center space-y-2 border-b border-dashed border-zinc-300 pb-4">
                            {showLogo && (
                                <div className="mx-auto h-12 w-12 bg-zinc-200 rounded-full flex items-center justify-center">
                                    <Ticket className="w-6 h-6 text-zinc-400" />
                                </div>
                            )}
                            <h2 className="font-bold text-lg">{headerText}</h2>
                            <div className="whitespace-pre-wrap">{address}</div>
                            <p>Tel: {phone}</p>
                        </div>

                        <div className="space-y-2 border-b border-dashed border-zinc-300 pb-4">
                            <div className="flex justify-between">
                                <span>Tarih: 22.01.2024</span>
                                <span>Saat: 14:30</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Fis No: 00123</span>
                                <span>Kasiyer: Ahmet</span>
                            </div>
                        </div>

                        <div className="space-y-2 pb-4 border-b border-dashed border-zinc-300">
                            <div className="flex justify-between">
                                <span>1 x Keten Gomlek (M)</span>
                                <span>450.00 tl</span>
                            </div>
                            <div className="flex justify-between">
                                <span>2 x Kot Pantolon (32)</span>
                                <span>1200.00 tl</span>
                            </div>
                        </div>

                        <div className="space-y-1 font-bold">
                            <div className="flex justify-between">
                                <span>ARA TOPLAM</span>
                                <span>{subTotal} tl</span>
                            </div>
                            <div className="flex justify-between">
                                <span>KDV (%{taxRate})</span>
                                <span>{taxAmount} tl</span>
                            </div>
                            <div className="flex justify-between text-base">
                                <span>GENEL TOPLAM</span>
                                <span>{total} tl</span>
                            </div>
                        </div>

                        <div className="text-center pt-4 text-zinc-500">
                            <p>{footerText}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
