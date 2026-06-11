import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Create Department
  const deptObgyn = await prisma.department.upsert({
    where: { name: 'PCT สูติกรรม' },
    update: {},
    create: {
      name: 'PCT สูติกรรม',
    },
  })

  // 2. Create Indicators
  const ind1 = await prisma.indicator.upsert({
    where: {
      name_departmentId: {
        name: 'อัตราการเกิดทารกน้ำหนักน้อย < 2,500 กรัม',
        departmentId: deptObgyn.id,
      },
    },
    update: {},
    create: {
      name: 'อัตราการเกิดทารกน้ำหนักน้อย < 2,500 กรัม',
      targetValue: 10,
      targetType: '<',
      unit: '%',
      departmentId: deptObgyn.id,
    },
  })

  const ind2 = await prisma.indicator.upsert({
    where: {
      name_departmentId: {
        name: 'อัตราหญิงตั้งครรภ์ มีภาวะซีดขณะใกล้คลอด',
        departmentId: deptObgyn.id,
      },
    },
    update: {},
    create: {
      name: 'อัตราหญิงตั้งครรภ์ มีภาวะซีดขณะใกล้คลอด',
      targetValue: 12,
      targetType: '<',
      unit: '%',
      departmentId: deptObgyn.id,
    },
  })

  const ind3 = await prisma.indicator.upsert({
    where: {
      name_departmentId: {
        name: 'อัตราทารกตายปริกำเนิด',
        departmentId: deptObgyn.id,
      },
    },
    update: {},
    create: {
      name: 'อัตราทารกตายปริกำเนิด',
      targetValue: 9,
      targetType: '<', // 9 per 1000 LB means it should be less than 9
      unit: 'ต่อ 1,000 LB',
      departmentId: deptObgyn.id,
    },
  })

  // 3. Create Monthly Data (Mock for 2569)
  const mockData = [
    // Indicator 1
    { ind: ind1, month: 1, num: 4, den: 59 }, // ต.ค.
    { ind: ind1, month: 2, num: 2, den: 47 }, // พ.ย.
    { ind: ind1, month: 3, num: 6, den: 51 }, // ธ.ค.
    { ind: ind1, month: 4, num: 7, den: 53 }, // ม.ค.
    { ind: ind1, month: 5, num: 4, den: 39 }, // ก.พ.
    { ind: ind1, month: 6, num: 7, den: 44 }, // มี.ค.
    { ind: ind1, month: 7, num: 6, den: 44 }, // เม.ย.
    // Indicator 2
    { ind: ind2, month: 1, num: 4, den: 58 },
    { ind: ind2, month: 2, num: 5, den: 46 },
    { ind: ind2, month: 3, num: 6, den: 51 },
    { ind: ind2, month: 4, num: 6, den: 53 },
    { ind: ind2, month: 5, num: 4, den: 39 },
    { ind: ind2, month: 6, num: 3, den: 44 },
    { ind: ind2, month: 7, num: 9, den: 44 },
    // Indicator 3
    { ind: ind3, month: 1, num: 0, den: 59 },
    { ind: ind3, month: 2, num: 0, den: 47 },
    { ind: ind3, month: 3, num: 1, den: 51 },
    { ind: ind3, month: 4, num: 0, den: 53 },
    { ind: ind3, month: 5, num: 0, den: 39 },
    { ind: ind3, month: 6, num: 1, den: 44 },
    { ind: ind3, month: 7, num: 0, den: 44 },
  ]

  for (const data of mockData) {
    let result = null
    let isPass = null

    if (data.den && data.den > 0) {
      if (data.ind.unit === '%') {
        result = (data.num / data.den) * 100
      } else if (data.ind.unit === 'ต่อ 1,000 LB') {
        result = (data.num / data.den) * 1000
      }
      
      if (result !== null) {
        if (data.ind.targetType === '<') isPass = result < data.ind.targetValue
        else if (data.ind.targetType === '>') isPass = result > data.ind.targetValue
        else if (data.ind.targetType === '<=') isPass = result <= data.ind.targetValue
        else if (data.ind.targetType === '>=') isPass = result >= data.ind.targetValue
        else if (data.ind.targetType === '=') isPass = result === data.ind.targetValue
      }
    }

    await prisma.monthlyData.upsert({
      where: {
        indicatorId_year_month: {
          indicatorId: data.ind.id,
          year: 2569,
          month: data.month,
        },
      },
      update: {
        numerator: data.num,
        denominator: data.den,
        result,
        isPass,
      },
      create: {
        indicatorId: data.ind.id,
        year: 2569,
        month: data.month,
        numerator: data.num,
        denominator: data.den,
        result,
        isPass,
      },
    })
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
