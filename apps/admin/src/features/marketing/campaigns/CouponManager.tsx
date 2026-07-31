import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Ticket, Copy, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../lib/axios';

interface Coupon { id: string; code: string; discountType: 'PERCENTAGE' | 'FIXED_AMOUNT'; discountValue: number; minOrderAmount?: number; usageLimit?: number; usedCount: number; expiresAt?: string; isActive: boolean; }

export const CouponManager = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(false);
    const fmt = (v: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);

    const copyCode = (code: string) => { navigator.clipboard.writeText(code); toast.success('Kupon kodu kopyalandı'); };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h2 className="text-xl font-bold text-zinc-900">Kupon Kodları</h2><p className="text-[13px] text-zinc-500 mt-1">Tek/çoklu kullanım kupon kodları oluşturun ve yönetin.</p></div>
                <Button icon={<Plus className="w-4 h-4" />} className="font-semibold shadow-md">Yeni Kupon</Button>
            </div>

            {coupons.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 rounded-2xl border border-zinc-200/80">
                    <Ticket className="w-12 h-12 text-zinc-300 mb-4" />
                    <p className="text-[15px] font-semibold text-zinc-500">Henüz kupon kodu oluşturulmamış</p>
                    <p className="text-[13px] text-zinc-400 mt-1">Yeni kupon kodu oluşturarak müşterilerinize indirimler sunun.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coupons.map(c => (
                        <div key={c.id} className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-lg text-zinc-900 bg-zinc-100 px-3 py-1 rounded-lg">{c.code}</span>
                                    <button onClick={() => copyCode(c.code)} className="text-zinc-400 hover:text-zinc-600"><Copy className="h-4 w-4" /></button>
                                </div>
                                <Badge variant={c.isActive ? 'success' : 'neutral'}>{c.isActive ? 'Aktif' : 'Pasif'}</Badge>
                            </div>
                            <p className="text-[14px] font-bold text-zinc-900">{c.discountType === 'PERCENTAGE' ? `%${c.discountValue} İndirim` : `${fmt(c.discountValue)} İndirim`}</p>
                            <div className="mt-3 text-[12px] text-zinc-500 space-y-1">
                                <p>Kullanım: {c.usedCount}/{c.usageLimit || '∞'}</p>
                                {c.expiresAt && <p>Son geçerlilik: {new Date(c.expiresAt).toLocaleDateString('tr-TR')}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
