import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Award, Plus, Edit, Trash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { loyaltyService } from '../api/loyaltyService';
import type { LoyaltyTier } from '../types';

const fmt = (v: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);

export const LoyaltyProgram = () => {
    const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { (async () => { try { setTiers(await loyaltyService.getTiers() || []); } catch { toast.error('Sadakat verileri yüklenemedi'); } finally { setLoading(false); } })(); }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-zinc-900" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h2 className="text-xl font-bold text-zinc-900">Sadakat Programı</h2><p className="text-[13px] text-zinc-500 mt-1">Müşteri seviyelerini ve puan kurallarını yönetin.</p></div>
                <Button icon={<Plus className="w-4 h-4" />} className="font-semibold shadow-md">Yeni Seviye</Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
                {tiers.map(tier => (
                    <div key={tier.id} className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl" style={{ backgroundColor: tier.color + '20' }}><Award className="h-5 w-5" style={{ color: tier.color }} /></div>
                            <h3 className="font-bold text-zinc-900">{tier.name}</h3>
                        </div>
                        <div className="space-y-2 text-[13px] text-zinc-600">
                            <p>Min. Harcama: <span className="font-semibold text-zinc-900">{fmt(tier.minSpent)}</span></p>
                            <p>İndirim: <span className="font-semibold text-zinc-900">%{tier.discountPercent}</span></p>
                            <p>Puan Çarpanı: <span className="font-semibold text-zinc-900">x{tier.pointMultiplier}</span></p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
