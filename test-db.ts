import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const ind = await prisma.indicator.findFirst({
    where: { name: { contains: 'fracture' } },
    include: { monthlyData: true }
  });
  console.log(JSON.stringify(ind?.monthlyData, null, 2));
}

main().finally(() => prisma.$disconnect());
