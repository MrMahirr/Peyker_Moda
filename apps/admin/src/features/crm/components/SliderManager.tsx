import { useState } from 'react';
import { useBanners } from '../hooks/useBanners';
import { Banner } from '../types/content.types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { ImageUpload } from '../../../components/shared/ImageUpload';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';

export function SliderManager() {
  const { banners, loading, createBanner, updateBanner, deleteBanner } = useBanners();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  
  const [formData, setFormData] = useState<Partial<Banner>>({
    title: '',
    subtitle: '',
    imageUrl: '',
    ctaText: '',
    ctaLink: '',
    position: 1,
    isActive: true,
  });

  const handleOpenModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData(banner);
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        subtitle: '',
        imageUrl: '',
        ctaText: '',
        ctaLink: '',
        position: banners.length + 1,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingBanner) {
        await updateBanner(editingBanner.id, formData);
      } else {
        await createBanner(formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu slider görselini silmek istediğinize emin misiniz?')) {
      await deleteBanner(id);
    }
  };

  if (loading && banners.length === 0) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-600" /></div>;
  }

  const sortedBanners = [...banners].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Ana Sayfa Slider İçerikleri</h3>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Yeni Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedBanners.map((banner) => (
          <div key={banner.id} className="border rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
            <div className="aspect-video relative bg-zinc-100">
              {banner.imageUrl ? (
                 <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
              ) : (
                 <div className="w-full h-full flex items-center justify-center text-zinc-400">Görsel Yok</div>
              )}
              {!banner.isActive && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow">
                  Pasif
                </div>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h4 className="font-semibold text-lg text-gray-900 line-clamp-1">{banner.title}</h4>
              {banner.subtitle && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{banner.subtitle}</p>}
              
              <div className="mt-auto pt-4 flex justify-between items-center">
                <span className="text-sm font-medium bg-zinc-100 text-zinc-600 px-2 py-1 rounded">
                  Sıra: {banner.position}
                </span>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleOpenModal(banner)}>
                    <Edit2 className="w-4 h-4 text-zinc-600" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(banner.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {sortedBanners.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed rounded-lg">
            Henüz slider içeriği eklenmemiş. Yeni Ekle butonu ile ekleyebilirsiniz.
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBanner ? "Slider Düzenle" : "Yeni Slider Ekle"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Görsel</label>
            <ImageUpload 
              folder="homepage" 
              maxFiles={1} 
              value={formData.imageUrl ? [formData.imageUrl] : []}
              onChange={(items) => {
                const url = typeof items[0] === 'string' ? items[0] : items[0]?.url;
                setFormData({ ...formData, imageUrl: url || '' });
              }}
            />
          </div>
          <Input 
            label="Başlık" 
            value={formData.title || ''} 
            onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
            placeholder="Yeni Sezonun Işıltısı"
          />
          <Input 
            label="Alt Başlık" 
            value={formData.subtitle || ''} 
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} 
            placeholder="Zarafeti yeniden tanımla..."
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Buton Metni" 
              value={formData.ctaText || ''} 
              onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })} 
              placeholder="Koleksiyonu Keşfet"
            />
            <Input 
              label="Buton Linki" 
              value={formData.ctaLink || ''} 
              onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })} 
              placeholder="/koleksiyonlar/yeni"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 items-end">
            <Input 
              label="Sıra No" 
              type="number"
              min="1"
              value={formData.position || 1} 
              onChange={(e) => setFormData({ ...formData, position: Number(e.target.value) })} 
            />
            <div className="flex items-center pb-2 pl-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-gray-900">
                Aktif (Sitede Göster)
              </label>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>İptal</Button>
            <Button onClick={handleSave} disabled={!formData.title || !formData.imageUrl}>
              {editingBanner ? "Güncelle" : "Ekle"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
