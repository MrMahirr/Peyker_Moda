import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Printer, Calendar, ArrowUpRight, ArrowDownLeft, CreditCard, Banknote, Info, Loader2 } from 'lucide-react';
import { zReportService, ZReportData } from '../services/zreport.service';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const ZReport = () => {
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [reportData, setReportData] = useState<ZReportData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                const data = await zReportService.getTodayReport(period);
                setReportData(data);
            } catch (error) {
                console.error('Failed to fetch Z report:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [period]);

    if (loading && !reportData) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
                <p className="text-[13px] font-medium text-zinc-500">Rapor hazırlanıyor...</p>
            </div>
        );
    }

    if (!reportData) return null;

    const handleCloseDay = () => {
        MySwal.fire({
            title: 'Emin misiniz?',
            text: 'Z-Raporu kesilecek ve gün kapatılacak. Bu işlem geri alınamaz!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d97706',
            cancelButtonColor: '#71717a',
            confirmButtonText: 'Evet, Gün Sonunu Kes',
            cancelButtonText: 'İptal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    setLoading(true);
                    await zReportService.closeDay();
                    toast.success("Gün sonu işlemi başarıyla tamamlandı.");
                    const data = await zReportService.getTodayReport('daily');
                    setReportData(data);
                } catch (error) {
                    toast.error("Gün sonu alınırken hata oluştu.");
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    return (
        <div className="p-6 space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200/80 pb-5">
                <div>
                    <h2 className="text-[20px] font-black tracking-tight text-zinc-900 flex items-center gap-2">
                        <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white shadow-md shadow-zinc-900/10">
                            <Calendar className="h-4 w-4" />
                        </div>
                        {period === 'daily' ? 'Gün Sonu Z-Raporu' : period === 'weekly' ? 'Haftalık Satış Raporu' : 'Aylık Satış Raporu'}
                    </h2>
                    <p className="text-zinc-500 font-medium text-[13px] mt-2 flex items-center gap-2">
                        {reportData.date} <span className="text-zinc-300">•</span> 
                        <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md font-mono text-[11px] border border-zinc-200/80">Rapor No: {reportData.reportNo}</span>
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select 
                        value={period} 
                        onChange={(e) => setPeriod(e.target.value as any)}
                        className="h-10 px-3 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-semibold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-sm"
                    >
                        <option value="daily">Günlük (Z-Raporu)</option>
                        <option value="weekly">Haftalık Rapor</option>
                        <option value="monthly">Aylık Rapor</option>
                    </select>
                    <Button variant="secondary" className="bg-white shadow-sm border border-zinc-200/80" icon={<Printer className="w-4 h-4" />}>
                        Yazdır
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sales Summary */}
                <div className="col-span-1 md:col-span-2 bg-surface border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden">
                    <div className="bg-zinc-50/50 border-b border-zinc-100 px-5 py-3">
                        <h3 className="font-bold text-zinc-900 text-[14px]">Satış Özeti</h3>
                    </div>
                    <div className="p-5">
                        <div className="flex justify-between items-center py-2.5 border-b border-zinc-100/80">
                            <span className="text-zinc-500 font-medium text-[14px]">Brüt Satış</span>
                            <span className="font-bold text-zinc-900 font-mono text-[15px]">{reportData.summary.totalSales.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-zinc-100/80">
                            <span className="text-zinc-500 font-medium text-[14px]">İadeler (-)</span>
                            <span className="font-bold text-red-600 font-mono text-[15px]">-{reportData.summary.totalReturns.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-zinc-100/80">
                            <span className="text-zinc-500 font-medium text-[14px]">Net Satış</span>
                            <span className="font-bold text-zinc-900 font-mono text-[15px]">{reportData.summary.netSales.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-zinc-100/80">
                            <span className="text-zinc-500 font-medium text-[14px]">KDV Toplamı</span>
                            <span className="font-bold text-zinc-600 font-mono text-[15px]">{reportData.summary.totalTax.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                        </div>
                        <div className="flex justify-between items-center py-3 mt-1 bg-zinc-50 -mx-5 px-5 border-t border-zinc-100">
                            <span className="text-zinc-800 font-bold text-[14px]">İşlem Sayısı</span>
                            <span className="font-bold text-zinc-900 bg-white border border-zinc-200/80 px-2 py-0.5 rounded-md shadow-sm">{reportData.summary.transactionCount} Adet</span>
                        </div>
                    </div>
                </div>

                {/* Payment Breakdown */}
                <div className="col-span-1 bg-surface border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="bg-zinc-50/50 border-b border-zinc-100 px-5 py-3">
                        <h3 className="font-bold text-zinc-900 text-[14px]">Tahsilat Dağılımı</h3>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-center">
                        <div className="space-y-3.5">
                            <div className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/50 hover:border-zinc-300 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg border border-zinc-200/80 shadow-sm">
                                        <CreditCard className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <span className="font-bold text-[14px] text-zinc-800">Kredi Kartı</span>
                                </div>
                                <span className="font-black font-mono text-[16px] text-zinc-900">{reportData.payments.creditCard.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                            </div>
                            
                            <div className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/50 hover:border-zinc-300 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg border border-zinc-200/80 shadow-sm">
                                        <Banknote className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <span className="font-bold text-[14px] text-zinc-800">Nakit Tahsilat</span>
                                </div>
                                <span className="font-black font-mono text-[16px] text-zinc-900">{reportData.payments.cash.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cash Flow Details */}
            <div className="bg-surface border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden mt-6">
                <div className="bg-zinc-50/50 border-b border-zinc-100 px-5 py-3">
                    <h3 className="font-bold text-zinc-900 text-[14px]">Z-Kasa Nakit Akışı</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-200/80">
                    <div className="p-6 text-center hover:bg-zinc-50/50 transition-colors">
                        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Devreden Kasa</p>
                        <p className="text-xl font-black font-mono text-zinc-700">{reportData.cashFlow.startBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</p>
                    </div>
                    <div className="p-6 text-center hover:bg-zinc-50/50 transition-colors bg-emerald-50/30">
                        <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center justify-center gap-1">
                            <ArrowUpRight className="h-3.5 w-3.5" /> Nakit Giriş
                        </p>
                        <p className="text-xl font-black font-mono text-emerald-600">+{reportData.cashFlow.cashIn.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</p>
                    </div>
                    <div className="p-6 text-center hover:bg-zinc-50/50 transition-colors bg-red-50/30">
                        <p className="text-[11px] font-bold text-red-600 uppercase tracking-widest mb-2 flex items-center justify-center gap-1">
                            <ArrowDownLeft className="h-3.5 w-3.5" /> Nakit Çıkış
                        </p>
                        <p className="text-xl font-black font-mono text-red-600">-{reportData.cashFlow.cashOut.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</p>
                    </div>
                    <div className="p-6 text-center bg-zinc-900 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/10 rounded-full blur-2xl transition-colors duration-500" />
                        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2 relative z-10">AKTARILACAK KASA</p>
                        <p className="text-3xl font-black font-mono tracking-tight relative z-10">{reportData.cashFlow.safeBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</p>
                    </div>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mt-6 shadow-sm">
                <div className="flex gap-3.5 items-start">
                    <div className="text-amber-500 mt-0.5">
                        <Info className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-[14px] text-amber-900">Gün Sonu Uyarısı</h4>
                        <p className="text-[13px] font-medium text-amber-800/80 mt-0.5 leading-relaxed">
                            Z-Raporu alındığında gün sonu işlemi tamamlanmış olur ve kasa bakiyesi bir sonraki güne devreder.
                            Bu işlem geri alınamaz. Lütfen bekleyen satış olmadığından emin olun.
                        </p>
                    </div>
                </div>
                
                {period === 'daily' && (
                    <Button 
                        onClick={handleCloseDay}
                        className="bg-amber-600 hover:bg-amber-700 text-white border-transparent whitespace-nowrap shadow-sm"
                    >
                        Gün Sonunu Kes (Z-Raporu Al)
                    </Button>
                )}
            </div>
        </div>
    );
};
