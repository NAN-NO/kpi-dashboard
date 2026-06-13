'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { calculateResult, checkIsPass } from "@/lib/calculations"

// --- Validation Schemas ---
const updateDataSchema = z.object({
  id: z.string().uuid(),
  numerator: z.number().nullable(),
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

export async function updateMonthlyData(dataId: string, numerator: number | null, denominator: number | null) {
  const parsed = updateDataSchema.parse({ id: dataId, numerator, denominator })
  
  const monthlyData = await prisma.monthlyData.findUnique({
    where: { id: parsed.id },
    include: { indicator: true }
  })

  if (!monthlyData) throw new Error("Data not found")
  
  const ind = monthlyData.indicator
  const result = calculateResult(parsed.numerator ?? 0, parsed.denominator ?? 0, ind.unit)
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

  revalidatePath('/', 'layout')
}

export async function updateIndicatorData(updates: { id: string, numerator: number | null, denominator: number | null }[]) {
  try {
    const parsedUpdates = z.array(updateDataSchema).parse(updates)
    
    const dataIds = parsedUpdates.map(u => u.id)
    const existingData = await prisma.monthlyData.findMany({
      where: { id: { in: dataIds } },
      include: { indicator: true }
    })

    const transactionPromises = parsedUpdates.map(update => {
      const data = existingData.find(d => d.id === update.id)
      if (!data) return null

      const ind = data.indicator
      const result = calculateResult(update.numerator ?? 0, update.denominator ?? 0, ind.unit)
      const isPass = checkIsPass(result, ind.targetType, ind.targetValue)

      return prisma.monthlyData.update({
        where: { id: update.id },
        data: {
          numerator: update.numerator,
          denominator: update.denominator,
          result,
          isPass
        }
      })
    }).filter(Boolean) as any[]

    await prisma.$transaction(transactionPromises)

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error("updateIndicatorData error:", error)
    if (error instanceof z.ZodError) {
      return { error: `ข้อมูลไม่ถูกต้อง: ${(error as any).errors[0].message}` }
    }
    return { error: error instanceof Error ? error.message : String(error) }
  }
}

export async function createDepartment(name: string) {
  try {
    const parsed = createDepartmentSchema.parse({ name })
    await prisma.department.create({
      data: { name: parsed.name }
    })
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) }
  }
}

export async function createIndicator(name: string, targetValue: number, targetType: string, unit: string, departmentId: string, year: number = 2569) {
  try {
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

    const dataToCreate = []
    for (let month = 1; month <= 12; month++) {
      dataToCreate.push({
        indicatorId: ind.id,
        year: parsed.year,
        month,
        numerator: null,
        denominator: null,
      })
    }

    await prisma.monthlyData.createMany({
      data: dataToCreate
    })

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) }
  }
}

export async function updateDepartment(id: string, name: string) {
  try {
    const parsed = z.object({ id: z.string().uuid(), name: z.string().min(1) }).parse({ id, name })
    await prisma.department.update({ where: { id: parsed.id }, data: { name: parsed.name } })
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) }
  }
}

export async function deleteDepartment(id: string) {
  try {
    const parsed = z.object({ id: z.string().uuid() }).parse({ id })
    await prisma.department.delete({ where: { id: parsed.id } })
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) }
  }
}

export async function updateIndicator(id: string, name: string, targetValue: number, targetType: string, unit: string) {
  try {
    const parsed = z.object({ id: z.string().uuid(), name: z.string().min(1), targetValue: z.number(), targetType: z.string(), unit: z.string() }).parse({ id, name, targetValue, targetType, unit })
    await prisma.indicator.update({ where: { id: parsed.id }, data: { name: parsed.name, targetValue: parsed.targetValue, targetType: parsed.targetType, unit: parsed.unit } })
    const monthlyData = await prisma.monthlyData.findMany({ where: { indicatorId: parsed.id } })
    const promises = monthlyData
      .filter(data => data.result !== null)
      .map(data => {
        const isPass = checkIsPass(data.result, parsed.targetType, parsed.targetValue)
        return prisma.monthlyData.update({ where: { id: data.id }, data: { isPass } })
      })
    
    await prisma.$transaction(promises)

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) }
  }
}

export async function deleteIndicator(id: string) {
  try {
    const parsed = z.object({ id: z.string().uuid() }).parse({ id })
    await prisma.indicator.delete({ where: { id: parsed.id } })
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) }
  }
}
