import { Button } from '@/components/ui/Button';
import { Zap } from 'lucide-react';
import type { QuickButton } from '../types';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);

interface QuickButtonsProps {
    buttons: QuickButton[];
    onSelect: (button: QuickButton) => void;
}

export const QuickButtons = ({ buttons, onSelect }: QuickButtonsProps) => {
    if (buttons.length === 0) {
        return (
            <div className="text-center py-6">
                <Zap className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                <p className="text-[12px] text-zinc-400">Hızlı erişim butonu henüz eklenmedi</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {buttons.map((btn) => (
                <button
                    key={btn.id}
                    onClick={() => onSelect(btn)}
                    className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-zinc-200/80 shadow-sm hover:shadow-md hover:border-zinc-300 active:scale-[0.97] transition-all text-center group"
                >
                    {btn.image ? (
                        <img
                            src={btn.image}
                            alt={btn.productName}
                            className="w-10 h-10 rounded-lg object-cover border border-zinc-200/50"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                            <Zap className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600" />
                        </div>
                    )}
                    <span className="text-[11px] font-semibold text-zinc-700 line-clamp-2 leading-tight">
                        {btn.productName}
                    </span>
                    <span className="text-[11px] font-bold text-zinc-900">
                        {formatCurrency(btn.price)}
                    </span>
                </button>
            ))}
        </div>
    );
};
