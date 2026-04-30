import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface ForgotPasswordProps {
    onBack?: () => void;
}

export const ForgotPassword = ({ onBack }: ForgotPasswordProps) => {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error('E-posta zorunludur', { className: 'font-medium' });
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setSent(true);
            setLoading(false);
            toast.success('Sifre sifirlama baglantisi gonderildi', { className: 'font-medium' });
        }, 500);
    };

    return (
        <div className="w-full bg-surface rounded-2xl shadow-xl border border-white/10 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
                {onBack && (
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex items-center text-xs text-zinc-500 hover:text-zinc-800 font-semibold"
                    >
                        <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                        Geri Don
                    </button>
                )}
            </div>

            <div className="mb-6">
                <h2 className="text-lg font-bold text-white">Sifremi Unuttum</h2>
                <p className="text-xs text-zinc-400 mt-1">E-posta adresinizi girin, sifre sifirlama linki gonderelim.</p>
            </div>

            {sent ? (
                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                    Baglanti gonderildi. Gelen kutunuzu kontrol edin.
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="E-posta"
                        type="email"
                        placeholder="ornek@peyker.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button type="submit" className="w-full" size="lg" loading={loading} icon={<Mail className="h-4 w-4" />}>
                        Sifirlama Linki Gonder
                    </Button>
                </form>
            )}
        </div>
    );
};
