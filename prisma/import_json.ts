import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { calculateResult, checkIsPass } from '../src/lib/calculations'

const prisma = new PrismaClient()

async function main() {
  const jsonPath = path.join(__dirname, '../../seed_data.json')
  const rawData = fs.readFileSync(jsonPath, 'utf-8')
  const departments = JSON.parse(rawData)

  console.log(`Starting import for ${departments.length} departments...`)

  // Clean the database
  await prisma.monthlyData.deleteMany()
  await prisma.indicator.deleteMany()
  await prisma.department.deleteMany()

  for (const deptData of departments) {
    const dept = await prisma.department.create({
      data: {
        name: deptData.name
      }
    })
    
    console.log(`Created Department: ${dept.name}`)

    const createdIndNames = new Set<string>()

    for (const indData of deptData.indicators) {
      let finalName = indData.name
      let counter = 1
      while (createdIndNames.has(finalName)) {
        finalName = `${indData.name} (${counter})`
        counter++
      }
      createdIndNames.add(finalName)

      const ind = await prisma.indicator.create({
        data: {
          name: finalName,
          targetValue: indData.targetValue,
          targetType: indData.targetType,
          unit: indData.unit,
          departmentId: dept.id
        }
      })

      // Monthly Data
      const monthlyDataToCreate = []
      
      for (const mData of indData.monthlyData) {
        const num = mData.numerator
        const den = mData.denominator
        
        const result = calculateResult(num, den, ind.unit)
        const isPass = checkIsPass(result, ind.targetType, ind.targetValue)
        
        monthlyDataToCreate.push({
          indicatorId: ind.id,
          year: 2569, // Default year
          month: mData.month,
          numerator: num,
          denominator: den,
          result: result,
          isPass: isPass
        })
      }
      
      await prisma.monthlyData.createMany({
        data: monthlyDataToCreate
      })
    }
  }

  console.log('Import completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
