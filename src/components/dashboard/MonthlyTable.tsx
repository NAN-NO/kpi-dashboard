import React, { useState, useEffect } from 'react';
import { KPI, calcRate, checkPassTarget } from '@/utils/kpiLogic';
import { Edit2, Save, X, Loader2 } from 'lucide-react';

interface Props {
  kpi: KPI;
  session: any;
  onBatchSave: (localData: any[]) => void;
  isSaving?: boolean;
}

export function MonthlyTable({ kpi, session, onBatchSave, isSaving }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState([...kpi.monthlyData]);

  // Sync localData when kpi data changes from outside (e.g. after save)
  useEffect(() => {
    if (!isEditing) {
      setLocalData([...kpi.monthlyData]);
    }
  }, [kpi.monthlyData, isEditing]);

  let sumNum = 0, sumDen = 0, latestActual: number | null = null, latestTarget: number | null = null;
  
  localData.forEach(md => {
    if (md.target !== null && md.target !== '') {
      sumDen += parseFloat(md.target as string);
      latestTarget = parseFloat(md.target as string);
    }
    if (md.actual !== null && md.actual !== '') {
      sumNum += parseFloat(md.actual as string);
      latestActual = parseFloat(md.actual as string);
    }
  });
  
  const handleInput = (mIdx: number, type: 'actual' | 'target', valStr: string) => {
    const newData = [...localData];
    newData[mIdx] = { ...newData[mIdx], [type]: valStr === '' ? null : valStr };
    setLocalData(newData);
  };

  const handleToggleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent collapsing the table
    if (!session || isSaving) return;
    
    if (isEditing) {
      // Save changes
      onBatchSave(localData);
      // Don't set isEditing false yet, let it stay editing while loading
    } else {
      // Start editing
      setIsEditing(true);
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaving) return;
    setLocalData([...kpi.monthlyData]);
    setIsEditing(false);
  };

  // Turn off editing mode automatically when save finishes
  useEffect(() => {
    if (isEditing && !isSaving && localData.every((md, i) => md.actual === kpi.monthlyData[i].actual && md.target === kpi.monthlyData[i].target)) {
      setIsEditing(false);
    }
  }, [isSaving, kpi.monthlyData]);

  const actualLabel = kpi.isHDC ? 'ผล (สะสม)' : 'ผล';
  const targetLabel = kpi.isHDC ? 'เป้า (ผู้รับผิดชอบ)' : 'เป้า';

  return (
    <section className="bg-white dark:bg-slate-900 rounded-lg shadow border border-blue-200 dark:border-blue-900/50 overflow-hidden flex-shrink-0 w-full">
      <div 
        className="px-2 py-1 section-header-blue flex items-center justify-between cursor-pointer select-none"
        onClick={() => setCollapsed(!collapsed)}
        title="คลิกเพื่อย่อ/ขยาย"
      >
        <h3 className="font-semibold text-white text-xs flex items-center gap-1.5">
          <svg className="w-3 h-3 text-blue-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18M10 6h4M10 18h4"/>
          </svg>
          ตารางบันทึกข้อมูลรายเดือน
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="text-white/60 text-[10px]">คลิกเพื่อย่อ/ขยาย</span>
          
          {session && (
            <div className="flex items-center gap-1 ml-2 mr-1">
              {isEditing && (
                <button 
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className={`p-1 rounded transition-colors ${isSaving ? 'text-white/50 cursor-not-allowed' : 'text-white hover:bg-rose-500 hover:text-white'}`}
                  title="ยกเลิก"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button 
                onClick={handleToggleEdit}
                disabled={isSaving}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                  isEditing 
                    ? isSaving 
                      ? 'bg-slate-500 cursor-not-allowed text-white shadow-sm' 
                      : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-sm' 
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {isEditing ? (
                  isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />
                ) : <Edit2 className="w-3 h-3" />}
                {isEditing ? (isSaving ? 'กำลังบันทึก...' : 'บันทึก') : 'แก้ไข'}
              </button>
            </div>
          )}

          <svg 
            className="w-3.5 h-3.5 text-white/80 transition-transform duration-200 ml-1"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/>
          </svg>
        </div>
      </div>
      {!collapsed && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <th className="px-2 py-0.5 font-bold min-w-[130px]">ข้อมูลรายเดือน</th>
                {['ต.ค.','พ.ย.','ธ.ค.','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.'].map(m => (
                  <th key={m} className="px-0.5 py-0.5 text-center font-bold w-10">{m}</th>
                ))}
                <th className="px-1.5 py-0.5 text-center font-bold w-14 border-l border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">สะสม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {/* Target Row */}
              <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition text-xs">
                <td className="px-2.5 py-1.5 min-w-[210px] whitespace-normal break-words leading-snug" title={kpi.denominatorLabel}>
                  <span className="inline-block text-[10px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded px-1 mr-1 leading-tight align-middle">{targetLabel}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{kpi.denominatorLabel}{kpi.isHDC && <span className="text-amber-600 dark:text-amber-400 font-bold ml-1 text-[9px]">(จำนวนทั้งหมด)</span>}</span>
                </td>
                {localData.map((md, i) => {
                  return (
                    <td key={i} className="px-0.5 py-0.5 text-center">
                      {isEditing ? (
                        <input 
                          type="number" 
                          placeholder="-"
                          value={md.target ?? ''}
                          onChange={(e) => handleInput(i, 'target', e.target.value)}
                          onFocus={e => e.target.select()}
                          onClick={e => e.stopPropagation()}
                          disabled={isSaving}
                          className="w-12 min-h-[32px] md:min-h-[36px] text-center border border-slate-200 dark:border-slate-700 rounded p-0.5 text-xs focus:border-blue-500 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      ) : (
                        <div className="w-12 min-h-[32px] md:min-h-[36px] flex items-center justify-center border border-transparent p-0.5 text-xs text-slate-900 dark:text-slate-100 font-medium">
                          {md.target ?? '-'}
                        </div>
                      )}
                    </td>
                  );
                })}
                {kpi.isHDC ? (
                  <td className="px-2 py-1.5 text-center bg-slate-100 dark:bg-slate-800/80 font-semibold border-l border-slate-200 dark:border-slate-700">
                    {latestTarget !== null ? (latestTarget as number).toLocaleString() : '-'}
                  </td>
                ) : (
                  <td className="px-2 py-1 text-center bg-slate-100 dark:bg-slate-800/80 border-l border-slate-200 dark:border-slate-700 leading-tight" rowSpan={2}>
                    <div className="font-bold text-blue-700 dark:text-blue-400 text-sm">{sumDen.toLocaleString()}</div>
                    <div className="w-8 h-px bg-slate-400 dark:bg-slate-600 mx-auto my-0.5"></div>
                    <div className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">{sumNum.toLocaleString()}</div> {/* we'll render this below but HTML needs it in one cell for rowspan */}
                  </td>
                )}
              </tr>

              {/* Actual Row */}
              <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition text-xs">
                <td className="px-2.5 py-1.5 min-w-[210px] whitespace-normal break-words leading-snug" title={kpi.numeratorLabel}>
                  <span className="inline-block text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded px-1 mr-1 leading-tight align-middle">{actualLabel}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{kpi.numeratorLabel}</span>
                </td>
                {localData.map((md, i) => {
                  return (
                    <td key={i} className="px-0.5 py-0.5 text-center">
                      {isEditing ? (
                        <input 
                          type="number" 
                          placeholder="-"
                          value={md.actual ?? ''}
                          onChange={(e) => handleInput(i, 'actual', e.target.value)}
                          onFocus={e => e.target.select()}
                          onClick={e => e.stopPropagation()}
                          disabled={isSaving}
                          className="w-12 min-h-[32px] md:min-h-[36px] text-center border border-slate-200 dark:border-slate-700 rounded p-0.5 text-xs focus:border-blue-500 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      ) : (
                        <div className="w-12 min-h-[32px] md:min-h-[36px] flex items-center justify-center border border-transparent p-0.5 text-xs text-slate-900 dark:text-slate-100 font-medium">
                          {md.actual ?? '-'}
                        </div>
                      )}
                    </td>
                  );
                })}
                {kpi.isHDC && (
                  <td className="px-2 py-1.5 text-center bg-slate-100 dark:bg-slate-800/80 font-semibold border-l border-slate-200 dark:border-slate-700">
                    {latestActual !== null ? (latestActual as number).toLocaleString() : '-'}
                  </td>
                )}
              </tr>

              {/* Rate Row */}
              <tr className="bg-slate-50/40 dark:bg-slate-800/20 text-xs">
                <td className="px-2.5 py-1.5 font-bold text-slate-600 dark:text-slate-400">
                  ผลลัพธ์{kpi.isHDC && <span className="text-[9px] font-normal text-amber-600 dark:text-amber-400"> (ณ เดือนนั้น)</span>}
                </td>
                {localData.map((md, i) => {
                  const num = md.actual !== null && md.actual !== '' ? parseFloat(md.actual) : null;
                  const den = md.target !== null && md.target !== '' ? parseFloat(md.target) : null;
                  let rateStr = '-';
                  let passClass = 'text-slate-400';
                  
                  if (den && den > 0 && num !== null) {
                    const r = calcRate(num, den, kpi.unit);
                    rateStr = r.toFixed(2);
                    passClass = checkPassTarget(r, kpi.operator, kpi.targetValue) ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold';
                  }

                  return (
                    <td key={i} className={`px-0.5 py-0.5 text-center ${passClass}`}>
                      {rateStr}
                    </td>
                  );
                })}
                {(() => {
                  let totalRateStr = '-';
                  let totalPassClass = 'text-slate-500';
                  
                  if (kpi.isHDC) {
                    if (latestActual !== null && latestTarget !== null && latestTarget > 0) {
                      const r = calcRate(latestActual, latestTarget, kpi.unit);
                      totalRateStr = r.toFixed(2);
                      totalPassClass = checkPassTarget(r, kpi.operator, kpi.targetValue) ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold';
                    }
                  } else {
                    if (sumDen > 0) {
                      const r = calcRate(sumNum, sumDen, kpi.unit);
                      totalRateStr = r.toFixed(2);
                      totalPassClass = checkPassTarget(r, kpi.operator, kpi.targetValue) ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold';
                    }
                  }

                  return (
                    <td className={`px-2 py-1.5 text-center ${totalPassClass} border-l border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/20 font-bold`}>
                      {totalRateStr}
                    </td>
                  );
                })()}
              </tr>
            </tbody>
          </table>
          
          {/* Fix for rowspan rendering (since React renders rows sequentially)
              In the code above, the Actual Row misses a td if it's not HDC because Target Row uses rowspan=2.
              This is valid HTML and will render correctly. */}
        </div>
      )}
    </section>
  );
}
