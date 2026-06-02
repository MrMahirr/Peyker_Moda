import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trash, X } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { StockAdjuster } from './StockAdjuster';

interface VariantMatrixProps {
    form: UseFormReturn<any>;
}

interface ColorGroup {
    color: string;
    sizes: string[];
}

export const VariantMatrix = ({ form }: VariantMatrixProps) => {
    const { register, watch, setValue, getValues, control, formState: { defaultValues } } = form;

    const basePrice = watch("price");
    const baseSku = watch("sku");

    const [colorGroups, setColorGroups] = useState<ColorGroup[]>([]);
    const [newSizeInputs, setNewSizeInputs] = useState<Record<number, string>>({});
    const [isInitialized, setIsInitialized] = useState(false);

    // Initial load from existing variants (if edit mode)
    useEffect(() => {
        if (isInitialized) return;
        const existingVariants = getValues('variants') || [];
        if (existingVariants.length > 0) {
            const groups: Record<string, string[]> = {};
            existingVariants.forEach((v: any) => {
                const c = v.color || '';
                if (!groups[c]) groups[c] = [];
                if (v.size && !groups[c].includes(v.size)) {
                    groups[c].push(v.size);
                }
            });
            const loadedGroups = Object.keys(groups).map(c => ({
                color: c,
                sizes: groups[c]
            }));
            if (loadedGroups.length > 0) {
                setColorGroups(loadedGroups);
            }
        }
        setIsInitialized(true);
    }, [getValues, isInitialized]);

    // Re-generate variants when colorGroups changes
    useEffect(() => {
        if (!isInitialized) return;

        let newVariants: any[] = [];

        if (colorGroups.length === 0) {
            setValue('variants', []);
            return;
        }

        colorGroups.forEach(group => {
            const colorName = group.color.trim() || 'Standart';
            const colorCode = colorName.substring(0, 3).toUpperCase();
            
            if (group.sizes.length === 0) {
                // Just a color without sizes
                if (group.color.trim()) {
                    newVariants.push({
                        name: colorName,
                        sku: `${baseSku || 'SKU'}-${colorCode}`,
                        price: Number(basePrice) || 0,
                        stock: 0,
                        color: group.color.trim(),
                        size: ''
                    });
                }
            } else {
                // Color + Sizes
                group.sizes.forEach(size => {
                    const name = group.color.trim() ? `${colorName} / ${size}` : size;
                    const suffix = group.color.trim() ? `${colorCode}-${size.toUpperCase()}` : size.toUpperCase();
                    newVariants.push({
                        name,
                        sku: `${baseSku || 'SKU'}-${suffix}`,
                        price: Number(basePrice) || 0,
                        stock: 0,
                        color: group.color.trim(),
                        size: size
                    });
                });
            }
        });

        const currentVariants = getValues('variants') || [];
        const mergedVariants = newVariants.map((nv: any) => {
            const existing = currentVariants.find((cv: any) => cv.name === nv.name);
            if (existing) {
                return { ...nv, price: existing.price, stock: existing.stock, sku: existing.sku || nv.sku };
            }
            return nv;
        });

        setValue('variants', mergedVariants);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [colorGroups, basePrice, baseSku]); // We only trigger when colorGroups change

    const handleAddSize = (index: number) => {
        const val = newSizeInputs[index]?.trim();
        if (val) {
            const newGroups = [...colorGroups];
            if (!newGroups[index].sizes.includes(val)) {
                newGroups[index].sizes.push(val);
                setColorGroups(newGroups);
            }
            setNewSizeInputs(prev => ({ ...prev, [index]: '' }));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSize(index);
        }
    };

    return (
        <div className="space-y-8">
            <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-medium text-zinc-900">Renk ve Beden Yapılandırması</h3>
                        <p className="text-sm text-zinc-500 mt-1">Her bir renk için stokta bulunan bedenleri ayrı ayrı ekleyebilirsiniz.</p>
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setColorGroups([...colorGroups, { color: '', sizes: [] }])}
                        type="button"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Renk Ekle
                    </Button>
                </div>

                {colorGroups.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-zinc-100">
                            <Plus className="w-5 h-5 text-zinc-400" />
                        </div>
                        <p className="text-sm font-medium text-zinc-700">Henüz varyant eklenmedi</p>
                        <p className="text-xs text-zinc-500 mt-1">Farklı renk ve bedenler girmek için yukarıdan "Renk Ekle" butonunu kullanın.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {colorGroups.map((group, groupIdx) => (
                            <div key={groupIdx} className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-sm relative group transition-all hover:border-zinc-300">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    type="button"
                                    className="absolute top-3 right-3 w-8 h-8 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                    onClick={() => {
                                        const newGroups = [...colorGroups];
                                        newGroups.splice(groupIdx, 1);
                                        setColorGroups(newGroups);
                                    }}
                                    title="Bu Renk Grubunu Sil"
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    <div className="md:col-span-4">
                                        <Input
                                            label="Renk Adı"
                                            placeholder="Örn: Kırmızı, Lacivert..."
                                            value={group.color}
                                            onChange={(e) => {
                                                const newGroups = [...colorGroups];
                                                newGroups[groupIdx].color = e.target.value;
                                                setColorGroups(newGroups);
                                            }}
                                            className="bg-zinc-50 focus:bg-white transition-colors"
                                        />
                                    </div>
                                    <div className="md:col-span-8">
                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-zinc-800">Bu Renge Ait Bedenler</label>
                                            
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Örn: S, M, L, XL, 38, 40..."
                                                    value={newSizeInputs[groupIdx] || ''}
                                                    onChange={(e) => setNewSizeInputs({ ...newSizeInputs, [groupIdx]: e.target.value })}
                                                    onKeyDown={(e) => handleKeyDown(e, groupIdx)}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    className="shrink-0"
                                                    onClick={() => handleAddSize(groupIdx)}
                                                >
                                                    Ekle
                                                </Button>
                                            </div>

                                            {group.sizes.length > 0 ? (
                                                <div className="flex flex-wrap gap-2 p-4 bg-zinc-50 border border-zinc-100 rounded-lg min-h-[56px]">
                                                    {group.sizes.map((size, sizeIdx) => (
                                                        <span 
                                                            key={sizeIdx} 
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-zinc-800 text-sm font-medium border border-zinc-200 shadow-sm hover:border-zinc-300 transition-colors"
                                                        >
                                                            {size}
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newGroups = [...colorGroups];
                                                                    newGroups[groupIdx].sizes.splice(sizeIdx, 1);
                                                                    setColorGroups(newGroups);
                                                                }}
                                                                className="text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-colors"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center p-4 bg-zinc-50 border border-zinc-100 border-dashed rounded-lg min-h-[56px] text-sm text-zinc-400">
                                                    Bu renk için henüz beden eklenmedi.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Generated Variants Table */}
            {watch('variants')?.length > 0 && (
                <Card className="p-6">
                    <h3 className="text-lg font-medium mb-4">Varyant Listesi ({watch('variants')?.length})</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 text-zinc-700 font-medium border-y border-zinc-200/80">
                                <tr>
                                    <th className="p-3">Varyant (Renk / Beden)</th>
                                    <th className="p-3 w-48">SKU</th>
                                    <th className="p-3 w-32">Fiyat (TL)</th>
                                    <th className="p-3 w-32">Stok</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {getValues('variants').map((_: any, index: number) => (
                                    <tr key={index} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="p-3 font-medium text-zinc-900">
                                            {watch(`variants.${index}.name`)}
                                        </td>
                                        <td className="p-3">
                                            <Input {...register(`variants.${index}.sku`)} className="h-9 text-sm" />
                                        </td>
                                        <td className="p-3">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...register(`variants.${index}.price`)}
                                                className="h-9 text-sm"
                                            />
                                        </td>
                                        <td className="p-3 min-w-[220px]">
                                            <Controller
                                                name={`variants.${index}.stock`}
                                                control={control}
                                                render={({ field }) => (
                                                    <StockAdjuster
                                                        currentStock={Number(defaultValues?.variants?.[index]?.stock || 0)}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        isVariant={true}
                                                    />
                                                )}
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
