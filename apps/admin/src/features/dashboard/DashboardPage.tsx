import { useEffect, useState } from 'react';
import { StatCard } from './components/StatCard';
import { SalesChart } from './components/SalesChart';
import { InventoryAlerts } from './components/InventoryAlerts';
import { RecentTransactions } from './components/RecentTransactions';
import { Banknote, ShoppingBag, Users, TrendingUp, Loader2, Download, Calendar } from 'lucide-react';
import { dashboardService, DashboardSummary } from './services/dashboard.service';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/shared/PageHeader';

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

    const getTrendData = (value?: number, suffix: string = '') => {
        if (value === undefined) return { text: 'Hesaplanıyor...', type: 'neutral' as const };
        if (value > 0) return { text: `+${value}% ${suffix}`, type: 'up' as const };
        if (value < 0) return { text: `${value}% ${suffix}`, type: 'down' as const };
        return { text: `0% ${suffix}`, type: 'neutral' as const };
    };

    const salesTrend = getTrendData(summary?.trends?.salesAmount, 'düne göre');
    const countTrend = getTrendData(summary?.trends?.salesCount, 'düne göre');
    const customerTrend = getTrendData(summary?.trends?.newCustomers, 'geçen haftaya göre');

    return (
        <div className="space-y-6">
            <PageHeader
                title="Genel Bakış"
                subtitle={`Mağazanızın bugünkü performansı. Son güncellenme: ${lastUpdate}`}
                actions={
                    <>
                        <Button variant="secondary" className="bg-white" icon={<Calendar className="w-4 h-4" />}>
                            Bu Hafta
                        </Button>
                        <Button variant="primary" className="shadow-md" icon={<Download className="w-4 h-4" />}>
                            Rapor İndir
                        </Button>
                    </>
                }
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                    title="Günlük Satış (Brüt)"
                    value={summary ? formatCurrency(summary.todaySales.amount) : '₺0'}
                    change={salesTrend.text}
                    icon={Banknote}
                    trend={salesTrend.type}
                    color="blue"
                />
                <StatCard
                    title="Satış Adedi Bugün"
                    value={String(summary?.todaySales.count || 0)}
                    change={countTrend.text}
                    icon={TrendingUp}
                    trend={countTrend.type}
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
                    change={customerTrend.text}
                    icon={Users}
                    trend={customerTrend.type}
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
