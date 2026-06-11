'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell, LabelList } from 'recharts'
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, Target, Users, Activity, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react"
import { calculateResult, checkIsPass } from "@/lib/calculations"

const monthNames = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.']

export function DashboardClient({ initialData }: { initialData: any[] }) {
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all')
  const [selectedKpiId, setSelectedKpiId] = useState<string>('')
  const [selectedDeptFocus, setSelectedDeptFocus] = useState<string | null>(null)
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({})
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

  const toggleDept = (deptName: string) => {
    setExpandedDepts(prev => ({...prev, [deptName]: !prev[deptName]}))
    setSelectedDeptFocus(deptName)
    setSelectedKpiId('') // Go to department overview
  }
  
  // When dropdown changes, reset focus
  useEffect(() => {
    setSelectedKpiId('')
    setSelectedDeptFocus(null)
  }, [selectedDeptId])

  // --- Data Processing ---
  const allIndicatorsList = useMemo(() => {
    const list: any[] = []
    initialData.forEach(dept => {
      dept.indicators.forEach((ind: any) => {
        // Use calculations.ts for YTD
        const numSum = ind.monthlyData.reduce((sum: number, m: any) => sum + (m.numerator || 0), 0)
        const denSum = ind.monthlyData.reduce((sum: number, m: any) => sum + (m.denominator || 0), 0)
        
        let ytdResult = null
        let isPass = null
        
        if (denSum > 0) {
          ytdResult = calculateResult(numSum, denSum, ind.unit)
          isPass = checkIsPass(ytdResult, ind.targetType, ind.targetValue)
        }

        list.push({
          ...ind,
          deptName: dept.name,
          deptId: dept.id,
          ytdResult,
          isPass,
          numSum,
          denSum
        })
      })
    })
    return list
  }, [initialData])

  // Filter lists based on selected department
  const filteredIndicatorsList = selectedDeptId === 'all' 
    ? allIndicatorsList 
    : allIndicatorsList.filter(i => i.deptId === selectedDeptId)

  // Calculate summary stats based on FILTERED indicators
  const summaryStats = useMemo(() => {
    let pass = 0
    let fail = 0
    let noData = 0
    const total = filteredIndicatorsList.length

    filteredIndicatorsList.forEach(ind => {
      if (ind.isPass === true) pass++
      else if (ind.isPass === false) fail++
      else noData++
    })

    return { pass, fail, noData, total }
  }, [filteredIndicatorsList])

  // Calculate department-level summaries
  const departmentSummaries = useMemo(() => {
    const depts: Record<string, { total: number, passed: number, deptName: string, inds: any[] }> = {}
    filteredIndicatorsList.forEach(ind => {
      if (!depts[ind.deptName]) {
        depts[ind.deptName] = { total: 0, passed: 0, deptName: ind.deptName, inds: [] }
      }
      depts[ind.deptName].inds.push(ind)
      depts[ind.deptName].total++
      if (ind.isPass === true) {
        depts[ind.deptName].passed++
      }
    })
    return Object.values(depts).map(dept => {
      const percent = dept.total > 0 ? (dept.passed / dept.total) * 100 : 0
      return { ...dept, percent }
    }).sort((a, b) => {
      if (sortOrder === 'desc') return b.percent - a.percent
      return a.percent - b.percent
    })
  }, [filteredIndicatorsList, sortOrder])

  const selectedKpiDetails = allIndicatorsList.find(i => i.id === selectedKpiId)

  const displayIndicators = selectedDeptFocus 
    ? filteredIndicatorsList.filter(i => i.deptName === selectedDeptFocus)
    : filteredIndicatorsList

  // Chart data for Department Overview
  const overviewChartData = useMemo(() => {
    const data = []
    for (let i = 0; i < 12; i++) {
      let pass = 0
      let fail = 0
      let noData = 0
      displayIndicators.forEach(ind => {
        const m = ind.monthlyData[i]
        if (m && m.denominator > 0) {
          if (m.isPass === true) pass++
          else if (m.isPass === false) fail++
        } else {
          noData++
        }
      })
      data.push({
        name: monthNames[i],
        ผ่านเกณฑ์: pass,
        ไม่ผ่านเกณฑ์: fail,
        ไม่มีข้อมูล: noData
      })
    }
    return data
  }, [displayIndicators])

  // Chart data for selected KPI
  const chartData = useMemo(() => {
    if (!selectedKpiDetails) return []
    
    let runningNum = 0
    let runningDen = 0
    
    return selectedKpiDetails.monthlyData.map((d: any, idx: number) => {
      const num = d.numerator || 0
      const den = d.denominator || 0
      
      runningNum += num
      runningDen += den
      
      const monthlyResult = calculateResult(num, den, selectedKpiDetails.unit)
      const ytdResult = calculateResult(runningNum, runningDen, selectedKpiDetails.unit)
      
      return {
        name: monthNames[idx],
        ผลงานรายเดือน: monthlyResult !== null ? Number(monthlyResult.toFixed(2)) : null,
        ผลงานสะสม: ytdResult !== null ? Number(ytdResult.toFixed(2)) : null,
        เป้าหมาย: selectedKpiDetails.targetValue,
        // Raw data for tooltip
        num, den, runningNum, runningDen
      }
    })
  }, [selectedKpiDetails])

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full mx-auto">
      
      {/* HEADER & FILTER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">ภาพรวมตัวชี้วัด (Executive Summary)</h1>
          <p className="text-slate-500 dark:text-slate-300 mt-1">สรุปสถานการณ์ตัวชี้วัดคุณภาพทางคลินิก ปีงบประมาณ 2569</p>
        </div>
        <div className="w-full sm:w-72">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">เลือกแผนก (PCT)</label>
          <Select value={selectedDeptId} onValueChange={(val) => val && setSelectedDeptId(val)}>
            <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm focus:ring-blue-500">
              <span data-slot="select-value" className="flex flex-1 text-left">
                {selectedDeptId === 'all' ? 'ดูภาพรวมทุกแผนก' : initialData.find(d => d.id === selectedDeptId)?.name || 'ทุกแผนก'}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ดูภาพรวมทุกแผนก</SelectItem>
              {initialData.map(dept => (
                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* DEPARTMENT SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        {departmentSummaries.map(dept => {
          const percent = dept.percent
          const radius = 24
          const circumference = 2 * Math.PI * radius
          const strokeDashoffset = circumference - (percent / 100) * circumference
          return (
            <Card key={dept.deptName} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-10 flex items-center justify-center mb-4">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2" title={dept.deptName}>{dept.deptName}</span>
                </div>
                
                <div className="relative flex items-center justify-center w-24 h-24 flex-shrink-0 mb-4">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-rose-500" />
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={(2 * Math.PI * 40) - (percent / 100) * (2 * Math.PI * 40)}
                      className="text-emerald-500 transition-all duration-1000 ease-in-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-lg font-bold text-emerald-700 dark:text-emerald-300">{Math.round(percent)}%</span>
                </div>

                <div className="flex flex-col bg-slate-50 dark:bg-slate-800/50 w-full py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-300 mb-0.5">ผ่านเกณฑ์</span>
                  <span className="text-sm font-bold text-emerald-600">{dept.passed} / {dept.total} ตัวชี้วัด</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* TWO COLUMN LAYOUT: List vs Detail */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        
        {/* KPI LIST (Left Column) */}
        <div className="lg:col-span-1 space-y-4 min-w-0">
          <Card className="shadow-sm border-slate-200 dark:border-slate-700">
            <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">รายการตัวชี้วัด</CardTitle>
                <CardDescription>คลิกเพื่อดูรายละเอียด</CardDescription>
              </div>
              <button 
                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors shadow-sm"
                title="เรียงตามเปอร์เซ็นต์ที่ผ่าน"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                เรียง % ({sortOrder === 'desc' ? 'มากไปน้อย' : 'น้อยไปมาก'})
              </button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto bg-white dark:bg-slate-900">
                {departmentSummaries.map(({ deptName, inds, total, passed, percent }) => {
                  const isExpanded = expandedDepts[deptName] === true // Default to false
                  const radius = 6;
                  const circumference = 2 * Math.PI * radius;
                  const strokeDashoffset = circumference - (percent / 100) * circumference;

                  return (
                  <div key={deptName} className="border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                    <div 
                      onClick={() => toggleDept(deptName)}
                      className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 sticky top-0 z-10 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 font-semibold text-sm text-indigo-900 dark:text-indigo-100 shadow-sm flex items-center justify-between cursor-pointer hover:bg-indigo-50/80 dark:hover:bg-indigo-900/30 dark:bg-indigo-900/30 transition-all duration-300"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                        {deptName}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="relative flex items-center justify-center w-8 h-8 flex-shrink-0">
                            <svg className="w-8 h-8 transform -rotate-90">
                              <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-rose-500" />
                              <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="3" fill="transparent"
                                strokeDasharray={2 * Math.PI * 13}
                                strokeDashoffset={(2 * Math.PI * 13) - (percent / 100) * (2 * Math.PI * 13)}
                                className="text-emerald-500 transition-all duration-1000 ease-in-out"
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute text-[8px] font-bold text-emerald-700 dark:text-emerald-300">{Math.round(percent)}%</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 dark:text-slate-300 font-medium leading-tight">ผ่านเกณฑ์</span>
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 leading-tight">{passed} / {total} ตัว</span>
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500 dark:text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-300" />}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="divide-y divide-slate-100">
                        {inds.map((ind: any) => (
                          <div 
                            key={ind.id}
                            onClick={() => setSelectedKpiId(ind.id)}
                            className={`p-4 cursor-pointer transition-all duration-300 ease-in-out ${selectedKpiId === ind.id ? 'bg-blue-50/60 border-l-4 border-blue-600 shadow-inner' : 'border-l-4 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:translate-x-1 hover:shadow-sm'}`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">{ind.name}</h4>
                                <div className="mt-2 flex items-center gap-2 text-xs">
                                  <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-medium shadow-sm">
                                    เป้า: {ind.targetType} {ind.targetValue} {ind.unit && ind.unit !== 'n/a' ? ind.unit : ''}
                                  </span>
                                  <span className="text-slate-500 dark:text-slate-300 font-medium">
                                    ผล: {ind.ytdResult !== null ? ind.ytdResult.toFixed(2) : '-'} {ind.ytdResult !== null && ind.unit && ind.unit !== 'n/a' ? ind.unit : ''}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-1 shrink-0">
                                {ind.isPass === true && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                {ind.isPass === false && <XCircle className="w-5 h-5 text-rose-500" />}
                                {ind.isPass === null && <AlertCircle className="w-5 h-5 text-amber-400" />}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )})}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPI DETAILS (Right Column) */}
        <div className="lg:col-span-2 min-w-0">
          {selectedKpiDetails ? (
            <Card className="shadow-sm border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className={`h-2 w-full ${
                selectedKpiDetails.isPass === true ? 'bg-emerald-500' : 
                selectedKpiDetails.isPass === false ? 'bg-rose-500' : 'bg-amber-400'
              }`} />
              
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="mb-2 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">{selectedKpiDetails.deptName}</Badge>
                    <CardTitle className="text-xl font-bold leading-tight text-slate-900 dark:text-white">{selectedKpiDetails.name}</CardTitle>
                  </div>
                  <Badge className={`px-3 py-1 text-sm font-medium ${
                    selectedKpiDetails.isPass === true ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:bg-emerald-900/50' : 
                    selectedKpiDetails.isPass === false ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:bg-rose-900/50' : 
                    'bg-amber-100 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                  }`}>
                    {selectedKpiDetails.isPass === true ? 'ผ่านเกณฑ์' : 
                     selectedKpiDetails.isPass === false ? 'ไม่ผ่านเกณฑ์' : 'ไม่มีข้อมูล'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 text-center border border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-300 font-medium mb-1">เป้าหมาย</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {selectedKpiDetails.targetType} {selectedKpiDetails.targetValue} <span className="text-sm font-normal text-slate-500 dark:text-slate-300">{selectedKpiDetails.unit}</span>
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 text-center border border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-300 font-medium mb-1">ผลงานสะสม (YTD)</p>
                    <p className={`text-2xl font-bold ${
                      selectedKpiDetails.isPass === true ? 'text-emerald-600' : 
                      selectedKpiDetails.isPass === false ? 'text-rose-600' : 'text-slate-900 dark:text-white'
                    }`}>
                      {selectedKpiDetails.ytdResult !== null ? selectedKpiDetails.ytdResult.toFixed(2) : '-'} <span className="text-sm font-normal text-slate-500 dark:text-slate-300">{selectedKpiDetails.unit}</span>
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 text-center border border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-300 font-medium mb-1">ความก้าวหน้า</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedKpiDetails.denSum > 0 ? (selectedKpiDetails.numSum + '/' + selectedKpiDetails.denSum) : '-'}
                    </p>
                  </div>
                </div>

                <div className="h-80 w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any, name: any) => {
                          if (name === 'เป้าหมาย') return [value, name]
                          return [`${value} ${selectedKpiDetails.unit}`, name]
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <ReferenceLine y={selectedKpiDetails.targetValue} stroke="#EF4444" strokeDasharray="5 5" label={{ position: 'right', value: 'เป้าหมาย', fill: '#EF4444', fontSize: 12 }} />
                      <Line type="monotone" dataKey="ผลงานสะสม" stroke="#3B82F6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                      <Line type="monotone" dataKey="ผลงานรายเดือน" stroke="#10B981" strokeWidth={2} dot={{r: 3}} strokeDasharray="3 3" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="md:hidden text-xs text-slate-500 dark:text-slate-300 mb-2 flex items-center justify-end gap-1">
                  <ArrowUpDown className="w-3 h-3 rotate-90" />
                  <span>เลื่อนซ้าย-ขวาเพื่อดูข้อมูลเพิ่มเติม</span>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 custom-scrollbar">
                  <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
                    <thead className="text-xs text-slate-700 dark:text-slate-200 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-4 py-3">ข้อมูล</th>
                        {monthNames.map(m => <th key={m} className="px-2 py-3 text-center">{m}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50">ผลงาน (Numerator)</td>
                        {chartData.map((d: any, i: number) => <td key={i} className="px-2 py-3 text-center">{d.num || '-'}</td>)}
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50">เป้าหมาย (Denominator)</td>
                        {chartData.map((d: any, i: number) => <td key={i} className="px-2 py-3 text-center">{d.den || '-'}</td>)}
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50">ผลลัพธ์รายเดือน</td>
                        {chartData.map((d: any, i: number) => (
                          <td key={i} className="px-2 py-3 text-center font-semibold text-blue-600">
                            {d.ผลงานรายเดือน !== null ? d.ผลงานรายเดือน : '-'}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in duration-500">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  สรุปผลรายเดือน: {selectedDeptFocus ? selectedDeptFocus : (selectedDeptId === 'all' ? 'ภาพรวมทุกแผนก' : initialData.find(d => d.id === selectedDeptId)?.name)}
                </CardTitle>
                <CardDescription>
                  กราฟแสดงจำนวนตัวชี้วัดที่ผ่านเกณฑ์และไม่ผ่านเกณฑ์ในแต่ละเดือน และตารางรายละเอียด (คลิกที่ตัวชี้วัดเพื่อดูข้อมูล)
                  <span className="block mt-2 md:hidden text-indigo-600 font-medium text-xs flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3 rotate-90" />
                    เลื่อนซ้าย-ขวาที่ตารางเพื่อดูข้อมูลทั้งหมด
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto custom-scrollbar max-h-[800px]">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="h-[250px] w-full min-w-[600px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={overviewChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Bar dataKey="ผ่านเกณฑ์" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40}>
                          <LabelList dataKey="ผ่านเกณฑ์" position="top" formatter={(val: any) => val > 0 ? val : ''} fill="#10b981" fontSize={11} fontWeight={600} />
                        </Bar>
                        <Bar dataKey="ไม่ผ่านเกณฑ์" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40}>
                          <LabelList dataKey="ไม่ผ่านเกณฑ์" position="top" formatter={(val: any) => val > 0 ? val : ''} fill="#f43f5e" fontSize={11} fontWeight={600} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {Object.entries(
                  displayIndicators.reduce((acc, ind) => {
                    if (!acc[ind.deptName]) acc[ind.deptName] = []
                    acc[ind.deptName].push(ind)
                    return acc
                  }, {} as Record<string, typeof filteredIndicatorsList>)
                ).map(([deptName, inds]) => (
                  <div key={deptName} className="mb-0">
                    <div className="bg-indigo-50/80 dark:bg-indigo-900/30 px-4 py-2 border-y border-indigo-100 font-semibold text-indigo-900 dark:text-indigo-100 text-sm sticky left-0">
                      {deptName}
                    </div>
                    <table className="w-full text-xs text-left border-collapse min-w-[800px]">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-3 font-medium min-w-[250px] max-w-[300px] sticky left-0 bg-slate-50 dark:bg-slate-800/50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10">ตัวชี้วัด</th>
                          <th className="p-3 font-medium text-center border-r border-slate-100 dark:border-slate-800">เป้า</th>
                          {monthNames.map(m => <th key={m} className="p-2 font-medium text-center">{m}</th>)}
                          <th className="p-3 font-medium text-center border-l border-slate-200 dark:border-slate-700 bg-amber-50 dark:bg-amber-900/20/50 dark:bg-amber-900/20">YTD</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(inds as any[]).map((ind: any) => (
                          <tr key={ind.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group" onClick={() => setSelectedKpiId(ind.id)}>
                            <td className="p-3 sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10">
                              <p className="font-medium text-slate-800 dark:text-slate-100 line-clamp-2" title={ind.name}>{ind.name}</p>
                            </td>
                            <td className="p-3 text-center whitespace-nowrap border-r border-slate-100 dark:border-slate-800">
                              <Badge variant="outline" className="text-[10px] bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-mono shadow-sm">
                                {ind.targetType} {ind.targetValue}
                              </Badge>
                            </td>
                            {ind.monthlyData.map((m: any, idx: number) => (
                              <td key={idx} className="p-1.5 align-middle">
                                {m.denominator > 0 ? (
                                  <div 
                                    className={`w-full min-w-[36px] py-1 px-1 rounded-md text-[11px] font-bold text-center transition-all group-hover:scale-[1.05] shadow-sm ${
                                      m.isPass === true 
                                        ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200' 
                                        : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200'
                                    }`} 
                                    title={`${monthNames[idx]} - ผล: ${m.result !== null ? m.result.toFixed(2) : '-'} (${m.isPass ? 'ผ่าน' : 'ไม่ผ่าน'})`}
                                  >
                                    {m.result !== null ? Number(m.result.toFixed(2)) : '-'}
                                  </div>
                                ) : (
                                  <div className="w-full min-w-[36px] py-1 px-1 rounded-md text-[11px] font-medium text-center bg-slate-50 dark:bg-slate-800/50 text-slate-300 border border-slate-100 dark:border-slate-800" title="ไม่มีข้อมูล">
                                    -
                                  </div>
                                )}
                              </td>
                            ))}
                            <td className="p-3 text-center border-l border-slate-200 dark:border-slate-700 bg-amber-50 dark:bg-amber-900/20/20 dark:bg-amber-900/10">
                              {ind.denSum > 0 ? (
                                <Badge className={`px-2 py-0.5 text-[10px] font-semibold ${ind.isPass === true ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'}`}>
                                  {ind.ytdResult !== null ? ind.ytdResult.toFixed(2) : '-'}
                                </Badge>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  )
}
