import { useState, useEffect } from 'react';
import { TransactionList } from './cash-flow/TransactionList';
import { InvoiceList } from './invoices/InvoiceList';
import { ZReport } from './reports/ZReport';
import { VatReport } from './reports/VatReport';
import { PeriodClosing } from './reports/PeriodClosing';
import { Wallet, PieChart, FileText, TrendingUp, TrendingDown, Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { transactionsService } from './services/transactions.service';
import { PageHeader } from '@/components/shared/PageHeader';

export const AccountingPage = () => {
    const [activeTab, setActiveTab] = useState<'transactions' | 'invoices' | 'reports'>('transactions');
    const [cashBalance, setCashBalance] = useState(0);
    const [bankBalance, setBankBalance] = useState(0);
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [monthlyExpense, setMonthlyExpense] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                // Nakit ve Banka bakiyeleri (Gerçek işlem verilerinden)
                const balances = await transactionsService.getCashBankBalances();
                setCashBalance(balances.cashBalance || 0);
                setBankBalance(balances.bankBalance || 0);

                // 2. Aylık gelir / gider hesaplaması
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
                
                const summary = await transactionsService.getSummary(startOfMonth, endOfMonth);
                setMonthlyIncome(summary.income?.total || 0);
                setMonthlyExpense(summary.expense?.total || 0);
            } catch (error) {
                console.error("Ön muhasebe verileri çekilirken hata oluştu:", error);
                toast.error("Ön muhasebe verileri yüklenirken bir hata oluştu");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
                <div>
                    <PageHeader title="Ön Muhasebe" subtitle="Gelir, gider ve nakit akışı takibi." />
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                {/* Nakit Kasa Bakiyesi */}
                <div className="bg-emerald-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors duration-500" />
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-widest">Nakit Kasa</p>
                            <h3 className="text-2xl font-black mt-2 tracking-tight flex items-center gap-1">
                                {isLoading ? <Loader2 className="h-6 w-6 animate-spin mt-1 text-emerald-200/50" /> : formatCurrency(cashBalance)}
                            </h3>
                        </div>
                        <div className="p-2.5 bg-emerald-800 rounded-xl shadow-inner border border-emerald-700/50">
                            <Wallet className="h-5 w-5 text-emerald-100" />
                        </div>
                    </div>
                </div>

                {/* Banka Bakiyesi */}
                <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors duration-500" />
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className="text-indigo-100/70 text-xs font-bold uppercase tracking-widest">Banka Bakiyesi</p>
                            <h3 className="text-2xl font-black mt-2 tracking-tight flex items-center gap-1">
                                {isLoading ? <Loader2 className="h-6 w-6 animate-spin mt-1 text-indigo-200/50" /> : formatCurrency(bankBalance)}
                            </h3>
                        </div>
                        <div className="p-2.5 bg-indigo-800 rounded-xl shadow-inner border border-indigo-700/50">
                            <CreditCard className="h-5 w-5 text-indigo-100" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Bu Ay Giren</p>
                            <h3 className="text-2xl font-black mt-2 text-emerald-600 tracking-tight flex items-center gap-1">
                                {isLoading ? <Loader2 className="h-6 w-6 animate-spin mt-1 text-emerald-200" /> : `+${formatCurrency(monthlyIncome)}`}
                            </h3>
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
                            <h3 className="text-2xl font-black mt-2 text-red-600 tracking-tight flex items-center gap-1">
                                {isLoading ? <Loader2 className="h-6 w-6 animate-spin mt-1 text-red-200" /> : `-${formatCurrency(monthlyExpense)}`}
                            </h3>
                        </div>
                        <div className="p-2.5 bg-red-50 rounded-xl border border-red-100/50">
                            <TrendingDown className="h-5 w-5 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm min-h-[400px] overflow-hidden flex flex-col">
                {activeTab === 'transactions' && <TransactionList />}
                {activeTab === 'invoices' && <InvoiceList />}
                {activeTab === 'reports' && <ReportsContainer />}
            </div>
        </div>
    );
};

// Alt Raporlar Container'ı
const ReportsContainer = () => {
    const [activeReport, setActiveReport] = useState<'z-report' | 'vat' | 'period'>('z-report');

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex border-b border-zinc-200/80 bg-zinc-50/50 p-2 gap-2">
                <button
                    onClick={() => setActiveReport('z-report')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                        activeReport === 'z-report'
                            ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/80'
                            : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 border border-transparent'
                    }`}
                >
                    Satış Raporları (Z-Raporu)
                </button>
                <button
                    onClick={() => setActiveReport('vat')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                        activeReport === 'vat'
                            ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/80'
                            : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 border border-transparent'
                    }`}
                >
                    KDV Raporu
                </button>
                <button
                    onClick={() => setActiveReport('period')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                        activeReport === 'period'
                            ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/80'
                            : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 border border-transparent'
                    }`}
                >
                    Dönem Sonu Kapanış
                </button>
            </div>
            <div className="flex-1">
                {activeReport === 'z-report' && <ZReport />}
                {activeReport === 'vat' && <VatReport />}
                {activeReport === 'period' && <PeriodClosing />}
            </div>
        </div>
    );
};
