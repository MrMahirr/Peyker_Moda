import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Lock, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cashService } from '../services/cash.service';

const formatCurrency = (v: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

export const PeriodClosing = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth());
    const [summary, setSummary] = useState<{ totalIncome: number; totalExpense: number; netProfit: number; taxPayable: number; isClosed?: boolean } | null>(null);
    const [loading, setLoading] = useState(false);
    const [closing, setClosing] = useState(false);

    const fetchSummary = async () => {
        try {
            setLoading(true);
            setSummary(await cashService.getPeriodSummary(year, month + 1));
        } catch { toast.error('Dönem özeti alınamadı'); }
        finally { setLoading(false); }
    };

    const handleClose = async () => {
        try {
            setClosing(true);
            await cashService.closePeriod(year, month + 1);
            toast.success('Dönem kapanışı tamamlandı');
        } catch { toast.error('Dönem kapanışı yapılamadı'); }
        finally { setClosing(false); }
    };

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const isPastPeriod = year < currentYear || (year === currentYear && month < currentMonth);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-violet-50 rounded-xl border border-violet-100/50"><Lock className="h-5 w-5 text-violet-600" /></div>
                <div><h2 className="text-xl font-bold text-zinc-900">Dönem Sonu Kapanış</h2><p className="text-[13px] text-zinc-500">Aylık/yıllık muhasebe kapanışı yapın.</p></div>
            </div>

            <div className="flex gap-3 items-end">
                <div>
                    <label className="text-[12px] font-semibold text-zinc-600 block mb-1">Yıl</label>
                    <select value={year} onChange={e => setYear(Number(e.target.value))} className="h-10 px-3 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-semibold">
                        {[2024, 2025, 2026, 2027].map(y => <option key={y}>{y}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-[12px] font-semibold text-zinc-600 block mb-1">Ay</label>
                    <select value={month} onChange={e => setMonth(Number(e.target.value))} className="h-10 px-3 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-semibold">
                        {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                </div>
                <Button onClick={fetchSummary} disabled={loading} className="font-semibold">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Özeti Göster'}
                </Button>
            </div>

            {summary && (
                <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-6 space-y-6">
                    <h3 className="font-bold text-zinc-900">{MONTHS[month]} {year} — Dönem Özeti</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100/50">
                            <p className="text-[12px] font-semibold text-emerald-700">Toplam Gelir</p>
                            <p className="text-xl font-black text-emerald-600 mt-1">{formatCurrency(summary.totalIncome)}</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-4 border border-red-100/50">
                            <p className="text-[12px] font-semibold text-red-700">Toplam Gider</p>
                            <p className="text-xl font-black text-red-600 mt-1">{formatCurrency(summary.totalExpense)}</p>
                        </div>
                        <div className="bg-zinc-100 rounded-xl p-4 border border-zinc-200/50">
                            <p className="text-[12px] font-semibold text-zinc-700">Net Kâr</p>
                            <p className={`text-xl font-black mt-1 ${summary.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(summary.netProfit)}</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100/50">
                            <p className="text-[12px] font-semibold text-amber-700">Ödenecek Vergi</p>
                            <p className="text-xl font-black text-amber-600 mt-1">{formatCurrency(summary.taxPayable)}</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-zinc-100">
                        {summary.isClosed ? (
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 text-zinc-600 rounded-lg font-semibold text-[14px]">
                                <Lock className="w-4 h-4" />
                                Bu Dönem Kapatıldı
                            </div>
                        ) : !isPastPeriod ? (
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-600 border border-amber-100/50 rounded-lg font-semibold text-[14px] ml-auto">
                                <Lock className="w-4 h-4" />
                                Ay Henüz Tamamlanmadı
                            </div>
                        ) : (
                            <Button 
                                className="font-semibold shadow-md ml-auto" 
                                icon={closing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} 
                                onClick={handleClose} 
                                disabled={closing}
                            >
                                {closing ? 'Kapatılıyor...' : 'Dönemi Kapat'}
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
