'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const updateQuarterlySchema = z.object({
  indicatorId: z.string().uuid(),
  year: z.number().int().positive(),
  q1Text: z.string().optional(),
  q2Text: z.string().optional(),
  q3Text: z.string().optional(),
  q4Text: z.string().optional(),
})

export async function updateQuarterlySummary(data: z.infer<typeof updateQuarterlySchema>) {
  const parsed = updateQuarterlySchema.parse(data)

  await prisma.quarterlySummary.upsert({
    where: {
      indicatorId_year: {
        indicatorId: parsed.indicatorId,
        year: parsed.year
      }
    },
    update: {
      ...(parsed.q1Text !== undefined && { q1Text: parsed.q1Text }),
      ...(parsed.q2Text !== undefined && { q2Text: parsed.q2Text }),
      ...(parsed.q3Text !== undefined && { q3Text: parsed.q3Text }),
      ...(parsed.q4Text !== undefined && { q4Text: parsed.q4Text }),
    },
    create: {
      indicatorId: parsed.indicatorId,
      year: parsed.year,
      q1Text: parsed.q1Text ?? "รอดำเนินการ",
      q2Text: parsed.q2Text ?? "รอดำเนินการ",
      q3Text: parsed.q3Text ?? "รอดำเนินการ",
      q4Text: parsed.q4Text ?? "รอดำเนินการ",
    }
  })

  revalidatePath('/')
  revalidatePath('/entry')
}
