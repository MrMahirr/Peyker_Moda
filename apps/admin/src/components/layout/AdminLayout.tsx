import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { navigation } from '../../router/navigation';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard, Users, Shirt, LogOut, Menu, X,
  ShoppingCart, Megaphone, RefreshCcw, Banknote, Settings,
  Package, UserCheck, Bell, Search, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { SidebarItem } from './SidebarItem';

const IconMap: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  users: Users,
  shirt: Shirt,
  'shopping-cart': ShoppingCart,
  megaphone: Megaphone,
  'refresh-ccw': RefreshCcw,
  banknote: Banknote,
  settings: Settings,
  package: Package,
  'user-check': UserCheck,
};

export const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  // Get current page title from navigation
  const getPageTitle = () => {
    for (const item of navigation) {
      if (item.path === location.pathname) return item.title;
      if (item.children) {
        for (const child of item.children) {
          if (child.path === location.pathname) return child.title;
        }
      }
    }
    return 'Dashboard';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Sidebar ───────────────────────────────── */}
      <aside
        className={cn(
          "bg-sidebar text-white flex flex-col shrink-0 transition-sidebar overflow-hidden",
          isSidebarOpen ? "w-[260px]" : "w-[72px]"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/[0.06]">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-sm font-bold">
                P
              </div>
              <span className="text-[15px] font-semibold tracking-wide">PEYKER</span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-sm font-bold mx-auto">
              P
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto sidebar-scroll py-4 px-3">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = IconMap[item.icon] || LayoutDashboard;
              const isActiveParent = item.children?.some(child =>
                location.pathname.startsWith(child.path)
              );

              return (
                <SidebarItem
                  key={item.path}
                  item={item}
                  isSidebarOpen={isSidebarOpen}
                  Icon={Icon}
                  isActiveParent={isActiveParent}
                  location={location}
                />
              );
            })}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/[0.06] space-y-2">
          {/* POS Button */}
          <button
            onClick={() => navigate('/pos')}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg bg-primary/10 text-primary-light text-[13px] font-medium hover:bg-primary/20 transition-all",
              !isSidebarOpen && "justify-center"
            )}
          >
            <ShoppingCart className="h-[18px] w-[18px] shrink-0" />
            {isSidebarOpen && <span>Satış Ekranı (POS)</span>}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-500 text-[13px] font-medium hover:text-red-400 hover:bg-red-500/10 transition-all",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {isSidebarOpen && <span>Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Area ─────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 bg-surface border-b border-slate-200/80 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
            >
              {isSidebarOpen ? <Menu className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-slate-400">Yönetim</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <span className="text-slate-700 font-medium">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ara..."
                className="h-9 w-56 pl-9 pr-4 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-200 mx-1" />

            {/* User */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-semibold text-slate-800 leading-none">Admin</p>
                <p className="text-xs text-slate-400 mt-0.5">Yönetici</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-semibold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
