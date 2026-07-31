import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string;
    change?: string;
    icon: LucideIcon;
    trend: 'up' | 'down' | 'neutral';
    color: 'green' | 'blue' | 'orange' | 'pink' | 'indigo' | 'emerald';
    description?: string;
}

const colorMap = {
    green: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', trend: 'text-emerald-500', iconBg: 'bg-emerald-100/50' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', trend: 'text-emerald-500', iconBg: 'bg-emerald-100/50' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-600', trend: 'text-blue-500', iconBg: 'bg-blue-100/50' },
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-600', trend: 'text-indigo-500', iconBg: 'bg-indigo-100/50' },
    orange: { bg: 'bg-amber-500/10', text: 'text-amber-600', trend: 'text-amber-500', iconBg: 'bg-amber-100/50' },
    pink: { bg: 'bg-rose-500/10', text: 'text-rose-600', trend: 'text-rose-500', iconBg: 'bg-rose-100/50' },
};

export const StatCard = ({ title, value, change, icon: Icon, trend, color }: StatCardProps) => {
    const styles = colorMap[color] || colorMap.blue;

    return (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="flex items-start justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl transition-colors", styles.iconBg, styles.text)}>
                    <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                {change && (
                    <span className={cn("inline-flex items-center gap-1 text-[12px] font-bold px-2 py-1 rounded-md bg-zinc-50 border border-zinc-100", styles.trend)}>
                        {trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                        {trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
                        {trend === 'neutral' && <Minus className="w-3.5 h-3.5" />}
                        {change}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-[13px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">{title}</h3>
                <p className="text-3xl font-black text-zinc-900 tracking-tight">{value}</p>
            </div>
        </div>
    );
};
