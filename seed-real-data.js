const { PrismaClient } = require('@prisma/client');
const data = require('../seed_data.json');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding full data...');
  for (const dept of data) {
    const createdDept = await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: { name: dept.name }
    });

    for (const ind of dept.indicators) {
      let targetType = ind.targetType;
      if (!['<', '>', '<=', '>=', '='].includes(targetType)) {
        targetType = '>';
      }

      const createdInd = await prisma.indicator.upsert({
        where: {
          name_departmentId: {
            name: ind.name,
            departmentId: createdDept.id
          }
        },
        update: {
          targetValue: ind.targetValue,
          targetType: targetType,
          unit: ind.unit || 'n/a'
        },
        create: {
          name: ind.name,
          targetValue: ind.targetValue,
          targetType: targetType,
          unit: ind.unit || 'n/a',
          departmentId: createdDept.id
        }
      });

      for (let i = 0; i < ind.monthlyData.length; i++) {
        const m = ind.monthlyData[i];
        if (m.denominator > 0 || m.numerator > 0) {
          await prisma.monthlyData.upsert({
            where: {
              indicatorId_year_month: {
                indicatorId: createdInd.id,
                year: 2569,
                month: i + 1
              }
            },
            update: {
              numerator: m.numerator,
              denominator: m.denominator,
              result: m.result,
              isPass: m.isPass
            },
            create: {
              indicatorId: createdInd.id,
              year: 2569,
              month: i + 1,
              numerator: m.numerator,
              denominator: m.denominator,
              result: m.result,
              isPass: m.isPass
            }
          });
        }
      }
    }
  }
  console.log('Seeding complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
