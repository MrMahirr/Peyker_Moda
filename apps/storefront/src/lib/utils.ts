import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price: any) => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
  if (isNaN(numPrice)) return '0,00 ₺';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(numPrice);
};

export const calculateDiscount = (price: any, compareAtPrice: any) => {
  const p = typeof price === 'string' ? parseFloat(price) : Number(price);
  const c = typeof compareAtPrice === 'string' ? parseFloat(compareAtPrice) : Number(compareAtPrice);
  if (isNaN(p) || isNaN(c) || c <= 0 || p >= c) return 0;
  return Math.round((1 - p / c) * 100);
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

/**
 * Tek bir görsel kaynağını URL string'ine dönüştürür.
 * API'den gelen görseller bazen string, bazen {id, url} objesi olarak gelebilir.
 */
export function resolveImageUrl(src: unknown): string {
  if (!src) return '';
  if (typeof src === 'string') return src;
  if (typeof src === 'object' && src !== null && 'url' in src) {
    return (src as { url: string }).url || '';
  }
  return '';
}

/**
 * Ürün images dizisini güvenli string[] dizisine dönüştürür.
 */
export function resolveProductImages(images: unknown): string[] {
  if (!Array.isArray(images)) return [];
  return images.map(resolveImageUrl).filter(Boolean);
}