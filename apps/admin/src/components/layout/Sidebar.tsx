import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    CreditCard,
    BarChart3,
    Store,
    Calculator
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sidebar = () => {
    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Inventory', icon: Package, path: '/inventory' },
        { name: 'Orders', icon: ShoppingBag, path: '/orders' },
        { name: 'Customers', icon: Users, path: '/customers' },
        { name: 'Accounting', icon: CreditCard, path: '/accounting' },
        { name: 'Marketing', icon: BarChart3, path: '/marketing' },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0 transition-colors duration-200">
            <div className="p-6 flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <Store className="text-primary w-8 h-8" />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight font-display">
                        Boutique Admin
                    </h1>
                    <p className="text-slate-500 text-xs font-normal">Management Portal</p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group",
                            isActive
                                ? "bg-primary/10 text-primary border-r-3 border-primary"
                                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        <p className="text-sm font-semibold">{item.name}</p>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <NavLink
                    to="/pos"
                    className="w-full flex items-center justify-center gap-2 rounded-lg h-12 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                    <Calculator className="w-5 h-5" />
                    <span className="truncate">Go to POS</span>
                </NavLink>
            </div>
        </aside>
    );
};
