import React from 'react';
import { KPI, getAccumulatedSnapshot, checkPassTarget } from '@/utils/kpiLogic';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  kpi: KPI;
  allKpis: KPI[];
}

export function KpiDetailCard({ kpi, allKpis }: Props) {
  const snapshot = getAccumulatedSnapshot(kpi, 11);
  const hasResult = snapshot.hasResult;
  const ytdRate = snapshot.rate;
  const actualDisplay = snapshot.hasData ? snapshot.totalActual.toLocaleString() : '-';
  const targetDisplay = snapshot.hasData ? snapshot.totalTarget.toLocaleString() : '-';

  const isPass = hasResult && checkPassTarget(ytdRate, kpi.operator, kpi.targetValue);

  // PCT Summary
  const pctKpis = allKpis.filter(k => k.category === kpi.category);
  let pctPass = 0;
  let pctFail = 0;
  let pctNoData = 0;
  
  // PCT evaluation (using YTD status for each)
  pctKpis.forEach(k => {
    const s = getAccumulatedSnapshot(k, 11);
    if (!s.hasData) {
      pctNoData++;
    } else {
      if (s.hasResult && checkPassTarget(s.rate, k.operator, k.targetValue)) {
        pctPass++;
      } else {
        pctFail++;
      }
    }
  });

  const pctTotal = pctPass + pctFail + pctNoData;
  const hasAnyPct = pctTotal > 0 && (pctPass > 0 || pctFail > 0 || pctNoData > 0);

  const pctData = {
    datasets: [{
      data: hasAnyPct ? [pctPass, pctFail, pctNoData] : [1],
      backgroundColor: hasAnyPct ? ['#10b981', '#e11d48', 'rgba(148,163,184,0.72)'] : ['rgba(148,163,184,0.45)'],
      borderColor: hasAnyPct ? ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.16)', 'rgba(255,255,255,0.12)'] : ['rgba(255,255,255,0.10)'],
      borderWidth: 2,
    }]
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="rounded-xl shadow overflow-hidden flex-1 flex flex-col" style={{ border: '2px solid rgba(0,0,0,0.08)' }}>
        <div className="section-header-blue px-3 py-1.5 flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <h3 className="font-semibold text-white text-xs">สรุปผลตัวชี้วัดที่เลือก</h3>
        </div>

        <div className="w-full px-4 py-3 flex flex-col flex-1 items-center text-center gap-2" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)' }}>
          <h2 className="text-base font-extrabold leading-snug w-full" style={{ color: '#1e1b4b', wordBreak: 'break-word', textAlign: 'center' }}>
            {kpi.name}
          </h2>

          <div className="flex items-center justify-center gap-1.5">
            <span className="text-sm font-bold" style={{ color: '#3730a3' }}>เกณฑ์:</span>
            <span className="px-3 py-0.5 rounded text-sm font-extrabold" style={{ background: 'rgba(255,255,255,0.7)', color: '#1e40af', border: '1px solid #c7d2fe' }}>
              {kpi.targetText}
            </span>
          </div>

          <div className="flex flex-row items-center gap-3 w-full flex-wrap justify-center flex-1">
            <div
              className="flex flex-col items-center justify-center px-6 py-3 gap-0.5 rounded-xl flex-shrink-0"
              style={{
                background: !hasResult ? 'linear-gradient(145deg, #334155 0%, #1e293b 55%, #0f172a 100%)' :
                            isPass ? 'linear-gradient(145deg, #064e3b 0%, #059669 52%, #10b981 100%)' :
                            'linear-gradient(145deg, #7f1d1d 0%, #be123c 52%, #f43f5e 100%)',
                boxShadow: !hasResult ? '0 16px 34px rgba(15,23,42,0.24), inset 0 1px 0 rgba(255,255,255,0.08)' :
                           isPass ? '0 18px 36px rgba(5,150,105,0.30), inset 0 1px 0 rgba(255,255,255,0.10)' :
                           '0 18px 36px rgba(225,29,72,0.30), inset 0 1px 0 rgba(255,255,255,0.10)',
                minWidth: '155px'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#ddd6fe', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                ผลสัมฤทธิ์ YTD
              </div>
              <div style={{ fontSize: '2.6rem', fontWeight: 900, lineHeight: 1.1, color: '#ffffff', letterSpacing: '-0.02em', textShadow: '0 4px 14px rgba(15,23,42,0.25)' }}>
                {hasResult ? ytdRate.toFixed(2) : '-'}
              </div>
              <div style={{ fontSize: '13px', color: '#e9d5ff', fontWeight: 700 }}>
                หน่วยดัชนี: {kpi.unit}
              </div>
              <div
                className={`px-2.5 py-0.5 rounded-lg font-bold mt-1 text-[12px] ${!hasResult ? 'bg-slate-100/90 text-slate-600' : isPass ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}
              >
                {!hasResult ? 'ไม่มีข้อมูล' : isPass ? '✓ ผ่านเกณฑ์' : '✗ ไม่ผ่านเกณฑ์'}
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-1 text-left" style={{ minWidth: '120px' }}>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-purple-700">{kpi.denominatorLabel}</span>
                <span className="text-base font-extrabold px-2 py-0.5 rounded self-start bg-white/85 text-indigo-950 border border-indigo-200">
                  {targetDisplay}
                </span>
              </div>
              <div className="w-full h-px bg-indigo-500/20"></div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-purple-700">{kpi.numeratorLabel}</span>
                <span className="text-base font-extrabold px-2 py-0.5 rounded self-start bg-white/85 text-indigo-950 border border-indigo-200">
                  {actualDisplay}
                </span>
              </div>
            </div>

            <div
              className="flex flex-col flex-shrink-0 rounded-xl px-3.5 py-3 gap-2"
              style={{
                background: !hasResult ? 'linear-gradient(145deg, #0f172a 0%, #1e293b 55%, #334155 100%)' :
                            isPass ? 'linear-gradient(145deg, #022c22 0%, #064e3b 50%, #065f46 100%)' :
                            'linear-gradient(145deg, #4c0519 0%, #7f1d1d 48%, #9f1239 100%)',
                border: '1.5px solid rgba(99,102,241,0.30)',
                minWidth: '255px'
              }}
            >
              <div className="w-full text-left relative z-10">
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>PCT - {kpi.category}</div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(226,232,240,0.82)' }}>ผลประเมินล่าสุดของกลุ่มตัวชี้วัด</div>
              </div>
              <div className="flex items-center gap-3 w-full relative z-10">
                <div style={{ position: 'relative', width: '92px', height: '92px', flexShrink: 0 }}>
                  <Doughnut data={pctData} options={{ cutout: '72%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }} />
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.15, width: '100%' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#34d399' }}>{pctPass}</div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pass</div>
                    <div style={{ width: '22px', height: '1px', background: 'rgba(148,163,184,0.45)', margin: '4px auto' }}></div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#fb7185' }}>{pctFail}</div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Fail</div>
                  </div>
                </div>
                <div className="flex-1 space-y-1.5 text-[11px] relative z-10">
                  <div className="flex items-center justify-between gap-2">
                    <span style={{ color: '#cbd5e1', fontWeight: 700 }}>ตัวชี้วัด</span>
                    <span style={{ color: '#ffffff', fontWeight: 900 }}>{pctTotal} ตัว</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span style={{ color: '#86efac', fontWeight: 700 }}>ผ่าน</span>
                    <span style={{ color: '#34d399', fontWeight: 900 }}>{pctPass} ตัว</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span style={{ color: '#fda4af', fontWeight: 700 }}>ไม่ผ่าน</span>
                    <span style={{ color: '#fb7185', fontWeight: 900 }}>{pctFail} ตัว</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
