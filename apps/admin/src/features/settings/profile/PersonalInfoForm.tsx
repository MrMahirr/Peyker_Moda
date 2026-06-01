import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Save, Loader2 } from 'lucide-react';
import { settingsService } from '../services/settings.service';
import { toast } from 'sonner';

const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  email: z.string().email(),
});

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;

interface PersonalInfoFormProps {
  initialData: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ initialData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: PersonalInfoValues) => {
    try {
      await settingsService.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
      });
      toast.success('Profil bilgileri başarıyla güncellendi');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Profil güncellenirken bir hata oluştu');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center space-x-3 border-b border-zinc-100 pb-4 mb-6">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <User className="w-5 h-5 text-indigo-600" />
        </div>
        <h3 className="font-bold text-zinc-900">Kişisel Bilgiler</h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center space-x-5 mb-8">
          <div className="relative group">
            <div className="h-20 w-20 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-2xl font-bold border-2 border-zinc-200 group-hover:border-indigo-400 transition-colors">
              {initialData.firstName[0]}{initialData.lastName[0]}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/5 transition-colors cursor-pointer" />
          </div>
          <Button type="button" variant="secondary" size="sm" className="font-semibold">Fotoğraf Değiştir</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Ad"
            placeholder="Adınızı giriniz"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Soyad"
            placeholder="Soyadınızı giriniz"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="E-posta"
          type="email"
          disabled
          className="bg-zinc-50 border-zinc-200 text-zinc-500 cursor-not-allowed"
          {...register('email')}
        />

        <div className="pt-4 flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting || !isDirty}
            className="px-8 font-bold shadow-lg shadow-indigo-100 min-w-[160px]"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Bilgileri Kaydet
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
