'use client'
import { useState, useMemo } from 'react'
import { createDepartment, createIndicator, deleteDepartment, updateDepartment, deleteIndicator, updateIndicator } from '../actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Edit2, X, Check, Search, PlusCircle, Building2, Target } from "lucide-react"
import { toast } from "react-hot-toast"
import { EntryForm } from "../entry/EntryForm"

export function SettingsClient({ departments }: { departments: any[] }) {
  const [activeTab, setActiveTab] = useState<'DATA' | 'DEPT'>('DATA')

  // Department Add/Edit States
  const [deptName, setDeptName] = useState('')
  const [savingDept, setSavingDept] = useState(false)
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null)
  const [editDeptName, setEditDeptName] = useState('')
  const [showAddDept, setShowAddDept] = useState(false)

  // --- Handlers ---
  const handleCreateDept = async () => {
    if (!deptName) return
    setSavingDept(true)
    const toastId = toast.loading('กำลังเพิ่มแผนก...')
    try {
      await createDepartment(deptName)
      setDeptName('')
      setShowAddDept(false)
      toast.success('เพิ่มแผนกเรียบร้อยแล้ว', { id: toastId })
    } catch (e) {
      toast.error('เกิดข้อผิดพลาดในการเพิ่มแผนก', { id: toastId })
    }
    setSavingDept(false)
  }

  const handleDeleteDept = async (id: string, name: string) => {
    if (window.confirm(`⚠️ การเตือน: คุณต้องการลบแผนก "${name}" ใช่หรือไม่?\nตัวชี้วัดทั้งหมดและข้อมูลรายเดือนของแผนกนี้จะถูกลบทิ้งอย่างถาวร!`)) {
      const toastId = toast.loading('กำลังลบแผนก...')
      try {
        await deleteDepartment(id)
        toast.success('ลบแผนกเรียบร้อยแล้ว', { id: toastId })
      } catch (e) {
        toast.error('เกิดข้อผิดพลาดในการลบแผนก', { id: toastId })
      }
    }
  }

  const startEditDept = (id: string, name: string) => {
    setEditingDeptId(id)
    setEditDeptName(name)
  }

  const saveEditDept = async (id: string) => {
    if (editDeptName) {
      const toastId = toast.loading('กำลังอัปเดตแผนก...')
      try {
        await updateDepartment(id, editDeptName)
        toast.success('อัปเดตแผนกเรียบร้อยแล้ว', { id: toastId })
      } catch (e) {
        toast.error('เกิดข้อผิดพลาดในการอัปเดตแผนก', { id: toastId })
      }
    }
    setEditingDeptId(null)
  }

  return (
    <div className="space-y-6">
      {/* Admin Header & Tabs */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 inline-flex gap-2 w-full sm:w-auto">
        <button 
          onClick={() => setActiveTab('DATA')}
          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'DATA' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <Edit2 className="h-4 w-4" />
          จัดการตัวชี้วัดและบันทึกผลงาน
        </button>
        <button 
          onClick={() => setActiveTab('DEPT')}
          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'DEPT' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <Building2 className="h-4 w-4" />
          จัดการแผนก
        </button>
      </div>



      {/* --- TAB: DEPARTMENTS --- */}
      {activeTab === 'DEPT' && (
        <Card className="shadow-sm border-slate-300 dark:border-slate-700 w-full bg-white dark:bg-slate-900">
          <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl text-slate-800 dark:text-white">จัดการแผนก (PCT)</CardTitle>
                <CardDescription>เพิ่ม ลบ หรือแก้ไขชื่อแผนกรับผิดชอบตัวชี้วัด</CardDescription>
              </div>
              <Button onClick={() => setShowAddDept(!showAddDept)} className="h-10 gap-2 bg-indigo-600 hover:bg-indigo-700">
                {showAddDept ? <X className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                {showAddDept ? 'ยกเลิก' : 'เพิ่มแผนก'}
              </Button>
            </div>
          </CardHeader>

          {showAddDept && (
            <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/20 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <Label>ชื่อแผนกใหม่</Label>
                <Input value={deptName} onChange={e => setDeptName(e.target.value)} placeholder="เช่น PCT อายุรกรรม" className="bg-white dark:bg-slate-950 mt-1.5 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100" />
              </div>
              <Button onClick={handleCreateDept} disabled={savingDept || !deptName} className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
                {savingDept ? 'กำลังบันทึก...' : 'บันทึกแผนกใหม่'}
              </Button>
            </div>
          )}

          <div className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4 font-semibold">ชื่อแผนก</th>
                  <th className="p-4 font-semibold text-center w-[150px]">จำนวนตัวชี้วัด</th>
                  <th className="p-4 font-semibold text-right w-[150px]">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {departments.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      {editingDeptId === d.id ? (
                        <Input value={editDeptName} onChange={e => setEditDeptName(e.target.value)} className="h-8 max-w-sm" autoFocus />
                      ) : (
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{d.name}</span>
                      )}
                    </td>
                    <td className="p-4 text-center text-slate-500 dark:text-slate-400">
                      {d.indicators.length} รายการ
                    </td>
                    <td className="p-4 text-right">
                      {editingDeptId === d.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" onClick={() => saveEditDept(d.id)} className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 gap-1">
                            <Check className="h-4 w-4" /> บันทึก
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingDeptId(null)} className="h-8 px-2 text-slate-500">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30" onClick={() => startEditDept(d.id, d.name)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30" onClick={() => handleDeleteDept(d.id, d.name)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {departments.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500 dark:text-slate-400">ยังไม่มีข้อมูลแผนกในระบบ</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* --- TAB: DATA ENTRY --- */}
      {activeTab === 'DATA' && (
        <div className="w-full">
          <EntryForm departments={departments} />
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  )
}
