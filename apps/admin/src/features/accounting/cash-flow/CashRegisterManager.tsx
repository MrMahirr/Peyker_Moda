import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Banknote, CreditCard, Building, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cashService } from '../services/cash.service';
import type { CashRegister, CashRegisterType } from '../types';

const formatCurrency = (v: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);

const typeIcons: Record<CashRegisterType, typeof Banknote> = { CASH: Banknote, POS_TERMINAL: CreditCard, BANK: Building };
const typeLabels: Record<CashRegisterType, string> = { CASH: 'Nakit Kasa', POS_TERMINAL: 'POS Terminali', BANK: 'Banka' };

export const CashRegisterManager = () => {
    const [registers, setRegisters] = useState<CashRegister[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setRegisters(await cashService.getRegisters() || []);
            } catch { toast.error('Kasalar yüklenemedi'); }
            finally { setLoading(false); }
        })();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-zinc-900" /></div>;

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900">Kasa Yönetimi</h2>
                    <p className="text-[13px] text-zinc-500 mt-1">Nakit kasa, POS terminal ve banka hesaplarınızı yönetin.</p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />} className="font-semibold shadow-md">Yeni Kasa</Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                {registers.map((reg) => {
                    const Icon = typeIcons[reg.type] || Banknote;
                    return (
                        <div key={reg.id} className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-zinc-100 rounded-xl"><Icon className="h-5 w-5 text-zinc-600" /></div>
                                <div>
                                    <h3 className="font-bold text-zinc-900">{reg.name}</h3>
                                    <span className="text-[12px] text-zinc-500">{typeLabels[reg.type]}</span>
                                </div>
                                <Badge variant={reg.isActive ? 'success' : 'neutral'} className="ml-auto">
                                    {reg.isActive ? 'Aktif' : 'Pasif'}
                                </Badge>
                            </div>
                            <p className="text-2xl font-black text-zinc-900">{formatCurrency(reg.balance)}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
