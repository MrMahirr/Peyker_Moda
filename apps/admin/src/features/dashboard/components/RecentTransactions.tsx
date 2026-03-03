import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const mockTransactions = [
    { id: '#PM-8492', customer: 'Ayşe Yılmaz', date: '03 Mar, 14:45', amount: '₺2.340', status: 'Kargoda', variant: 'success' as const },
    { id: '#PM-8491', customer: 'Elif Demir', date: '03 Mar, 13:12', amount: '₺890', status: 'Hazırlanıyor', variant: 'warning' as const },
    { id: '#PM-8490', customer: 'Zeynep Kaya', date: '03 Mar, 11:30', amount: '₺4.120', status: 'Kargoda', variant: 'success' as const },
    { id: '#PM-8489', customer: 'Fatma Öz', date: '03 Mar, 10:05', amount: '₺1.560', status: 'İptal', variant: 'error' as const },
    { id: '#PM-8488', customer: 'Merve Aksoy', date: '02 Mar, 18:22', amount: '₺3.750', status: 'Teslim Edildi', variant: 'info' as const },
];

export const RecentTransactions = () => {
    return (
        <div className="bg-surface rounded-xl border border-slate-200/80">
            <div className="p-5 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-slate-800">Son İşlemler</h3>
                    <p className="text-xs text-slate-400 mt-0.5">En son yapılan satışlar</p>
                </div>
                <button className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-dark transition-colors">
                    Tümünü Gör
                    <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-t border-b border-slate-100">
                            <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sipariş</th>
                            <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Müşteri</th>
                            <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tarih</th>
                            <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tutar</th>
                            <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Durum</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {mockTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-3.5 text-sm font-medium text-slate-700">{tx.id}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">{tx.customer}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-400">{tx.date}</td>
                                <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">{tx.amount}</td>
                                <td className="px-5 py-3.5">
                                    <Badge variant={tx.variant} dot>{tx.status}</Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
