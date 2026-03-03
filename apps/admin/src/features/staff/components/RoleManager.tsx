import { Button } from '@/components/ui/Button';
import { Shield, Plus, Lock } from 'lucide-react';
import { toast } from 'sonner';

const roles = [
    {
        id: 1,
        name: 'Sistem Yöneticisi',
        description: 'Tüm modüllere ve ayarlara tam erişim yetkisi.',
        permissions: ['all'],
        usersCount: 2
    },
    {
        id: 2,
        name: 'Satış Temsilcisi',
        description: 'POS, Kasa işlemleri ve Müşteri listesi ekranlarına erişim.',
        permissions: ['pos.read', 'pos.write', 'crm.read'],
        usersCount: 5
    },
    {
        id: 3,
        name: 'Depo Sorumlusu',
        description: 'Ürün yönetimi, stok takibi ve katalog düzenlemesi.',
        permissions: ['catalog.read', 'catalog.write'],
        usersCount: 3
    },
];

export const RoleManager = () => {
    return (
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
                <div key={role.id} className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col p-6 hover:shadow-md transition-all duration-200 group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-zinc-50 border border-zinc-200/80 rounded-xl flex items-center justify-center text-zinc-900 shadow-sm group-hover:scale-105 transition-transform">
                            {role.id === 1 ? <Shield className="w-6 h-6" /> : <Lock className="w-6 h-6 text-zinc-500" />}
                        </div>
                        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-100 px-2 py-1 rounded">
                            {role.usersCount} Personel
                        </span>
                    </div>
                    
                    <h3 className="text-[16px] font-bold text-zinc-900 mb-1.5">{role.name}</h3>
                    <p className="text-[13px] font-medium text-zinc-500 leading-relaxed min-h-[40px] mb-6">
                        {role.description}
                    </p>

                    <div className="mt-auto space-y-4">
                        <div className="flex items-center gap-2 p-3 bg-zinc-50 border border-zinc-200/50 rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                            <span className="text-[13px] font-bold text-zinc-700">{role.permissions.length} Yetki Tanımlı</span>
                        </div>

                        <Button 
                            variant="secondary" 
                            className="w-full h-11 bg-white border border-zinc-200/80 shadow-sm hover:bg-zinc-50 font-bold text-zinc-700" 
                            onClick={() => toast.info('Düzenleme özelliği yakında gelecek.', { className: 'font-medium' })}
                        >
                            İzinleri Düzenle
                        </Button>
                    </div>
                </div>
            ))}

            <button className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-300 transition-all group min-h-[300px]">
                <div className="h-14 w-14 bg-white rounded-full border border-zinc-200 flex items-center justify-center mb-4 shadow-sm group-hover:border-zinc-900 group-hover:text-zinc-900 transition-colors">
                    <Plus className="h-6 w-6 text-zinc-400 group-hover:text-zinc-900" />
                </div>
                <h3 className="text-[16px] font-bold text-zinc-900">Özel Rol Oluştur</h3>
                <p className="text-[13px] font-medium text-zinc-500 mt-1 max-w-[200px] text-center">İhtiyacınıza göre özel izinlere sahip yeni bir rol tanımlayın.</p>
            </button>
        </div>
    );
};
