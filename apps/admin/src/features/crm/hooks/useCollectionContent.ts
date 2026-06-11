import { useState, useEffect, useCallback } from 'react';
import { CollectionContent } from '../types/content.types';
import { collectionContentService } from '../services/contentService';
import { toast } from 'sonner';

export function useCollectionContent() {
  const [collections, setCollections] = useState<CollectionContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCollections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await collectionContentService.getAll();
      setCollections(data);
    } catch (err: any) {
      setError(err.message || 'Koleksiyonlar yüklenirken bir hata oluştu');
      toast.error('Koleksiyonlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCollection = async (data: Partial<CollectionContent>) => {
    try {
      const newCollection = await collectionContentService.create(data);
      setCollections(prev => [...prev, newCollection]);
      toast.success('Koleksiyon başarıyla oluşturuldu');
      return newCollection;
    } catch (err: any) {
      toast.error('Koleksiyon oluşturulamadı');
      throw err;
    }
  };

  const updateCollection = async (id: string, data: Partial<CollectionContent>) => {
    try {
      const updatedCollection = await collectionContentService.update(id, data);
      setCollections(prev => prev.map(c => c.id === id ? updatedCollection : c));
      toast.success('Koleksiyon başarıyla güncellendi');
      return updatedCollection;
    } catch (err: any) {
      toast.error('Koleksiyon güncellenemedi');
      throw err;
    }
  };

  const deleteCollection = async (id: string) => {
    try {
      await collectionContentService.delete(id);
      setCollections(prev => prev.filter(c => c.id !== id));
      toast.success('Koleksiyon başarıyla silindi');
    } catch (err: any) {
      toast.error('Koleksiyon silinemedi');
      throw err;
    }
  };

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  return {
    collections,
    loading,
    error,
    loadCollections,
    createCollection,
    updateCollection,
    deleteCollection
  };
}
