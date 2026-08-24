import * as crypto from 'crypto';

/**
 * Generate a random string
 */
export function generateRandomString(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate order number
 * Format: YYMMDDXXXXX (11 haneli, sadece rakam — önek/tire yok)
 * Not: Bu değer sistemde HER YERDE (admin Siparişler sayfası, POS fişi,
 * fiş barkodu, e-postalar, faturalar) aynı şekilde kullanılıyor — ayrı bir
 * "kısaltılmış görünüm" yok. Sadece rakamlardan oluşması iki sebepten:
 * (1) POS fişinin 45mm'lik termal barkodunun güvenilir taranabilmesi için
 * kısa olması gerekiyor, (2) fiş üzerindeki barkodu okutunca çıkan değerin,
 * Fiş No'da ve admin panelindeki sipariş numarasında yazan değerle birebir
 * aynı olması gerekiyor — harf/tire içeren bir format bu ikisini birbirinden
 * ayırırdı.
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(2, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');
  return `${dateStr}${random}`;
}

/**
 * Generate invoice number
 * Format: INV-YYYYMMDD-XXXXX
 */
export function generateInvoiceNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');
  return `INV-${dateStr}-${random}`;
}

/**
 * Generate SKU
 * Format: SKU-XXXX-XXXX
 */
export function generateSku(): string {
  const part1 = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  const part2 = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `SKU-${part1}-${part2}`;
}

/**
 * EAN-13 kontrol basamağı hesaplama
 * İlk 12 hane üzerinden EAN-13 checksum algoritması uygular.
 */
function calculateEan13CheckDigit(first12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(first12[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * EAN-13 barkod kodu üret
 * Format: 869 (Türkiye) + 9 haneli rastgele sayı + 1 haneli checksum = 13 hane
 * NOT: Benzersizlik kontrolü çağıran servis tarafından yapılmalıdır.
 */
export function generateBarcode(): string {
  const prefix = '869';
  const randomPart = Math.floor(Math.random() * 1_000_000_000)
    .toString()
    .padStart(9, '0');
  const first12 = prefix + randomPart;
  const checkDigit = calculateEan13CheckDigit(first12);
  return `${first12}${checkDigit}`;
}

/**
 * Slugify a string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[üÜ]/g, 'u')
    .replace(/[öÖ]/g, 'o')
    .replace(/[şŞ]/g, 's')
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[ıİ]/g, 'i')
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

