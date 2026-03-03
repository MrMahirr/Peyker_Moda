import { useState } from 'react';
import { UserList } from './components/UserList';
import { RoleManager } from './components/RoleManager';
import { cn } from '@/lib/utils';
import { Users, ShieldCheck } from 'lucide-react';

export const StaffPage = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-zinc-900">Personel Yönetimi</h1>
                    <p className="text-[13px] font-medium text-zinc-500 mt-1">Yöneticileri, satış temsilcilerini ve yetkilerini yapılandırın.</p>
                </div>

                <div className="flex bg-zinc-100/50 p-1 rounded-xl border border-zinc-200/50 shadow-inner self-start sm:self-auto">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
                            activeTab === 'users'
                                ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/50"
                                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 border border-transparent"
                        )}
                    >
                        <Users className="h-4 w-4" />
                        Kullanıcılar
                    </button>
                    <button
                        onClick={() => setActiveTab('roles')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
                            activeTab === 'roles'
                                ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/50"
                                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 border border-transparent"
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
