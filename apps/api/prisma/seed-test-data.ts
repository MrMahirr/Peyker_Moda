import 'dotenv/config';
import { Prisma, PrismaClient, OrderStatus, PaymentStatus, OrderSource, PaymentMethod, TransactionType } from '@prisma/client';

type CustomerRecord = Prisma.CustomerGetPayload<{}>;
type ProductWithVariants = Prisma.ProductGetPayload<{ include: { variants: true } }>;

const prisma = new PrismaClient();

function randomString(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

async function generateTestData() {
  console.log('Generating 50 test records for multiple tables...');

  // 1. Get existing categories
  const categories = await prisma.category.findMany();
  if (categories.length === 0) {
    console.log('No categories found. Please run the main seed first (npm run db:seed).');
    return;
  }

  // 2. Generate 50 Customers
  console.log('Creating 50 Customers...');
  const customers: CustomerRecord[] = [];
  for (let i = 0; i < 50; i++) {
    const customer = await prisma.customer.create({
      data: {
        firstName: `TestAd${i}`,
        lastName: `TestSoyad${i}`,
        email: `test${i}_${randomString(4)}@example.com`,
        phone: `555000${i.toString().padStart(4, '0')}`,
        address: `Test Mah. Test Sok. No:${i}`,
        city: 'İstanbul',
        district: 'Kadıköy',
      }
    });
    customers.push(customer);
  }

  // 3. Generate 50 Products
  console.log('Creating 50 Products and Variants...');
  const products: ProductWithVariants[] = [];
  for (let i = 0; i < 50; i++) {
    const cat = randomElement(categories);
    const product = await prisma.product.create({
      data: {
        name: `Test Ürün ${i} - ${randomString(4)}`,
        slug: `test-urun-${randomString(8)}`,
        description: 'Bu bir test ürünüdür.',
        sku: `TST-${randomString(5).toUpperCase()}`,
        barcode: `868${randomInt(100000000, 999999999)}`,
        basePrice: randomInt(100, 1000),
        salePrice: randomInt(80, 900),
        categoryId: cat.id,
        variants: {
          create: [
            {
              sku: `TST-VAR-${randomString(5).toUpperCase()}`,
              size: randomElement(['S', 'M', 'L', 'XL']),
              color: randomElement(['Kırmızı', 'Mavi', 'Siyah', 'Beyaz']),
              stock: randomInt(5, 50),
              price: randomInt(100, 1000),
            }
          ]
        }
      },
      include: { variants: true }
    });
    products.push(product);
  }

  const adminUser = await prisma.user.findFirst();

  // 4. Generate 50 Orders
  console.log('Creating 50 Orders and related data...');
  for (let i = 0; i < 50; i++) {
    const customer = randomElement(customers);
    const product = randomElement(products);
    const variant = product.variants[0];
    const qty = randomInt(1, 3);
    const unitPrice = variant.price || product.basePrice;
    const total = Number(unitPrice) * qty;

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${randomString(6).toUpperCase()}`,
        customerId: customer.id,
        userId: adminUser?.id,
        status: randomElement([OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED]),
        paymentStatus: randomElement([PaymentStatus.PENDING, PaymentStatus.COMPLETED]),
        source: randomElement([OrderSource.POS, OrderSource.ONLINE]),
        subtotal: total,
        totalAmount: total,
        items: {
          create: [
            {
              variantId: variant.id,
              quantity: qty,
              unitPrice: unitPrice,
              total: total
            }
          ]
        },
        payments: {
          create: {
            amount: total,
            method: randomElement([PaymentMethod.CASH, PaymentMethod.CREDIT_CARD, PaymentMethod.BANK_TRANSFER]),
            status: PaymentStatus.COMPLETED
          }
        }
      }
    });

    // 5. Generate Transaction for each order if paid
    if (order.paymentStatus === PaymentStatus.COMPLETED && adminUser) {
      await prisma.transaction.create({
        data: {
          type: TransactionType.INCOME,
          amount: total,
          description: `${order.orderNumber} nolu sipariş ödemesi`,
          userId: adminUser.id,
          orderId: order.id,
        }
      });
    }
  }

  console.log('Successfully created 50 random records for Customers, Products, Orders, and Transactions.');
}

generateTestData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
