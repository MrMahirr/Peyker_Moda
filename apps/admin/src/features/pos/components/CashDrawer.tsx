import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DollarSign, LogIn, LogOut, Loader2, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { posService } from '../services/pos.service';
import type { PosSession } from '../services/pos.service';
import type { CashDrawerSummary } from '../types';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);

export const CashDrawer = () => {
    const [session, setSession] = useState<PosSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [openingBalance, setOpeningBalance] = useState('');
    const [closingBalance, setClosingBalance] = useState('');

    const fetchSession = async () => {
        try {
            setLoading(true);
            const current = await posService.getCurrentSession();
            setSession(current);
        } catch (err) {
            console.error('Session fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSession(); }, []);

    const handleOpen = async () => {
        const amount = parseFloat(openingBalance);
        if (isNaN(amount) || amount < 0) {
            toast.error('Geçerli bir tutar giriniz');
            return;
        }
        try {
            const newSession = await posService.openSession(amount);
            setSession(newSession);
            setOpeningBalance('');
            toast.success('Kasa açıldı');
        } catch (err) {
            console.error('Open session error:', err);
            toast.error('Kasa açılamadı');
        }
    };

    const handleClose = async () => {
        const amount = parseFloat(closingBalance);
        if (isNaN(amount) || amount < 0) {
            toast.error('Geçerli bir tutar giriniz');
            return;
        }
        try {
            const closed = await posService.closeSession(amount);
            setSession(null);
            setClosingBalance('');
            toast.success(`Kasa kapatıldı. Fark: ${formatCurrency(closed.difference || 0)}`);
        } catch (err) {
            console.error('Close session error:', err);
            toast.error('Kasa kapatılamadı');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
                <p className="text-[13px] font-medium text-zinc-500">Kasa bilgisi yükleniyor...</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-8 shadow-sm max-w-md mx-auto mt-8">
                <div className="text-center mb-6">
                    <div className="p-4 bg-emerald-50 rounded-2xl inline-block mb-4">
                        <LogIn className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900">Kasa Aç</h2>
                    <p className="text-[13px] text-zinc-500 mt-1">Vardiyayı başlatmak için açılış bakiyesini girin.</p>
                </div>
                <div className="space-y-4">
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            type="number"
                            placeholder="Açılış bakiyesi (₺)"
                            value={openingBalance}
                            onChange={(e) => setOpeningBalance(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
                            className="h-12 pl-10 bg-white border border-zinc-200/80 rounded-xl text-[15px] font-semibold"
                        />
                    </div>
                    <Button onClick={handleOpen} className="w-full h-12 font-bold text-[15px] justify-center shadow-md">
                        Kasayı Aç
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-lg mx-auto mt-8">
            <div className="bg-zinc-900 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Aktif Kasa</span>
                    <span className="text-[12px] text-zinc-500">
                        Açılış: {new Date(session.openedAt).toLocaleTimeString('tr-TR')}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-zinc-400 text-[12px] font-semibold">Açılış Bakiyesi</p>
                        <p className="text-xl font-black mt-1">{formatCurrency(session.openingBalance)}</p>
                    </div>
                    <div>
                        <p className="text-zinc-400 text-[12px] font-semibold">Toplam Satış</p>
                        <p className="text-xl font-black mt-1 text-emerald-400">{formatCurrency(session.totalSales || 0)}</p>
                    </div>
                    <div>
                        <p className="text-zinc-400 text-[12px] font-semibold">İşlem Sayısı</p>
                        <p className="text-xl font-black mt-1">{session.totalTransactions || 0}</p>
                    </div>
                    <div>
                        <p className="text-zinc-400 text-[12px] font-semibold">Beklenen Bakiye</p>
                        <p className="text-xl font-black mt-1">{formatCurrency(session.expectedBalance || 0)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-red-50 rounded-xl border border-red-100/50">
                        <LogOut className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900">Kasa Kapat</h3>
                        <p className="text-[12px] text-zinc-500">Kasadaki nakit tutarı sayın ve girin.</p>
                    </div>
                </div>
                <div className="relative">
                    <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        type="number"
                        placeholder="Kapanış bakiyesi (₺)"
                        value={closingBalance}
                        onChange={(e) => setClosingBalance(e.target.value)}
                        className="h-12 pl-10 bg-white border border-zinc-200/80 rounded-xl text-[15px] font-semibold"
                    />
                </div>
                <Button
                    onClick={handleClose}
                    className="w-full h-12 font-bold text-[15px] justify-center bg-red-600 hover:bg-red-700 text-white shadow-md"
                >
                    Kasayı Kapat
                </Button>
            </div>
        </div>
    );
};
