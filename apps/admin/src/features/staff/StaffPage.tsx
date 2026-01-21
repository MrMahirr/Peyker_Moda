import { useState } from 'react';
import { UserList } from './components/UserList';
import { RoleManager } from './components/RoleManager';
import { cn } from '@/lib/utils';
import { Users, ShieldCheck } from 'lucide-react';

export const StaffPage = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Personel Yönetimi</h1>
                    <p className="text-slate-500 mt-1">Yöneticileri, satış temsilcilerini ve rollerini yapılandırın.</p>
                </div>

                <div className="flex p-1 bg-slate-100 rounded-lg self-start">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                            activeTab === 'users'
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <Users className="h-4 w-4" />
                        Kullanıcılar
                    </button>
                    <button
                        onClick={() => setActiveTab('roles')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                            activeTab === 'roles'
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <ShieldCheck className="h-4 w-4" />
                        Roller & Yetkiler
                    </button>
                </div>
            </div>

            <div className="mt-8">
                {activeTab === 'users' ? <UserList /> : <RoleManager />}
            </div>
        </div>
    );
};
