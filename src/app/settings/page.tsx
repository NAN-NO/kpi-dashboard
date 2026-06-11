import { prisma } from "@/lib/prisma"
import { SettingsClient } from "./SettingsClient"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const departments = await prisma.department.findMany({
    include: {
      indicators: {
        include: { 
          monthlyData: {
            where: { year: 2569 },
            orderBy: { month: 'asc' }
          } 
        },
        orderBy: { name: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">จัดการระบบและข้อมูล</h1>
        <p className="text-slate-500 mt-1">ตั้งค่าแผนก ตัวชี้วัด และบันทึกข้อมูลผลงาน</p>
      </div>
      <SettingsClient departments={departments} />
    </div>
  )
}
