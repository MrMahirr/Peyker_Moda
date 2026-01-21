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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Ön Muhasebe</h1>
                    <p className="text-slate-500">Gelir/Gider takibi, faturalar ve finansal raporlar.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={activeTab === 'transactions' ? 'primary' : 'outline'}
                        onClick={() => setActiveTab('transactions')}
                        className={activeTab === 'transactions' ? 'bg-indigo-600' : ''}
                    >
                        <Wallet className="mr-2 h-4 w-4" />
                        Kasa Hareketleri
                    </Button>
                    <Button
                        variant={activeTab === 'invoices' ? 'primary' : 'outline'}
                        onClick={() => setActiveTab('invoices')}
                        className={activeTab === 'invoices' ? 'bg-indigo-600' : ''}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Faturalar
                    </Button>
                    <Button
                        variant={activeTab === 'reports' ? 'primary' : 'outline'}
                        onClick={() => setActiveTab('reports')}
                        className={activeTab === 'reports' ? 'bg-indigo-600' : ''}
                    >
                        <PieChart className="mr-2 h-4 w-4" />
                        Raporlar
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-lg shadow-indigo-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-indigo-100 text-sm font-medium">Toplam Bakiye</p>
                            <h3 className="text-3xl font-bold mt-2">124.500 ₺</h3>
                        </div>
                        <div className="p-2 bg-indigo-400/30 rounded-lg">
                            <Wallet className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Bu Ay Gelir</p>
                            <h3 className="text-2xl font-bold mt-2 text-green-600">+45.250 ₺</h3>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Bu Ay Gider</p>
                            <h3 className="text-2xl font-bold mt-2 text-red-600">-12.800 ₺</h3>
                        </div>
                        <div className="p-2 bg-red-50 rounded-lg">
                            <TrendingDown className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
                {activeTab === 'transactions' && <TransactionList />}
                {activeTab === 'invoices' && <InvoiceList />}
                {activeTab === 'reports' && <ZReport />}
            </div>
        </div>
    );
};
