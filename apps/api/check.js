const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const orders = await prisma.order.findMany({
    select: { createdAt: true },
    orderBy: { createdAt: 'desc' }
  });
  console.log('Total Orders:', orders.length);
  if (orders.length > 0) {
    console.log('Last order:', orders[0].createdAt);
    console.log('Oldest order:', orders[orders.length - 1].createdAt);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
