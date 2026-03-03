import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    description: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

export const StatsCard = ({ title, value, icon: Icon, description, trend, trendValue }: StatsCardProps) => {
    return (
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-zinc-500">{title}</p>
                    <h3 className="text-2xl font-bold text-zinc-900 mt-2">{value}</h3>
                </div>
                <div className="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
                {trend === 'up' && <span className="text-green-600 font-medium mr-2">+{trendValue}</span>}
                {trend === 'down' && <span className="text-red-600 font-medium mr-2">-{trendValue}</span>}
                <span className="text-zinc-500">{description}</span>
            </div>
        </div>
    );
};
