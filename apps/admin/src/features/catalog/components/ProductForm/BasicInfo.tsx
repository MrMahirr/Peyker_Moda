import { UseFormReturn, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { categoriesService } from '../../services/categories.service';
import { StockAdjuster } from './StockAdjuster';

interface BasicInfoProps {
    form: UseFormReturn<any>;
}

export const BasicInfo = ({ form }: BasicInfoProps) => {
    const { register, control, formState: { errors, defaultValues } } = form;
    const [categories, setCategories] = useState<{label: string, value: string}[]>([]);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const data = await categoriesService.getAll();
                setCategories(data.map(c => ({ label: c.name, value: c.id })));
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        }
        fetchCategories();
    }, []);

    const generateSku = () => {
        // Örn: PM-A8B9C2
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        form.setValue('sku', `PM-${randomStr}`, { shouldValidate: true, shouldDirty: true });
    };

    return (
        <div className="space-y-6">
            <Card title="Temel Bilgiler" className="border-zinc-200 shadow-sm">
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
                        suffix={
                            <button
                                type="button"
                                onClick={generateSku}
                                className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                title="Otomatik SKU Oluştur"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </button>
                        }
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

            <Card title="Stok Ayarları" className="border-zinc-200 shadow-sm">
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="manageStock"
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            {...register('manageStock')}
                        />
                        <label htmlFor="manageStock" className="text-sm font-medium text-zinc-700">Bu ürün için stok takibi yap</label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="hasVariants"
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            {...register('hasVariants')}
                        />
                        <label htmlFor="hasVariants" className="text-sm font-medium text-zinc-700">Bu ürünün renk/beden gibi varyantları var</label>
                    </div>

                    {form.watch('manageStock') && !form.watch('hasVariants') && (
                        <div className="pt-6 mt-6 border-t border-zinc-100">
                            <Controller
                                name="stock"
                                control={control}
                                render={({ field }) => (
                                    <StockAdjuster
                                        currentStock={Number(defaultValues?.stock || 0)}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.stock?.message && (
                                <p className="text-xs text-red-600 mt-1.5">{errors.stock.message as string}</p>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};
