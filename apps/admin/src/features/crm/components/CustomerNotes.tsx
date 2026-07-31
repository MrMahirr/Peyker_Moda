import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { MessageCircle, Plus, Loader2, Phone, Mail, User } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../lib/axios';
import type { CustomerNote } from '../types';

const typeLabels: Record<string, string> = { CALL: 'Telefon', VISIT: 'Ziyaret', EMAIL: 'E-Posta', OTHER: 'Diğer' };
const typeIcons: Record<string, typeof Phone> = { CALL: Phone, VISIT: User, EMAIL: Mail, OTHER: MessageCircle };

interface Props { customerId: string; }

export const CustomerNotes = ({ customerId }: Props) => {
    const [notes, setNotes] = useState<CustomerNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [type, setType] = useState<CustomerNote['type']>('CALL');

    useEffect(() => { (async () => { try { const r = await api.get(`/customers/${customerId}/notes`); setNotes(r.data.data || []); } catch { toast.error('Notlar yüklenemedi'); } finally { setLoading(false); } })(); }, [customerId]);

    const handleAdd = async () => {
        if (!content.trim()) return;
        try { const r = await api.post(`/customers/${customerId}/notes`, { content: content.trim(), type }); setNotes([r.data.data, ...notes]); setContent(''); toast.success('Not eklendi'); }
        catch { toast.error('Not eklenemedi'); }
    };

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-zinc-900">Etkileşim Notları</h3>
            <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200/80 space-y-3">
                <div className="flex gap-2">
                    <select value={type} onChange={e => setType(e.target.value as CustomerNote['type'])} className="h-10 px-3 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-semibold">
                        {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Not..." className="flex-1 h-20 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium p-3 focus:outline-none resize-none" />
                </div>
                <div className="flex justify-end"><Button size="sm" onClick={handleAdd} icon={<Plus className="w-3.5 h-3.5" />} className="font-semibold">Ekle</Button></div>
            </div>
            {loading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div> :
                <div className="space-y-3">{notes.map(note => { const Icon = typeIcons[note.type] || MessageCircle; return (
                    <div key={note.id} className="bg-white rounded-xl border border-zinc-200/80 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2"><Icon className="h-3.5 w-3.5 text-zinc-400" /><span className="font-semibold text-[13px]">{typeLabels[note.type]}</span><span className="text-[12px] text-zinc-400">— {note.userName}</span></div>
                            <span className="text-[11px] text-zinc-400">{new Date(note.createdAt).toLocaleString('tr-TR')}</span>
                        </div>
                        <p className="text-[13px] text-zinc-600">{note.content}</p>
                    </div>
                ); })}</div>}
        </div>
    );
};
