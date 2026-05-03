import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { navigation } from '../../router/navigation';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard, Users, Shirt, LogOut, Menu,
  ShoppingCart, Megaphone, RefreshCcw, Banknote, Settings,
  Package, UserCheck, Bell, Search, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { SidebarItem } from './SidebarItem';
import { NotificationDropdown } from '../../features/notifications/components/NotificationDropdown';

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
          "bg-sidebar text-primary-dark flex flex-col shrink-0 transition-sidebar overflow-hidden border-r border-sidebar-hover",
          isSidebarOpen ? "w-[260px]" : "w-[72px]"
        )}
      >
        <div className="h-16 flex items-center px-5 border-b border-zinc-200">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-dark flex items-center justify-center text-white text-sm font-black shadow-sm">
                P
              </div>
              <span className="text-[17px] font-black tracking-tight text-zinc-900">PEYKER</span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary-dark flex items-center justify-center text-white text-sm font-black shadow-sm mx-auto">
              P
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto sidebar-scroll py-6 px-4">
          <ul className="space-y-1.5">
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

        <div className="p-4 border-t border-zinc-200 space-y-2 bg-sidebar-hover/50">
          {/* POS Button */}
          <button
            onClick={() => navigate('/pos')}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-3 rounded-xl bg-white text-zinc-800 text-[14px] font-bold shadow-sm border border-zinc-200 hover:bg-zinc-50 transition-all",
              !isSidebarOpen && "justify-center"
            )}
          >
            <ShoppingCart className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span>POS Ekranı</span>}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-3 rounded-xl text-zinc-500 text-[14px] font-bold hover:text-red-600 hover:bg-red-50 transition-all",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span>Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Area ─────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 bg-surface border-b border-zinc-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-[13px] font-bold">
              <span className="text-zinc-500 uppercase tracking-widest">Yönetim Paneli</span>
              <ChevronRight className="h-4 w-4 text-zinc-300" strokeWidth={3} />
              <span className="text-zinc-900">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Hızlı arama..."
                className="h-10 w-64 pl-10 pr-4 rounded-xl border border-zinc-200 bg-zinc-50 text-[13px] font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all focus:bg-white shadow-sm"
              />
            </div>

            {/* Notifications */}
            <NotificationDropdown />

            {/* Divider */}
            <div className="h-8 w-px bg-zinc-200 mx-1" />

            {/* User */}
            <div className="flex items-center gap-3 pl-1">
              <div className="text-right hidden lg:block">
                <p className="text-[13px] font-bold text-zinc-900 leading-none">Admin</p>
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Sistem Yöneticisi</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center text-white text-sm font-black shadow-sm">
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
