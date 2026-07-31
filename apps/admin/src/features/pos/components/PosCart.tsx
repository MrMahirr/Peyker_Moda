import { Button } from '@/components/ui/Button';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';

export interface PosCartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    lineType?: 'SALE' | 'RETURN' | 'EXCHANGE';
    image?: string;
}

export interface PosCartTotals {
    subtotal: number;
    tax: number;
    total: number;
}

interface PosCartProps {
    items?: PosCartItem[];
    totals?: PosCartTotals;
    taxRate?: number;
    onRemove?: (id: string) => void;
    onChangeQuantity?: (id: string, quantity: number) => void;
    onClear?: () => void;
}

const formatMoney = (value: number) => value.toLocaleString('tr-TR', { minimumFractionDigits: 2 });

export const PosCart = ({
    items = [],
    totals,
    taxRate = 10,
    onRemove,
    onChangeQuantity,
    onClear,
}: PosCartProps) => {
    const computedSubtotal = items.reduce((sum, item) => {
        const multiplier = item.lineType === 'RETURN' ? -1 : 1;
        return sum + item.price * item.quantity * multiplier;
    }, 0);
    const computedTax = computedSubtotal * (taxRate / 100);
    const computedTotal = computedSubtotal + computedTax;

    const displayTotals = totals || {
        subtotal: computedSubtotal,
        tax: computedTax,
        total: computedTotal,
    };

    return (
        <div className="flex h-full flex-col bg-white border-l border-zinc-200/80">
            <div className="p-4 border-b border-zinc-200/80 flex items-center justify-between bg-zinc-50/50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="font-bold text-zinc-900">Sepet ({items.length})</h2>
                </div>
                {onClear && (
                    <Button variant="ghost" size="sm" onClick={onClear} className="text-zinc-500 hover:text-red-600">
                        Temizle
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/30">
                {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4 border border-zinc-200/50">
                            <ShoppingCart className="h-6 w-6 text-zinc-300" />
                        </div>
                        <p className="text-zinc-600 font-semibold mb-1">Sepet bos.</p>
                        <p className="text-sm text-zinc-400 font-medium max-w-[220px]">
                            Urun eklemek icin barkod okutabilir veya listeden secim yapabilirsiniz.
                        </p>
                    </div>
                ) : (
                    items.map((item) => {
                        const isReturn = item.lineType === 'RETURN';
                        return (
                        <div key={item.id} className="flex gap-3 bg-white border border-zinc-200/60 rounded-xl p-3 shadow-sm">
                            <div className="flex-shrink-0">
                                <img src={item.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&auto=format&fit=crop"} alt={item.name} className="h-14 w-14 object-cover rounded-lg" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-[13px] text-zinc-900 truncate">{item.name}</h4>
                                        {isReturn && (
                                            <span className="inline-flex mt-1 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-600">
                                                Iade
                                            </span>
                                        )}
                                    </div>
                                    {onRemove && (
                                        <button
                                            onClick={() => onRemove(item.id)}
                                            className="text-zinc-300 hover:text-red-500"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-end justify-between mt-2">
                                    <div className="text-zinc-900 font-bold text-[14px]">{formatMoney(item.price * item.quantity * (isReturn ? -1 : 1))} TL</div>
                                    <div className="flex items-center gap-1 bg-zinc-100 rounded-lg p-1 border border-zinc-200/60">
                                        <button
                                            className="w-6 h-6 flex items-center justify-center rounded-md bg-white border border-zinc-200/50"
                                            onClick={() => onChangeQuantity?.(item.id, item.quantity - 1)}
                                        >
                                            <Minus className="h-3.5 w-3.5" />
                                        </button>
                                        <span className="w-6 text-center text-[12px] font-bold text-zinc-900">{item.quantity}</span>
                                        <button
                                            className="w-6 h-6 flex items-center justify-center rounded-md bg-white border border-zinc-200/50"
                                            onClick={() => onChangeQuantity?.(item.id, item.quantity + 1)}
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        );
                    })
                )}
            </div>

            <div className="p-5 border-t border-zinc-200/80 bg-white">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-zinc-500">
                        <span>Ara Toplam</span>
                        <span className="font-semibold text-zinc-700">{formatMoney(displayTotals.subtotal)} TL</span>
                    </div>
                    <div className="flex justify-between text-sm text-zinc-500">
                        <span>KDV (%{taxRate})</span>
                        <span className="font-semibold text-zinc-700">{formatMoney(displayTotals.tax)} TL</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-zinc-100">
                        <span className="text-base font-bold text-zinc-900">GENEL TOPLAM</span>
                        <span className="text-xl font-black text-zinc-900">{formatMoney(displayTotals.total)} TL</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
