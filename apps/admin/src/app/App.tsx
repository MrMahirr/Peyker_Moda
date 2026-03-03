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
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 4px 24px rgb(0 0 0 / 0.08)',
            padding: '14px 16px',
            fontFamily: "'Inter', system-ui, sans-serif",
          },
          classNames: {
            title: 'text-zinc-800 font-semibold text-sm',
            description: 'text-zinc-400 text-xs',
            actionButton: 'bg-primary text-white font-medium text-xs py-2 px-4 rounded-lg',
            cancelButton: 'bg-zinc-100 text-zinc-600 font-medium text-xs py-2 px-4 rounded-lg',
            toast: 'font-sans'
          }
        }}
      />
    </BrowserRouter>
  );
}

export default App;
