import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { PosProvider } from '@/context/PosContext';
import { AppRoutes } from '@/router/appRoutes';
import { Toaster } from 'sonner';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <PosProvider>
            <AppRoutes />
          </PosProvider>
        </ThemeProvider>
      </AuthProvider>
      <Toaster
        position="top-center"
        richColors
        theme="light"
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #e2e8f0', // slate-200
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // shadow-xl
            padding: '16px',
          },
          classNames: {
            title: 'text-slate-900 font-semibold text-sm',
            description: 'text-slate-500 text-xs',
            actionButton: 'bg-indigo-600 text-white font-medium text-xs py-2 px-4 rounded-lg',
            cancelButton: 'bg-slate-100 text-slate-600 font-medium text-xs py-2 px-4 rounded-lg',
            toast: 'font-sans'
          }
        }}
      />
    </BrowserRouter>
  );
}

export default App;
