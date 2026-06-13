import { prisma } from "@/lib/prisma"
import { EntryForm } from "./EntryForm"

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function EntryPage() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        indicators: {
          include: {
            monthlyData: {
              where: { year: 2569 },
              orderBy: { month: 'asc' }
            }
          }
        }
      }
    })

    return (
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Data Entry</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">บันทึกข้อมูลผลการดำเนินงาน ปีงบประมาณ 2569</p>
        </div>
        <EntryForm departments={departments} />
      </div>
    )
  } catch (error) {
    throw new Error('ไม่สามารถโหลดข้อมูลบันทึกผลงานได้ กรุณาลองใหม่อีกครั้ง')
  }
}
