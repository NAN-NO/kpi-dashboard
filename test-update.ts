import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const indicators = await prisma.indicator.findMany({
    include: { quarterlyData: true }
  })

  let updatedCount = 0;
  for (const ind of indicators) {
    const qText1 = `${ind.name} (1)`
    const qText2 = `${ind.name} (2)`
    const qText3 = `${ind.name} (3)`
    const qText4 = `${ind.name} (4)`

    if (ind.quarterlyData.length > 0) {
      await prisma.quarterlySummary.update({
        where: { id: ind.quarterlyData[0].id },
        data: {
          q1Text: qText1,
          q2Text: qText2,
          q3Text: qText3,
          q4Text: qText4
        }
      })
    } else {
      await prisma.quarterlySummary.create({
        data: {
          indicatorId: ind.id,
          year: 2569,
          q1Text: qText1,
          q2Text: qText2,
          q3Text: qText3,
          q4Text: qText4
        }
      })
    }
    updatedCount++;
  }

  console.log(`Update complete! Updated ${updatedCount} indicators.`);
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
