import { prisma } from "@/lib/prisma"
import { DashboardClient } from "./DashboardClient"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
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
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 mt-1">ภาพรวมผลการดำเนินงานระดับองค์กร ปีงบประมาณ 2569</p>
        </div>
      </div>

      <DashboardClient initialData={departments} />
    </div>
  )
}
