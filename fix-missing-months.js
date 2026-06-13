const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const indicators = await prisma.indicator.findMany({
    include: { monthlyData: { where: { year: 2569 } } }
  });

  for (const ind of indicators) {
    const existingMonths = ind.monthlyData.map(d => d.month);
    const dataToCreate = [];
    for (let m = 1; m <= 12; m++) {
      if (!existingMonths.includes(m)) {
        dataToCreate.push({
          indicatorId: ind.id,
          year: 2569,
          month: m,
          numerator: null,
          denominator: null
        });
      }
    }
    if (dataToCreate.length > 0) {
      await prisma.monthlyData.createMany({ data: dataToCreate });
      console.log(`Added ${dataToCreate.length} missing months for indicator: ${ind.name}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
