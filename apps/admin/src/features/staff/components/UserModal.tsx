import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { staffService, User } from '../services/staff.service';
import { toast } from 'sonner';

const userSchema = z.object({
    firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
    lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır').optional().or(z.literal('')),
    role: z.string().min(1, 'Rol seçilmelidir'),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSuccess: () => void;
}

export const UserModal = ({ isOpen, onClose, user, onSuccess }: UserModalProps) => {
    const isEdit = !!user;

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: 'STAFF',
        }
    });

    useEffect(() => {
        if (isOpen) {
            if (user) {
                reset({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    password: '' // Don't populate password on edit
                });
            } else {
                reset({
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    role: 'STAFF',
                });
            }
        }
    }, [isOpen, user, reset]);

    const onSubmit: SubmitHandler<UserFormData> = async (data) => {
        try {
            if (isEdit && user) {
                const updateData: any = {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    role: data.role,
                };
                if (data.password) {
                    updateData.password = data.password;
                }
                await staffService.update(user.id, updateData);
                toast.success('Personel başarıyla güncellendi', { className: 'font-medium' });
            } else {
                if (!data.password) {
                    toast.error('Yeni personel için şifre zorunludur');
                    return;
                }
                await staffService.create({
                    ...data,
                    password: data.password
                });
                toast.success('Personel başarıyla Eklendi', { className: 'font-medium' });
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Bir hata oluştu', { className: 'font-medium' });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Personeli Düzenle' : 'Yeni Personel Ekle'}
            className="sm:max-w-[500px]"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Ad"
                        placeholder="Örn: Ahmet"
                        error={errors.firstName?.message}
                        {...register('firstName')}
                    />
                    <Input
                        label="Soyad"
                        placeholder="Örn: Yılmaz"
                        error={errors.lastName?.message}
                        {...register('lastName')}
                    />
                </div>

                <Input
                    label="E-posta"
                    type="email"
                    placeholder="ornek@sirket.com"
                    error={errors.email?.message}
                    {...register('email')}
                />

                <Input
                    label={isEdit ? "Şifre (Değiştirmek istemiyorsanız boş bırakın)" : "Şifre"}
                    type="password"
                    placeholder="******"
                    error={errors.password?.message}
                    {...register('password')}
                />

                <Select
                    label="Rol"
                    error={errors.role?.message}
                    {...register('role')}
                    options={[
                        { value: 'ADMIN', label: 'Admin (Tam Yetki)' },
                        { value: 'MANAGER', label: 'Yönetici' },
                        { value: 'STAFF', label: 'Personel (Satış/Stok)' }
                    ]}
                />

                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 mt-6">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        İptal
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
