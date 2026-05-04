import React, { useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { invoicesService } from '../services/invoices.service';
import { toast } from 'sonner';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  User, 
  Hash,
  Info,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const invoiceItemSchema = z.object({
  productName: z.string().min(1, 'Ürün adı zorunludur'),
  quantity: z.number().min(1, 'En az 1 olmalı'),
  unitPrice: z.number().min(0, 'Geçersiz fiyat'),
  taxRate: z.number().min(0, 'Geçersiz KDV'),
});

const invoiceSchema = z.object({
  type: z.enum(['SALES', 'PURCHASE']),
  customerName: z.string().min(1, 'Müşteri/Cari adı zorunludur'),
  invoiceNumber: z.string().min(1, 'Fatura numarası zorunludur'),
  items: z.array(invoiceItemSchema).min(1, 'En az bir kalem eklemelisiniz'),
  notes: z.string().optional(),
  status: z.enum(['DRAFT', 'ISSUED']),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      type: 'SALES',
      status: 'ISSUED',
      items: [{ productName: '', quantity: 1, unitPrice: 0, taxRate: 10 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");
  const invoiceType = watch("type");

  const totals = useMemo(() => {
    const subtotal = watchItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const taxTotal = watchItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0);
    return {
      subtotal,
      tax: taxTotal,
      total: subtotal + taxTotal,
    };
  }, [watchItems]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };

  const onSubmit = async (data: InvoiceFormValues) => {
    try {
      await invoicesService.create({
        ...data,
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
      });
      toast.success('Fatura başarıyla oluşturuldu');
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Invoice creation error:', error);
      toast.error('Fatura oluşturulurken bir hata oluştu');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Yeni Fatura Kes"
      description="Satış veya alış faturası kaydı oluşturun."
      size="xl"
      className="max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 bg-zinc-50 rounded-2xl border border-zinc-200/60">
          <div className="md:col-span-2">
            <Input
              label={invoiceType === 'SALES' ? 'Müşteri / Cari Adı' : 'Tedarikçi Adı'}
              placeholder="İsim giriniz..."
              icon={<User className="w-4 h-4" />}
              error={errors.customerName?.message}
              {...register('customerName')}
            />
          </div>
          <Input
            label="Fatura No"
            placeholder="FAT20240001"
            icon={<Hash className="w-4 h-4" />}
            error={errors.invoiceNumber?.message}
            {...register('invoiceNumber')}
          />
        </div>

        {/* Invoice Type & Status Switchers */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex p-1 bg-zinc-100 rounded-lg border border-zinc-200/50">
            <button
              type="button"
              onClick={() => setValue('type', 'SALES')}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                invoiceType === 'SALES' ? "bg-white text-blue-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Satış Faturası
            </button>
            <button
              type="button"
              onClick={() => setValue('type', 'PURCHASE')}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                invoiceType === 'PURCHASE' ? "bg-white text-orange-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Alış Faturası
            </button>
          </div>

          <div className="flex gap-2">
             <span className="text-xs font-semibold text-zinc-400 self-center mr-1">Durum:</span>
             <select 
               {...register('status')}
               className="text-xs font-bold bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
             >
               <option value="ISSUED">Kesildi</option>
               <option value="DRAFT">Taslak</option>
             </select>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-200/80">
                <th className="text-left px-4 py-3 font-semibold text-zinc-600">Ürün / Hizmet</th>
                <th className="text-center px-4 py-3 font-semibold text-zinc-600 w-24">Miktar</th>
                <th className="text-center px-4 py-3 font-semibold text-zinc-600 w-32">Birim Fiyat</th>
                <th className="text-center px-4 py-3 font-semibold text-zinc-600 w-24">KDV %</th>
                <th className="text-right px-4 py-3 font-semibold text-zinc-600 w-32">Toplam</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {fields.map((field, index) => (
                <tr key={field.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="px-3 py-2">
                    <Input
                      placeholder="Ürün adı veya açıklama"
                      className="h-9 text-xs border-zinc-200/60 focus:border-primary/40"
                      {...register(`items.${index}.productName`)}
                      error={errors.items?.[index]?.productName?.message}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      type="number"
                      className="h-9 text-xs text-center border-zinc-200/60"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      type="number"
                      className="h-9 text-xs text-center border-zinc-200/60"
                      {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      type="number"
                      className="h-9 text-xs text-center border-zinc-200/60"
                      {...register(`items.${index}.taxRate`, { valueAsNumber: true })}
                    />
                  </td>
                  <td className="px-4 py-2 text-right font-mono font-bold text-zinc-700">
                    {formatCurrency(watchItems[index]?.quantity * watchItems[index]?.unitPrice * (1 + watchItems[index]?.taxRate / 100) || 0)}
                  </td>
                  <td className="px-2">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-3 border-t border-zinc-100 bg-zinc-50/30">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => append({ productName: '', quantity: 1, unitPrice: 0, taxRate: 10 })}
              className="text-primary hover:bg-primary/5 font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Yeni Satır Ekle
            </Button>
          </div>
        </div>

        {/* Footer: Notes & Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-4">
            <Textarea
              label="Fatura Notları"
              placeholder="Ödeme koşulları, banka bilgileri vb..."
              rows={4}
              className="text-xs bg-zinc-50/50 border-zinc-200/60"
              {...register('notes')}
            />
            <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                Bu fatura kaydedildiğinde muhasebe kayıtlarına otomatik olarak işlenecektir. Taslak olarak kaydederseniz daha sonra düzenleyebilirsiniz.
              </p>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-6 text-white shadow-xl space-y-4 self-start relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
             
             <div className="flex justify-between items-center text-zinc-400">
               <span className="text-xs font-bold uppercase tracking-wider">Ara Toplam</span>
               <span className="font-mono text-sm">{formatCurrency(totals.subtotal)}</span>
             </div>
             
             <div className="flex justify-between items-center text-zinc-400">
               <span className="text-xs font-bold uppercase tracking-wider">KDV Toplamı</span>
               <span className="font-mono text-sm">{formatCurrency(totals.tax)}</span>
             </div>
             
             <div className="h-px bg-white/10 my-2" />
             
             <div className="flex justify-between items-end">
               <div>
                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Genel Toplam</p>
                 <h3 className="text-3xl font-black tracking-tight">{formatCurrency(totals.total)}</h3>
               </div>
               <div className="p-3 bg-white/10 rounded-xl">
                 <FileText className="w-6 h-6 text-white" />
               </div>
             </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-100">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="px-6 font-semibold"
          >
            Vazgeç
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "px-10 min-w-[160px] font-bold shadow-lg transition-all",
              invoiceType === 'SALES' ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200" : "bg-orange-600 hover:bg-orange-700 shadow-orange-200"
            )}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Faturayı Kaydet
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
