import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { navigation } from '../../router/navigation';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard, Users, Shirt, LogOut, Menu,
  ShoppingCart, Megaphone, RefreshCcw, Banknote, Settings,
  Package, UserCheck, Bell, Search, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { SidebarItem } from './SidebarItem';
import { NotificationDropdown } from '../../features/notifications/components/NotificationDropdown';
import { GlobalSearch } from '../shared/GlobalSearch';

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        <div className="p-4 mt-auto">
          {/* POS Button */}
          <button
            onClick={() => navigate('/pos')}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-3.5 rounded-xl bg-zinc-900 text-white text-[14px] font-bold shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all border border-zinc-800",
              !isSidebarOpen && "justify-center px-0"
            )}
          >
            <ShoppingCart className="h-5 w-5 shrink-0 text-zinc-100" />
            {isSidebarOpen && <span className="tracking-wide">POS Ekranı</span>}
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
            <GlobalSearch />

            {/* Notifications */}
            <NotificationDropdown />

            {/* Divider */}
            <div className="h-8 w-px bg-zinc-200 mx-1" />

            {/* User */}
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 pl-1 hover:bg-zinc-100 p-1.5 rounded-xl transition-colors text-left"
              >
                <div className="text-right hidden lg:block">
                  <p className="text-[13px] font-bold text-zinc-900 leading-none">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{user?.role === 'admin' ? 'Sistem Yöneticisi' : user?.role || 'Kullanıcı'}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center text-white text-sm font-black shadow-sm uppercase">
                  {user?.firstName?.charAt(0) || 'U'}
                </div>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-zinc-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-zinc-100 mb-1 lg:hidden">
                    <p className="text-sm font-bold text-zinc-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-zinc-500 uppercase mt-0.5">{user?.role}</p>
                  </div>
                  <button 
                    onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/settings/profile');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    <UserCheck className="h-4 w-4" />
                    Profilim
                  </button>
                  <div className="h-px bg-zinc-100 my-1"></div>
                  <button 
                    onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Çıkış Yap
                  </button>
                </div>
              )}
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
