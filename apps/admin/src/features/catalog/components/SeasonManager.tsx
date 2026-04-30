import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Calendar, Plus, Edit, Trash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { showDeleteConfirm } from '@/utils/swal';
import { stockService } from '../services/stock.service';
import type { Season } from '../types/stock.types';

export const SeasonManager = () => {
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<Season | null>(null);
    const [formData, setFormData] = useState({ name: '', year: new Date().getFullYear(), startDate: '', endDate: '' });

    const fetchSeasons = async () => {
        try {
            setLoading(true);
            const data = await stockService.getSeasons();
            setSeasons(data || []);
        } catch (err) {
            console.error('Seasons fetch error:', err);
            toast.error('Sezonlar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSeasons(); }, []);

    const handleSubmit = async () => {
        if (!formData.name.trim()) return;
        try {
            if (editItem) {
                await stockService.updateSeason(editItem.id, formData);
                toast.success('Sezon güncellendi');
            } else {
                await stockService.createSeason(formData);
                toast.success('Sezon oluşturuldu');
            }
            setShowForm(false);
            setEditItem(null);
            setFormData({ name: '', year: new Date().getFullYear(), startDate: '', endDate: '' });
            fetchSeasons();
        } catch (err) {
            console.error('Save season error:', err);
            toast.error('Sezon kaydedilemedi');
        }
    };

    const handleDelete = async (id: string) => {
        const result = await showDeleteConfirm('Sezonu Sil?', 'Bu sezon silinecek.');
        if (result.isConfirmed) {
            try {
                await stockService.deleteSeason(id);
                setSeasons(seasons.filter(s => s.id !== id));
                toast.success('Sezon silindi');
            } catch (err) {
                console.error('Delete error:', err);
                toast.error('Sezon silinemedi');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
                <p className="text-[13px] font-medium text-zinc-500">Sezonlar yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-zinc-900">Sezon / Koleksiyon Yönetimi</h1>
                    <p className="text-[13px] font-medium text-zinc-500 mt-1">Ürünlerinizi sezonlara ve koleksiyonlara göre gruplandırın.</p>
                </div>
                <Button
                    className="font-semibold shadow-md active:scale-[0.98] transition-all"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => { setEditItem(null); setFormData({ name: '', year: new Date().getFullYear(), startDate: '', endDate: '' }); setShowForm(true); }}
                >
                    Yeni Sezon
                </Button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-zinc-900">{editItem ? 'Sezon Düzenle' : 'Yeni Sezon Ekle'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                            placeholder="Sezon Adı (ör. Yaz 2026)"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium px-4"
                        />
                        <Input
                            type="number"
                            placeholder="Yıl"
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                            className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium px-4"
                        />
                        <Input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium px-4"
                        />
                        <Input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="h-10 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium px-4"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleSubmit} className="font-semibold">{editItem ? 'Güncelle' : 'Kaydet'}</Button>
                        <Button variant="ghost" onClick={() => setShowForm(false)} className="font-semibold">İptal</Button>
                    </div>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {seasons.map((season) => (
                    <div key={season.id} className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-violet-50 rounded-xl border border-violet-100/50">
                                    <Calendar className="h-5 w-5 text-violet-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900">{season.name}</h3>
                                    <p className="text-[12px] text-zinc-500 mt-0.5">{season.year}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Badge variant={season.isActive ? 'success' : 'neutral'}>
                                    {season.isActive ? 'Aktif' : 'Pasif'}
                                </Badge>
                                <Button
                                    variant="ghost" size="sm"
                                    className="h-8 w-8 p-0 text-zinc-400 hover:text-amber-600"
                                    onClick={() => {
                                        setEditItem(season);
                                        setFormData({ name: season.name, year: season.year, startDate: season.startDate || '', endDate: season.endDate || '' });
                                        setShowForm(true);
                                    }}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost" size="sm"
                                    className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600"
                                    onClick={() => handleDelete(season.id)}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        {season.productCount !== undefined && (
                            <div className="mt-3 pt-3 border-t border-zinc-100 text-[13px] text-zinc-500 font-medium">
                                {season.productCount} ürün
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
