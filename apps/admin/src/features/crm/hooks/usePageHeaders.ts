import { useState, useEffect, useCallback } from 'react';
import { PageHeader, PageSlug } from '../types/content.types';
import { pageHeaderService } from '../services/contentService';
import { toast } from 'sonner';

export function usePageHeaders() {
  const [headers, setHeaders] = useState<PageHeader[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHeaders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pageHeaderService.getAll();
      setHeaders(data);
    } catch (err: any) {
      setError(err.message || 'Sayfa başlıkları yüklenirken bir hata oluştu');
      toast.error('Sayfa başlıkları yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  const upsertHeader = async (pageSlug: PageSlug | string, data: Partial<PageHeader>) => {
    try {
      const updatedHeader = await pageHeaderService.upsert(pageSlug, data);
      setHeaders(prev => {
        const index = prev.findIndex(h => h.pageSlug === pageSlug);
        if (index === -1) {
          return [...prev, updatedHeader];
        }
        const newHeaders = [...prev];
        newHeaders[index] = updatedHeader;
        return newHeaders;
      });
      toast.success('Sayfa başlığı başarıyla güncellendi');
      return updatedHeader;
    } catch (err: any) {
      toast.error('Sayfa başlığı güncellenemedi');
      throw err;
    }
  };

  useEffect(() => {
    loadHeaders();
  }, [loadHeaders]);

  return {
    headers,
    loading,
    error,
    loadHeaders,
    upsertHeader
  };
}
