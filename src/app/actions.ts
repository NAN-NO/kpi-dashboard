'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { calculateResult, checkIsPass } from "@/lib/calculations"

// --- Validation Schemas ---
const updateDataSchema = z.object({
  id: z.string().uuid(),
  numerator: z.number().min(0),
  denominator: z.number().nullable().refine((val) => val === null || val >= 0, {
    message: "Denominator must be positive or null"
  })
})

const createDepartmentSchema = z.object({
  name: z.string().min(1)
})

const createIndicatorSchema = z.object({
  name: z.string().min(1),
  targetValue: z.number(),
  targetType: z.string(),
  unit: z.string(),
  departmentId: z.string().uuid(),
  year: z.number().int().positive().default(2569)
})

export async function updateMonthlyData(dataId: string, numerator: number, denominator: number | null) {
  const parsed = updateDataSchema.parse({ id: dataId, numerator, denominator })
  
  const monthlyData = await prisma.monthlyData.findUnique({
    where: { id: parsed.id },
    include: { indicator: true }
  })

  if (!monthlyData) throw new Error("Data not found")
  
  const ind = monthlyData.indicator
  const result = calculateResult(parsed.numerator, parsed.denominator, ind.unit)
  const isPass = checkIsPass(result, ind.targetType, ind.targetValue)

  await prisma.monthlyData.update({
    where: { id: parsed.id },
    data: {
      numerator: parsed.numerator,
      denominator: parsed.denominator,
      result,
      isPass
    }
  })

  revalidatePath('/')
  revalidatePath('/entry')
}

export async function updateIndicatorData(updates: { id: string, numerator: number, denominator: number | null }[]) {
  const parsedUpdates = z.array(updateDataSchema).parse(updates)
  
  for (const update of parsedUpdates) {
    const monthlyData = await prisma.monthlyData.findUnique({
      where: { id: update.id },
      include: { indicator: true }
    })
    
    if (monthlyData) {
      const ind = monthlyData.indicator
      const result = calculateResult(update.numerator, update.denominator, ind.unit)
      const isPass = checkIsPass(result, ind.targetType, ind.targetValue)

      await prisma.monthlyData.update({
        where: { id: update.id },
        data: {
          numerator: update.numerator,
          denominator: update.denominator,
          result,
          isPass
        }
      })
    }
  }

  revalidatePath('/')
  revalidatePath('/entry')
}

export async function createDepartment(name: string) {
  const parsed = createDepartmentSchema.parse({ name })
  await prisma.department.create({
    data: { name: parsed.name }
  })
  revalidatePath('/settings')
  revalidatePath('/entry')
  revalidatePath('/')
}

export async function createIndicator(name: string, targetValue: number, targetType: string, unit: string, departmentId: string, year: number = 2569) {
  const parsed = createIndicatorSchema.parse({ name, targetValue, targetType, unit, departmentId, year })
  
  const ind = await prisma.indicator.create({
    data: {
      name: parsed.name,
      targetValue: parsed.targetValue,
      targetType: parsed.targetType,
      unit: parsed.unit,
      departmentId: parsed.departmentId
    }
  })

  // Create empty monthly data for the new indicator (months 1-12)
  const dataToCreate = []
  for (let month = 1; month <= 12; month++) {
    dataToCreate.push({
      indicatorId: ind.id,
      year: parsed.year,
      month,
      numerator: 0,
      denominator: null, // Start with null for empty
    })
  }

  await prisma.monthlyData.createMany({
    data: dataToCreate
  })

  revalidatePath('/settings')
  revalidatePath('/entry')
  revalidatePath('/')
}

export async function updateDepartment(id: string, name: string) {
  const parsed = z.object({ id: z.string().uuid(), name: z.string().min(1) }).parse({ id, name })
  await prisma.department.update({ where: { id: parsed.id }, data: { name: parsed.name } })
  revalidatePath('/settings')
  revalidatePath('/entry')
  revalidatePath('/')
}

export async function deleteDepartment(id: string) {
  const parsed = z.object({ id: z.string().uuid() }).parse({ id })
  await prisma.department.delete({ where: { id: parsed.id } })
  revalidatePath('/settings')
  revalidatePath('/entry')
  revalidatePath('/')
}

export async function updateIndicator(id: string, name: string, targetValue: number, targetType: string, unit: string) {
  const parsed = z.object({ id: z.string().uuid(), name: z.string().min(1), targetValue: z.number(), targetType: z.string(), unit: z.string() }).parse({ id, name, targetValue, targetType, unit })
  await prisma.indicator.update({ where: { id: parsed.id }, data: { name: parsed.name, targetValue: parsed.targetValue, targetType: parsed.targetType, unit: parsed.unit } })
  // Should also re-calculate all monthly data for this indicator because targetValue or type changed
  const monthlyData = await prisma.monthlyData.findMany({ where: { indicatorId: parsed.id }, include: { indicator: true } })
  for (const data of monthlyData) {
    if (data.result !== null) {
      const isPass = checkIsPass(data.result, parsed.targetType, parsed.targetValue)
      await prisma.monthlyData.update({ where: { id: data.id }, data: { isPass } })
    }
  }

  revalidatePath('/settings')
  revalidatePath('/entry')
  revalidatePath('/')
}

export async function deleteIndicator(id: string) {
  const parsed = z.object({ id: z.string().uuid() }).parse({ id })
  await prisma.indicator.delete({ where: { id: parsed.id } })
  revalidatePath('/settings')
  revalidatePath('/entry')
  revalidatePath('/')
}
