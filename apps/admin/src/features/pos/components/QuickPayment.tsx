import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CreditCard, Wallet, Banknote } from 'lucide-react';

interface QuickPaymentProps {
    total: number;
    onComplete?: (amount: number, method: 'cash' | 'card' | 'transfer') => void;
}

export const QuickPayment = ({ total, onComplete }: QuickPaymentProps) => {
    const [method, setMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
    const [received, setReceived] = useState(total.toFixed(2));

    const quickAmounts = useMemo(() => {
        const base = Math.ceil(total / 10) * 10;
        return [total, base, base + 50, base + 100].map((n) => Math.round(n));
    }, [total]);

    const change = Math.max(0, Number(received) - total);

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <button
                    onClick={() => setMethod('cash')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold border ${
                        method === 'cash' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200'
                    }`}
                >
                    <Banknote className="h-4 w-4 inline-block mr-2" />
                    Nakit
                </button>
                <button
                    onClick={() => setMethod('card')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold border ${
                        method === 'card' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200'
                    }`}
                >
                    <CreditCard className="h-4 w-4 inline-block mr-2" />
                    Kart
                </button>
                <button
                    onClick={() => setMethod('transfer')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold border ${
                        method === 'transfer' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200'
                    }`}
                >
                    <Wallet className="h-4 w-4 inline-block mr-2" />
                    Havale
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {quickAmounts.map((amount) => (
                    <button
                        key={amount}
                        className="py-2 rounded-lg border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                        onClick={() => setReceived(String(amount))}
                    >
                        {amount} TL
                    </button>
                ))}
            </div>

            <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-4">
                <div className="flex justify-between text-sm text-zinc-500">
                    <span>Ödenecek</span>
                    <span className="font-semibold text-zinc-700">{total.toFixed(2)} TL</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-500 mt-2">
                    <span>Alınan</span>
                    <input
                        className="w-28 text-right bg-transparent font-semibold text-zinc-700 focus:outline-none"
                        value={received}
                        onChange={(e) => setReceived(e.target.value)}
                    />
                </div>
                <div className="flex justify-between text-sm text-zinc-500 mt-2">
                    <span>Para Üstü</span>
                    <span className="font-semibold text-emerald-600">{change.toFixed(2)} TL</span>
                </div>
            </div>

            <Button
                className="w-full font-bold"
                onClick={() => onComplete?.(Number(received), method)}
            >
                Ödemeyi Tamamla
            </Button>
        </div>
    );
};
