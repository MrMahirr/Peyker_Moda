import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Store } from 'lucide-react';

export const PosLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Compact POS Header */}
      <header className="h-12 bg-sidebar flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-white text-xs font-bold">
            P
          </div>
          <span className="text-white text-sm font-semibold tracking-wide">POS</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-slate-400 text-xs font-medium hover:text-white hover:bg-white/10 transition-all"
          >
            <Store className="h-3.5 w-3.5" />
            <span>Yönetim Paneli</span>
          </button>
          <button
            onClick={() => { logout(); navigate('/auth/login'); }}
            className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* POS Content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};
