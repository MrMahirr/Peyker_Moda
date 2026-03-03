import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string;
    change?: string;
    icon: LucideIcon;
    trend: 'up' | 'down' | 'neutral';
    color: 'green' | 'blue' | 'orange' | 'pink';
    description?: string;
}

const colorMap = {
    green: { icon: 'text-emerald-600 bg-emerald-50', trend: 'text-emerald-600' },
    blue: { icon: 'text-violet-600 bg-violet-50', trend: 'text-violet-600' },
    orange: { icon: 'text-amber-600 bg-amber-50', trend: 'text-amber-600' },
    pink: { icon: 'text-rose-600 bg-rose-50', trend: 'text-rose-600' },
};

export const StatCard = ({ title, value, change, icon: Icon, trend, color }: StatCardProps) => {
    const styles = colorMap[color] || colorMap.blue;

    return (
        <div className="bg-surface rounded-xl border border-slate-200/80 p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-lg", styles.icon)}>
                    <Icon className="w-5 h-5" />
                </div>
                {change && (
                    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", styles.trend)}>
                        {trend === 'up' && <TrendingUp className="w-3 h-3" />}
                        {trend === 'down' && <TrendingDown className="w-3 h-3" />}
                        {trend === 'neutral' && <Minus className="w-3 h-3" />}
                        {change}
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">{title}</p>
        </div>
    );
};
