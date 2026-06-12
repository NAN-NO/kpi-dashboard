'use client'

import React, { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { OverviewSection } from '@/components/dashboard/OverviewSection';
import { KpiSelector } from '@/components/dashboard/KpiSelector';
import { KpiDetailCard } from '@/components/dashboard/KpiDetailCard';
import { ChartsRow } from '@/components/dashboard/ChartsRow';
import { MonthlyTable } from '@/components/dashboard/MonthlyTable';
import { QuarterlySummary } from '@/components/dashboard/QuarterlySummary';
import { updateMonthlyData } from './actions';
import { updateQuarterlySummary } from './actions/quarterly';
import { evaluateKpiSummaryStatus } from '@/utils/kpiLogic';

export function DashboardClient({ initialData }: { initialData: any[] }) {
  const { data: session } = useSession();

  // Transform initialData into our appData format
  const appData = useMemo(() => {
    const list: any[] = [];
    initialData.forEach(dept => {
      dept.indicators.forEach((ind: any) => {
        const monthlyData = Array.from({ length: 12 }, (_, i) => {
          const m = ind.monthlyData.find((md: any) => md.month === i + 1);
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

        list.push({
          id: ind.id,
          category: dept.name,
          name: ind.name,
          isHDC: false, // You might need to derive this from your DB if you added it
          numeratorLabel: 'ผลงาน (Numerator)',
          denominatorLabel: 'เป้าหมาย (Denominator)',
          targetText: `${ind.targetType} ${ind.targetValue} ${ind.unit !== 'n/a' ? ind.unit : ''}`,
          targetValue: parseFloat(ind.targetValue),
          operator: ind.targetType,
          unit: ind.unit !== 'n/a' ? ind.unit : '',
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
      kpi.monthlyData.forEach((md: any, i: number) => {
        if (md.actual !== null || md.target !== null) {
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

  const handleUpdateMonthly = async (kpiId: number, monthIdx: number, type: 'actual' | 'target', value: number | null) => {
    // Optimistic UI update
    const newData = [...data];
    const kpiIdx = newData.findIndex(k => k.id === kpiId);
    if (kpiIdx !== -1) {
      newData[kpiIdx].monthlyData[monthIdx][type] = value !== null ? String(value) : null;
      setData(newData);

      const md = newData[kpiIdx].monthlyData[monthIdx];
      // Sync to DB
      if (md.id) {
        await updateMonthlyData(
          md.id,
          type === 'actual' ? (value || 0) : Number(md.actual || 0),
          type === 'target' ? value : (md.target !== null ? Number(md.target) : null)
        );
      }
    }
  };

  const handleUpdateQuarterly = async (kpiId: number, qIdx: number, text: string) => {
    // Optimistic UI update
    const newData = [...data];
    const kpiIdx = newData.findIndex(k => k.id === kpiId);
    if (kpiIdx !== -1) {
      newData[kpiIdx].analysis[qIdx] = text;
      setData(newData);

      const kpi = newData[kpiIdx];
      // Sync to DB
      await updateQuarterlySummary({
        indicatorId: kpi.id,
        year: kpi.year,
        q1Text: kpi.analysis[0],
        q2Text: kpi.analysis[1],
        q3Text: kpi.analysis[2],
        q4Text: kpi.analysis[3],
      });
    }
  };

  const currentKpi = data[selectedKpiIndex];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans selection:bg-indigo-200 selection:text-indigo-900 relative">
      <main className="px-4 py-4 w-full max-w-[2000px] mx-auto">
        
        {/* Toggle Overview Button */}
        <div className="flex justify-end mb-2 no-print">
          <button 
            onClick={() => setOverviewCollapsed(!overviewCollapsed)}
            className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
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
          <OverviewSection 
            total={overview.totalCount} 
            pass={overview.passCount} 
            fail={overview.failCount} 
            noData={overview.noDataCount} 
            kpis={overview.fails} 
          />
        )}

        {/* Toggle Detail Section Button */}
        <div className="flex justify-center my-1 no-print">
          <button 
            onClick={() => setDetailsCollapsed(!detailsCollapsed)}
            className="group flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
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
          <div className="space-y-1">
            <KpiSelector 
              kpis={data}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedKpiIndex={selectedKpiIndex}
              setSelectedKpiIndex={setSelectedKpiIndex}
            />

            <div className="flex flex-col gap-1.5 mt-2">
              <KpiDetailCard kpi={currentKpi} allKpis={data} />
              <ChartsRow kpi={currentKpi} />
              <MonthlyTable kpi={currentKpi} session={session} updateMonthlyData={handleUpdateMonthly} />
              <QuarterlySummary kpi={currentKpi} session={session} updateQuarterlyData={handleUpdateQuarterly} />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
