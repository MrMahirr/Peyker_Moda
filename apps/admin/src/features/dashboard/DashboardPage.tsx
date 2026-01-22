import React from 'react';
import { StatsCard } from './components/StatsCard';
import { LowStockAlerts } from './components/LowStockAlerts';
import { BestSellers } from './components/BestSellers';
import { Users, ShoppingBag, Banknote, TrendingUp } from 'lucide-react';

export const DashboardPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Genel Bakış</h1>
                    <p className="text-slate-500">Mağazanızın anlık durumu</p>
                </div>
                <div className="text-sm text-slate-500">
                    Son güncelleme: Birkaç saniye önce
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Günlük Satış"
                    value="₺12,450"
                    icon={Banknote}
                    description="Düne göre"
                    trend="up"
                    trendValue="%12"
                />
                <StatsCard
                    title="Siparişler"
                    value="45"
                    icon={ShoppingBag}
                    description="Bekleyen: 2"
                    trend="neutral"
                />
                <StatsCard
                    title="Yeni Müşteri"
                    value="12"
                    icon={Users}
                    description="Bu hafta"
                    trend="up"
                    trendValue="4"
                />
                <StatsCard
                    title="Ort. Sepet"
                    value="₺276"
                    icon={TrendingUp}
                    description="Düne göre"
                    trend="down"
                    trendValue="%3"
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Main Chart Area or Recent Sales - Placeholder for now used by Best Sellers 2/3 width? No let's do 1/3 widgets */}

                {/* For this version, let's put LowStock and BestSellers side by side 
                    and maybe a recent activity feed or simple chart placeholder later. 
                */}
                <div className="lg:col-span-2">
                    <BestSellers />
                </div>
                <div className="lg:col-span-1">
                    <LowStockAlerts />
                </div>
            </div>
        </div>
    );
};
