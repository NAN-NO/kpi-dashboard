import React, { useMemo } from 'react';
import { KPI } from '@/utils/kpiLogic';

interface Props {
  kpis: KPI[];
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedKpiIndex: number;
  setSelectedKpiIndex: (i: number) => void;
}

export function KpiSelector({ kpis, selectedCategory, setSelectedCategory, selectedKpiIndex, setSelectedKpiIndex }: Props) {
  const categories = useMemo(() => ['ALL', ...new Set(kpis.map(k => k.category))], [kpis]);

  const filteredKpis = useMemo(() => {
    return kpis.map((kpi, idx) => ({ ...kpi, globalIndex: idx }))
      .filter(kpi => selectedCategory === 'ALL' || kpi.category === selectedCategory);
  }, [kpis, selectedCategory]);

  const currentKpi = kpis[selectedKpiIndex];

  return (
    <section 
      className="rounded-xl shadow-md border border-indigo-200 px-3 py-2.5 no-print overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 75%, #6d28d9 100%)',
        boxShadow: '0 4px 20px rgba(67,56,202,0.30)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 rounded bg-white/15 flex items-center justify-center border border-white/20">
          <svg className="w-3 h-3 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </div>
        <div>
          <h3 className="text-white font-bold text-xs tracking-wide">เลือกตัวชี้วัด</h3>
          <p className="text-indigo-200 text-[10px]">เลือกกลุ่มงาน PCT และตัวชี้วัดที่ต้องการดูรายละเอียด</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 items-end">
        <div style={{ minWidth: '160px', flex: 1 }}>
          <label className="block text-[10px] font-bold text-indigo-200 mb-1 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 inline-block"></span>
            กลุ่มงาน / PCT
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              // reset kpi selection on category change to the first available in that category
              const firstMatch = kpis.findIndex(k => e.target.value === 'ALL' || k.category === e.target.value);
              if (firstMatch !== -1) setSelectedKpiIndex(firstMatch);
            }}
            className="w-full rounded-lg border-0 px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-400 outline-none text-xs font-semibold text-indigo-900"
            style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'ALL' ? 'แสดงทุกกลุ่มงาน' : c}</option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: '260px', flex: 3 }}>
          <label className="block text-[10px] font-bold text-indigo-200 mb-1 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-300 inline-block"></span>
            เลือกตัวชี้วัด (KPI)
          </label>
          <select
            value={selectedKpiIndex}
            onChange={(e) => setSelectedKpiIndex(parseInt(e.target.value))}
            className="w-full rounded-lg border-0 px-2.5 py-1.5 focus:ring-2 focus:ring-purple-400 outline-none font-semibold text-xs text-indigo-900"
            style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
          >
            {filteredKpis.map(k => (
              <option key={k.globalIndex} value={k.globalIndex}>
                [{k.category}] {k.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end pb-0.5">
          {currentKpi && (
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 border border-white/20 backdrop-blur ${currentKpi.isHDC ? 'bg-amber-400/90 text-amber-900 border-amber-300/50' : 'bg-blue-400/90 text-blue-900 border-blue-300/50'}`}>
              {currentKpi.isHDC ? '📊 HDC Data KPI' : '🏥 Internal KPI'}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
