import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

export interface SeoSettingsValue {
    title: string;
    description: string;
    slug: string;
    keywords: string;
}

interface SeoSettingsProps {
    value?: SeoSettingsValue;
    onChange?: (value: SeoSettingsValue) => void;
}

const DEFAULT_VALUE: SeoSettingsValue = {
    title: '',
    description: '',
    slug: '',
    keywords: '',
};

export const SeoSettings = ({ value, onChange }: SeoSettingsProps) => {
    const [local, setLocal] = useState<SeoSettingsValue>(value || DEFAULT_VALUE);

    useEffect(() => {
        if (value) {
            setLocal(value);
        }
    }, [value]);

    const update = (patch: Partial<SeoSettingsValue>) => {
        const next = { ...local, ...patch };
        setLocal(next);
        onChange?.(next);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-base font-semibold text-zinc-900">SEO Ayarlari</h3>
                <p className="text-[12px] text-zinc-500 mt-1">Urun sayfasi icin meta bilgilerini girin.</p>
            </div>

            <Input
                label="Meta Baslik"
                placeholder="Orn: Siyah Keten Elbise - Peyker"
                value={local.title}
                onChange={(e) => update({ title: e.target.value })}
            />

            <Textarea
                label="Meta Aciklama"
                placeholder="Kisa ve aciklayici bir urun aciklamasi yazin."
                value={local.description}
                onChange={(e) => update({ description: e.target.value })}
                className="min-h-[120px]"
            />

            <div className="grid md:grid-cols-2 gap-4">
                <Input
                    label="URL Slug"
                    placeholder="siyah-keten-elbise"
                    value={local.slug}
                    onChange={(e) => update({ slug: e.target.value })}
                />
                <Input
                    label="Anahtar Kelimeler"
                    placeholder="keten, elbise, yaz"
                    value={local.keywords}
                    onChange={(e) => update({ keywords: e.target.value })}
                />
            </div>
        </div>
    );
};
