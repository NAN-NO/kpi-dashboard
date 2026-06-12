const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const depts = await prisma.department.count()
  const inds = await prisma.indicator.count()
  const mdata = await prisma.monthlyData.count()
  const qsum = await prisma.quarterlySummary.count()
  
  console.log(`Departments: ${depts}`)
  console.log(`Indicators: ${inds}`)
  console.log(`MonthlyData: ${mdata}`)
  console.log(`QuarterlySummary: ${qsum}`)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
