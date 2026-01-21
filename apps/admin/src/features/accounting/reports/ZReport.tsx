import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Printer, Calendar, ArrowUpRight, ArrowDownLeft, CreditCard, Banknote } from 'lucide-react';

export const ZReport = () => {
    // Mock Data for End of Day Report
    const reportData = {
        date: new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        reportNo: 'Z-20240122',
        summary: {
            totalSales: 24500.00,
            totalReturns: 1250.00,
            netSales: 23250.00,
            totalTax: 2325.00,
            transactionCount: 45
        },
        payments: {
            cash: 8500.00,
            creditCard: 14750.00,
            other: 0.00
        },
        cashFlow: {
            startBalance: 1200.00,
            cashIn: 8500.00,
            cashOut: 350.00, // Expenses paid from cash
            safeBalance: 9350.00
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                        Gün Sonu Raporu (Z-Raporu)
                    </h2>
                    <p className="text-slate-500 text-sm">{reportData.date} • Rapor No: {reportData.reportNo}</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Printer className="mr-2 h-4 w-4" />
                    Raporu Yazdır
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sales Summary */}
                <Card className="col-span-1 md:col-span-2 p-0 overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 p-4">
                        <h3 className="font-semibold text-slate-900">Satış Özeti</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-600">Toplam Satış</span>
                            <span className="font-bold text-slate-900">{reportData.summary.totalSales.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 text-red-600">
                            <span>İadeler (-)</span>
                            <span className="font-bold">-{reportData.summary.totalReturns.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-600">Net Satış</span>
                            <span className="font-bold text-xl text-green-600">{reportData.summary.netSales.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 text-sm text-slate-500">
                            <span>Hesaplanan KDV (%10)</span>
                            <span>{reportData.summary.totalTax.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-slate-500">
                            <span>İşlem Adedi</span>
                            <span>{reportData.summary.transactionCount} Adet</span>
                        </div>
                    </div>
                </Card>

                {/* Payment Breakdown */}
                <Card className="p-0 overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 p-4">
                        <h3 className="font-semibold text-slate-900">Ödeme Dağılımı</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-full">
                                    <CreditCard className="h-5 w-5 text-indigo-600" />
                                </div>
                                <span className="font-medium text-slate-700">Kredi Kartı</span>
                            </div>
                            <span className="font-bold text-slate-900">{reportData.payments.creditCard.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <Banknote className="h-5 w-5 text-green-600" />
                                </div>
                                <span className="font-medium text-slate-700">Nakit</span>
                            </div>
                            <span className="font-bold text-slate-900">{reportData.payments.cash.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Cash Flow Details */}
            <Card className="p-0 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 p-4">
                    <h3 className="font-semibold text-slate-900">Kasa Özeti (Nakit Akışı)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                    <div className="p-4 text-center">
                        <p className="text-sm text-slate-500 mb-1">Devreden Bakiye</p>
                        <p className="text-xl font-bold text-slate-700">{reportData.cashFlow.startBalance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                    </div>
                    <div className="p-4 text-center">
                        <p className="text-sm text-green-600 mb-1 flex items-center justify-center gap-1"><ArrowUpRight className="h-3 w-3" /> Kasa Giriş</p>
                        <p className="text-xl font-bold text-green-600">+{reportData.cashFlow.cashIn.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                    </div>
                    <div className="p-4 text-center">
                        <p className="text-sm text-red-600 mb-1 flex items-center justify-center gap-1"><ArrowDownLeft className="h-3 w-3" /> Kasa Çıkış</p>
                        <p className="text-xl font-bold text-red-600">-{reportData.cashFlow.cashOut.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                    </div>
                    <div className="p-4 text-center bg-slate-50">
                        <p className="text-sm text-slate-900 font-bold mb-1">GÜNCEL NET KASA</p>
                        <p className="text-2xl font-black text-slate-900">{reportData.cashFlow.safeBalance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                    </div>
                </div>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm flex gap-3 items-start">
                <div className="mt-0.5 font-bold text-lg">ℹ</div>
                <div>
                    <h4 className="font-bold">Bilgilendirme</h4>
                    <p>
                        Z-Raporu alındığında gün sonu işlemi tamamlanmış olur ve kasa bakiyesi bir sonraki güne devreder.
                        Bu işlem geri alınamaz. Lütfen tüm satışların tamamlandığından emin olun.
                    </p>
                </div>
            </div>
        </div>
    );
};
