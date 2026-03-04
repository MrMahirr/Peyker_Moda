import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const RESOURCES = [
  'products',
  'categories',
  'variants',
  'orders',
  'customers',
  'customer-groups',
  'transactions',
  'invoices',
  'campaigns',
  'coupons',
  'pos',
  'dashboard',
  'users',
  'roles',
  'settings',
  'media',
  'audit-logs',
  'cms',
];

const ACTIONS = ['create', 'read', 'update', 'delete'];

function allPermissions(): { resource: string; action: string }[] {
  return RESOURCES.flatMap((resource) =>
    ACTIONS.map((action) => ({ resource, action })),
  );
}

async function main() {
  console.log('🌱 Seeding database...');

  // ============= 1. Rolleri Oluştur =============
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      displayName: 'Yönetici',
      description: 'Tam yetkili sistem yöneticisi',
      isSystem: true,
      permissions: {
        create: allPermissions(),
      },
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      displayName: 'Müdür',
      description:
        'Mağaza müdürü — kullanıcı ve ayar silme hariç tüm yetkiler',
      isSystem: true,
      permissions: {
        create: allPermissions().filter(
          (p) =>
            !(p.resource === 'users' && p.action === 'delete') &&
            !(p.resource === 'roles' && p.action === 'delete') &&
            !(p.resource === 'settings' && p.action === 'delete'),
        ),
      },
    },
  });

  const staffRole = await prisma.role.upsert({
    where: { name: 'staff' },
    update: {},
    create: {
      name: 'staff',
      displayName: 'Personel',
      description: 'Ürün, sipariş ve müşteri yönetimi',
      isSystem: true,
      permissions: {
        create: [
          'products',
          'categories',
          'variants',
          'orders',
          'customers',
          'customer-groups',
          'dashboard',
        ].flatMap((resource) =>
          ['create', 'read', 'update'].map((action) => ({
            resource,
            action,
          })),
        ),
      },
    },
  });

  const cashierRole = await prisma.role.upsert({
    where: { name: 'cashier' },
    update: {},
    create: {
      name: 'cashier',
      displayName: 'Kasiyer',
      description: 'POS ve temel okuma yetkileri',
      isSystem: true,
      permissions: {
        create: [
          { resource: 'pos', action: 'create' },
          { resource: 'pos', action: 'read' },
          { resource: 'pos', action: 'update' },
          { resource: 'pos', action: 'delete' },
          { resource: 'products', action: 'read' },
          { resource: 'variants', action: 'read' },
          { resource: 'categories', action: 'read' },
          { resource: 'customers', action: 'read' },
          { resource: 'customers', action: 'create' },
          { resource: 'orders', action: 'read' },
          { resource: 'orders', action: 'create' },
          { resource: 'dashboard', action: 'read' },
        ],
      },
    },
  });

  console.log('✅ Roller oluşturuldu:', {
    admin: adminRole.id,
    manager: managerRole.id,
    staff: staffRole.id,
    cashier: cashierRole.id,
  });

  // ============= 2. Admin Kullanıcı =============
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@peyker.com' },
    update: {},
    create: {
      email: 'admin@peyker.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Peyker',
      roleId: adminRole.id,
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', adminUser.email);

  // ============= 3. Kategoriler =============
  const categories = [
    {
      name: 'Üst Giyim',
      slug: 'ust-giyim',
      description: 'Tişört, Gömlek, Bluz vb.',
    },
    {
      name: 'Alt Giyim',
      slug: 'alt-giyim',
      description: 'Pantolon, Etek, Şort vb.',
    },
    {
      name: 'Elbise',
      slug: 'elbise',
      description: 'Günlük ve abiye elbiseler',
    },
    {
      name: 'Dış Giyim',
      slug: 'dis-giyim',
      description: 'Ceket, Mont, Kaban vb.',
    },
    {
      name: 'Aksesuar',
      slug: 'aksesuar',
      description: 'Çanta, Kemer, Takı vb.',
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Categories created');

  // ============= 4. Ürün ve Varyantlar =============
  const ustGiyim = await prisma.category.findUnique({
    where: { slug: 'ust-giyim' },
  });

  if (ustGiyim) {
    const existingProduct = await prisma.product.findUnique({
      where: { slug: 'basic-beyaz-tisort' },
    });

    if (!existingProduct) {
      const product = await prisma.product.create({
        data: {
          name: 'Basic Beyaz Tişört',
          slug: 'basic-beyaz-tisort',
          description: '%100 Pamuklu Temel Tişört',
          basePrice: 250.0,
          sku: 'TS-WHT-001',
          barcode: '8680000000001',
          categoryId: ustGiyim.id,
        },
      });

      await prisma.variant.createMany({
        data: [
          {
            productId: product.id,
            sku: 'TS-WHT-001-S',
            size: 'S',
            color: 'Beyaz',
            colorCode: '#FFFFFF',
            stock: 10,
          },
          {
            productId: product.id,
            sku: 'TS-WHT-001-M',
            size: 'M',
            color: 'Beyaz',
            colorCode: '#FFFFFF',
            stock: 15,
          },
          {
            productId: product.id,
            sku: 'TS-WHT-001-L',
            size: 'L',
            color: 'Beyaz',
            colorCode: '#FFFFFF',
            stock: 8,
          },
        ],
      });
      console.log('✅ Products and Variants created');
    }
  }

  // ============= 5. Müşteri =============
  await prisma.customer.upsert({
    where: { id: 'seed-customer-1' },
    update: {},
    create: {
      id: 'seed-customer-1',
      firstName: 'Ayşe',
      lastName: 'Yılmaz',
      email: 'musteri@ornek.com',
      phone: '5551234567',
      isActive: true,
    },
  });
  console.log('✅ Sample customer created');

  console.log('🚀 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
