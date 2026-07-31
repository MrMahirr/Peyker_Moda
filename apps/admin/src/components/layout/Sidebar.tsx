import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    CreditCard,
    BarChart3,
    Store,
    Calculator,
    Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();
    const userRole = user?.role?.toLowerCase() || '';

    const isPathActive = (path: string, activePaths?: string[]) => {
        if (activePaths) {
            return activePaths.some(ap => {
                if (ap === '/') return location.pathname === '/';
                return location.pathname.startsWith(ap);
            });
        }
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/', activePaths: ['/'], allowedRoles: ['admin', 'manager', 'staff'] },
        { name: 'Inventory', icon: Package, path: '/inventory', activePaths: ['/inventory', '/catalog'], allowedRoles: ['admin', 'manager'] },
        { name: 'Orders', icon: ShoppingBag, path: '/sales/orders', activePaths: ['/sales', '/returns'], allowedRoles: ['admin', 'manager', 'staff'] },
        { name: 'Customers', icon: Users, path: '/crm', activePaths: ['/crm'], allowedRoles: ['admin', 'manager', 'staff'] },
        { name: 'Accounting', icon: CreditCard, path: '/accounting', activePaths: ['/accounting'], allowedRoles: ['admin', 'manager'] },
        { name: 'Marketing', icon: BarChart3, path: '/marketing/campaigns', activePaths: ['/marketing'], allowedRoles: ['admin', 'manager'] },
        { name: 'Settings', icon: Settings, path: '/settings/general', activePaths: ['/settings'], allowedRoles: ['admin'] },
    ];

    // Filter navigation items based on the user's role
    const filteredNavItems = navItems.filter(item => item.allowedRoles.includes(userRole));

    return (
        <aside className="w-64 bg-sidebar border-r border-sidebar-hover flex flex-col h-full shrink-0 transition-colors duration-200">
            <div className="p-6 flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-xl">
                    <Store className="text-primary w-8 h-8" />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-primary-dark text-lg font-black leading-tight tracking-tight">
                        Peyker Admin
                    </h1>
                    <p className="text-primary/70 text-[11px] font-bold uppercase tracking-widest mt-0.5">
                        {user?.firstName ? `${user.firstName} - ` : ''} 
                        {userRole.toUpperCase()}
                    </p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto mt-4">
                {filteredNavItems.map((item) => {
                    const active = isPathActive(item.path, item.activePaths);
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                                active
                                    ? "bg-white text-primary border border-sidebar-active shadow-sm font-bold"
                                    : "text-primary-dark/60 hover:bg-sidebar-hover hover:text-primary-dark font-semibold"
                            )}
                        >
                            <item.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                            <p className="text-[14px]">{item.name}</p>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-sidebar-hover bg-white/50">
                <Link
                    to="/pos"
                    className="w-full flex items-center justify-center gap-2 rounded-xl h-12 bg-primary text-white text-[14px] font-bold shadow-md shadow-primary/20 hover:bg-primary-dark transition-all active:scale-[0.98]"
                >
                    <Calculator className="w-5 h-5" />
                    <span className="truncate">POS Ekranı</span>
                </Link>
            </div>
        </aside>
    );
};
