import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Store } from 'lucide-react';

export const PosLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Compact POS Header */}
      <header className="h-14 bg-surface border-b border-zinc-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-dark flex items-center justify-center text-white text-[14px] font-black shadow-sm">
            P
          </div>
          <span className="text-zinc-900 text-[15px] font-black tracking-tight">POS EKRANI</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-600 text-[13px] font-bold hover:text-zinc-900 hover:bg-zinc-100 border border-transparent transition-all shadow-sm"
          >
            <Store className="h-4 w-4" />
            <span>Yönetim Paneli</span>
          </button>
          <div className="h-5 w-px bg-zinc-200 mx-1" />
          <button
            onClick={() => { logout(); navigate('/auth/login'); }}
            className="p-2 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-all"
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
