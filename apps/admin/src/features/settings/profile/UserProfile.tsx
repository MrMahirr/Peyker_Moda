import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { PersonalInfoForm } from './PersonalInfoForm';
import { PasswordChangeForm } from './PasswordChangeForm';
import { Loader2 } from 'lucide-react';

export const UserProfile = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div>
                <PageHeader title="Profil Ayarları" />
                <p className="text-zinc-500 mt-1">Kişisel bilgilerinizi ve hesap güvenliğinizi yönetin.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <PersonalInfoForm 
                    initialData={{
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email
                    }} 
                />

                <PasswordChangeForm />
            </div>
        </div>
    );
};
