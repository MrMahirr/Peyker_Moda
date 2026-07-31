import { LoginForm } from './components/LoginForm';

export const LoginPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
            <div className="mb-8 flex flex-col items-center">
                <div className="w-12 h-12 bg-zinc-950 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md shadow-zinc-950/20 mb-4">
                    P
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white">PEYKER</h2>
                <p className="text-sm text-zinc-400 mt-1">Yönetim Paneli Girişi</p>
            </div>
            
            <div className="w-full">
                <LoginForm />
            </div>

            <p className="mt-8 text-center text-xs text-zinc-500">
                &copy; {new Date().getFullYear()} Peyker Moda. Tüm hakları saklıdır.
            </p>
        </div>
    );
};
