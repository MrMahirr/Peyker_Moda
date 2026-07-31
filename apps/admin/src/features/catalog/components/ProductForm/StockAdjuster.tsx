import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Plus, Minus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockAdjusterProps {
    value: number;
    onChange: (val: number) => void;
    className?: string;
    isVariant?: boolean;
}

export const StockAdjuster = ({ value, onChange, className, isVariant = false }: StockAdjusterProps) => {
    // Form resetlendikten sonra (veritabanından veri geldiğinde) component mount olur, 
    // bu yüzden ilk gelen value gerçek mevcut stoktur.
    const [currentStock] = useState<number>(Number(value) || 0);
    const [adjustment, setAdjustment] = useState<string>('0');

    // Sadece component ilk yüklendiğinde veya mevcut stok değiştiğinde
    useEffect(() => {
        if (value !== currentStock && (adjustment === '0' || adjustment === '')) {
            const diff = value - currentStock;
            setAdjustment(diff > 0 ? `+${diff}` : `${diff}`);
        } else if (value === currentStock && adjustment !== '0') {
            setAdjustment('0');
        }
    }, [value, currentStock]);

    const handleAdjustmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setAdjustment(val);
        
        // Sadece rakam ve + - içeriyorsa hesapla
        if (/^[+-]?\d*$/.test(val) && val !== '+' && val !== '-') {
            const num = parseInt(val || '0', 10);
            if (!isNaN(num)) {
                const newTotal = Math.max(0, currentStock + num);
                onChange(newTotal);
            }
        }
    };

    const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTotal = parseInt(e.target.value || '0', 10);
        if (!isNaN(newTotal)) {
            const validTotal = Math.max(0, newTotal);
            onChange(validTotal);
            const diff = validTotal - currentStock;
            setAdjustment(diff > 0 ? `+${diff}` : `${diff}`);
        }
    };

    const isAdded = value > currentStock;
    const isReduced = value < currentStock;

    if (isVariant) {
        return (
            <div className={cn("flex flex-col gap-1.5", className)}>
                <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200/80 rounded-md p-1">
                    <div className="flex flex-col items-center justify-center px-2 py-0.5 min-w-[3rem] border-r border-zinc-200">
                        <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider leading-none mb-0.5">Mevcut</span>
                        <span className="text-xs font-bold text-zinc-700 leading-none">{currentStock}</span>
                    </div>
                    
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="+ / -"
                            value={adjustment}
                            onChange={handleAdjustmentChange}
                            className="w-full h-7 bg-white border border-zinc-200 rounded px-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-center"
                            title="Eklenecek veya çıkarılacak miktar (Örn: +5 veya -2)"
                        />
                    </div>
                    
                    <div className="flex items-center justify-center px-0.5">
                        <ArrowRight className="w-3 h-3 text-zinc-300" />
                    </div>

                    <div className="flex-1 relative">
                        <input
                            type="number"
                            min="0"
                            placeholder="Yeni"
                            value={value || 0}
                            onChange={handleTotalChange}
                            className={cn(
                                "w-full h-7 bg-white border rounded px-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-center",
                                isAdded ? "border-emerald-200 text-emerald-700 bg-emerald-50/50" : 
                                isReduced ? "border-red-200 text-red-700 bg-red-50/50" : 
                                "border-zinc-200 text-zinc-900"
                            )}
                            title="Yeni toplam stok"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("flex items-start gap-4 p-4 border border-zinc-200/80 rounded-xl bg-zinc-50/50", className)}>
            <div className="flex flex-col items-center justify-center p-3 bg-white border border-zinc-200 rounded-lg min-w-[80px] shadow-sm">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Mevcut Stok</span>
                <span className="text-2xl font-black text-zinc-800">{currentStock}</span>
            </div>

            <div className="flex-1 flex items-center gap-4">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5 uppercase tracking-wide">Değişim (+/-)</label>
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Örn: +15 veya -5"
                            value={adjustment}
                            onChange={handleAdjustmentChange}
                            className="pl-8 text-sm font-semibold"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                            {adjustment.startsWith('-') ? <Minus className="w-4 h-4 text-red-500" /> : <Plus className="w-4 h-4 text-emerald-500" />}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center mt-6">
                    <ArrowRight className="w-5 h-5 text-zinc-300" />
                </div>

                <div className="flex-1">
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5 uppercase tracking-wide">Yeni Toplam</label>
                    <Input
                        type="number"
                        min="0"
                        placeholder="Toplam Stok"
                        value={value || 0}
                        onChange={handleTotalChange}
                        className={cn(
                            "text-sm font-bold",
                            isAdded ? "border-emerald-300 text-emerald-700 bg-emerald-50 focus:ring-emerald-500" : 
                            isReduced ? "border-red-300 text-red-700 bg-red-50 focus:ring-red-500" : ""
                        )}
                    />
                </div>
            </div>
        </div>
    );
};
