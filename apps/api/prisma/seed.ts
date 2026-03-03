import { PrismaClient, UserRole, OrderStatus, PaymentStatus, OrderSource, PaymentMethod, TransactionType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Admin Kullanıcısı Oluştur
    const adminEmail = 'admin@peyker.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                role: UserRole.ADMIN,
                isActive: true,
            },
        });
        console.log('✅ Admin user created');
    } else {
        console.log('ℹ️ Admin user already exists');
    }

    // 2. Kategorileri Oluştur
    const categories = [
        { name: 'Üst Giyim', slug: 'ust-giyim', description: 'Tişört, Gömlek, Bluz vb.' },
        { name: 'Alt Giyim', slug: 'alt-giyim', description: 'Pantolon, Etek, Şort vb.' },
        { name: 'Elbise', slug: 'elbise', description: 'Günlük ve abiye elbiseler' },
        { name: 'Dış Giyim', slug: 'dis-giyim', description: 'Ceket, Mont, Kaban vb.' },
        { name: 'Aksesuar', slug: 'aksesuar', description: 'Çanta, Kemer, Takı vb.' },
    ];

    for (const cat of categories) {
        const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
        if (!existing) {
            await prisma.category.create({ data: cat });
        }
    }
    console.log('✅ Categories created');

    // 3. Ürün ve Varyantları Oluştur
    const ustGiyim = await prisma.category.findUnique({ where: { slug: 'ust-giyim' } });

    if (ustGiyim) {
        const products = [
            {
                name: 'Basic Beyaz Tişört',
                slug: 'basic-beyaz-tisort',
                description: '%100 Pamuklu Temel Tişört',
                basePrice: 250.00,
                sku: 'TS-WHT-001',
                barcode: '8680000000001',
                categoryId: ustGiyim.id,
                variants: [
                    { sku: 'TS-WHT-001-S', size: 'S', color: 'Beyaz', colorCode: '#FFFFFF', stock: 10 },
                    { sku: 'TS-WHT-001-M', size: 'M', color: 'Beyaz', colorCode: '#FFFFFF', stock: 15 },
                    { sku: 'TS-WHT-001-L', size: 'L', color: 'Beyaz', colorCode: '#FFFFFF', stock: 8 },
                ]
            },
            {
                name: 'Desenli Gömlek',
                slug: 'desenli-gomlek',
                description: 'Yazlık desenli gömlek',
                basePrice: 450.00,
                sku: 'SRT-PAT-001',
                barcode: '8680000000002',
                categoryId: ustGiyim.id,
                variants: [
                    { sku: 'SRT-PAT-001-S', size: 'S', color: 'Mavi', colorCode: '#0000FF', stock: 5 },
                    { sku: 'SRT-PAT-001-M', size: 'M', color: 'Mavi', colorCode: '#0000FF', stock: 5 },
                ]
            }
        ];

        for (const p of products) {
            const existingProduct = await prisma.product.findUnique({ where: { slug: p.slug } });
            if (!existingProduct) {
                const { variants, ...productData } = p;
                const createdProduct = await prisma.product.create({
                    data: productData
                });

                for (const v of variants) {
                    await prisma.variant.create({
                        data: {
                            productId: createdProduct.id,
                            ...v
                        }
                    });
                }
            }
        }
        console.log('✅ Products and Variants created');
    }

    // 4. Müşteri Oluştur
    const customerEmail = 'musteri@ornek.com';
    let customer = await prisma.customer.findFirst({ where: { email: customerEmail } });

    if (!customer) {
        customer = await prisma.customer.create({
            data: {
                firstName: 'Ayşe',
                lastName: 'Yılmaz',
                email: customerEmail,
                phone: '5551234567',
                isActive: true,
            }
        });
        console.log('✅ Sample customer created');
    }

    // 5. Örnek Siparişler (Dashboard için)
    const adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (adminUser && customer) {
        // Geçmiş siparişler oluşturarak dashboard verisi sağlayalım
        const orderCount = await prisma.order.count();

        if (orderCount === 0) {
            // Dün yapılmış bir sipariş
            await prisma.order.create({
                data: {
                    orderNumber: 'ORD-0001',
                    customerId: customer.id,
                    userId: adminUser.id,
                    status: OrderStatus.DELIVERED,
                    paymentStatus: PaymentStatus.COMPLETED,
                    source: OrderSource.POS,
                    subtotal: 500,
                    totalAmount: 500,
                    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Dün
                    items: {
                        create: [
                            {
                                variantId: (await prisma.variant.findFirst())?.id || '',
                                quantity: 2,
                                unitPrice: 250,
                                total: 500
                            }
                        ]
                    },
                    payments: {
                        create: {
                            amount: 500,
                            method: PaymentMethod.CASH,
                            status: PaymentStatus.COMPLETED
                        }
                    },
                    transactions: {
                        create: {
                            type: TransactionType.INCOME,
                            amount: 500,
                            description: 'Sipariş Ödemesi #ORD-0001',
                            userId: adminUser.id,
                            category: 'SATIŞ'
                        }
                    }
                }
            });

            // Bugün yapılmış bir sipariş
            await prisma.order.create({
                data: {
                    orderNumber: 'ORD-0002',
                    customerId: customer.id,
                    userId: adminUser.id,
                    status: OrderStatus.PENDING,
                    paymentStatus: PaymentStatus.PENDING,
                    source: OrderSource.ONLINE,
                    subtotal: 450,
                    totalAmount: 450,
                    items: {
                        create: [
                            {
                                variantId: (await prisma.variant.findFirst())?.id || '',
                                quantity: 1,
                                unitPrice: 450,
                                total: 450
                            }
                        ]
                    }
                }
            });

            console.log('✅ Sample orders created');
        }
    }

    console.log('🚀 Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
