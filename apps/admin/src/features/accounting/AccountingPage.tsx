import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TransactionList } from './cash-flow/TransactionList';
import { InvoiceList } from './invoices/InvoiceList';
import { ZReport } from './reports/ZReport';
import { Wallet, PieChart, FileText, TrendingUp, TrendingDown } from 'lucide-react';

export const AccountingPage = () => {
    const [activeTab, setActiveTab] = useState<'transactions' | 'invoices' | 'reports'>('transactions');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Ön Muhasebe</h1>
                    <p className="text-sm font-medium text-zinc-500 mt-1">Gelir/Gider takibi, faturalar ve finansal raporlar.</p>
                </div>
                <div className="flex bg-zinc-100/50 p-1 rounded-xl border border-zinc-200/50 shadow-inner">
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            activeTab === 'transactions' 
                                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50' 
                                : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 border border-transparent'
                        }`}
                    >
                        <Wallet className="w-4 h-4" />
                        Kasa Hareketleri
                    </button>
                    <button
                        onClick={() => setActiveTab('invoices')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            activeTab === 'invoices' 
                                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50' 
                                : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 border border-transparent'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        Faturalar
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            activeTab === 'reports' 
                                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50' 
                                : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 border border-transparent'
                        }`}
                    >
                        <PieChart className="w-4 h-4" />
                        Raporlar
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-zinc-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors duration-500" />
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Kasa Bakiyesi</p>
                            <h3 className="text-[32px] font-black mt-2 tracking-tight">124.500 ₺</h3>
                        </div>
                        <div className="p-3 bg-zinc-800 rounded-xl shadow-inner border border-zinc-700/50">
                            <Wallet className="h-6 w-6 text-zinc-300" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Bu Ay Giren</p>
                            <h3 className="text-2xl font-black mt-2 text-emerald-600 tracking-tight">+45.250 ₺</h3>
                        </div>
                        <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100/50">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Bu Ay Çıkan</p>
                            <h3 className="text-2xl font-black mt-2 text-red-600 tracking-tight">-12.800 ₺</h3>
                        </div>
                        <div className="p-2.5 bg-red-50 rounded-xl border border-red-100/50">
                            <TrendingDown className="h-5 w-5 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm min-h-[400px] overflow-hidden">
                {activeTab === 'transactions' && <TransactionList />}
                {activeTab === 'invoices' && <InvoiceList />}
                {activeTab === 'reports' && <ZReport />}
            </div>
        </div>
    );
};
