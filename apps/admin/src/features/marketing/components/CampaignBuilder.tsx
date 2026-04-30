import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Sparkles } from 'lucide-react';

type CampaignType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y';

const TYPE_OPTIONS = [
    { value: 'PERCENTAGE', label: 'Yuzdelik Indirim' },
    { value: 'FIXED_AMOUNT', label: 'Sabit Tutar' },
    { value: 'BUY_X_GET_Y', label: 'Al X Oda Y' },
];

export const CampaignBuilder = () => {
    const [name, setName] = useState('');
    const [type, setType] = useState<CampaignType>('PERCENTAGE');
    const [value, setValue] = useState('10');
    const [minOrder, setMinOrder] = useState('0');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');

    const preview = useMemo(() => {
        if (type === 'PERCENTAGE') return `%${value} indirim`;
        if (type === 'FIXED_AMOUNT') return `${value} TL indirim`;
        return `2 al 1 ode`;
    }, [type, value]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100/50">
                    <Sparkles className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-zinc-900">Kampanya Kurgusu</h2>
                    <p className="text-[13px] text-zinc-500">Indirim kosullarini olusturun ve onizleyin.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm space-y-5">
                <Input
                    label="Kampanya Adi"
                    placeholder="Yaz Indirimi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <div className="grid md:grid-cols-2 gap-4">
                    <Select
                        label="Indirim Turu"
                        options={TYPE_OPTIONS}
                        value={type}
                        onChange={(e) => setType(e.target.value as CampaignType)}
                    />
                    <Input
                        label={type === 'PERCENTAGE' ? 'Indirim Orani (%)' : 'Indirim Tutari'}
                        type="number"
                        placeholder="0"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <Input
                        label="Minimum Sepet Tutari"
                        type="number"
                        placeholder="0"
                        value={minOrder}
                        onChange={(e) => setMinOrder(e.target.value)}
                    />
                    <Input
                        label="Kampanya Kodu (opsiyonel)"
                        placeholder="PEYKER10"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                </div>

                <Textarea
                    label="Aciklama"
                    placeholder="Kampanya kosullari ve detaylari..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-[15px] font-bold text-zinc-900">Onizleme</h3>
                        <p className="text-[12px] text-zinc-500 mt-1">Kampanya ozeti ve hedef kosullar.</p>
                    </div>
                    <Badge variant="info">{preview}</Badge>
                </div>
                <div className="mt-4 text-[13px] text-zinc-600">
                    <div><strong>Kampanya:</strong> {name || 'Isim girilmedi'}</div>
                    <div><strong>Minimum Sepet:</strong> {minOrder || '0'} TL</div>
                    <div><strong>Kod:</strong> {code || 'Kodsuz kampanya'}</div>
                </div>
            </div>
        </div>
    );
};
