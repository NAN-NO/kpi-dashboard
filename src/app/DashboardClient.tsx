'use client'

import React, { useState, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { OverviewSection } from '@/components/dashboard/OverviewSection';
import { KpiSelector } from '@/components/dashboard/KpiSelector';
import { KpiDetailCard } from '@/components/dashboard/KpiDetailCard';
import { ChartsRow } from '@/components/dashboard/ChartsRow';
import { MonthlyTable } from '@/components/dashboard/MonthlyTable';
import { QuarterlySummary } from '@/components/dashboard/QuarterlySummary';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { updateMonthlyData } from './actions';
import { updateQuarterlySummary } from './actions/quarterly';
import { evaluateKpiSummaryStatus } from '@/utils/kpiLogic';
import { toast } from 'react-hot-toast';

export function DashboardClient({ initialData }: { initialData: any[] }) {
  const { data: session } = useSession();

  // Transform initialData into our appData format
  const appData = useMemo(() => {
    const list: any[] = [];
    (initialData ?? []).forEach(dept => {
      (dept?.indicators ?? []).forEach((ind: any) => {
        const monthlyData = Array.from({ length: 12 }, (_, i) => {
          const m = ind.monthlyData?.find((md: any) => md.month === i + 1);
          // Support both legacy (num=0, den=null) and new (num=null, den=null) as empty
          const isEmpty = (m?.numerator === 0 && m?.denominator === null) || (m?.numerator === null && m?.denominator === null);
          // Auto-set actual to '0' on load if denominator exists but numerator is null
          let actualVal = null;
          if (!isEmpty) {
            if (m?.numerator !== undefined && m?.numerator !== null) {
              actualVal = String(m.numerator);
            } else if (m?.denominator !== null) {
              actualVal = '0';
            }
          }

          return {
            id: m?.id,
            actual: actualVal,
            target: m?.denominator !== undefined && m?.denominator !== null ? String(m.denominator) : null
          };
        });

        const quarterlyData = [
          ind.quarterlyData?.[0]?.q1Text || '',
          ind.quarterlyData?.[0]?.q2Text || '',
          ind.quarterlyData?.[0]?.q3Text || '',
          ind.quarterlyData?.[0]?.q4Text || ''
        ];

        const rawUnit = ind.unit !== 'n/a' ? ind.unit : '';
        const displayUnit = rawUnit.replace(/ต่อ\s*/g, ': ');

        list.push({
          id: ind.id,
          category: dept.name,
          name: ind.name,
          isHDC: false,
          numeratorLabel: 'ผลงาน (Numerator)',
          denominatorLabel: 'เป้าหมาย (Denominator)',
          targetText: `${ind.targetType} ${ind.targetValue} ${displayUnit}`.trim(),
          targetValue: parseFloat(ind.targetValue) || 0,
          operator: ind.targetType,
          unit: displayUnit,
          monthlyData,
          analysis: quarterlyData,
          year: 2569
        });
      });
    });
    return list;
  }, [initialData]);

  // Client side state for the data, so it updates immediately when user types
  const [data, setData] = useState(appData);

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedKpiIndex, setSelectedKpiIndex] = useState(0);
  const [overviewCollapsed, setOverviewCollapsed] = useState(false);
  const [detailsCollapsed, setDetailsCollapsed] = useState(false);

  // Auto-detect latest month (simplified logic)
  const latestMonthIdx = useMemo(() => {
    let latest = 0;
    data.forEach(kpi => {
      kpi.monthlyData?.forEach((md: any, i: number) => {
        if (md?.actual !== null || md?.target !== null) {
          if (i > latest) latest = i;
        }
      });
    });
    return latest;
  }, [data]);

  // Calculate Overview
  const overview = useMemo(() => {
    let passCount = 0, failCount = 0, noDataCount = 0;
    const fails: any[] = [];
    data.forEach(kpi => {
      const summary = evaluateKpiSummaryStatus(kpi, latestMonthIdx);
      if (summary.status === 'pass') passCount++;
      else if (summary.status === 'fail') {
        failCount++;
        fails.push({ ...kpi, rate: summary.rate });
      } else noDataCount++;
    });
    return { passCount, failCount, noDataCount, fails, totalCount: data.length };
  }, [data, latestMonthIdx]);

  const handleUpdateMonthly = useCallback(async (kpiId: number, monthIdx: number, type: 'actual' | 'target', value: number | null) => {
    // Save previous state for rollback
    const prevData = data.map(d => ({ ...d, monthlyData: d.monthlyData.map((md: any) => ({ ...md })) }));

    // Optimistic UI update
    const newData = [...data];
    const kpiIdx = newData.findIndex(k => k.id === kpiId);
    if (kpiIdx === -1) return;

    newData[kpiIdx] = {
      ...newData[kpiIdx],
      monthlyData: newData[kpiIdx].monthlyData.map((md: any, i: number) =>
        i === monthIdx ? { ...md, [type]: value !== null ? String(value) : null } : md
      )
    };
    setData(newData);

    const md = newData[kpiIdx].monthlyData[monthIdx];
    // Sync to DB
    if (md?.id) {
      try {
        await updateMonthlyData(
          md.id,
          type === 'actual' ? (value ?? 0) : Number(md.actual || 0),
          type === 'target' ? value : (md.target !== null ? Number(md.target) : null)
        );
      } catch (error) {
        // Rollback on failure
        setData(prevData);
        toast.error('บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่');
      }
    }
  }, [data]);

  const handleUpdateQuarterly = useCallback(async (kpiId: number, qIdx: number, text: string) => {
    // Save previous state for rollback
    const prevData = data.map(d => ({ ...d, analysis: [...d.analysis] }));

    // Optimistic UI update
    const newData = [...data];
    const kpiIdx = newData.findIndex(k => k.id === kpiId);
    if (kpiIdx === -1) return;

    newData[kpiIdx] = {
      ...newData[kpiIdx],
      analysis: newData[kpiIdx].analysis.map((a: string, i: number) => i === qIdx ? text : a)
    };
    setData(newData);

    const kpi = newData[kpiIdx];
    // Sync to DB
    try {
      await updateQuarterlySummary({
        indicatorId: kpi.id,
        year: kpi.year,
        q1Text: kpi.analysis[0],
        q2Text: kpi.analysis[1],
        q3Text: kpi.analysis[2],
        q4Text: kpi.analysis[3],
      });
    } catch (error) {
      // Rollback on failure
      setData(prevData);
      toast.error('บันทึกข้อมูลไตรมาสไม่สำเร็จ กรุณาลองใหม่');
    }
  }, [data]);

  const currentKpi = data[selectedKpiIndex];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-200 font-sans selection:bg-indigo-200 dark:selection:bg-indigo-900 selection:text-indigo-900 dark:selection:text-indigo-100 relative transition-colors duration-300">
      <main className="px-4 py-4 w-full max-w-[2000px] mx-auto">
        
        {/* Toggle Overview Button */}
        <div className="flex justify-end mb-2 no-print">
          <button 
            onClick={() => setOverviewCollapsed(!overviewCollapsed)}
            className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            {overviewCollapsed ? 'แสดง Dashboard ภาพรวม' : 'ซ่อน Dashboard ภาพรวม'}
            <svg 
              className="w-4 h-4 transition-transform duration-200" 
              style={{ transform: overviewCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/>
            </svg>
          </button>
        </div>

        {!overviewCollapsed && (
          <ErrorBoundary fallbackTitle="ไม่สามารถแสดงข้อมูลภาพรวมได้">
            <OverviewSection 
              total={overview.totalCount} 
              pass={overview.passCount} 
              fail={overview.failCount} 
              noData={overview.noDataCount} 
              kpis={overview.fails} 
            />
          </ErrorBoundary>
        )}

        {/* Toggle Detail Section Button */}
        <div className="flex justify-center my-1 no-print">
          <button 
            onClick={() => setDetailsCollapsed(!detailsCollapsed)}
            className="group flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all active:scale-95"
          >
            <span>{detailsCollapsed ? 'แสดงรายละเอียดตัวชี้วัดทั้งหมด' : 'ปิดการแสดงรายละเอียดตัวชี้วัด'}</span>
            <svg 
              className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition" 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              {detailsCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/>
              )}
            </svg>
          </button>
        </div>

        {!detailsCollapsed && currentKpi && (
          <ErrorBoundary fallbackTitle="ไม่สามารถแสดงรายละเอียดตัวชี้วัดได้">
            <div className="space-y-1">
              <KpiSelector 
                kpis={data}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedKpiIndex={selectedKpiIndex}
                setSelectedKpiIndex={setSelectedKpiIndex}
              />

              <div key={currentKpi.id} className="flex flex-col gap-1.5 mt-2">
                <KpiDetailCard kpi={currentKpi} allKpis={data} />
                <ChartsRow kpi={currentKpi} />
                <MonthlyTable kpi={currentKpi} session={session} updateMonthlyData={handleUpdateMonthly} />
                <QuarterlySummary kpi={currentKpi} session={session} updateQuarterlyData={handleUpdateQuarterly} />
              </div>
            </div>
          </ErrorBoundary>
        )}

      </main>
    </div>
  );
}
