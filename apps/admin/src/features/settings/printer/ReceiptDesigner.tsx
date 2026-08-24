import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';
import { settingsService } from '../services/settings.service';
import { PageHeader } from '@/components/shared/PageHeader';
import { Receipt, ReceiptLineItem } from '@/components/shared/Receipt';

// Ayarlar sayfasındaki önizleme, POS'ta gerçekte basılan fişle birebir aynı
// bileşeni (Receipt) kullanır — böylece "Test Yazdır" gerçek çıktıyı yansıtır.
const PREVIEW_CART: ReceiptLineItem[] = [
    { id: 'preview-1', name: 'Keten Gomlek (M)', price: 450, quantity: 1, lineType: 'SALE' },
    { id: 'preview-2', name: 'Kot Pantolon (32)', price: 600, quantity: 2, lineType: 'SALE' },
];
const PREVIEW_TOTAL = PREVIEW_CART.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const ReceiptDesigner = () => {
    const [headerText, setHeaderText] = useState('Peyker Moda');
    const [footerText, setFooterText] = useState('Tesekkur ederiz, yine bekleriz.');
    const [address, setAddress] = useState('Bagdat Cad. No:123\nKadikoy / Istanbul');
    const [phone, setPhone] = useState('(555) 123 45 67');
    const [taxRate, setTaxRate] = useState('10'); // Stored as string for input
    const [showLogo, setShowLogo] = useState(true);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
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
                setLogoUrl(data.storeLogo || null);
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

    const receiptProps = {
        cart: PREVIEW_CART,
        total: PREVIEW_TOTAL,
        paymentMethod: 'cash',
        date: new Date(),
        receiptNo: 'PM-20260824-14907',
        barcodeValue: '26082414907',
        cashierName: 'Ahmet Yilmaz',
        headerText,
        address,
        phone,
        footerText,
        taxRate: Number(taxRate) || 0,
        showLogo,
        logoUrl: logoUrl || undefined,
    };

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

                {/* Live Preview - POS'ta gerçekte basılan fiş bileşeninin aynısı */}
                <div className="bg-zinc-100 p-8 rounded-lg border border-zinc-200 flex justify-center">
                    <Receipt {...receiptProps} />
                </div>
            </div>

            {/* Gerçek "Test Yazdır" çıktısı: #print-root'a portallanır (bkz.
                index.html ve index.css @media print) — bu sayfa düzeninden
                tamamen izole, gerçek POS yazdırma yolunun aynısı. */}
            {createPortal(
                <Receipt {...receiptProps} />,
                document.getElementById('print-root') ?? document.body,
            )}
        </div>
    );
};
