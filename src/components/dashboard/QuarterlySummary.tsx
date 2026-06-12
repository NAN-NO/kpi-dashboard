import React, { useState } from 'react';
import { KPI, calcRate, checkPassTarget } from '@/utils/kpiLogic';

interface Props {
  kpi: KPI;
  session: any;
  updateQuarterlyData: (kpiId: number, qIdx: number, text: string) => void;
}

const QUARTERS = [
  { name: 'ไตรมาส 1', months: [0, 1, 2] },
  { name: 'ไตรมาส 2', months: [3, 4, 5] },
  { name: 'ไตรมาส 3', months: [6, 7, 8] },
  { name: 'ไตรมาส 4', months: [9, 10, 11] }
];

export function QuarterlySummary({ kpi, session, updateQuarterlyData }: Props) {
  // We determine the current month from the latest month that has any data across the app.
  // For simplicity here, we look at this KPI's latest month.
  let currentMonthIdx = 0;
  kpi.monthlyData.forEach((md, i) => {
    if ((md.actual !== null && md.actual !== '') || (md.target !== null && md.target !== '')) {
      currentMonthIdx = i;
    }
  });

  const [locks, setLocks] = useState([true, true, true, true]);
  const [analysisTexts, setAnalysisTexts] = useState(kpi.analysis || ['', '', '', '']);

  const handleToggleLock = (qIdx: number) => {
    if (!session) {
      alert('ต้องเข้าสู่ระบบเพื่อแก้ไขข้อมูล');
      return;
    }
    const newLocks = [...locks];
    if (newLocks[qIdx]) {
      // Unlocking
      newLocks[qIdx] = false;
      setLocks(newLocks);
    } else {
      // Saving and locking
      newLocks[qIdx] = true;
      setLocks(newLocks);
      updateQuarterlyData(kpi.id, qIdx, analysisTexts[qIdx]);
    }
  };

  return (
    <section className="bg-white rounded-lg shadow border border-emerald-200 overflow-hidden w-full">
      <div className="px-2 py-1 flex justify-between items-center" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)' }}>
        <h3 className="font-semibold text-white text-xs">สรุปผลประจำไตรมาส + วิเคราะห์ปัญหา</h3>
        <span className="text-[9px] text-emerald-200 font-medium">4 ไตรมาส</span>
      </div>
      <div className="flex flex-col gap-2 p-2 bg-slate-50/50">
        {QUARTERS.map((q, qIdx) => {
          let qNum = 0, qDen = 0, hasData = false, monthsWithData = 0;
          let qLatestActual: number | null = null, qLatestTarget: number | null = null;

          q.months.forEach(mIdx => {
            const m = kpi.monthlyData[mIdx];
            if (m && m.actual !== null && m.actual !== '') { 
              qNum += parseFloat(m.actual); 
              hasData = true; 
              monthsWithData++; 
              qLatestActual = parseFloat(m.actual); 
            }
            if (m && m.target !== null && m.target !== '') { 
              qDen += parseFloat(m.target); 
              qLatestTarget = parseFloat(m.target); 
            }
          });

          const qFirstMonthIdx = q.months[0];
          const qLastMonthIdx = q.months[2];
          const quarterNotStarted = currentMonthIdx < qFirstMonthIdx;
          const quarterNotEnded = currentMonthIdx < qLastMonthIdx;
          const isComplete = monthsWithData >= 3;

          let rateStr = '-', statusText = 'ไม่มีข้อมูล';
          let cardClass = 'bg-white border-slate-200 text-slate-400';
          let badgeClass = 'bg-slate-100 text-slate-600';
          let headerBg = 'linear-gradient(135deg, #1e293b 0%, #475569 100%)';
          let isPending = false;

          const dispActual = hasData ? (kpi.isHDC && qLatestActual !== null ? (qLatestActual as number) : qNum).toLocaleString() : '-';
          const dispTarget = kpi.isHDC ? (qLatestTarget !== null ? `${(qLatestTarget as number).toLocaleString()} (ทั้งหมด)` : 'N/A') : qDen.toLocaleString();

          if (quarterNotStarted) {
            statusText = 'รอดำเนินการ';
            cardClass = 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300 text-yellow-900';
            badgeClass = 'bg-yellow-400 text-yellow-900';
            headerBg = 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #d97706 100%)';
            isPending = true;
          } else if (hasData && isComplete && !quarterNotEnded) {
            const rate = kpi.isHDC ? (qLatestActual !== null && qLatestTarget !== null && qLatestTarget > 0 ? calcRate(qLatestActual, qLatestTarget, kpi.unit) : 0) : (qDen > 0 ? calcRate(qNum, qDen, kpi.unit) : 0);
            rateStr = rate.toFixed(2) + (kpi.unit === '%' ? '%' : kpi.unit === '/1,000' ? '/พัน' : '');
            
            if (checkPassTarget(rate, kpi.operator, kpi.targetValue)) {
              statusText = 'ผ่าน';
              cardClass = 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 text-emerald-900';
              badgeClass = 'bg-emerald-500 text-white';
              headerBg = 'linear-gradient(135deg, #064e3b 0%, #059669 100%)';
            } else {
              statusText = 'ไม่ผ่าน';
              cardClass = 'bg-gradient-to-br from-rose-50 to-orange-50 border-rose-200 text-rose-900';
              badgeClass = 'bg-rose-500 text-white';
              headerBg = 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)';
            }
          } else if (quarterNotEnded && !quarterNotStarted) {
            statusText = 'รอดำเนินการ';
            cardClass = 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300 text-yellow-900';
            badgeClass = 'bg-yellow-400 text-yellow-900';
            headerBg = 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #d97706 100%)';
            isPending = true;
            if (hasData) rateStr = `${monthsWithData}/3 เดือน`;
          } else if (hasData && !isComplete) {
            statusText = 'ข้อมูลไม่ครบ';
            cardClass = 'bg-white border-amber-200 text-amber-800';
            badgeClass = 'bg-amber-100 text-amber-700';
            headerBg = 'linear-gradient(135deg, #78350f 0%, #d97706 100%)';
            rateStr = `${monthsWithData}/3 เดือน`;
          }

          const isLocked = locks[qIdx];
          const textVal = analysisTexts[qIdx] || '';

          return (
            <div key={qIdx} className={`rounded-lg border-2 ${cardClass} shadow overflow-hidden w-full`}>
              <div className="flex items-center justify-between px-3 py-2" style={{ background: headerBg }}>
                <div className="flex items-center gap-3">
                  <span className="text-white font-black text-sm">{q.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>{statusText}</span>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="text-center">
                    <div className="text-[9px] font-bold text-white/70 uppercase tracking-wider">เป้า ({kpi.isHDC ? 'จำนวนผู้รับผิดชอบ' : 'รวมทั้งหมด'})</div>
                    <div className="text-sm font-black text-white">{dispTarget}</div>
                  </div>
                  <div className="w-px h-7 bg-white/30"></div>
                  <div className="text-center">
                    <div className="text-[9px] font-bold text-white/70 uppercase tracking-wider">ผล ({kpi.isHDC ? 'สะสม ณ เดือนล่าสุด' : 'รวมทั้งหมด'})</div>
                    <div className="text-sm font-black text-white">{dispActual}</div>
                  </div>
                  <div className="w-px h-7 bg-white/30"></div>
                  <div className="text-center">
                    <div className="text-[9px] font-bold text-white/70 uppercase tracking-wider">ผลลัพธ์</div>
                    <div className="text-xl font-black text-white drop-shadow">{hasData ? rateStr : '-'}</div>
                  </div>
                  <div className="text-center hidden md:block">
                    <div className="text-[9px] font-bold text-white/70 uppercase tracking-wider">เดือนที่มีข้อมูล</div>
                    <div className="text-sm font-black text-white">{monthsWithData}/3 เดือน</div>
                  </div>
                </div>
              </div>
              <div className="px-3 py-2 flex items-start gap-2" style={{ background: isPending ? 'linear-gradient(135deg,#fefce8 0%,#fef9c3 100%)' : 'white' }}>
                <span className="text-[10px] font-extrabold uppercase tracking-wider mt-1.5 flex-shrink-0" style={{ color: isPending ? '#92400e' : '#64748b' }}>วิเคราะห์/แนวทางพัฒนา:</span>
                <textarea
                  value={isPending && !textVal ? 'รอดำเนินการ' : textVal}
                  readOnly={isLocked}
                  onChange={(e) => {
                    const newTexts = [...analysisTexts];
                    newTexts[qIdx] = e.target.value;
                    setAnalysisTexts(newTexts);
                  }}
                  className="flex-1 p-1.5 rounded text-xs resize-none overflow-hidden outline-none transition"
                  style={{ minHeight: '44px', background: isLocked ? 'rgba(255,255,255,0.4)' : 'white', border: `1px solid ${isPending ? '#fbbf24' : '#e2e8f0'}` }}
                  placeholder={isPending ? 'รอดำเนินการ — ยังไม่ถึงไตรมาสนี้' : 'วิเคราะห์/แนวทางพัฒนา ' + q.name}
                />
                <button 
                  onClick={() => handleToggleLock(qIdx)}
                  className={`text-xs px-3 py-2 min-h-[36px] rounded font-semibold transition shrink-0 mt-1 ${isLocked ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  {isLocked ? 'ปลดล็อก' : 'อัปเดต'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
