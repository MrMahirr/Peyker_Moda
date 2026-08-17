const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper copied from our utils
function calculateEan13CheckDigit(first12) {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(first12[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

function generateBarcode() {
  const prefix = '869';
  const randomPart = Math.floor(Math.random() * 1_000_000_000)
    .toString()
    .padStart(9, '0');
  const first12 = prefix + randomPart;
  const checkDigit = calculateEan13CheckDigit(first12);
  return `${first12}${checkDigit}`;
}

async function main() {
  console.log('Barkodsuz varyantlar bulunuyor...');
  const variants = await prisma.variant.findMany({
    where: { barcode: null },
  });

  if (variants.length === 0) {
    console.log('Tüm varyantların zaten barkodu var.');
    return;
  }

  for (const variant of variants) {
    let barcode = generateBarcode();
    // (Basit çakışma ihtimalini atlıyoruz çünkü mevcut varyant sayısı çok az)
    
    await prisma.variant.update({
      where: { id: variant.id },
      data: { barcode },
    });
    console.log(`Varyant ${variant.sku} için barkod atandı: ${barcode}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
