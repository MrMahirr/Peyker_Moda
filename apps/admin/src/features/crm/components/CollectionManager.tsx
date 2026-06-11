import { useState } from 'react';
import { useCollectionContent } from '../hooks/useCollectionContent';
import { CollectionContent } from '../types/content.types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { ImageUpload } from '../../../components/shared/ImageUpload';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';

export function CollectionManager() {
  const { collections, loading, createCollection, updateCollection, deleteCollection } = useCollectionContent();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<CollectionContent | null>(null);
  
  const [formData, setFormData] = useState<Partial<CollectionContent>>({
    name: '',
    imageUrl: '',
    slug: '',
    position: 1,
    isActive: true,
  });

  const handleOpenModal = (collection?: CollectionContent) => {
    if (collection) {
      setEditingCollection(collection);
      setFormData(collection);
    } else {
      setEditingCollection(null);
      setFormData({
        name: '',
        imageUrl: '',
        slug: '',
        position: collections.length + 1,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingCollection) {
        await updateCollection(editingCollection.id, formData);
      } else {
        await createCollection(formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu koleksiyonu silmek istediğinize emin misiniz?')) {
      await deleteCollection(id);
    }
  };

  if (loading && collections.length === 0) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-600" /></div>;
  }

  const sortedCollections = [...collections].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Koleksiyonları Keşfet</h3>
          <p className="text-sm text-gray-500">Ana sayfadaki koleksiyonlar bölümünü yönetin.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Yeni Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedCollections.map((collection) => (
          <div key={collection.id} className="border rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
            <div className="aspect-[4/5] relative bg-zinc-100">
              {collection.imageUrl ? (
                 <img src={collection.imageUrl} alt={collection.name} className="w-full h-full object-cover" />
              ) : (
                 <div className="w-full h-full flex items-center justify-center text-zinc-400">Görsel Yok</div>
              )}
              {!collection.isActive && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow">
                  Pasif
                </div>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h4 className="font-semibold text-gray-900 line-clamp-1 text-center">{collection.name}</h4>
              {collection.slug && (
                 <p className="text-xs text-center text-gray-500 mt-1 truncate">/{collection.slug}</p>
              )}
              
              <div className="mt-4 pt-4 flex justify-between items-center border-t border-gray-100">
                <span className="text-xs font-medium bg-zinc-100 text-zinc-600 px-2 py-1 rounded">
                  Sıra: {collection.position}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleOpenModal(collection)}>
                    <Edit2 className="w-4 h-4 text-zinc-600" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(collection.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {sortedCollections.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed rounded-lg">
            Henüz koleksiyon içeriği eklenmemiş.
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCollection ? "Koleksiyon Düzenle" : "Yeni Koleksiyon Ekle"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Görsel (collections/)</label>
            <ImageUpload 
              folder="collections" 
              maxFiles={1} 
              value={formData.imageUrl ? [formData.imageUrl] : []}
              onChange={(items) => {
                const url = typeof items[0] === 'string' ? items[0] : items[0]?.url;
                setFormData({ ...formData, imageUrl: url || '' });
              }}
            />
          </div>
          <Input 
            label="Koleksiyon Adı" 
            value={formData.name || ''} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            placeholder="Örn: Elbiseler"
          />
          <Input 
            label="Yönlendirme Linki (Slug)" 
            value={formData.slug || ''} 
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })} 
            placeholder="Örn: elbise"
          />
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
                id="collectionIsActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="collectionIsActive" className="ml-2 block text-sm font-medium text-gray-900">
                Aktif
              </label>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>İptal</Button>
            <Button onClick={handleSave} disabled={!formData.name || !formData.imageUrl}>
              {editingCollection ? "Güncelle" : "Ekle"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
