import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { CalendarCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { swal } from '@/utils/swal';
import { cashService } from '../services/cash.service';

type PeriodSummary = {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    taxPayable: number;
};

const MONTHS = [
    { value: '1', label: 'Ocak' },
    { value: '2', label: 'Subat' },
    { value: '3', label: 'Mart' },
    { value: '4', label: 'Nisan' },
    { value: '5', label: 'Mayis' },
    { value: '6', label: 'Haziran' },
    { value: '7', label: 'Temmuz' },
    { value: '8', label: 'Agustos' },
    { value: '9', label: 'Eylul' },
    { value: '10', label: 'Ekim' },
    { value: '11', label: 'Kasim' },
    { value: '12', label: 'Aralik' },
];

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);

export const DailyClosing = () => {
    const now = new Date();
    const [year, setYear] = useState(String(now.getFullYear()));
    const [month, setMonth] = useState(String(now.getMonth() + 1));
    const [summary, setSummary] = useState<PeriodSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [closing, setClosing] = useState(false);

    const yearOptions = useMemo(() => {
        const current = now.getFullYear();
        return Array.from({ length: 4 }, (_, i) => {
            const y = current - i;
            return { value: String(y), label: String(y) };
        });
    }, [now]);

    useEffect(() => {
        let isMounted = true;

        const fetchSummary = async () => {
            try {
                setLoading(true);
                const data = await cashService.getPeriodSummary(Number(year), Number(month));
                if (isMounted) {
                    setSummary(data);
                }
            } catch (err) {
                console.error('Period summary error:', err);
                toast.error('Donem ozeti yuklenemedi', { className: 'font-medium' });
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchSummary();
        return () => {
            isMounted = false;
        };
    }, [year, month]);

    const handleClose = async () => {
        const { isConfirmed } = await swal.fire({
            title: 'Dönemi Kapat',
            text: `${month}/${year} dönemi kapatılacak. Bu işlemden sonra bu döneme ait kayıtlar kilitlenecektir. Emin misiniz?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Evet, Kapat',
            cancelButtonText: 'İptal',
        });
        
        if (!isConfirmed) return;

        try {
            setClosing(true);
            await cashService.closePeriod(Number(year), Number(month));
            toast.success('Donem kapanisi tamamlandi', { className: 'font-medium' });
        } catch (err) {
            console.error('Close period error:', err);
            toast.error('Donem kapanisi basarisiz', { className: 'font-medium' });
        } finally {
            setClosing(false);
        }
    };

    const profitBadge = summary && summary.netProfit >= 0 ? 'success' : 'error';
    const profitLabel = summary && summary.netProfit >= 0 ? 'Kar' : 'Zarar';

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900">Donem Kapanis</h2>
                    <p className="text-[13px] text-zinc-500 mt-1">
                        Aylik gelir/gider ozetini goruntuleyin ve donemi kapatin.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                    <Select
                        label="Ay"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        options={MONTHS}
                    />
                    <Select
                        label="Yil"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        options={yearOptions}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-52">
                    <Loader2 className="w-7 h-7 animate-spin text-zinc-900" />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Toplam Gelir</p>
                            <p className="text-2xl font-black text-emerald-600 mt-2">
                                {formatCurrency(summary?.totalIncome || 0)}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Toplam Gider</p>
                            <p className="text-2xl font-black text-red-600 mt-2">
                                {formatCurrency(summary?.totalExpense || 0)}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm">
                            <div className="flex items-center gap-2">
                                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Net Sonuc</p>
                                <Badge variant={profitBadge}>{profitLabel}</Badge>
                            </div>
                            <p className="text-2xl font-black text-zinc-900 mt-2">
                                {formatCurrency(summary?.netProfit || 0)}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Odencek Vergi</p>
                            <p className="text-2xl font-black text-amber-600 mt-2">
                                {formatCurrency(summary?.taxPayable || 0)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-zinc-100 rounded-xl">
                                <CalendarCheck className="h-5 w-5 text-zinc-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900">Donem Kapanisi</h3>
                                <p className="text-[13px] text-zinc-500">
                                    {month}/{year} donemi kapanis islemi gelir/gider kayitlarini kilitler.
                                </p>
                            </div>
                        </div>
                        <Button
                            className="font-semibold shadow-md"
                            onClick={handleClose}
                            loading={closing}
                        >
                            Donemi Kapat
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
