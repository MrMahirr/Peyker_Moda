import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';

// Categories mock
const categories = [
    { label: 'Elbise', value: 'dress' },
    { label: 'Üst Giyim', value: 'top' },
    { label: 'Alt Giyim', value: 'bottom' },
    { label: 'Dış Giyim', value: 'outerwear' },
    { label: 'Aksesuar', value: 'accessory' },
];

interface BasicInfoProps {
    form: UseFormReturn<any>;
}

export const BasicInfo = ({ form }: BasicInfoProps) => {
    const { register, formState: { errors } } = form;

    return (
        <div className="space-y-6">
            <Card title="Temel Bilgiler" className="border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <Input
                            label="Ürün Adı"
                            placeholder="Örn: Yazlık Çiçekli Elbise"
                            error={errors.name?.message as string}
                            {...register('name')}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Textarea
                            label="Ürün Açıklaması"
                            placeholder="Ürün detayları, kumaş bilgisi vb."
                            rows={4}
                            error={errors.description?.message as string}
                            {...register('description')}
                        />
                    </div>

                    <Select
                        label="Kategori"
                        options={categories}
                        error={errors.category?.message as string}
                        {...register('category')}
                    />

                    <Input
                        label="Ürün Kodu (SKU)"
                        placeholder="Örn: ELB-001"
                        error={errors.sku?.message as string}
                        {...register('sku')}
                    />

                    <Input
                        label="Satış Fiyatı (TL)"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        error={errors.price?.message as string}
                        {...register('price')}
                    />

                    <Input
                        label="Alış Fiyatı (Maliyet)"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        error={errors.costPrice?.message as string}
                        {...register('costPrice')}
                    />
                </div>
            </Card>

            <Card title="Stok Ayarları" className="border-slate-200 shadow-sm">
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="manageStock"
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            {...register('manageStock')}
                        />
                        <label htmlFor="manageStock" className="text-sm font-medium text-slate-700">Bu ürün için stok takibi yap</label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="hasVariants"
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            {...register('hasVariants')}
                        />
                        <label htmlFor="hasVariants" className="text-sm font-medium text-slate-700">Bu ürünün renk/beden gibi varyantları var</label>
                    </div>
                </div>
            </Card>
        </div>
    );
};
