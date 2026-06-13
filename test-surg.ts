import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const dept = await prisma.department.findFirst({
    where: { name: { contains: 'ศัลยกรรม' } },
    include: { indicators: { include: { monthlyData: true } } }
  });
  console.log(JSON.stringify(dept, null, 2));
}

main().finally(() => prisma.$disconnect());
