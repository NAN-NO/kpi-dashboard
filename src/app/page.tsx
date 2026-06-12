import { prisma } from "@/lib/prisma"
import { DashboardClient } from "./DashboardClient"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        indicators: {
          include: {
            monthlyData: {
              where: { year: 2569 },
              orderBy: { month: 'asc' }
            },
            quarterlyData: {
              where: { year: 2569 }
            }
          }
        }
      }
    })

    return <DashboardClient initialData={departments} />
  } catch (error) {
    throw new Error('ไม่สามารถโหลดข้อมูล Dashboard ได้ กรุณาลองใหม่อีกครั้ง')
  }
}
