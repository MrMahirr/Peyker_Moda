import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { navigation } from '../../router/navigation';
import { cn } from '../../lib/utils';
import { LayoutDashboard, Users, Shirt, LogOut, Menu, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

// Map icon strings (from navigation.ts) to Lucide components
const IconMap: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  users: Users,
  shirt: Shirt,
  'shopping-cart': ShoppingCart,
};

export const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-slate-900 text-white transition-all duration-300 flex flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="h-16 flex items-center justify-center border-b border-slate-800">
          {isSidebarOpen ? (
            <span className="text-xl font-bold tracking-wider">PEYKER</span>
          ) : (
            <span className="text-xl font-bold">P</span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navigation.map((item) => {
              const Icon = IconMap[item.icon] || LayoutDashboard;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                        isActive
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      )
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {isSidebarOpen && <span>{item.title}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full text-left text-sm font-medium text-slate-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-slate-800",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span>Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 rounded-md hover:bg-slate-100 text-slate-500"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
              A
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
