import React, { useState, useEffect } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trash, X } from 'lucide-react';

// Helper to generate combinations
const cartesian = (args: any[][]) => {
    const r: any[][] = [];
    const max = args.length - 1;
    function helper(arr: any[], i: number) {
        for (let j = 0, l = args[i].length; j < l; j++) {
            const a = arr.slice(0); // clone arr
            a.push(args[i][j]);
            if (i === max) r.push(a);
            else helper(a, i + 1);
        }
    }
    helper([], 0);
    return r;
};

interface VariantMatrixProps {
    form: UseFormReturn<any>;
}

export const VariantMatrix = ({ form }: VariantMatrixProps) => {
    const { register, control, watch, setValue } = form;
    const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
        control,
        name: "options"
    });

    // We monitor options to regenerate variants
    const watchedOptions = watch("options");
    const basePrice = watch("price");
    const baseSku = watch("sku");

    // Local state for adding new values to an option
    // Map of optionIndex -> string (inputValue)
    const [newValues, setNewValues] = useState<Record<number, string>>({});

    const handleAddValue = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = newValues[index]?.trim();
            if (val) {
                const currentValues = watchedOptions[index].values || [];
                // update form value
                const updatedOption = { ...watchedOptions[index], values: [...currentValues, val] };
                setValue(`options.${index}`, updatedOption);
                setNewValues(prev => ({ ...prev, [index]: '' }));
            }
        }
    };

    const removeValue = (optIndex: number, valIndex: number) => {
        const currentValues = [...watchedOptions[optIndex].values];
        currentValues.splice(valIndex, 1);
        const updatedOption = { ...watchedOptions[optIndex], values: currentValues };
        setValue(`options.${optIndex}`, updatedOption);
    };

    // Generate variants effect
    useEffect(() => {
        if (!watchedOptions?.length) return;

        // Filter valid options (must have values)
        const validOptions = watchedOptions.filter((o: any) => o.values && o.values.length > 0);

        if (validOptions.length === 0) {
            setValue('variants', []);
            return;
        }

        const arraysToCombine = validOptions.map((o: any) => o.values);
        const combinations = cartesian(arraysToCombine);

        // Generate variant objects
        const newVariants = combinations.map((combo) => {
            const name = combo.join(' / ');
            // Sku generation logic: BASESKU-VAR1-VAR2
            const suffix = combo.map((c: string) => c.substring(0, 3).toUpperCase()).join('-');
            const variantSku = `${baseSku}-${suffix}`;

            return {
                name,
                sku: variantSku,
                price: Number(basePrice) || 0,
                stock: 0,
                options: combo
            };
        });

        // Important: We should preserve existing values (stock/price) if variant already existed
        const currentVariants = form.getValues('variants') || [];

        const mergedVariants = newVariants.map((nv: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const existing = currentVariants.find((cv: any) => cv.name === nv.name);
            if (existing) {
                return { ...nv, price: existing.price, stock: existing.stock, sku: existing.sku || nv.sku };
            }
            return nv;
        });

        setValue('variants', mergedVariants);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(watchedOptions), basePrice, baseSku, setValue]); // Deep compare options

    return (
        <div className="space-y-8">
            {/* Options Configuration */}
            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Varyant Seçenekleri</h3>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => appendOption({ name: '', values: [] })}
                        type="button"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Seçenek Ekle
                    </Button>
                </div>

                {optionFields.length === 0 && (
                    <p className="text-sm text-center text-zinc-500 py-4 border-2 border-dashed rounded-md">
                        Henüz seçenek eklenmemiş (Örn: Renk, Beden).
                    </p>
                )}

                <div className="space-y-6">
                    {optionFields.map((field, index) => (
                        <div key={field.id} className="bg-zinc-50 p-4 rounded-md border border-zinc-200 relative">
                            <Button
                                variant="secondary"
                                size="sm"
                                type="button"
                                className="absolute top-2 right-2 w-9 h-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => removeOption(index)}
                            >
                                <Trash className="h-4 w-4" />
                            </Button>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Input
                                        label="Seçenek Adı (Örn: Renk)"
                                        placeholder="Renk, Beden vb."
                                        {...register(`options.${index}.name` as const)}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-700">Değerler</label>
                                        <div className="flex flex-wrap gap-2 p-3 bg-white border border-zinc-200 rounded min-h-[42px]">
                                            {watchedOptions[index]?.values?.map((val: string, vIndex: number) => (
                                                <span key={vIndex} className="inline-flex items-center px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-sm border border-indigo-100">
                                                    {val}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeValue(index, vIndex)}
                                                        className="ml-1 hover:text-indigo-900"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                            <input
                                                type="text"
                                                className="outline-none bg-transparent text-sm min-w-[100px] flex-1"
                                                placeholder="Değer yaz ve Enter'a bas..."
                                                value={newValues[index] || ''}
                                                onChange={(e) => setNewValues({ ...newValues, [index]: e.target.value })}
                                                onKeyDown={(e) => handleAddValue(e, index)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Generated Variants Table */}
            {watch('variants')?.length > 0 && (
                <Card className="p-6">
                    <h3 className="text-lg font-medium mb-4">Varyant Listesi ({watch('variants')?.length})</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 text-zinc-700 font-medium">
                                <tr>
                                    <th className="p-3 border-b">Varyant Adı</th>
                                    <th className="p-3 border-b w-48">SKU</th>
                                    <th className="p-3 border-b w-32">Fiyat (TL)</th>
                                    <th className="p-3 border-b w-32">Stok</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {form.getValues('variants').map((_: any, index: number) => (
                                    <tr key={index}>
                                        <td className="p-3 font-medium text-zinc-900">
                                            {watch(`variants.${index}.name`)}
                                        </td>
                                        <td className="p-3">
                                            <Input {...register(`variants.${index}.sku`)} className="h-8" />
                                        </td>
                                        <td className="p-3">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...register(`variants.${index}.price`)}
                                                className="h-8"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <Input
                                                type="number"
                                                {...register(`variants.${index}.stock`)}
                                                className="h-8"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};
