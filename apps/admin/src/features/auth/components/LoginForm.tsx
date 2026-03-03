import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
            setError('Geçersiz e-posta veya şifre.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full bg-surface rounded-2xl shadow-xl border border-white/10 p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                    label="E-posta"
                    type="email"
                    placeholder="ornek@peyker.com"
                    error={errors.email?.message}
                    {...register('email')}
                />
                
                <div className="space-y-1">
                    <Input
                        label="Şifre"
                        type="password"
                        placeholder="••••••"
                        error={errors.password?.message}
                        {...register('password')}
                    />
                    <div className="flex justify-end pt-1">
                        <a href="#" className="text-xs text-zinc-500 hover:text-zinc-800 font-medium transition-colors">
                            Şifremi unuttum
                        </a>
                    </div>
                </div>

                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg font-medium">
                        {error}
                    </div>
                )}

                <Button type="submit" className="w-full mt-2" size="lg" loading={isLoading}>
                    Giriş Yap
                </Button>
            </form>
        </div>
    );
};
