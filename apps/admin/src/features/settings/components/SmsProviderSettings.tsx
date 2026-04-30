import { MessageSquare } from 'lucide-react';

export const SmsProviderSettings = () => (
    <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 rounded-xl"><MessageSquare className="h-5 w-5 text-amber-600" /></div>
            <div><h2 className="text-xl font-bold text-zinc-900">SMS / Bildirim Ayarları</h2><p className="text-[13px] text-zinc-500">Müşteri bilgilendirme ve OTP ayarları.</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-8 shadow-sm flex flex-col items-center justify-center text-center">
            <MessageSquare className="w-12 h-12 text-zinc-300 mb-4" />
            <h3 className="font-bold text-zinc-900">SMS Sağlayıcı API</h3>
            <p className="text-[13px] text-zinc-500 mt-2">Netgsm, İletiMerkezi gibi servislerin API bilgilerini girerek SMS gönderimi sağlayabilirsiniz.</p>
        </div>
    </div>
);
