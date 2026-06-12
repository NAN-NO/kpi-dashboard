import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  total: number;
  pass: number;
  fail: number;
  noData: number;
  kpis: any[]; // The failing KPIs
}

export function OverviewSection({ total, pass, fail, noData, kpis }: Props) {
  const data = {
    labels: ['ผ่าน', 'ไม่ผ่าน', 'ไม่มีข้อมูล'],
    datasets: [
      {
        data: [pass, fail, noData],
        backgroundColor: ['#10b981', '#f43f5e', '#e2e8f0'],
        borderWidth: 0,
        hoverOffset: 1,
      },
    ],
  };

  const options = {
    cutout: '72%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false }
    },
  };

  return (
    <section id="overviewDashboard" className="mb-3 print-break-inside">
      <div id="overviewDashboardContent" className="bg-slate-50/50 dark:bg-slate-900/50 rounded-lg p-2.5 space-y-2 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-1.5">
            <label className="font-bold text-slate-600 dark:text-slate-300">ปีงบประมาณ:</label>
            <span className="w-16 font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 rounded px-1.5 py-0.5 outline-none text-center bg-white dark:bg-slate-800">
              2569
            </span>
          </div>
          <div className="w-px h-3 bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center mb-2">
          {/* Donut chart */}
          <div
            className="flex flex-col items-center justify-center rounded-xl p-2 min-h-[115px]"
            style={{
              background: 'linear-gradient(145deg, #06070f 0%, #0f172a 30%, #1e3a8a 70%, #3730a3 100%)',
              border: '1px solid rgba(99,102,241,0.3)',
            }}
          >
            <div className="relative" style={{ width: '105px', height: '105px' }}>
              <Doughnut data={data} options={options} />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%,-50%)',
                  textAlign: 'center',
                  pointerEvents: 'none',
                  width: '100%',
                }}
              >
                <div className="text-xs font-bold text-slate-300">
                  ผ่าน: <span className="text-base font-black text-emerald-400">{pass}</span>
                </div>
                <div className="w-8 h-px bg-slate-600/50 mx-auto my-0.5"></div>
                <div className="text-xs font-bold text-slate-300">
                  ไม่ผ่าน: <span className="text-base font-black text-rose-400">{fail}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 stat cards */}
          <div className="sm:col-span-3 grid grid-cols-3 gap-2 h-full">
            <div
              className="stat-card p-2 rounded-lg text-center flex flex-col justify-center shadow-sm"
              style={{
                background: 'linear-gradient(145deg, #1d4ed8, #2563eb, #3b82f6)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div className="text-2xl font-black text-white drop-shadow">{total}</div>
              <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">ตัวชี้วัดทั้งหมด</div>
            </div>
            <div
              className="stat-card p-2 rounded-lg text-center flex flex-col justify-center shadow-sm"
              style={{
                background: 'linear-gradient(145deg, #059669, #10b981, #34d399)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div className="text-2xl font-black text-white drop-shadow">{pass}</div>
              <div className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">ผ่านเกณฑ์</div>
            </div>
            <div
              className="stat-card p-2 rounded-lg text-center flex flex-col justify-center shadow-sm"
              style={{
                background: 'linear-gradient(145deg, #be123c, #e11d48, #fb7185)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div className="text-2xl font-black text-white drop-shadow">{fail}</div>
              <div className="text-[10px] font-bold text-rose-100 uppercase tracking-wider">ไม่ผ่านเกณฑ์</div>
            </div>
          </div>
        </div>

        {/* Fail table */}
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/30 overflow-hidden shadow-sm bg-white dark:bg-slate-900">
          <div className="section-header-rose px-2.5 py-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-rose-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="font-bold text-white text-xs">ตัวชี้วัดที่ยังไม่ผ่านเกณฑ์</h3>
            </div>
            <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-white/30">
              {fail} ตัว
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left kpi-summary-table">
              <thead>
                <tr>
                  <th className="px-2 py-1.5 font-semibold w-8 text-center">#</th>
                  <th className="px-2 py-1.5 font-semibold min-w-[110px]">กลุ่มงาน / PCT</th>
                  <th className="px-2 py-1.5 font-semibold min-w-[310px]">ชื่อตัวชี้วัด</th>
                  <th className="px-2 py-1.5 font-semibold text-left whitespace-nowrap">เป้าหมาย</th>
                  <th className="px-2 py-1.5 font-semibold text-left whitespace-nowrap">ผลลัพธ์</th>
                  <th className="px-2 py-1.5 font-semibold text-center w-24">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50 dark:divide-slate-800/50">
                {kpis.length > 0 ? (
                  kpis.map((kpi, idx) => (
                    <tr key={idx} className="text-xs">
                      <td className="px-2 py-1.5 text-center font-bold text-slate-400 dark:text-slate-500">{idx + 1}</td>
                      <td className="px-2 py-1.5 text-slate-500 dark:text-slate-400 font-medium">{kpi.category}</td>
                      <td className="px-2 py-1.5 font-medium text-slate-700 dark:text-slate-200 whitespace-normal leading-tight">{kpi.name}</td>
                      <td className="px-2 py-1.5 text-left whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-semibold">{kpi.targetText}</span>
                      </td>
                      <td className="px-2 py-1.5 text-left font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">{kpi.rate.toFixed(2)} {kpi.unit}</td>
                      <td className="px-2 py-1.5 text-center whitespace-nowrap"><span className="status-fail">ไม่ผ่านเกณฑ์</span></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-2 text-center text-slate-400 dark:text-slate-500 font-medium text-xs">
                      ไม่มีตัวชี้วัดที่ไม่ผ่านเกณฑ์ในเดือนนี้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
