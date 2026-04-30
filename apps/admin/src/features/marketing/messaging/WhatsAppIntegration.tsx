import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const WhatsAppIntegration = () => {
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-green-50 rounded-xl border border-green-100/50"><MessageSquare className="h-5 w-5 text-green-600" /></div>
                <div><h2 className="text-xl font-bold text-zinc-900">WhatsApp Entegrasyonu</h2><p className="text-[13px] text-zinc-500">WhatsApp Business ile müşteri bildirimleri gönderin.</p></div>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm space-y-4">
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200/50 text-[13px] text-amber-700 font-medium">⚠️ WhatsApp Business API entegrasyonu yapılandırılması gerekiyor. Ayarlar bölümünden API anahtarınızı giriniz.</div>
                <Input placeholder="Telefon numarası (+90...)" value={phone} onChange={e => setPhone(e.target.value)} className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium px-4" />
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Mesajınız..." className="w-full h-32 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                <Button icon={<Send className="w-4 h-4" />} className="font-semibold shadow-md" disabled>Gönder</Button>
            </div>
        </div>
    );
};
