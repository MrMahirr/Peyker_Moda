import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { BasicInfo } from './components/ProductForm/BasicInfo';
import { VariantMatrix } from './components/ProductForm/VariantMatrix';
import { ChevronLeft, Save, Loader2, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { productsService } from './services/products.service';
import { PageHeader } from '@/components/shared/PageHeader';

const productSchema = z.object({
    name: z.string().min(3, 'Ürün adı en az 3 karakter olmalıdır'),
    description: z.string().optional(),
    category: z.string().min(1, 'Kategori seçilmelidir'),
    sku: z.string().min(3, 'SKU en az 3 karakter olmalıdır'),
    price: z.coerce.number().min(0.01, 'Fiyat 0 dan büyük olmalıdır'),
    costPrice: z.coerce.number().min(0, 'Maliyet 0 veya büyük olmalıdır').optional(),
    manageStock: z.boolean().default(true),
    hasVariants: z.boolean().default(false),
    options: z.array(z.object({
        name: z.string(),
        values: z.array(z.string())
    })).optional(),
    variants: z.array(z.object({
        name: z.string(),
        sku: z.string(),
        price: z.coerce.number(),
        stock: z.coerce.number(),
        color: z.string().optional(),
        size: z.string().optional()
    })).optional(),
    images: z.array(z.string()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;
type ProductFormInput = z.input<typeof productSchema>;

const STEPS = [
    { id: 1, title: 'Temel Bilgiler' },
    { id: 2, title: 'Varyant Özellikleri' },
    { id: 3, title: 'Görseller & SEO' },
];

interface AddProductPageProps {
    onClose?: () => void;
    onSuccess?: () => void;
    isModal?: boolean;
}

const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export const AddProductPage = ({ onClose, onSuccess, isModal }: AddProductPageProps) => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(!!id);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<ProductFormInput, unknown, ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            description: '',
            category: '',
            sku: '',
            price: 0,
            costPrice: 0,
            manageStock: true,
            hasVariants: false,
            options: [],
            variants: [],
            images: []
        }
    });

    const { handleSubmit, watch, trigger, setValue } = form;
    const hasVariants = watch('hasVariants');

    useEffect(() => {
        if (!id) return;
        const loadProduct = async () => {
            try {
                const product = await productsService.getById(id);
                form.reset({
                    name: product.name,
                    description: product.description || '',
                    category: product.category?.id || '',
                    sku: product.sku,
                    price: product.basePrice,
                    costPrice: 0,
                    manageStock: true,
                    hasVariants: (product.variants?.length || 0) > 1,
                    images: product.images || [],
                    variants: product.variants?.map(v => ({
                        name: v.sku,
                        sku: v.sku,
                        price: v.price || product.basePrice,
                        stock: v.stock,
                        color: v.color || '',
                        size: v.size || ''
                    })) || [],
                });
            } catch (err) {
                console.error("Failed to load product", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadProduct();
    }, [id, form]);

    const handleClose = () => {
        if (onClose) {
            onClose();
            return;
        }
        navigate('/catalog');
    };

    const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const mediaIds = (data.images || [])
                .map((img: any) => typeof img === 'string' ? img : img?.id)
                .filter((id: any) => typeof id === 'string' && id.length > 10); // Güvenli kontrol (uuid veya fallback)
            
            const productData: any = {
                name: data.name,
                sku: data.sku,
                description: data.description,
                price: data.price,
                cost: data.costPrice || undefined,
                categoryId: data.category,
                isActive: true,
                mediaIds: mediaIds.length > 0 ? mediaIds : undefined,
            };

            if (data.hasVariants && data.variants && data.variants.length > 0) {
                productData.variants = data.variants.map((v: any) => ({
                    sku: v.sku,
                    price: v.price,
                    stock: Number.isFinite(v.stock) ? Math.max(0, Math.round(v.stock)) : 0,
                    size: v.size || undefined,
                    color: v.color || undefined,
                }));
            } else if (data.manageStock) {
                productData.variants = [{
                    sku: `${data.sku}-STD`,
                    price: data.price,
                    stock: 100,
                }];
            }

            if (id) {
                await productsService.update(id, productData);
            } else {
                await productsService.create(productData);
            }
            onSuccess?.();
            handleClose();
        } catch (err: any) {
            setSubmitError(err.response?.data?.message || 'Ürün kaydedilirken sunucu hatası oluştu');
            console.error('Product create error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = async () => {
        let valid = false;
        if (currentStep === 1) {
            valid = await trigger(['name', 'category', 'sku', 'price']);
        } else {
            valid = true;
        }

        if (valid) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    return (
        <div className={`max-w-4xl mx-auto space-y-8 ${isModal ? 'pb-6' : 'pb-20'}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-900 transition-colors shadow-sm"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <PageHeader title={id ? "Ürünü Düzenle" : "Yeni Ürün Ekle"} />
                        <p className="text-sm font-medium text-zinc-500">{id ? "Ürün detaylarını güncelleyin." : "Ürün detaylarını doldurarak kataloğunuza işleyin."}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={handleClose}>İptal</Button>
                    <Button variant="primary" onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
                        {!isSubmitting && <Save className="w-4 h-4 mr-1.5" />}
                        Kaydet
                    </Button>
                </div>
            </div>

            {/* Premium Stepper */}
            <div className="flex items-center justify-between px-8 py-5 bg-surface border border-zinc-200/80 rounded-xl shadow-sm">
                {STEPS.map((step, index) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    return (
                        <div key={step.id} className="flex items-center relative w-full">
                            <div className="flex items-center gap-3 z-10 bg-white pr-4">
                                <div className={cn(
                                    "flex items-center justify-center w-7 h-7 rounded-full text-[13px] font-bold transition-all duration-300",
                                    isActive ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/20" : 
                                    isCompleted ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400"
                                )}>
                                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.id}
                                </div>
                                <span className={cn(
                                    "text-[13px] font-semibold transition-colors duration-300",
                                    isActive ? "text-zinc-900" : isCompleted ? "text-zinc-700" : "text-zinc-400"
                                )}>
                                    {step.title}
                                </span>
                            </div>

                            {index < STEPS.length - 1 && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full px-6 z-0">
                                    <div className="w-full h-[2px] bg-zinc-100 rounded-full overflow-hidden">
                                        <div className={cn(
                                            "h-full bg-zinc-900 transition-all duration-500",
                                            isCompleted ? "w-full" : "w-0"
                                        )} />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {submitError && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
                        {submitError}
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="bg-surface border border-zinc-200/80 rounded-xl p-6 shadow-sm">
                        <BasicInfo form={form} />
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="bg-surface border border-zinc-200/80 rounded-xl p-6 shadow-sm">
                        {hasVariants ? (
                            <VariantMatrix form={form} />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center max-w-sm mx-auto">
                                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                                    <Check className="w-8 h-8 text-zinc-300" />
                                </div>
                                <h3 className="text-base font-semibold text-zinc-900 mb-2">Varyantsız Ürün</h3>
                                <p className="text-[13px] text-zinc-500 mb-6">
                                    "Temel Bilgiler" adımında bu ürünün varyantsız olduğunu belirttiniz. Renk veya beden yapılandırmasına ihtiyacınız varsa önceki adıma dönebilirsiniz.
                                </p>
                                <Button variant="secondary" onClick={prevStep}>
                                    Önceki Adıma Dön
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="bg-surface border border-zinc-200/80 rounded-xl p-6 shadow-sm">
                        <div className="mb-4">
                            <h3 className="text-base font-semibold text-zinc-900">Ürün Görselleri</h3>
                            <p className="text-xs text-zinc-500 mt-1">Yüksek çözünürlüklü ve 1:1 oranlı kare fotoğraflar yükleyin.</p>
                        </div>
                        <ImageUpload
                            value={watch('images')}
                            onChange={(urls) => setValue('images', urls)}
                            className="w-full"
                        />
                    </div>
                )}
                </>
                )}
            </div>

            {/* Footer Navigation Box */}
            <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-zinc-200/80 shadow-sm mt-4">
                <Button variant="secondary" onClick={prevStep} disabled={currentStep === 1}>
                    Geri Gel
                </Button>

                {currentStep < STEPS.length ? (
                    <Button variant="primary" onClick={nextStep}>
                        Sonraki Adım
                    </Button>
                ) : (
                    <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700 text-white border-transparent" onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
                        Kataloğa Ekle
                    </Button>
                )}
            </div>
        </div>
    );
};
