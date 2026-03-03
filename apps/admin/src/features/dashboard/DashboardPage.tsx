import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from './components/StatCard';
import { SalesChart } from './components/SalesChart';
import { InventoryAlerts } from './components/InventoryAlerts';
import { RecentTransactions } from './components/RecentTransactions';
import { Banknote, ShoppingBag, Users, TrendingUp, Loader2 } from 'lucide-react';
import { dashboardService, DashboardSummary } from './services/dashboard.service';

const formatCurrency = (value: number) => {
    return '₺' + new Intl.NumberFormat('tr-TR', { style: 'decimal' }).format(value);
};

export const DashboardPage = () => {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await dashboardService.getSummary();
                setSummary(data);
                setLastUpdate(new Date().toLocaleTimeString('tr-TR'));
            } catch (err) {
                console.error('Dashboard summary error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 mb-4 text-sm font-medium">
                <a className="text-slate-500 hover:text-primary transition-colors" href="#">Home</a>
                <span className="text-slate-500 text-xs">{'>'}</span>
                <span className="text-slate-900 dark:text-white">Admin Dashboard</span>
            </nav>

            {/* Page Heading */}
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight font-display">Bonjour, Yönetici</h2>
                    <p className="text-slate-500 text-base font-normal mt-1">İşte mağazanızın bugün ({new Date().toLocaleDateString('tr-TR')}) gösterdiği performans.</p>
                </div>
                <div className="flex gap-3">
                    <div className="text-sm text-slate-500 self-center mr-4">
                        Son güncelleme: {lastUpdate}
                    </div>
                    <button className="flex items-center gap-2 rounded-lg h-10 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold hover:bg-slate-50 transition-colors">
                        <span>Bu Hafta</span>
                    </button>
                    <button className="flex items-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 transition-all">
                        <span>Rapor İndir</span>
                    </button>
                </div>
            </div>

            {/* KPI Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Günlük Satış"
                    value={summary ? formatCurrency(summary.todaySales.amount) : '₺0'}
                    change="+12.5%"
                    icon={Banknote}
                    trend="up"
                    color="green"
                />
                <StatCard
                    title="Toplam Kar (Tahmini)"
                    value={summary ? formatCurrency(summary.todaySales.amount * 0.4) : '₺0'} // Mock calculation
                    change="+8.2%"
                    icon={TrendingUp}
                    trend="up"
                    color="blue"
                />
                <StatCard
                    title="Aktif Siparişler"
                    value={String(summary?.pendingOrders || 0)}
                    change={`${summary?.pendingOrders || 0} Bekleyen`}
                    icon={ShoppingBag}
                    trend="neutral"
                    color="orange"
                />
                <StatCard
                    title="Yeni Müşteriler"
                    value={String(summary?.newCustomersThisWeek || 0)}
                    change="+5.7%"
                    icon={Users}
                    trend="up"
                    color="pink"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Sales Chart Area */}
                <SalesChart />

                {/* Side Widget: Inventory Alerts */}
                <InventoryAlerts />
            </div>

            {/* Recent Orders Table Section */}
            <RecentTransactions />
        </DashboardLayout>
    );
};
