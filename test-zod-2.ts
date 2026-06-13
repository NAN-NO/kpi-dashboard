import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const updateDataSchema = z.object({
  id: z.string().uuid(),
  numerator: z.number().nullable(),
  denominator: z.number().nullable().refine((val) => val === null || val >= 0, {
    message: "Denominator must be positive or null"
  })
})

async function main() {
  const indicatorName = "ร้อยละของผู้ป่วย fracture around the hip กระดูกสะโพกหักได้รับการผ่าตัด ภายใน 72 ชั่วโมง";
  const ind = await prisma.indicator.findFirst({
    where: { name: indicatorName },
    include: { monthlyData: true }
  })
  if (!ind) {
    console.log("Indicator not found");
    return;
  }
  
  console.log("Found indicator:", ind.name);
  
  const updates = ind.monthlyData.map(d => {
    return {
      id: d.id,
      numerator: d.numerator,
      denominator: d.denominator
    }
  });

  console.log("Updates payload:", JSON.stringify(updates, null, 2));
  
  try {
    const parsedUpdates = z.array(updateDataSchema).parse(updates)
    console.log("Zod parse successful.");
  } catch(e) {
    console.error("Zod parse failed:", e);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
