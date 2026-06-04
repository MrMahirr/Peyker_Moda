import { useState } from 'react';
import { BarChart3, TrendingUp, PackageSearch } from 'lucide-react';
import { SalesReport } from './components/SalesReport';
import { ProductPerformance } from './components/ProductPerformance';
import { PageHeader } from '@/components/shared/PageHeader';

type Tab = 'sales' | 'products';

export const ReportsPage = () => {
    const [activeTab, setActiveTab] = useState<Tab>('sales');

    const tabs: { key: Tab; label: string; icon: typeof BarChart3 }[] = [
        { key: 'sales', label: 'Satış & Ciro Raporu', icon: TrendingUp },
        { key: 'products', label: 'Ürün & Kategori Performansı', icon: PackageSearch },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
                <div>
                    <PageHeader title="Analiz & İstatistik" subtitle="Mağaza performansı ve detaylı analizler." />
                    <p className="text-sm font-medium text-zinc-500 mt-1">Mağazanızın satış, ürün ve müşteri istatistiklerini inceleyin.</p>
                </div>
                <div className="flex bg-zinc-100/50 p-1 rounded-xl border border-zinc-200/50 shadow-inner">
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === t.key ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 border border-transparent'}`}>
                            <t.icon className="w-4 h-4" />{t.label}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm min-h-[400px]">
                {activeTab === 'sales' && <SalesReport />}
                {activeTab === 'products' && <ProductPerformance />}
            </div>
        </div>
    );
};
