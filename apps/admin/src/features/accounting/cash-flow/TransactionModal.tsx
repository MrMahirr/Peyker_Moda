import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { transactionsService } from '../services/transactions.service';
import { toast } from 'sonner';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  Calendar, 
  Tag, 
  CreditCard, 
  Type,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.string().min(1, 'Tutar zorunludur').refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Geçerli bir tutar giriniz'),
  category: z.string().min(1, 'Kategori seçiniz'),
  description: z.string().optional(),
  transactionDate: z.string().min(1, 'Tarih seçiniz'),
  paymentMethod: z.string().min(1, 'Ödeme yöntemi seçiniz'),
  reference: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const INCOME_CATEGORIES = [
  { value: 'SATIŞ', label: 'Satış' },
  { value: 'HİZMET', label: 'Hizmet Bedeli' },
  { value: 'İADE', label: 'İade Alınan' },
  { value: 'DİĞER_GELİR', label: 'Diğer Gelir' },
];

const EXPENSE_CATEGORIES = [
  { value: 'MAAŞ', label: 'Personel Maaş' },
  { value: 'KİRA', label: 'Kira' },
  { value: 'FATURA', label: 'Fatura' },
  { value: 'MAL_ALIMI', label: 'Mal Alımı' },
  { value: 'PAZARLAMA', label: 'Pazarlama' },
  { value: 'DİĞER_GİDER', label: 'Diğer Gider' },
];

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Nakit' },
  { value: 'BANK_TRANSFER', label: 'Banka Havalesi' },
  { value: 'CREDIT_CARD', label: 'Kredi Kartı' },
  { value: 'CHECK', label: 'Çek' },
];

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'INCOME',
      transactionDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'CASH',
    },
  });

  const transactionType = watch('type');

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      await transactionsService.create({
        ...data,
        amount: Number(data.amount),
      });
      toast.success('İşlem başarıyla kaydedildi');
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Transaction creation error:', error);
      toast.error('İşlem kaydedilirken bir hata oluştu');
    }
  };

  const categories = transactionType === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Yeni İşlem Ekle"
      description="Gelir veya gider hareketini sisteme kaydedin."
      size="lg"
      className="overflow-hidden"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Type Toggle */}
        <div className="flex p-1 bg-zinc-100 rounded-xl border border-zinc-200/50">
          <button
            type="button"
            onClick={() => setValue('type', 'INCOME')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-300",
              transactionType === 'INCOME'
                ? "bg-white text-emerald-600 shadow-sm border border-zinc-200/50"
                : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            <ArrowUpRight className={cn("w-4 h-4 transition-transform duration-300", transactionType === 'INCOME' && "scale-110")} />
            Gelir
          </button>
          <button
            type="button"
            onClick={() => setValue('type', 'EXPENSE')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-300",
              transactionType === 'EXPENSE'
                ? "bg-white text-red-600 shadow-sm border border-zinc-200/50"
                : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            <ArrowDownLeft className={cn("w-4 h-4 transition-transform duration-300", transactionType === 'EXPENSE' && "scale-110")} />
            Gider
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Amount Field */}
          <div className="relative group">
            <div className={cn(
              "absolute -inset-0.5 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition duration-500",
              transactionType === 'INCOME' ? "bg-emerald-500" : "bg-red-500"
            )} />
            <Input
              label="Tutar (₺)"
              placeholder="0.00"
              icon={<Wallet className="w-4 h-4" />}
              error={errors.amount?.message}
              className="relative font-mono text-lg font-bold"
              {...register('amount')}
            />
          </div>

          {/* Date Field */}
          <Input
            label="İşlem Tarihi"
            type="date"
            icon={<Calendar className="w-4 h-4" />}
            error={errors.transactionDate?.message}
            {...register('transactionDate')}
          />

          {/* Category Field */}
          <Select
            label="Kategori"
            options={categories}
            placeholder="Kategori Seçiniz"
            error={errors.category?.message}
            {...register('category')}
          />

          {/* Payment Method Field */}
          <Select
            label="Ödeme Yöntemi"
            options={PAYMENT_METHODS}
            error={errors.paymentMethod?.message}
            {...register('paymentMethod')}
          />
        </div>

        <div className="space-y-4">
          <Input
            label="Referans / Belge No"
            placeholder="İsteğe bağlı..."
            icon={<Tag className="w-4 h-4" />}
            error={errors.reference?.message}
            {...register('reference')}
          />

          <Textarea
            label="Açıklama"
            placeholder="İşlem ile ilgili detayları buraya yazabilirsiniz..."
            rows={3}
            error={errors.description?.message}
            {...register('description')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="px-6"
          >
            Vazgeç
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "px-8 min-w-[140px] transition-all duration-300",
              transactionType === 'INCOME' 
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" 
                : "bg-red-600 hover:bg-red-700 shadow-red-200"
            )}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Kaydet'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
