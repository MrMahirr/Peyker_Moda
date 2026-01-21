import { LoginForm } from './components/LoginForm';

export const LoginPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="mb-8 text-center">
                {/* Logo placeholder - replace with actual logo later */}
                <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg">
                    P
                </div>
                <h2 className="text-lg font-medium text-slate-600">Peyker Moda</h2>
            </div>
            <LoginForm />

            <p className="mt-8 text-center text-xs text-slate-400">
                &copy; {new Date().getFullYear()} Peyker Moda. Tüm hakları saklıdır.
            </p>
        </div>
    );
};
