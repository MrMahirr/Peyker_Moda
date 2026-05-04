import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, RefreshCcw, Loader2 } from 'lucide-react';
import { settingsService } from '../services/settings.service';
import { toast } from 'sonner';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre zorunludur'),
  newPassword: z.string().min(6, 'Yeni şifre en az 6 karakter olmalıdır'),
  confirmPassword: z.string().min(1, 'Şifre tekrarı zorunludur'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type PasswordValues = z.infer<typeof passwordSchema>;

export const PasswordChangeForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordValues) => {
    try {
      await settingsService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Şifreniz başarıyla güncellendi');
      reset();
    } catch (error: any) {
      console.error('Password change error:', error);
      const errorMessage = error.response?.data?.message || 'Şifre güncellenirken bir hata oluştu';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm transition-all hover:shadow-md h-fit">
      <div className="flex items-center space-x-3 border-b border-zinc-100 pb-4 mb-6">
        <div className="p-2 bg-amber-50 rounded-lg">
          <Lock className="w-5 h-5 text-amber-600" />
        </div>
        <h3 className="font-bold text-zinc-900">Şifre Değiştir</h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Mevcut Şifre"
          type="password"
          placeholder="••••••••"
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />
        
        <div className="h-px bg-zinc-50 my-2" />

        <Input
          label="Yeni Şifre"
          type="password"
          placeholder="••••••••"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        
        <Input
          label="Yeni Şifre (Tekrar)"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <div className="pt-4 flex justify-end">
          <Button 
            type="submit" 
            variant="secondary"
            disabled={isSubmitting}
            className="px-8 font-bold min-w-[160px] border-zinc-200"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <RefreshCcw className="w-4 h-4 mr-2" />
                Şifreyi Güncelle
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
