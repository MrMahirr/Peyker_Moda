import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const mockTransactions = [
    { id: '#PM-8492', customer: 'Ayşe Yılmaz', date: '03 Mar, 14:45', amount: '₺2.340', status: 'Teslim Edildi', variant: 'success' },
    { id: '#PM-8491', customer: 'Elif Demir', date: '03 Mar, 13:12', amount: '₺890', status: 'Hazırlanıyor', variant: 'warning' },
    { id: '#PM-8490', customer: 'Zeynep Kaya', date: '03 Mar, 11:30', amount: '₺4.120', status: 'Kargoda', variant: 'neutral' },
    { id: '#PM-8489', customer: 'Fatma Öz', date: '03 Mar, 10:05', amount: '₺1.560', status: 'İptal', variant: 'error' },
    { id: '#PM-8488', customer: 'Merve Aksoy', date: '02 Mar, 18:22', amount: '₺3.750', status: 'Ödendi', variant: 'success' },
];

export const RecentTransactions = () => {
    return (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50">
                <div>
                    <h3 className="text-[16px] font-bold text-zinc-900">Son İşlemler</h3>
                    <p className="text-[13px] font-medium text-zinc-500 mt-0.5">En son yapılan satışlar ve kargo durumları.</p>
                </div>
                <button className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                    Tümünü Gör
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-200/50 bg-white">
                            <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-widest">Sipariş</th>
                            <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-widest">Müşteri</th>
                            <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-widest">Tarih</th>
                            <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-widest">Tutar</th>
                            <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-widest">Durum</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 bg-white">
                        {mockTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-zinc-50/80 transition-colors group cursor-pointer">
                                <td className="px-6 py-4">
                                    <span className="font-mono text-[13px] font-bold text-zinc-900 bg-zinc-100 px-2 py-1 rounded">{tx.id}</span>
                                </td>
                                <td className="px-6 py-4 text-[14px] font-semibold text-zinc-700 group-hover:text-zinc-900 transition-colors">{tx.customer}</td>
                                <td className="px-6 py-4 text-[13px] font-medium text-zinc-500">{tx.date}</td>
                                <td className="px-6 py-4 text-[14px] font-black font-mono text-zinc-900">{tx.amount}</td>
                                <td className="px-6 py-4">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    <Badge variant={tx.variant as any} dot={tx.variant !== 'neutral'}>{tx.status}</Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="p-4 bg-zinc-50 border-t border-zinc-100 sm:hidden">
                <button className="w-full inline-flex justify-center items-center gap-1.5 text-[13px] font-bold text-indigo-600 bg-indigo-50 px-3 py-2.5 rounded-lg transition-colors">
                    Tümünü Gör
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
