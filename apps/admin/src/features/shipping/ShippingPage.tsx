import { useState } from 'react';
import { Truck, Package, MapPin, BarChart3 } from 'lucide-react';
import { CarrierList } from './components/CarrierList';
import { ShipmentCreate } from './components/ShipmentCreate';
import { ShipmentTracking } from './components/ShipmentTracking';
import { ShippingRates } from './components/ShippingRates';
import { DeliveryReport } from './components/DeliveryReport';

type Tab = 'shipments' | 'carriers' | 'rates' | 'reports';

export const ShippingPage = () => {
    const [activeTab, setActiveTab] = useState<Tab>('shipments');

    const tabs: { key: Tab; label: string; icon: typeof Truck }[] = [
        { key: 'shipments', label: 'Gönderiler', icon: Package },
        { key: 'carriers', label: 'Kargo Firmaları', icon: Truck },
        { key: 'rates', label: 'Ücret Tarifeleri', icon: MapPin },
        { key: 'reports', label: 'Teslimat Raporu', icon: BarChart3 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Kargo & Lojistik</h1>
                    <p className="text-sm font-medium text-zinc-500 mt-1">Kargo firmaları, gönderiler ve teslimat takibi.</p>
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
            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm min-h-[400px] overflow-hidden">
                {activeTab === 'shipments' && <ShipmentTracking />}
                {activeTab === 'carriers' && <CarrierList />}
                {activeTab === 'rates' && <ShippingRates />}
                {activeTab === 'reports' && <DeliveryReport />}
            </div>
        </div>
    );
};
