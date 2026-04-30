import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Tag as TagIcon, Plus, Trash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { showDeleteConfirm } from '@/utils/swal';
import { stockService } from '../services/stock.service';
import type { Tag } from '../types/stock.types';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

export const TagManager = () => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTagName, setNewTagName] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);

    const fetchTags = async () => {
        try {
            setLoading(true);
            const data = await stockService.getTags();
            setTags(data || []);
        } catch (err) {
            console.error('Tags fetch error:', err);
            toast.error('Etiketler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTags(); }, []);

    const handleAdd = async () => {
        if (!newTagName.trim()) return;
        try {
            await stockService.createTag({ name: newTagName.trim(), color: selectedColor });
            setNewTagName('');
            toast.success('Etiket eklendi');
            fetchTags();
        } catch (err) {
            console.error('Add tag error:', err);
            toast.error('Etiket eklenemedi');
        }
    };

    const handleDelete = async (id: string) => {
        const result = await showDeleteConfirm('Etiketi Sil?', 'Bu etiket silinecek.');
        if (result.isConfirmed) {
            try {
                await stockService.deleteTag(id);
                setTags(tags.filter(t => t.id !== id));
                toast.success('Etiket silindi');
            } catch (err) {
                console.error('Delete error:', err);
                toast.error('Etiket silinemedi');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
                <p className="text-[13px] font-medium text-zinc-500">Etiketler yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-zinc-900">Etiket Yönetimi</h1>
                <p className="text-[13px] font-medium text-zinc-500 mt-1">Ürünlerinizi etiketlerle gruplandırın (yeni, trend, sezon sonu vb.).</p>
            </div>

            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/80 shadow-sm space-y-3">
                <div className="flex gap-3">
                    <Input
                        placeholder="Yeni etiket adı..."
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        className="flex-1 h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium px-4"
                    />
                    <Button onClick={handleAdd} icon={<Plus className="w-4 h-4" />} className="font-semibold">
                        Ekle
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-zinc-500">Renk:</span>
                    {COLORS.map((color) => (
                        <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColor === color ? 'border-zinc-900 scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                    <div
                        key={tag.id}
                        className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color || '#94a3b8' }} />
                        <span className="font-semibold text-[14px] text-zinc-800">{tag.name}</span>
                        {tag.productCount !== undefined && (
                            <Badge variant="neutral">{tag.productCount}</Badge>
                        )}
                        <button
                            onClick={() => handleDelete(tag.id)}
                            className="ml-1 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all"
                        >
                            <Trash className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
