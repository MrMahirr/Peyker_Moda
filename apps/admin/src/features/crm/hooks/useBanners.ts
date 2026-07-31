import { useState, useEffect, useCallback } from 'react';
import { Banner } from '../types/content.types';
import { bannerService } from '../services/contentService';
import { toast } from 'sonner';

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBanners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bannerService.getAll();
      setBanners(data);
    } catch (err: any) {
      setError(err.message || 'Bannerlar yüklenirken bir hata oluştu');
      toast.error('Bannerlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBanner = async (data: Partial<Banner>) => {
    try {
      const newBanner = await bannerService.create(data);
      setBanners(prev => [...prev, newBanner]);
      toast.success('Banner başarıyla oluşturuldu');
      return newBanner;
    } catch (err: any) {
      toast.error('Banner oluşturulamadı');
      throw err;
    }
  };

  const updateBanner = async (id: string, data: Partial<Banner>) => {
    try {
      const updatedBanner = await bannerService.update(id, data);
      setBanners(prev => prev.map(b => b.id === id ? updatedBanner : b));
      toast.success('Banner başarıyla güncellendi');
      return updatedBanner;
    } catch (err: any) {
      toast.error('Banner güncellenemedi');
      throw err;
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      await bannerService.delete(id);
      setBanners(prev => prev.filter(b => b.id !== id));
      toast.success('Banner başarıyla silindi');
    } catch (err: any) {
      toast.error('Banner silinemedi');
      throw err;
    }
  };

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  return {
    banners,
    loading,
    error,
    loadBanners,
    createBanner,
    updateBanner,
    deleteBanner
  };
}
