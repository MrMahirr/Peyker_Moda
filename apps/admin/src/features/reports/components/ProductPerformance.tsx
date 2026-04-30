import { PackageSearch } from 'lucide-react';

export const ProductPerformance = () => (
    <div className="p-6 space-y-6">
        <h2 className="text-lg font-bold text-zinc-900">En Çok Satan Ürünler & Kategoriler</h2>
        <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-zinc-200/80 rounded-xl overflow-hidden">
                <div className="bg-zinc-50 p-3 border-b border-zinc-200/80 font-semibold text-[13px] text-zinc-700">Top 5 Kategori</div>
                <div className="p-8 text-center text-zinc-400">Veri bulunamadı</div>
            </div>
            <div className="border border-zinc-200/80 rounded-xl overflow-hidden">
                <div className="bg-zinc-50 p-3 border-b border-zinc-200/80 font-semibold text-[13px] text-zinc-700">En Çok Satan Ürünler</div>
                <div className="p-8 text-center text-zinc-400">Veri bulunamadı</div>
            </div>
        </div>
    </div>
);
