import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Ticket, Printer } from 'lucide-react';

export const ReceiptDesigner = () => {
    const [headerText, setHeaderText] = useState('Peyker Moda');
    const [footerText, setFooterText] = useState('Teşekkür ederiz, yine bekleriz.');
    const [address, setAddress] = useState('Bağdat Cad. No:123\nKadıköy / İstanbul');
    const [phone, setPhone] = useState('(555) 123 45 67');
    const [taxRate, setTaxRate] = useState('10'); // Stored as string for input
    const [showLogo, setShowLogo] = useState(true);

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

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Fiş Tasarımı</h1>
                    <p className="text-slate-500">Müşteri fişlerinin görünümünü özelleştirin</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline">
                        <Printer className="w-4 h-4 mr-2" />
                        Test Yazdır
                    </Button>
                    <Button>Kaydet</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor Settings */}
                <div className="space-y-6 bg-white p-6 rounded-lg border border-slate-200 h-fit">
                    <h3 className="font-medium text-slate-900">Tasarım Ayarları</h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Başlık Metni</label>
                            <Input value={headerText} onChange={(e) => setHeaderText(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Adres</label>
                            <textarea
                                className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Telefon</label>
                            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">KDV Oranı (%)</label>
                            <Input
                                type="number"
                                value={taxRate}
                                onChange={(e) => setTaxRate(e.target.value)}
                                min="0" max="100"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Altbilgi Metni (Footer)</label>
                            <Input value={footerText} onChange={(e) => setFooterText(e.target.value)} />
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <input
                                type="checkbox"
                                id="showLogo"
                                checked={showLogo}
                                onChange={(e) => setShowLogo(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                            />
                            <label htmlFor="showLogo" className="text-sm font-medium text-slate-700">Logoyu Göster</label>
                        </div>
                    </div>
                </div>

                {/* Live Preview */}
                <div className="bg-slate-100 p-8 rounded-lg border border-slate-200 flex justify-center">
                    <div className="bg-white w-[300px] shadow-sm p-4 text-xs font-mono space-y-4">
                        <div className="text-center space-y-2 border-b border-dashed border-slate-300 pb-4">
                            {showLogo && (
                                <div className="mx-auto h-12 w-12 bg-slate-200 rounded-full flex items-center justify-center">
                                    <Ticket className="w-6 h-6 text-slate-400" />
                                </div>
                            )}
                            <h2 className="font-bold text-lg">{headerText}</h2>
                            <div className="whitespace-pre-wrap">{address}</div>
                            <p>Tel: {phone}</p>
                        </div>

                        <div className="space-y-2 border-b border-dashed border-slate-300 pb-4">
                            <div className="flex justify-between">
                                <span>Tarih: 22.01.2024</span>
                                <span>Saat: 14:30</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Fiş No: 00123</span>
                                <span>Kasiyer: Ahmet</span>
                            </div>
                        </div>

                        <div className="space-y-2 pb-4 border-b border-dashed border-slate-300">
                            <div className="flex justify-between">
                                <span>1 x Keten Gömlek (M)</span>
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

                        <div className="text-center pt-4 text-slate-500">
                            <p>{footerText}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
