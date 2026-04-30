import { CreditCard } from 'lucide-react';

export const PaymentSettings = () => (
    <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl"><CreditCard className="h-5 w-5 text-emerald-600" /></div>
            <div><h2 className="text-xl font-bold text-zinc-900">Ödeme Entegrasyonları</h2><p className="text-[13px] text-zinc-500">İyzico, PayTR, Stripe vb. sanal POS ayarları.</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-8 shadow-sm flex flex-col items-center justify-center text-center">
            <CreditCard className="w-12 h-12 text-zinc-300 mb-4" />
            <h3 className="font-bold text-zinc-900">Sanal POS Yapılandırması</h3>
            <p className="text-[13px] text-zinc-500 mt-2">API anahtarlarınızı buraya ekleyerek ödeme almayı başlatabilirsiniz.</p>
        </div>
    </div>
);
