import { useEffect, useState } from 'react';
import { Receipt, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cashService } from '../services/cash.service';

const formatCurrency = (v: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);

export const VatReport = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [lines, setLines] = useState<{ period: string; salesVat: number; purchaseVat: number; netVat: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try { setLoading(true); const data = await cashService.getVatReport(year); setLines(data.lines || []); }
            catch { toast.error('KDV raporu yüklenemedi'); }
            finally { setLoading(false); }
        })();
    }, [year]);

    const totalSalesVat = lines.reduce((s, l) => s + l.salesVat, 0);
    const totalPurchaseVat = lines.reduce((s, l) => s + l.purchaseVat, 0);
    const totalNetVat = lines.reduce((s, l) => s + l.netVat, 0);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-zinc-900" /></div>;

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-teal-50 rounded-xl border border-teal-100/50"><Receipt className="h-5 w-5 text-teal-600" /></div>
                    <div><h2 className="text-xl font-bold text-zinc-900">KDV Raporu</h2><p className="text-[13px] text-zinc-500">Dönemsel KDV hesaplaması.</p></div>
                </div>
                <select value={year} onChange={e => setYear(Number(e.target.value))} className="h-10 px-3 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-semibold">
                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
                <table className="w-full text-[13px]">
                    <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-200/80">
                            <th className="text-left px-6 py-3 font-semibold text-zinc-600">Dönem</th>
                            <th className="text-right px-6 py-3 font-semibold text-zinc-600">Hesaplanan KDV</th>
                            <th className="text-right px-6 py-3 font-semibold text-zinc-600">İndirilecek KDV</th>
                            <th className="text-right px-6 py-3 font-semibold text-zinc-600">Ödenecek KDV</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lines.map((line, i) => (
                            <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50">
                                <td className="px-6 py-3 font-semibold text-zinc-800">{line.period}</td>
                                <td className="px-6 py-3 text-right font-mono">{formatCurrency(line.salesVat)}</td>
                                <td className="px-6 py-3 text-right font-mono">{formatCurrency(line.purchaseVat)}</td>
                                <td className="px-6 py-3 text-right font-mono font-bold">{formatCurrency(line.netVat)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-zinc-900 text-white">
                            <td className="px-6 py-3 font-bold">Toplam</td>
                            <td className="px-6 py-3 text-right font-mono font-bold">{formatCurrency(totalSalesVat)}</td>
                            <td className="px-6 py-3 text-right font-mono font-bold">{formatCurrency(totalPurchaseVat)}</td>
                            <td className="px-6 py-3 text-right font-mono font-black">{formatCurrency(totalNetVat)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};
