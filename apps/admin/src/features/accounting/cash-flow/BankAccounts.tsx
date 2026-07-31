import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Building, Plus, Edit, Trash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { showDeleteConfirm } from '@/utils/swal';
import { cashService } from '../services/cash.service';
import type { BankAccount } from '../types';

const formatCurrency = (v: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);

export const BankAccounts = () => {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ bankName: '', accountName: '', iban: '', currency: 'TRY' });

    useEffect(() => {
        (async () => {
            try { setLoading(true); setAccounts(await cashService.getBankAccounts() || []); }
            catch { toast.error('Banka hesapları yüklenemedi'); }
            finally { setLoading(false); }
        })();
    }, []);

    const handleAdd = async () => {
        try {
            await cashService.createBankAccount(formData);
            toast.success('Hesap eklendi');
            setShowForm(false);
            setFormData({ bankName: '', accountName: '', iban: '', currency: 'TRY' });
            setAccounts(await cashService.getBankAccounts());
        } catch { toast.error('Hesap eklenemedi'); }
    };

    const handleDelete = async (id: string) => {
        const r = await showDeleteConfirm('Hesabı Sil?', 'Bu işlem geri alınamaz.');
        if (r.isConfirmed) {
            try { await cashService.deleteBankAccount(id); setAccounts(accounts.filter(a => a.id !== id)); toast.success('Hesap silindi'); }
            catch { toast.error('Hesap silinemedi'); }
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-zinc-900" /></div>;

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900">Banka Hesapları</h2>
                    <p className="text-[13px] text-zinc-500 mt-1">Banka hesap bakiyeleri ve hareketlerini takip edin.</p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />} className="font-semibold shadow-md" onClick={() => setShowForm(true)}>Yeni Hesap</Button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-zinc-900">Yeni Banka Hesabı</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder="Banka Adı" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium px-4" />
                        <Input placeholder="Hesap Adı" value={formData.accountName} onChange={e => setFormData({...formData, accountName: e.target.value})} className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium px-4" />
                        <Input placeholder="IBAN" value={formData.iban} onChange={e => setFormData({...formData, iban: e.target.value})} className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium px-4 md:col-span-2" />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleAdd} className="font-semibold">Kaydet</Button>
                        <Button variant="ghost" onClick={() => setShowForm(false)} className="font-semibold">İptal</Button>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
                {accounts.map((acc) => (
                    <div key={acc.id} className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100/50">
                                    <Building className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900">{acc.bankName}</h3>
                                    <p className="text-[12px] text-zinc-500">{acc.accountName}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-red-600" onClick={() => handleDelete(acc.id)}>
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono mb-2">{acc.iban}</p>
                        <p className="text-2xl font-black text-zinc-900">{formatCurrency(acc.balance)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
