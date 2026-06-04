import { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { StatCard } from './components/StatCard';
import { SalesChart } from './components/SalesChart';
import { InventoryAlerts } from './components/InventoryAlerts';
import { RecentTransactions } from './components/RecentTransactions';
import { Banknote, ShoppingBag, Users, TrendingUp, Loader2, Download, Calendar } from 'lucide-react';
import { dashboardService, DashboardSummary } from './services/dashboard.service';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/shared/PageHeader';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';

const formatCurrency = (value: number) => {
    return '₺' + new Intl.NumberFormat('tr-TR', { style: 'decimal' }).format(value);
};

export const DashboardPage = () => {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<string>('');
    const [dateFilterType, setDateFilterType] = useState('this_week');
    const [customDates, setCustomDates] = useState({ startDate: '', endDate: '' });

    const dateRange = useMemo(() => {
        const now = new Date();
        let startDate = '';
        let endDate = '';
        if (dateFilterType === 'this_week') {
            const firstDay = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)));
            startDate = firstDay.toISOString().split('T')[0];
            endDate = new Date().toISOString().split('T')[0];
        } else if (dateFilterType === 'this_month') {
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            startDate = firstDay.toISOString().split('T')[0];
            endDate = new Date().toISOString().split('T')[0];
        } else if (dateFilterType === 'custom') {
            startDate = customDates.startDate;
            endDate = customDates.endDate;
        }
        return { startDate, endDate };
    }, [dateFilterType, customDates]);

    const fetchData = useCallback(async () => {
        try {
            const data = await dashboardService.getSummary(dateRange.startDate, dateRange.endDate);
            setSummary(data);
            setLastUpdate(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
        } catch (err) {
            console.error('Dashboard summary error:', err);
            toast.error('Dashboard özeti yüklenemedi');
        } finally {
            setLoading(false);
        }
    }, [dateRange.startDate, dateRange.endDate]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleDownloadReport = () => {
        if (!summary) return;

        const csvRows = [
            ['Rapor Olusturulma Tarihi', new Date().toLocaleString('tr-TR')],
            ['Tarih Araligi', dateRange.startDate ? `${dateRange.startDate} - ${dateRange.endDate}` : 'Son 30 Gun'],
            [],
            ['Metrik', 'Deger'],
            ['Toplam Musteri', summary.totalCustomers || 0],
            ['Bekleyen Siparis', summary.pendingOrders || 0],
            ['Yeni Musteri', summary.filteredCustomers || 0],
            ['Satis Adedi', summary.totalOrders || 0],
            ['Satis Tutari (TL)', summary.totalRevenue || 0],
        ];

        const csvContent = '\uFEFF' + csvRows.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `dashboard_rapor_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                        <div className="flex items-center gap-2">
                            {dateFilterType === 'custom' && (
                                <div className="flex items-center gap-2">
                                    <Input 
                                        type="date" 
                                        value={customDates.startDate} 
                                        onChange={(e) => setCustomDates(prev => ({ ...prev, startDate: e.target.value }))}
                                        className="h-10 text-sm"
                                    />
                                    <span className="text-zinc-400">-</span>
                                    <Input 
                                        type="date" 
                                        value={customDates.endDate} 
                                        onChange={(e) => setCustomDates(prev => ({ ...prev, endDate: e.target.value }))}
                                        className="h-10 text-sm"
                                    />
                                </div>
                            )}
                            <Select 
                                value={dateFilterType}
                                onChange={(e) => setDateFilterType(e.target.value)}
                                className="w-36"
                                options={[
                                    { value: 'this_week', label: 'Bu Hafta' },
                                    { value: 'this_month', label: 'Bu Ay' },
                                    { value: 'custom', label: 'Özel Tarih' }
                                ]}
                            />
                        </div>
                        <Button variant="primary" className="shadow-md" icon={<Download className="w-4 h-4" />} onClick={handleDownloadReport}>
                            Rapor İndir
                        </Button>
                    </>
                }
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                    title={dateFilterType === 'this_week' ? 'Haftalık Satış (Brüt)' : dateFilterType === 'this_month' ? 'Aylık Satış (Brüt)' : 'Toplam Satış (Brüt)'}
                    value={summary ? formatCurrency(summary.totalRevenue) : '₺0'}
                    change={salesTrend.text}
                    icon={Banknote}
                    trend={salesTrend.type}
                    color="blue"
                />
                <StatCard
                    title="Satış Adedi"
                    value={String(summary?.totalOrders || 0)}
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
                    title={dateFilterType === 'this_week' ? 'Yeni Müşteri (Haftalık)' : dateFilterType === 'this_month' ? 'Yeni Müşteri (Aylık)' : 'Yeni Müşteri'}
                    value={String(summary?.filteredCustomers || 0)}
                    change={dateFilterType === 'this_week' ? customerTrend.text : ''}
                    icon={Users}
                    trend={dateFilterType === 'this_week' ? customerTrend.type : 'neutral'}
                    color="emerald"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <SalesChart dateRange={dateRange} />
                <InventoryAlerts />
            </div>

            <RecentTransactions />
        </div>
    );
};
