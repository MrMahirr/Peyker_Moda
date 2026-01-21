import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';

const roles = [
    {
        id: 1,
        name: 'Admin',
        description: 'Tüm sisteme tam erişim',
        permissions: ['all'],
    },
    {
        id: 2,
        name: 'Satış Temsilcisi (Sales)',
        description: 'Sadece POS ve Müşteri ekranlarına erişim',
        permissions: ['pos.read', 'pos.write', 'crm.read'],
    },
    {
        id: 3,
        name: 'Depo Sorumlusu',
        description: 'Ürün ve Stok yönetimi',
        permissions: ['catalog.read', 'catalog.write'],
    },
];

export const RoleManager = () => {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
                <Card key={role.id} title={role.name} className="relative overflow-hidden">
                    <div className="flex flex-col h-full">
                        <p className="text-sm text-slate-500 mb-6">{role.description}</p>

                        <div className="mt-auto space-y-4">
                            <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 p-2 rounded">
                                <Shield className="h-4 w-4 text-indigo-500" />
                                <span className="font-medium">{role.permissions.length} Yetki Tanımlı</span>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" className="w-full" onClick={() => toast.info('Düzenleme özelliği yakında gelecek.')}>Düzenle</Button>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}

            <Card className="border-dashed border-2 flex items-center justify-center p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="text-center">
                    <div className="h-10 w-10 bg-white rounded-full border border-slate-200 flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:border-indigo-500 transition-colors">
                        <PlusIcon className="h-5 w-5 text-slate-500 group-hover:text-indigo-500" />
                    </div>
                    <h3 className="font-medium text-slate-900">Yeni Rol Oluştur</h3>
                    <p className="text-xs text-slate-500 mt-1">Özel yetkilerle yeni bir rol tanımla</p>
                </div>
            </Card>
        </div>
    );
};

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
