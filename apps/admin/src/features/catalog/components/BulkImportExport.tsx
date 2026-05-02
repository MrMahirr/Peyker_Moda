import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { stockService } from '../services/stock.service';
import { PageHeader } from '@/components/shared/PageHeader';

export const BulkImportExport = () => {
    const [importing, setImporting] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setImporting(true);
            setImportResult(null);
            const result = await stockService.importProducts(file);
            setImportResult(result);
            toast.success(`${result.imported} ürün başarıyla içe aktarıldı`);
        } catch (err) {
            console.error('Import error:', err);
            toast.error('İçe aktarma başarısız');
        } finally {
            setImporting(false);
            e.target.value = '';
        }
    };

    const handleExport = async (format: 'csv' | 'xlsx') => {
        try {
            setExporting(true);
            const blob = await stockService.exportProducts(format);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `urunler_${new Date().toISOString().slice(0, 10)}.${format}`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Dışa aktarma tamamlandı');
        } catch (err) {
            console.error('Export error:', err);
            toast.error('Dışa aktarma başarısız');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <PageHeader title="Toplu Ürün İşlemleri" />
                <p className="text-[13px] font-medium text-zinc-500 mt-1">Excel veya CSV dosyalarıyla toplu ürün içe/dışa aktarımı yapın.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Import Card */}
                <div className="bg-white rounded-2xl border border-zinc-200/80 p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100/50">
                            <Upload className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900">İçe Aktar</h2>
                            <p className="text-[13px] text-zinc-500">CSV veya Excel dosyası yükleyin</p>
                        </div>
                    </div>

                    <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 text-center hover:border-zinc-300 transition-colors">
                        <FileSpreadsheet className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                        <p className="text-[14px] font-semibold text-zinc-700 mb-1">Dosya Sürükle veya Seç</p>
                        <p className="text-[12px] text-zinc-400 mb-4">.csv, .xlsx formatları desteklenir</p>
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleImport}
                                className="hidden"
                                disabled={importing}
                            />
                            <Button
                                variant="ghost"
                                className="font-semibold border border-zinc-200"
                                disabled={importing}
                                icon={importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            >
                                {importing ? 'İçe Aktarılıyor...' : 'Dosya Seç'}
                            </Button>
                        </label>
                    </div>

                    {importResult && (
                        <div className="mt-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-2">
                            <div className="flex items-center gap-2 text-[13px] font-semibold text-emerald-600">
                                <CheckCircle className="h-4 w-4" />
                                {importResult.imported} ürün başarıyla aktarıldı
                            </div>
                            {importResult.errors.length > 0 && (
                                <div className="space-y-1">
                                    {importResult.errors.map((err, i) => (
                                        <div key={i} className="flex items-start gap-2 text-[12px] text-red-600">
                                            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                            {err}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Export Card */}
                <div className="bg-white rounded-2xl border border-zinc-200/80 p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100/50">
                            <Download className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900">Dışa Aktar</h2>
                            <p className="text-[13px] text-zinc-500">Tüm ürünleri dosyaya aktarın</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            className="w-full font-semibold justify-center"
                            onClick={() => handleExport('xlsx')}
                            disabled={exporting}
                            icon={exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                        >
                            Excel (.xlsx) Olarak İndir
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full font-semibold justify-center border border-zinc-200"
                            onClick={() => handleExport('csv')}
                            disabled={exporting}
                            icon={<FileSpreadsheet className="w-4 h-4" />}
                        >
                            CSV Olarak İndir
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
