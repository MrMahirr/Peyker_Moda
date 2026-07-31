import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Copy, RefreshCcw, TicketPercent } from 'lucide-react';
import { toast } from 'sonner';

type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

const DISCOUNT_OPTIONS = [
    { value: 'PERCENTAGE', label: 'Yuzdelik' },
    { value: 'FIXED_AMOUNT', label: 'Sabit Tutar' },
];

const generateCode = () => {
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `PEYKER-${random}`;
};

export const CouponGenerator = () => {
    const [code, setCode] = useState(generateCode());
    const [type, setType] = useState<DiscountType>('PERCENTAGE');
    const [value, setValue] = useState('10');
    const [maxUsage, setMaxUsage] = useState('100');
    const [expiresAt, setExpiresAt] = useState('');

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            toast.success('Kupon kopyalandi', { className: 'font-medium' });
        } catch {
            toast.error('Kopyalama basarisiz', { className: 'font-medium' });
        }
    };

    const handleRegenerate = () => {
        setCode(generateCode());
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100/50">
                    <TicketPercent className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-zinc-900">Kupon Olustur</h2>
                    <p className="text-[13px] text-zinc-500">Musteriler icin indirim kuponu hazirlayin.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm space-y-5">
                <div className="grid md:grid-cols-[1fr_auto] gap-3">
                    <Input
                        label="Kupon Kodu"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                    />
                    <div className="flex gap-2 md:mt-6">
                        <Button variant="secondary" onClick={handleRegenerate} icon={<RefreshCcw className="h-4 w-4" />}>
                            Yenile
                        </Button>
                        <Button variant="ghost" onClick={handleCopy} icon={<Copy className="h-4 w-4" />}>
                            Kopyala
                        </Button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <Select
                        label="Indirim Tipi"
                        options={DISCOUNT_OPTIONS}
                        value={type}
                        onChange={(e) => setType(e.target.value as DiscountType)}
                    />
                    <Input
                        label={type === 'PERCENTAGE' ? 'Indirim Orani (%)' : 'Indirim Tutari'}
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                    <Input
                        label="Maksimum Kullanim"
                        type="number"
                        value={maxUsage}
                        onChange={(e) => setMaxUsage(e.target.value)}
                    />
                </div>

                <Input
                    label="Son Kullanma Tarihi"
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-[15px] font-bold text-zinc-900">Ozet</h3>
                        <p className="text-[12px] text-zinc-500">Kampanya onizleme karti.</p>
                    </div>
                    <Badge variant="success">{type === 'PERCENTAGE' ? `%${value}` : `${value} TL`}</Badge>
                </div>
                <div className="mt-4 text-[13px] text-zinc-600 space-y-1">
                    <div><strong>Kod:</strong> {code}</div>
                    <div><strong>Kullanim:</strong> {maxUsage} adet</div>
                    <div><strong>Bitis:</strong> {expiresAt || 'Belirlenmedi'}</div>
                </div>
            </div>
        </div>
    );
};
