'use client'
import React, { useState, useEffect } from 'react'
import { updateIndicatorData, updateIndicator, createIndicator, deleteIndicator } from '../actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Save, AlertCircle, Edit2, Check, X, PlusCircle, Trash2, ArrowUpDown } from "lucide-react"
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
function CellInput({ value, onChange, placeholder = "-" }: { value: number | null, onChange: (val: string) => void, placeholder?: string }) {
  const [val, setVal] = useState(value === null ? '' : value.toString())
  
  useEffect(() => {
    setVal(value === null ? '' : value.toString())
  }, [value])

  return (
    <Input 
      type="number"
      placeholder={placeholder}
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={() => {
        const newValue = value === null ? '' : value.toString();
        if (val !== newValue) {
          onChange(val);
        }
      }}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          const newValue = value === null ? '' : value.toString();
          if (val !== newValue) {
            onChange(val);
          }
        }
      }}
      onFocus={e => {
        e.target.select()
      }}
      className="h-8 w-16 text-center px-1 text-xs mx-auto focus-visible:ring-2 focus-visible:ring-indigo-500 bg-transparent border-slate-200 dark:border-slate-700"
    />
  )
}

export function EntryForm({ departments }: { departments: any }) {
  const router = useRouter()
  const [selectedDept, setSelectedDept] = useState(departments[0]?.id || '')
  const [dataGrid, setDataGrid] = useState<{ [id: string]: any }>({})
  const [saving, setSaving] = useState(false)
  const [editingIndId, setEditingIndId] = useState<string | null>(null)
  const [editIndName, setEditIndName] = useState('')
  const [editIndTarget, setEditIndTarget] = useState('')
  const [editIndTargetType, setEditIndTargetType] = useState('<')
  const [editIndUnit, setEditIndUnit] = useState('%')

  // Add Indicator States
  const [showAddInd, setShowAddInd] = useState(false)
  const [indName, setIndName] = useState('')
  const [targetVal, setTargetVal] = useState('')
  const [targetType, setTargetType] = useState('<')
  const [unit, setUnit] = useState('%')
  const [savingInd, setSavingInd] = useState(false)

  const startEditInd = (ind: any) => {
    setEditingIndId(ind.id)
    setEditIndName(ind.name)
    setEditIndTarget(ind.targetValue.toString())
    setEditIndTargetType(ind.targetType || '<')
    setEditIndUnit(ind.unit || '%')
  }

  const saveEditInd = async (id: string) => {
    const toastId = toast.loading('กำลังบันทึกตัวชี้วัด...')
    try {
      await updateIndicator(id, editIndName, Number(editIndTarget), editIndTargetType, editIndUnit)
      toast.success('แก้ไขตัวชี้วัดเรียบร้อยแล้ว', { id: toastId })
      setEditingIndId(null)
      router.refresh()
    } catch (e) {
      toast.error('เกิดข้อผิดพลาด', { id: toastId })
    }
  }

  const handleDeleteInd = async (id: string, name: string) => {
    if (window.confirm(`⚠️ การเตือน: คุณต้องการลบตัวชี้วัด "${name}" ใช่หรือไม่?\nข้อมูลรายเดือนทั้งหมดของตัวชี้วัดนี้จะหายไป!`)) {
      const toastId = toast.loading('กำลังลบตัวชี้วัด...')
      try {
        await deleteIndicator(id)
        toast.success('ลบตัวชี้วัดเรียบร้อยแล้ว', { id: toastId })
        router.refresh()
      } catch (e) {
        toast.error('เกิดข้อผิดพลาดในการลบตัวชี้วัด', { id: toastId })
      }
    }
  }

  const handleCreateInd = async () => {
    if (!indName || !targetVal) return
    setSavingInd(true)
    const toastId = toast.loading('กำลังเพิ่มตัวชี้วัด...')
    try {
      await createIndicator(indName, Number(targetVal), targetType, unit, selectedDept)
      setIndName('')
      setTargetVal('')
      setShowAddInd(false)
      toast.success('เพิ่มตัวชี้วัดเรียบร้อยแล้ว', { id: toastId })
      router.refresh()
    } catch (e) {
      toast.error('เกิดข้อผิดพลาดในการเพิ่มตัวชี้วัด', { id: toastId })
    }
    setSavingInd(false)
  }

  // Initialize data grid state
  useEffect(() => {
    const initialGrid: any = {}
    departments.forEach((dept: any) => {
      dept.indicators.forEach((ind: any) => {
        ind.monthlyData.forEach((d: any) => {
          let num = (d.numerator === 0 && d.denominator === null) ? null : d.numerator;
          // Auto-set numerator to 0 if denominator exists but numerator is null
          if (d.denominator !== null && num === null) {
            num = 0;
          }
          initialGrid[d.id] = { ...d, numerator: num }
        })
      })
    })
    setDataGrid(initialGrid)
  }, [departments])

  const dept = departments.find((d: any) => d.id === selectedDept)
  const monthNames = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.']

  const handleNumChange = (id: string, val: string) => {
    setDataGrid(prev => ({
      ...prev,
      [id]: { ...prev[id], numerator: val === '' ? null : Number(val) }
    }))
  }

  const handleDenChange = (id: string, val: string) => {
    setDataGrid(prev => ({
      ...prev,
      [id]: { ...prev[id], denominator: val === '' ? null : Number(val) }
    }))
  }

  const handleSave = async () => {
    if (!dept) return
    setSaving(true)
    const toastId = toast.loading('กำลังบันทึกข้อมูล...')
    
    try {
      // Gather all updates for current department
      const updates: any[] = []
      dept.indicators.forEach((ind: any) => {
        ind.monthlyData.forEach((d: any) => {
          const gridData = dataGrid[d.id]
          if (gridData && (gridData.numerator !== d.numerator || gridData.denominator !== d.denominator)) {
            updates.push({
              id: d.id,
              numerator: gridData.numerator,
              denominator: gridData.denominator
            })
          }
        })
      })

      if (updates.length === 0) {
        toast.dismiss(toastId)
        toast.error("ไม่มีการเปลี่ยนแปลงข้อมูล", { duration: 3000 })
        setSaving(false)
        return
      }

      const res = await updateIndicatorData(updates)
      if (res && res.error) {
        throw new Error(res.error)
      }
      toast.success(`บันทึกข้อมูลเรียบร้อยแล้ว (${updates.length} รายการ)`, { id: toastId, duration: 4000 })
      router.refresh()
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e)
      toast.error(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${errMsg}`, { id: toastId })
    }
    setSaving(false)
  }

  if (!dept) return null

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4 justify-between sticky top-[64px] z-40">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <Label className="text-xs text-slate-500 dark:text-slate-300">เลือกแผนก / PCT</Label>
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger className="w-full sm:w-[300px] h-9 font-medium">
                <span data-slot="select-value" className="flex flex-1 text-left">
                  {dept?.name || 'เลือกแผนก'}
                </span>
              </SelectTrigger>
              <SelectContent>
                {departments.map((d: any) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button onClick={() => setShowAddInd(!showAddInd)} variant="outline" className="w-full sm:w-auto h-10 gap-2 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
            {showAddInd ? <X className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
            {showAddInd ? 'ยกเลิก' : 'เพิ่มตัวชี้วัด'}
          </Button>
          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto h-10 gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md">
            <Save className="h-4 w-4" />
            {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลทั้งหมด'}
          </Button>
        </div>
      </div>

      {showAddInd && (
        <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/20 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm relative -mt-2 mb-6">
          <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> สร้างตัวชี้วัดใหม่ในแผนกนี้
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2">
              <Label>ชื่อตัวชี้วัด</Label>
              <Input value={indName} onChange={e => setIndName(e.target.value)} placeholder="เช่น อัตราการเกิดทารกน้ำหนักน้อย" className="bg-white dark:bg-slate-900 mt-1.5" />
            </div>
            <div>
              <Label>เงื่อนไข</Label>
              <Select value={targetType} onValueChange={(val) => val && setTargetType(val)}>
                <SelectTrigger className="bg-white dark:bg-slate-900 mt-1.5">
                  <span data-slot="select-value" className="flex flex-1 text-left">
                    {targetType === '<' ? 'น้อยกว่า (<)' : targetType === '<=' ? 'น้อยกว่าหรือเท่ากับ (<=)' : targetType === '>' ? 'มากกว่า (>)' : targetType === '>=' ? 'มากกว่าหรือเท่ากับ (>=)' : targetType === '=' ? 'เท่ากับ (=)' : ''}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="<">น้อยกว่า {'(<)'}</SelectItem>
                  <SelectItem value="<=">น้อยกว่าหรือเท่ากับ {'(<=)'}</SelectItem>
                  <SelectItem value=">">มากกว่า {'(>)'}</SelectItem>
                  <SelectItem value=">=">มากกว่าหรือเท่ากับ {'(>=)'}</SelectItem>
                  <SelectItem value="=">เท่ากับ {'(=)'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>ตัวเลขเป้าหมาย</Label>
              <Input type="number" value={targetVal} onChange={e => setTargetVal(e.target.value)} placeholder="เช่น 10" className="bg-white dark:bg-slate-900 mt-1.5" />
            </div>
            <div>
              <Label>หน่วย</Label>
              <Select value={unit} onValueChange={(val) => val && setUnit(val)}>
                <SelectTrigger className="bg-white dark:bg-slate-900 mt-1.5">
                  <span data-slot="select-value" className="flex flex-1 text-left">
                    {unit === '%' ? 'ร้อยละ (%)' : unit}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="%">ร้อยละ (%)</SelectItem>
                  <SelectItem value="ต่อ 1,000 LB">ต่อ 1,000 LB</SelectItem>
                  <SelectItem value="ต่อ 1,000 วันนอน">ต่อ 1,000 วันนอน</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleCreateInd} disabled={savingInd || !indName || !targetVal} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Check className="h-4 w-4" /> บันทึกตัวชี้วัดใหม่
            </Button>
          </div>
        </div>
      )}

      <Card className="shadow-sm border-slate-300 dark:border-slate-600 overflow-hidden">
        <div className="md:hidden text-xs text-slate-500 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 flex items-center justify-center gap-1 border-b border-slate-200 dark:border-slate-700">
          <ArrowUpDown className="w-3 h-3 rotate-90" />
          <span>เลื่อนซ้าย-ขวาที่ตารางเพื่อดูและกรอกข้อมูลเดือนอื่น</span>
        </div>
        <div className="overflow-x-auto max-h-[75vh] relative custom-scrollbar">
          <table className="w-full text-sm border-collapse min-w-[1200px]">
            <thead className="sticky top-0 z-40 bg-slate-100 dark:bg-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
              <tr className="text-slate-700 dark:text-slate-200">
                <th className="border-b border-slate-300 dark:border-slate-600 p-3 font-semibold text-left lg:sticky lg:left-0 z-50 bg-slate-100 dark:bg-slate-800 min-w-[200px] sm:min-w-[300px] max-w-[400px] lg:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  รายชื่อตัวชี้วัด
                </th>
                <th className="border-b border-slate-300 dark:border-slate-600 border-l p-3 font-semibold text-center lg:sticky lg:left-[300px] z-50 bg-slate-100 dark:bg-slate-800 min-w-[100px] lg:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  ประเภท
                </th>
                {monthNames.map((m, i) => (
                  <th key={i} className="border-b border-l border-slate-300 dark:border-slate-600 p-3 font-semibold text-center min-w-[70px]">
                    {m}
                  </th>
                ))}
                <th className="border-b border-l border-slate-300 dark:border-slate-600 p-3 font-bold text-center bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100 min-w-[80px] lg:sticky lg:right-0 z-40 lg:shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  รวม (YTD)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900">
              {dept.indicators.map((ind: any, indIdx: number) => {
                const rowBg = indIdx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/30'
                
                // Calculate YTD dynamically based on current grid state
                let sumNum = 0
                let sumDen = 0
                ind.monthlyData.forEach((d: any) => {
                  const currentData = dataGrid[d.id] || d
                  sumNum += Number(currentData.numerator) || 0
                  sumDen += Number(currentData.denominator) || 0
                })

                let ytdResult = '-'
                let isPass = false
                if (sumDen > 0) {
                  let resultVal = 0
                  if (ind.unit === '%') {
                    resultVal = (sumNum / sumDen) * 100
                  } else if (ind.unit === 'ต่อ 1,000 LB' || ind.unit === 'ต่อ 1,000 วันนอน') {
                    resultVal = (sumNum / sumDen) * 1000
                  }
                  
                  ytdResult = resultVal.toFixed(2)
                  
                  if (ind.targetType === '<') isPass = resultVal < ind.targetValue
                  else if (ind.targetType === '>') isPass = resultVal > ind.targetValue
                  else if (ind.targetType === '<=') isPass = resultVal <= ind.targetValue
                  else if (ind.targetType === '>=') isPass = resultVal >= ind.targetValue
                  else if (ind.targetType === '=') isPass = resultVal === ind.targetValue
                }

                return (
                  <React.Fragment key={ind.id}>
                    {/* Denominator Row */}
                    <tr className={`border-b border-slate-200 dark:border-slate-700 ${rowBg} hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors`}>
                      <td rowSpan={3} className={`border-r border-slate-200 dark:border-slate-700 p-4 lg:sticky lg:left-0 z-30 bg-white dark:bg-slate-900 lg:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] align-top group`}>
                        {editingIndId === ind.id ? (
                          <div className="flex flex-col gap-2">
                            <Input value={editIndName} onChange={(e) => setEditIndName(e.target.value)} className="h-8 text-sm" />
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 dark:text-slate-300 whitespace-nowrap">เป้าหมาย:</span>
                              <Select value={editIndTargetType} onValueChange={(val) => setEditIndTargetType(val || '')}>
                                <SelectTrigger className="h-8 w-20 text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600">
                                  <span data-slot="select-value" className="flex flex-1 text-left">{editIndTargetType}</span>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="<">&lt;</SelectItem>
                                  <SelectItem value="<=">&lt;=</SelectItem>
                                  <SelectItem value="=">=</SelectItem>
                                  <SelectItem value=">=">&gt;=</SelectItem>
                                  <SelectItem value=">">&gt;</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input type="number" value={editIndTarget} onChange={(e) => setEditIndTarget(e.target.value)} className="h-8 w-20 text-sm" />
                              <Select value={editIndUnit} onValueChange={(val) => setEditIndUnit(val || '')}>
                                <SelectTrigger className="h-8 w-[140px] text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600">
                                  <span data-slot="select-value" className="flex flex-1 text-left">{editIndUnit === '%' ? 'ร้อยละ (%)' : editIndUnit}</span>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="%">ร้อยละ (%)</SelectItem>
                                  <SelectItem value="ต่อ 1,000 LB">ต่อ 1,000 LB</SelectItem>
                                  <SelectItem value="ต่อ 1,000 วันนอน">ต่อ 1,000 วันนอน</SelectItem>
                                  <SelectItem value="n/a">ไม่มีหน่วย (n/a)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Button size="sm" onClick={() => saveEditInd(ind.id)} className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-xs">
                                <Check className="h-3 w-3 mr-1" /> บันทึก
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingIndId(null)} className="h-7 px-2 text-slate-500 dark:text-slate-300">
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="relative pr-6">
                            <div className="font-medium text-slate-800 dark:text-slate-100 mb-2 leading-relaxed">
                              {ind.name}
                            </div>
                            <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 font-semibold px-2 py-0.5 text-xs">
                              เป้าหมาย: {ind.targetType} {ind.targetValue} {ind.unit}
                            </Badge>
                            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => startEditInd(ind)} 
                                className="h-6 w-6 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteInd(ind.id, ind.name)} 
                                className="h-6 w-6 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-300"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className={`border-r border-slate-200 dark:border-slate-700 p-2 text-center text-xs font-medium text-slate-600 dark:text-slate-300 lg:sticky lg:left-[300px] z-30 bg-slate-50 dark:bg-slate-800/50 lg:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]`}>
                        เป้าหมาย<br/><span className="text-[9px] text-slate-400">(Denominator)</span>
                      </td>
                      {ind.monthlyData.map((d: any) => {
                        const gridData = dataGrid[d.id] || d
                        return (
                          <td key={`den-${d.id}`} className="border-r border-slate-200 dark:border-slate-700 p-1">
                            <CellInput 
                              placeholder="-"
                              value={gridData.denominator}
                              onChange={val => handleDenChange(d.id, val)}
                            />
                          </td>
                        )
                      })}
                      <td className="p-2 text-center font-semibold bg-amber-50 dark:bg-amber-900/20/50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100 border-l border-slate-200 dark:border-slate-700 lg:sticky lg:right-0 z-20 lg:shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        {sumDen > 0 ? sumDen.toLocaleString() : '-'}
                      </td>
                    </tr>

                    {/* Numerator Row */}
                    <tr className={`border-b border-slate-200 dark:border-slate-700 ${rowBg} hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors`}>
                      <td className={`border-r border-slate-200 dark:border-slate-700 p-2 text-center text-xs font-medium text-slate-600 dark:text-slate-300 lg:sticky lg:left-[300px] z-30 bg-slate-50 dark:bg-slate-800/50 lg:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]`}>
                        ผลงาน<br/><span className="text-[9px] text-slate-400">(Numerator)</span>
                      </td>
                      {ind.monthlyData.map((d: any) => {
                        const gridData = dataGrid[d.id] || d
                        return (
                          <td key={`num-${d.id}`} className="border-r border-slate-200 dark:border-slate-700 p-1">
                            <CellInput 
                              placeholder="-"
                              value={gridData.numerator}
                              onChange={val => handleNumChange(d.id, val)}
                            />
                          </td>
                        )
                      })}
                      <td className="p-2 text-center font-semibold bg-amber-50 dark:bg-amber-900/20/50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100 border-l border-slate-200 dark:border-slate-700 lg:sticky lg:right-0 z-20 lg:shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        {sumDen > 0 ? sumNum.toLocaleString() : '-'}
                      </td>
                    </tr>

                    <tr className={`border-b-2 border-slate-300 dark:border-slate-600 ${rowBg}`}>
                      <td className={`border-r border-slate-200 dark:border-slate-700 p-2 text-center text-xs font-medium text-slate-600 dark:text-slate-300 lg:sticky lg:left-[300px] z-30 bg-slate-50 dark:bg-slate-800/50 lg:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]`}>
                        ผลลัพธ์<br/><span className="text-[9px] text-slate-400">({ind.unit})</span>
                      </td>
                      {ind.monthlyData.map((d: any) => {
                        // For the monthly result, we should dynamically calculate it if the grid data changed
                        const gridData = dataGrid[d.id] || d
                        let cellResult = '-'
                        let cellPass = null
                        if (gridData.denominator && gridData.denominator > 0) {
                          let r = 0
                          if (ind.unit === '%') r = (gridData.numerator / gridData.denominator) * 100
                          else r = (gridData.numerator / gridData.denominator) * 1000
                          
                          cellResult = r.toFixed(2)
                          
                          if (ind.targetType === '<') cellPass = r < ind.targetValue
                          else if (ind.targetType === '>') cellPass = r > ind.targetValue
                          else if (ind.targetType === '<=') cellPass = r <= ind.targetValue
                          else if (ind.targetType === '>=') cellPass = r >= ind.targetValue
                          else if (ind.targetType === '=') cellPass = r === ind.targetValue
                        } else if (d.result !== null) {
                          // Fallback to saved result if no local edit and it exists
                          cellResult = Number(d.result).toFixed(2)
                          cellPass = d.isPass
                        }

                        return (
                          <td key={`res-${d.id}`} className={`border-r border-slate-200 dark:border-slate-700 p-2 text-center text-xs font-medium ${cellPass === true ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20' : cellPass === false ? 'text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-900/20' : 'text-slate-400 dark:text-slate-500'}`}>
                            {cellResult}
                          </td>
                        )
                      })}
                      <td className={`p-2 text-center font-bold border-l border-slate-200 dark:border-slate-700 lg:sticky lg:right-0 z-20 lg:shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] ${isPass ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50' : sumDen > 0 ? 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/50' : 'text-slate-500 dark:text-slate-300 bg-amber-50 dark:bg-amber-900/20'}`}>
                        {ytdResult}
                      </td>
                    </tr>
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />
    </div>
  )
}
