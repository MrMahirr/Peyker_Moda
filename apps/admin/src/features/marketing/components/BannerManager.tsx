import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Image, Plus, GripVertical, Trash } from 'lucide-react';
import { toast } from 'sonner';

interface Banner { id: string; title: string; imageUrl: string; linkUrl?: string; position: number; isActive: boolean; }

export const BannerManager = () => {
    const [banners, setBanners] = useState<Banner[]>([]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h2 className="text-xl font-bold text-zinc-900">Vitrin / Banner Yönetimi</h2><p className="text-[13px] text-zinc-500 mt-1">Web sitesi vitrin bannerlarını düzenleyin.</p></div>
                <Button icon={<Plus className="w-4 h-4" />} className="font-semibold shadow-md">Yeni Banner</Button>
            </div>

            {banners.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 rounded-2xl border border-zinc-200/80">
                    <Image className="w-12 h-12 text-zinc-300 mb-4" />
                    <p className="text-[15px] font-semibold text-zinc-500">Henüz banner eklenmemiş</p>
                    <p className="text-[13px] text-zinc-400 mt-1">Sitenizin ana sayfasına banner ekleyin.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {banners.map(b => (
                        <div key={b.id} className="flex items-center gap-4 bg-white rounded-xl border border-zinc-200/80 p-4 shadow-sm">
                            <GripVertical className="h-5 w-5 text-zinc-300 cursor-grab" />
                            <div className="w-24 h-14 rounded-lg bg-zinc-100 overflow-hidden shrink-0">
                                {b.imageUrl && <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1"><p className="font-semibold text-[14px] text-zinc-900">{b.title}</p></div>
                            <button className="text-zinc-400 hover:text-red-500"><Trash className="h-4 w-4" /></button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
