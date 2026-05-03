const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.customer.count();
  console.log(`Total customers: ${count}`);
  const customers = await prisma.customer.findMany({ take: 5 });
  console.log('Sample customers:', JSON.stringify(customers, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
