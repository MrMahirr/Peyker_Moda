import { z } from 'zod';

// --- Auth ---
export const loginSchema = z.object({
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

// --- Product ---
export const productSchema = z.object({
    name: z.string().min(2, 'Ürün adı zorunludur'),
    sku: z.string().min(1, 'SKU zorunludur'),
    basePrice: z.number().positive('Fiyat 0\'dan büyük olmalıdır'),
    salePrice: z.number().positive().optional().nullable(),
    categoryId: z.string().uuid('Kategori seçiniz'),
    description: z.string().optional(),
    barcode: z.string().optional(),
    brand: z.string().optional(),
});

// --- Customer ---
export const customerSchema = z.object({
    firstName: z.string().min(2, 'İsim zorunludur'),
    lastName: z.string().min(2, 'Soyisim zorunludur'),
    email: z.string().email('Geçerli bir e-posta giriniz').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
});

// --- Order ---
export const orderSchema = z.object({
    customerId: z.string().uuid().optional(),
    items: z.array(z.object({
        variantId: z.string().uuid(),
        quantity: z.number().int().positive('Adet en az 1 olmalıdır'),
    })).min(1, 'Sipariş en az 1 ürün içermelidir'),
    notes: z.string().optional(),
});

// --- Category ---
export const categorySchema = z.object({
    name: z.string().min(2, 'Kategori adı zorunludur'),
    slug: z.string().min(2, 'Slug zorunludur'),
    description: z.string().optional(),
    parentId: z.string().uuid().optional().nullable(),
});

// --- Coupon ---
export const couponSchema = z.object({
    code: z.string().min(3, 'Kupon kodu en az 3 karakter olmalıdır').max(20),
    discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
    discountValue: z.number().positive('İndirim değeri 0\'dan büyük olmalıdır'),
    startDate: z.string().min(1, 'Başlangıç tarihi zorunludur'),
    endDate: z.string().min(1, 'Bitiş tarihi zorunludur'),
    usageLimit: z.number().int().positive().optional().nullable(),
});

// --- Transaction ---
export const transactionSchema = z.object({
    type: z.enum(['INCOME', 'EXPENSE']),
    amount: z.number().positive('Tutar 0\'dan büyük olmalıdır'),
    description: z.string().optional(),
    category: z.string().optional(),
    paymentMethod: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'OTHER']).optional(),
});
