import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Zod schema for login validation
const loginSchema = z.object({
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setError(null);
        try {
            await login(data);
            toast.success('Giriş başarılı!', { duration: 2000 });
            navigate('/');
        } catch {
            toast.error('Giriş başarısız. Bilgilerinizi kontrol edin.');
            setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-xl border-slate-200">
            <div className="p-6 space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Admin Paneli
                    </h1>
                    <p className="text-sm text-slate-500">
                        Yönetim paneline erişmek için giriş yapın
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="E-posta"
                        type="email"
                        placeholder="ornek@peyker.com"
                        error={errors.email?.message}
                        {...register('email')}
                    />
                    <div className="space-y-2">
                        <Input
                            label="Şifre"
                            type="password"
                            placeholder="••••••"
                            error={errors.password?.message}
                            {...register('password')}
                        />
                        <div className="flex justify-end">
                            <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                                Şifremi unuttum?
                            </a>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                        Giriş Yap
                    </Button>
                </form>
            </div>
        </Card>
    );
};
