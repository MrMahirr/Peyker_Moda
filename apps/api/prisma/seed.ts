import 'dotenv/config';
import { CarrierCode, PrismaClient } from '@prisma/client';
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

function getEnvString(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

function getEnvBool(key: string, fallback = false): boolean {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}

async function ensureAdminUser(adminRoleId: string) {
  const email = getEnvString('ADMIN_EMAIL', 'admin@peyker.com');
  const password = getEnvString('ADMIN_PASSWORD', 'Admin123!');
  const firstName = getEnvString('ADMIN_FIRST_NAME', 'Admin');
  const lastName = getEnvString('ADMIN_LAST_NAME', 'Peyker');
  const forcePassword = getEnvBool('ADMIN_FORCE_PASSWORD', false);

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const adminUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        roleId: adminRoleId,
        isActive: true,
      },
    });
    console.log('Admin user created:', adminUser.email);
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (existingAdmin.roleId !== adminRoleId) updateData.roleId = adminRoleId;
  if (!existingAdmin.isActive) updateData.isActive = true;
  if (forcePassword) {
    updateData.password = await bcrypt.hash(password, 12);
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: updateData,
    });
  }

  console.log('Admin user ensured:', email);
}

async function ensureDefaultCarriers() {
  const carriers = [
    { name: 'Yurtici Kargo', code: CarrierCode.YURTICI },
    { name: 'Aras Kargo', code: CarrierCode.ARAS },
    { name: 'MNG Kargo', code: CarrierCode.MNG },
    { name: 'PTT Kargo', code: CarrierCode.PTT },
  ];

  for (const carrier of carriers) {
    await prisma.carrier.upsert({
      where: { code: carrier.code },
      update: {
        name: carrier.name,
        isActive: true,
      },
      create: {
        ...carrier,
        isActive: true,
      },
    });
  }

  console.log('Default carriers ensured');
}

async function main() {
  console.log('Seeding database...');

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      displayName: 'Yonetici',
      description: 'Tam yetkili sistem yoneticisi',
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
      displayName: 'Mudur',
      description: 'Magaza muduru - kullanici ve ayar silme haric tum yetkiler',
      isSystem: true,
      permissions: {
        create: allPermissions().filter(
          (permission) =>
            !(permission.resource === 'users' && permission.action === 'delete') &&
            !(permission.resource === 'roles' && permission.action === 'delete') &&
            !(permission.resource === 'settings' && permission.action === 'delete'),
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
      description: 'Urun, siparis ve musteri yonetimi',
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

  console.log('Roles ensured:', {
    admin: adminRole.id,
    manager: managerRole.id,
    staff: staffRole.id,
    cashier: cashierRole.id,
  });

  await ensureAdminUser(adminRole.id);
  await ensureDefaultCarriers();

  const categories = [
    {
      name: 'Ust Giyim',
      slug: 'ust-giyim',
      description: 'Tisort, Gomlek, Bluz vb.',
    },
    {
      name: 'Alt Giyim',
      slug: 'alt-giyim',
      description: 'Pantolon, Etek, Sort vb.',
    },
    {
      name: 'Elbise',
      slug: 'elbise',
      description: 'Gunluk ve abiye elbiseler',
    },
    {
      name: 'Dis Giyim',
      slug: 'dis-giyim',
      description: 'Ceket, Mont, Kaban vb.',
    },
    {
      name: 'Aksesuar',
      slug: 'aksesuar',
      description: 'Canta, Kemer, Taki vb.',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log('Categories ensured');

  const topWearCategory = await prisma.category.findUnique({
    where: { slug: 'ust-giyim' },
  });

  if (topWearCategory) {
    const existingProduct = await prisma.product.findUnique({
      where: { slug: 'basic-beyaz-tisort' },
    });

    if (!existingProduct) {
      const product = await prisma.product.create({
        data: {
          name: 'Basic Beyaz Tisort',
          slug: 'basic-beyaz-tisort',
          description: '%100 Pamuklu Temel Tisort',
          basePrice: 250.0,
          sku: 'TS-WHT-001',
          barcode: '8680000000001',
          categoryId: topWearCategory.id,
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
      console.log('Products and variants created');
    }
  }

  await prisma.customer.upsert({
    where: { id: 'seed-customer-1' },
    update: {},
    create: {
      id: 'seed-customer-1',
      firstName: 'Ayse',
      lastName: 'Yilmaz',
      email: 'musteri@ornek.com',
      phone: '5551234567',
      isActive: true,
    },
  });
  console.log('Sample customer ensured');

  console.log('Seeding completed');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
