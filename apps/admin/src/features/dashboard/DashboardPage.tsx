import { useEffect, useState } from 'react';
import { StatCard } from './components/StatCard';
import { SalesChart } from './components/SalesChart';
import { InventoryAlerts } from './components/InventoryAlerts';
import { RecentTransactions } from './components/RecentTransactions';
import { Banknote, ShoppingBag, Users, TrendingUp, Loader2, Download, Calendar } from 'lucide-react';
import { dashboardService, DashboardSummary } from './services/dashboard.service';
import { Button } from '@/components/ui/Button';

const formatCurrency = (value: number) => {
    return '₺' + new Intl.NumberFormat('tr-TR', { style: 'decimal' }).format(value);
};

export const DashboardPage = () => {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<string>('');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchData = async () => {
        try {
            const data = await dashboardService.getSummary();
            setSummary(data);
            setLastUpdate(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
        } catch (err) {
            console.error('Dashboard summary error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
                <p className="text-[13px] font-medium text-zinc-500">Gösterge tablosu hazırlanıyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-zinc-900">Genel Bakış</h1>
                    <p className="text-[13px] font-medium text-zinc-500 mt-1">
                        Mağazanızın bugünkü performansı. Son güncellenme: <span className="font-bold text-zinc-700">{lastUpdate}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" className="bg-white" icon={<Calendar className="w-4 h-4" />}>
                        Bu Hafta
                    </Button>
                    <Button variant="primary" className="shadow-md" icon={<Download className="w-4 h-4" />}>
                        Rapor İndir
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                    title="Günlük Satış (Brüt)"
                    value={summary ? formatCurrency(summary.todaySales.amount) : '₺0'}
                    change="+12.5% düne göre"
                    icon={Banknote}
                    trend="up"
                    color="blue"
                />
                <StatCard
                    title="Satış Adedi Bugün"
                    value={String(summary?.todaySales.count || 0)}
                    change="+8.2% hedefe göre"
                    icon={TrendingUp}
                    trend="up"
                    color="indigo"
                />
                <StatCard
                    title="Bekleyen Sipariş"
                    value={String(summary?.pendingOrders || 0)}
                    change={`${summary?.pendingOrders || 0} Sipariş işlenmedi`}
                    icon={ShoppingBag}
                    trend="neutral"
                    color="orange"
                />
                <StatCard
                    title="Yeni Müşteri (Haftalık)"
                    value={String(summary?.newCustomersThisWeek || 0)}
                    change="+5.7% artış"
                    icon={Users}
                    trend="up"
                    color="emerald"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <SalesChart />
                <InventoryAlerts />
            </div>

            <RecentTransactions />
        </div>
    );
};
