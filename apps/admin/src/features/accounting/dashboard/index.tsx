import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FileText, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);

export const AccountingDashboard = () => {
    const stats = [
        { label: 'Toplam Bakiye', value: 125400, icon: Wallet, color: 'text-zinc-900', bg: 'bg-zinc-100' },
        { label: 'Bu Ay Gelir', value: 48250, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Bu Ay Gider', value: 12800, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-zinc-900">Muhasebe Ozeti</h2>
                <p className="text-[13px] text-zinc-500 mt-1">Kasa, gelir ve gider hareketlerinin genel gorunumu.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="flex items-center justify-between" padding={false}>
                        <div className="p-6">
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">{stat.label}</p>
                            <p className={`text-2xl font-black mt-2 ${stat.color}`}>{formatCurrency(stat.value)}</p>
                        </div>
                        <div className={`m-6 p-3 rounded-xl ${stat.bg}`}>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                    </Card>
                ))}
            </div>

            <Card>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900">Hizli Islemler</h3>
                        <p className="text-[13px] text-zinc-500 mt-1">Sik kullanilan muhasebe aksiyonlari.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" className="font-semibold">Yeni Gider</Button>
                        <Button variant="secondary" className="font-semibold">Yeni Tahsilat</Button>
                        <Button className="font-semibold" icon={<FileText className="h-4 w-4" />}>Fatura Kes</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};
