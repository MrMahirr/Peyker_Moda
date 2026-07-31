import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Receipt, Save } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
    { value: 'rent', label: 'Kira' },
    { value: 'salary', label: 'Maas' },
    { value: 'utility', label: 'Fatura' },
    { value: 'shipment', label: 'Kargo' },
    { value: 'other', label: 'Diger' },
];

const METHODS = [
    { value: 'cash', label: 'Nakit' },
    { value: 'card', label: 'Kredi Karti' },
    { value: 'bank', label: 'Banka' },
];

export const ExpenseForm = () => {
    const [form, setForm] = useState({
        title: '',
        category: '',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        method: 'cash',
        notes: '',
    });

    const handleSave = () => {
        if (!form.title || !form.amount) {
            toast.error('Baslik ve tutar zorunludur.', { className: 'font-medium' });
            return;
        }
        toast.success('Gider kaydi olusturuldu', { className: 'font-medium' });
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100/50">
                    <Receipt className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-zinc-900">Gider Kaydi</h2>
                    <p className="text-[13px] text-zinc-500">Kira, maas, fatura gibi giderlerinizi kaydedin.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm space-y-5">
                <Input
                    label="Gider Basligi"
                    placeholder="Orn: Mart kira odemesi"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                />

                <div className="grid md:grid-cols-3 gap-4">
                    <Select
                        label="Kategori"
                        options={CATEGORIES}
                        placeholder="Kategori sec"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                    />
                    <Input
                        label="Tutar"
                        type="number"
                        placeholder="0.00"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    />
                    <Input
                        label="Tarih"
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                </div>

                <Select
                    label="Odeme Yontemi"
                    options={METHODS}
                    value={form.method}
                    onChange={(e) => setForm({ ...form, method: e.target.value })}
                />

                <Textarea
                    label="Notlar"
                    placeholder="Gider ile ilgili aciklama..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />

                <div className="flex justify-end">
                    <Button icon={<Save className="h-4 w-4" />} className="font-semibold shadow-md" onClick={handleSave}>
                        Kaydet
                    </Button>
                </div>
            </div>
        </div>
    );
};
