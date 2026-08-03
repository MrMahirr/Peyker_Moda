const { PrismaClient, CarrierCode } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const RESOURCES = [
  'products','categories','variants','orders','customers','customer-groups',
  'transactions','invoices','campaigns','coupons','pos','dashboard',
  'users','roles','settings','media','audit-logs','cms'
];
const ACTIONS = ['create','read','update','delete'];

function allPermissions() {
  return RESOURCES.flatMap(r => ACTIONS.map(a => ({ resource: r, action: a })));
}

async function main() {
  console.log('Seeding database...');

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin', displayName: 'Yonetici',
      description: 'Tam yetkili sistem yoneticisi', isSystem: true,
      permissions: { create: allPermissions() }
    }
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager', displayName: 'Mudur',
      description: 'Magaza muduru', isSystem: true,
      permissions: {
        create: allPermissions().filter(p =>
          !(p.resource === 'users' && p.action === 'delete') &&
          !(p.resource === 'roles' && p.action === 'delete') &&
          !(p.resource === 'settings' && p.action === 'delete')
        )
      }
    }
  });

  const staffRole = await prisma.role.upsert({
    where: { name: 'staff' },
    update: {},
    create: {
      name: 'staff', displayName: 'Personel',
      description: 'Urun, siparis ve musteri yonetimi', isSystem: true,
      permissions: {
        create: ['products','categories','variants','orders','customers','customer-groups','dashboard']
          .flatMap(r => ['create','read','update'].map(a => ({ resource: r, action: a })))
      }
    }
  });

  const cashierRole = await prisma.role.upsert({
    where: { name: 'cashier' },
    update: {},
    create: {
      name: 'cashier', displayName: 'Kasiyer',
      description: 'POS ve temel okuma yetkileri', isSystem: true,
      permissions: {
        create: [
          { resource: 'pos', action: 'create' },{ resource: 'pos', action: 'read' },
          { resource: 'pos', action: 'update' },{ resource: 'pos', action: 'delete' },
          { resource: 'products', action: 'read' },{ resource: 'variants', action: 'read' },
          { resource: 'categories', action: 'read' },{ resource: 'customers', action: 'read' },
          { resource: 'customers', action: 'create' },{ resource: 'orders', action: 'read' },
          { resource: 'orders', action: 'create' },{ resource: 'dashboard', action: 'read' },
        ]
      }
    }
  });

  console.log('Roles ensured:', { admin: adminRole.id, manager: managerRole.id, staff: staffRole.id, cashier: cashierRole.id });

  // Admin user
  const email = process.env.ADMIN_EMAIL || 'admin@peyker.com';
  const password = process.env.ADMIN_PASSWORD || 'dummy_password';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { email, password: hashed, firstName: process.env.ADMIN_FIRST_NAME || 'Admin', lastName: process.env.ADMIN_LAST_NAME || 'Peyker', roleId: adminRole.id, isActive: true }
    });
    console.log('Admin user created:', email);
  } else {
    console.log('Admin user already exists:', email);
  }

  // Default carriers
  const carriers = [
    { name: 'Yurtici Kargo', code: 'YURTICI' },
    { name: 'Aras Kargo', code: 'ARAS' },
    { name: 'MNG Kargo', code: 'MNG' },
    { name: 'PTT Kargo', code: 'PTT' },
  ];
  for (const c of carriers) {
    await prisma.carrier.upsert({ where: { code: c.code }, update: { name: c.name, isActive: true }, create: { ...c, isActive: true } });
  }
  console.log('Default carriers ensured');

  // Categories
  const categories = [
    { name: 'Ust Giyim', slug: 'ust-giyim', description: 'Tisort, Gomlek, Bluz vb.' },
    { name: 'Alt Giyim', slug: 'alt-giyim', description: 'Pantolon, Etek, Sort vb.' },
    { name: 'Elbise', slug: 'elbise', description: 'Gunluk ve abiye elbiseler' },
    { name: 'Dis Giyim', slug: 'dis-giyim', description: 'Ceket, Mont, Kaban vb.' },
    { name: 'Aksesuar', slug: 'aksesuar', description: 'Canta, Kemer, Taki vb.' },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat });
  }
  console.log('Categories ensured');

  console.log('Seeding completed');
}

main()
  .catch(e => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
