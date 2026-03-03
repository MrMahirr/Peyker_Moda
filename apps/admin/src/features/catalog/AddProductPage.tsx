import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { BasicInfo } from './components/ProductForm/BasicInfo';
import { VariantMatrix } from './components/ProductForm/VariantMatrix';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { Card } from '@/components/ui/Card';
import { productsService } from './services/products.service';

// Validation Schema
const productSchema = z.object({
    name: z.string().min(3, 'Ürün adı en az 3 karakter olmalıdır'),
    description: z.string().optional(),
    category: z.string().min(1, 'Kategori seçilmelidir'),
    sku: z.string().min(3, 'SKU en az 3 karakter olmalıdır'),
    price: z.preprocess((val) => Number(val), z.number().min(0.01, 'Fiyat 0 dan büyük olmalıdır')),
    costPrice: z.preprocess((val) => Number(val), z.number().min(0, 'Maliyet 0 veya büyük olmalıdır')).optional(),
    manageStock: z.boolean().default(true),
    hasVariants: z.boolean().default(false),
    options: z.array(z.object({
        name: z.string(),
        values: z.array(z.string())
    })).optional(),
    variants: z.array(z.object({
        name: z.string(),
        sku: z.string(),
        price: z.preprocess((val) => Number(val), z.number()),
        stock: z.preprocess((val) => Number(val), z.number()),
        options: z.array(z.string())
    })).optional(),
    images: z.array(z.string()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

const STEPS = [
    { id: 1, title: 'Temel Bilgiler' },
    { id: 2, title: 'Varyantlar & Stok' },
    { id: 3, title: 'Medya & SEO' },
];

export const AddProductPage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<ProductFormData>({
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

    const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            await productsService.create({
                name: data.name,
                sku: data.sku,
                description: data.description,
                basePrice: data.price,
                categoryId: data.category,
                isActive: true,
                images: data.images,
            });
            navigate('/catalog');
        } catch (err: any) {
            setSubmitError(err.response?.data?.message || 'Ürün kaydedilemedi');
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
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/catalog')}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Yeni Ürün Ekle</h1>
                        <p className="text-sm text-slate-500">Ürün bilgilerini girerek kataloğa ekleyin.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/catalog')}>İptal</Button>
                    <Button onClick={handleSubmit(onSubmit)}>
                        <Save className="mr-2 h-4 w-4" />
                        Kaydet
                    </Button>
                </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between px-10 py-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                {STEPS.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                        <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full border-2 font-semibold text-sm",
                            currentStep >= step.id
                                ? "border-indigo-600 bg-indigo-600 text-white"
                                : "border-slate-300 text-slate-500"
                        )}>
                            {step.id}
                        </div>
                        <span className={cn(
                            "ml-3 text-sm font-medium",
                            currentStep >= step.id ? "text-indigo-900" : "text-slate-500"
                        )}>{step.title}</span>

                        {index < STEPS.length - 1 && (
                            <div className={cn(
                                "w-24 h-0.5 mx-4",
                                currentStep > step.id ? "bg-indigo-600" : "bg-slate-200"
                            )} />
                        )}
                    </div>
                ))}
            </div>

            {/* Form Content */}
            <div className="min-h-[400px]">
                {currentStep === 1 && <BasicInfo form={form} />}

                {currentStep === 2 && (
                    hasVariants ? (
                        <VariantMatrix form={form} />
                    ) : (
                        <Card className="p-8 text-center">
                            <div className="max-w-md mx-auto space-y-4">
                                <h3 className="text-lg font-medium">Bu ürünün varyantı yok</h3>
                                <p className="text-slate-500">
                                    "Temel Bilgiler" adımında "Varyant var" seçeneğini işaretlemediniz.
                                    Eğer bu ürünün renk/beden gibi seçenekleri varsa geri dönüp işaretleyin.
                                </p>
                                <Button variant="outline" onClick={prevStep}>Geri Dön</Button>
                            </div>
                        </Card>
                    )
                )}

                {currentStep === 3 && (
                    <div className="space-y-6">
                        <Card title="Ürün Görselleri" className="p-6">
                            <ImageUpload
                                value={watch('images')}
                                onChange={(urls) => setValue('images', urls)}
                                className="w-full"
                            />
                        </Card>
                    </div>
                )}
            </div>

            {/* Navigation Footer */}
            <div className="flex justify-between pt-6 border-t border-slate-200">
                <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                >
                    Önceki
                </Button>

                {currentStep < STEPS.length ? (
                    <Button onClick={nextStep}>Sonraki Adım</Button>
                ) : (
                    <Button onClick={handleSubmit(onSubmit)} className="bg-emerald-600 hover:bg-emerald-700">
                        Tamamla & Kaydet
                    </Button>
                )}
            </div>
        </div>
    );
};
