import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../lib/axios';

interface OrderNote { id: string; content: string; isInternal: boolean; userName?: string; createdAt: string; }

interface OrderNotesProps { orderId: string; }

export const OrderNotes = ({ orderId }: OrderNotesProps) => {
    const [notes, setNotes] = useState<OrderNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [newNote, setNewNote] = useState('');
    const [isInternal, setIsInternal] = useState(true);

    useEffect(() => {
        (async () => {
            try { setLoading(true); const r = await api.get(`/orders/${orderId}/notes`); setNotes(r.data.data || []); }
            catch { toast.error('Notlar yüklenemedi'); }
            finally { setLoading(false); }
        })();
    }, [orderId]);

    const handleAdd = async () => {
        if (!newNote.trim()) return;
        try {
            const r = await api.post(`/orders/${orderId}/notes`, { content: newNote.trim(), isInternal });
            setNotes([r.data.data, ...notes]);
            setNewNote('');
            toast.success('Not eklendi');
        } catch { toast.error('Not eklenemedi'); }
    };

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-zinc-900 flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Sipariş Notları</h3>

            <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200/80 space-y-3">
                <textarea
                    value={newNote} onChange={e => setNewNote(e.target.value)}
                    placeholder="Not ekleyiniz..."
                    className="w-full h-20 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-[13px] font-medium text-zinc-600 cursor-pointer">
                        <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} className="rounded border-zinc-300" />
                        İç not (müşteriye görünmez)
                    </label>
                    <Button size="sm" onClick={handleAdd} icon={<Plus className="w-3.5 h-3.5" />} className="font-semibold">Ekle</Button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>
            ) : notes.length === 0 ? (
                <p className="text-[13px] text-zinc-400 text-center py-6">Henüz not eklenmemiş</p>
            ) : (
                <div className="space-y-3">
                    {notes.map(note => (
                        <div key={note.id} className={`rounded-xl p-4 border text-[13px] ${note.isInternal ? 'bg-amber-50 border-amber-200/50' : 'bg-white border-zinc-200/80'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold text-zinc-800">{note.userName || 'Sistem'}</span>
                                <span className="text-[11px] text-zinc-400">{new Date(note.createdAt).toLocaleString('tr-TR')}</span>
                            </div>
                            <p className="text-zinc-600">{note.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
