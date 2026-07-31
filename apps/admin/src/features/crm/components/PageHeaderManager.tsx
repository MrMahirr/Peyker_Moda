import { useState } from 'react';
import { usePageHeaders } from '../hooks/usePageHeaders';
import { PageHeader, PageSlug } from '../types/content.types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ImageUpload } from '../../../components/shared/ImageUpload';
import { Loader2, Save } from 'lucide-react';

const PAGE_SLUGS: { slug: PageSlug; label: string; desc: string }[] = [
  { slug: 'cok-satanlar', label: 'Çok Satanlar', desc: 'cok-satanlar/page.tsx sayfasının tepe görseli ve yazıları' },
  { slug: 'giyim', label: 'Giyim Kategorisi', desc: 'giyim/page.tsx sayfasının tepe görseli ve yazıları' },
  { slug: 'indirim', label: 'İndirim Kategorisi', desc: 'indirim/page.tsx sayfasının tepe görseli ve yazıları' },
  { slug: 'aksesuar', label: 'Aksesuar Kategorisi', desc: 'aksesuar/page.tsx sayfasının tepe görseli ve yazıları' },
];

export function PageHeaderManager() {
  const { headers, loading, upsertHeader } = usePageHeaders();
  
  // Local state for editing forms
  const [forms, setForms] = useState<Record<string, Partial<PageHeader>>>({});
  const [savingState, setSavingState] = useState<Record<string, boolean>>({});

  // Sadece ilgili header ilk defa yüklendiğinde formu set etmek için yardımcı bir fonksiyon
  const getFormData = (slug: PageSlug) => {
    if (forms[slug]) return forms[slug];
    
    const existing = headers.find(h => h.pageSlug === slug);
    if (existing) return existing;
    
    return {
      title: '',
      subtitle: '',
      imageUrl: '',
      isActive: true,
      pageSlug: slug
    };
  };

  const handleFormChange = (slug: PageSlug, field: keyof PageHeader, value: any) => {
    setForms(prev => ({
      ...prev,
      [slug]: {
        ...getFormData(slug),
        [field]: value
      }
    }));
  };

  const handleSave = async (slug: PageSlug) => {
    setSavingState(prev => ({ ...prev, [slug]: true }));
    try {
      const dataToSave = getFormData(slug);
      await upsertHeader(slug, dataToSave);
      // Başarılı kayıttan sonra formu temizleyebiliriz (veya bırakabiliriz)
      // Biz bırakalım, zaten apiden gelen taze veri ile besleniyor.
    } finally {
      setSavingState(prev => ({ ...prev, [slug]: false }));
    }
  };

  if (loading && headers.length === 0) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Kategori Sayfası Başlıkları</h3>
        <p className="text-sm text-gray-500">Çeşitli kategori sayfalarının üst kısımlarındaki hero banner alanlarını yönetin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {PAGE_SLUGS.map((pageConfig) => {
          const formData = getFormData(pageConfig.slug);
          const isSaving = savingState[pageConfig.slug];
          
          return (
            <div key={pageConfig.slug} className="border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
              <div className="bg-zinc-50 px-4 py-3 border-b flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-900">{pageConfig.label}</h4>
                  <p className="text-xs text-gray-500">{pageConfig.desc}</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`active-${pageConfig.slug}`}
                    checked={formData.isActive !== false}
                    onChange={(e) => handleFormChange(pageConfig.slug, 'isActive', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`active-${pageConfig.slug}`} className="ml-2 text-sm text-gray-700">
                    Aktif
                  </label>
                </div>
              </div>
              
              <div className="p-5 space-y-4 flex-1 flex flex-col">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arka Plan Görseli</label>
                  <ImageUpload 
                    folder="page-headers" 
                    maxFiles={1} 
                    value={formData.imageUrl ? [formData.imageUrl] : []}
                    onChange={(items) => {
                      const url = typeof items[0] === 'string' ? items[0] : items[0]?.url;
                      handleFormChange(pageConfig.slug, 'imageUrl', url || '');
                    }}
                  />
                </div>
                
                <div className="space-y-3 mt-4">
                  <Input 
                    label="Sayfa Başlığı (Title)" 
                    value={formData.title || ''} 
                    onChange={(e) => handleFormChange(pageConfig.slug, 'title', e.target.value)} 
                    placeholder="Örn: En Çok Satanlar"
                  />
                  <Input 
                    label="Açıklama (Subtitle)" 
                    value={formData.subtitle || ''} 
                    onChange={(e) => handleFormChange(pageConfig.slug, 'subtitle', e.target.value)} 
                    placeholder="Sezonun favori parçaları..."
                  />
                </div>
                
                <div className="mt-auto pt-6 flex justify-end">
                  <Button 
                    onClick={() => handleSave(pageConfig.slug)} 
                    disabled={isSaving || !formData.title}
                    className="w-full sm:w-auto"
                  >
                    {isSaving ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Kaydediliyor...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" /> Kaydet</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
