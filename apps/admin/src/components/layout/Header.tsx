import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';

export const Header = () => {
    return (
        <header className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 px-8 py-3 transition-colors duration-200">
            <div className="flex items-center gap-8">
                <label className="relative flex items-center w-72">
                    <Search className="absolute left-3 text-slate-400 w-5 h-5" />
                    <input
                        className="w-full h-10 pl-10 pr-4 rounded-lg border-none bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                        placeholder="Search orders, products..."
                    />
                </label>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white relative hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                </button>
                <button className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <Settings className="w-5 h-5" />
                </button>

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

                <div className="flex items-center gap-3 pl-2 cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-none group-hover:text-primary transition-colors">Elena Thorne</p>
                        <p className="text-xs text-slate-500">Store Manager</p>
                    </div>
                    {/* Avatar Placeholder */}
                    <div className="bg-center bg-no-repeat bg-cover rounded-full w-10 h-10 border-2 border-boutique-rose bg-slate-200 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgBQJr9wDPP89nBSkLWuaT9EwFYx4f2M5oEJFG0sBZboTT0_fCTw5Tr3Zbhh5LocmbndW6x9gsBsjtVnc__f0DrvLM-ObJzC1J_8n6RMUY0p51ZDn50B8IsNUvXxz9joVhHgkocpoLX9jWrHBX-9ZYQN-XrYk4LPY-S6_wcbOCKDpv8h_AXy6XpDjAbGBDSpUwk-5fMVJU5xSxt2hFZu_WLlY0vcGevmNx6FmC3rG7Qq3sxfXMh-lVHhIUXEnQq1wYCwmXmIncmBo"
                            alt="User Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};
