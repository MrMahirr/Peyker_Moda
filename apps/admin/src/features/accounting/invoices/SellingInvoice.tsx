import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileText, Plus, Save } from 'lucide-react';

export const SellingInvoice = () => {
    const [formData, setFormData] = useState({
        customerName: '',
        invoiceNumber: '',
        items: [{ productName: '', quantity: 1, unitPrice: 0, taxRate: 10 }],
        notes: '',
    });

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { productName: '', quantity: 1, unitPrice: 0, taxRate: 10 }],
        });
    };

    const updateItem = (index: number, field: string, value: string | number) => {
        const items = [...formData.items];
        items[index] = { ...items[index], [field]: value };
        setFormData({ ...formData, items });
    };

    const removeItem = (index: number) => {
        setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
    };

    const subtotal = formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate) / 100, 0);
    const total = subtotal + tax;
    const fmt = (v: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100/50">
                    <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-zinc-900">Satis Faturasi</h2>
                    <p className="text-[13px] text-zinc-500">Musteri fatura kaydi olusturun.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <Input
                    placeholder="Musteri Adi"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium px-4"
                />
                <Input
                    placeholder="Fatura No"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium px-4"
                />
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
                <table className="w-full text-[13px]">
                    <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-200/80">
                            <th className="text-left px-4 py-3 font-semibold text-zinc-600">Urun Adi</th>
                            <th className="text-center px-4 py-3 font-semibold text-zinc-600 w-24">Miktar</th>
                            <th className="text-center px-4 py-3 font-semibold text-zinc-600 w-32">Birim Fiyat</th>
                            <th className="text-center px-4 py-3 font-semibold text-zinc-600 w-24">KDV %</th>
                            <th className="text-right px-4 py-3 font-semibold text-zinc-600 w-32">Toplam</th>
                            <th className="w-12"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {formData.items.map((item, i) => (
                            <tr key={i} className="border-b border-zinc-100">
                                <td className="px-4 py-2">
                                    <Input
                                        value={item.productName}
                                        onChange={(e) => updateItem(i, 'productName', e.target.value)}
                                        placeholder="Urun adi"
                                        className="h-9 text-[13px] border-zinc-200/80 rounded-lg px-3"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
                                        className="h-9 text-center text-[13px] border-zinc-200/80 rounded-lg"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <Input
                                        type="number"
                                        value={item.unitPrice}
                                        onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))}
                                        className="h-9 text-center text-[13px] border-zinc-200/80 rounded-lg"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <Input
                                        type="number"
                                        value={item.taxRate}
                                        onChange={(e) => updateItem(i, 'taxRate', Number(e.target.value))}
                                        className="h-9 text-center text-[13px] border-zinc-200/80 rounded-lg"
                                    />
                                </td>
                                <td className="px-4 py-2 text-right font-mono font-semibold">
                                    {fmt(item.quantity * item.unitPrice * (1 + item.taxRate / 100))}
                                </td>
                                <td className="px-2">
                                    <button
                                        onClick={() => removeItem(i)}
                                        className="text-zinc-400 hover:text-red-500 text-lg"
                                    >
                                        ×
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-4 border-t border-zinc-200/80">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={addItem}
                        icon={<Plus className="w-3.5 h-3.5" />}
                        className="font-semibold text-[12px]"
                    >
                        Kalem Ekle
                    </Button>
                </div>
            </div>

            <div className="flex justify-end">
                <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200/80 w-64 space-y-2 text-[13px]">
                    <div className="flex justify-between"><span className="text-zinc-500">Ara Toplam</span><span className="font-semibold">{fmt(subtotal)}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">KDV</span><span className="font-semibold">{fmt(tax)}</span></div>
                    <div className="flex justify-between border-t border-zinc-200 pt-2"><span className="font-bold text-zinc-900">Genel Toplam</span><span className="font-black text-zinc-900">{fmt(total)}</span></div>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <Button variant="ghost" className="font-semibold">Taslak Kaydet</Button>
                <Button icon={<Save className="w-4 h-4" />} className="font-semibold shadow-md">Faturayi Kaydet</Button>
            </div>
        </div>
    );
};
