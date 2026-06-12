import React from 'react';
import { KPI, calcRate, checkPassTarget, MONTH_NAMES } from '@/utils/kpiLogic';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export function ChartsRow({ kpi }: { kpi: KPI }) {
  const lineDataPoints: (number | null)[] = [];
  const barActuals: (number | null)[] = [];
  const barTargets: (number | null)[] = [];

  if (kpi.isHDC) {
    kpi.monthlyData.forEach(md => {
      const hasActual = md.actual !== null && md.actual !== '';
      const hasTarget = md.target !== null && md.target !== '';
      if (hasActual && hasTarget && parseFloat(md.target as string) > 0) {
        lineDataPoints.push(parseFloat(calcRate(parseFloat(md.actual as string), parseFloat(md.target as string), kpi.unit).toFixed(2)));
      } else {
        lineDataPoints.push(null);
      }
      barActuals.push(hasActual ? parseFloat(md.actual as string) : null);
      barTargets.push(hasTarget ? parseFloat(md.target as string) : null);
    });
  } else {
    let totalActual = 0, totalTarget = 0;
    let hasAnyActual = false, hasAnyTarget = false;

    kpi.monthlyData.forEach(md => {
      if (md.actual !== null && md.actual !== '') {
        totalActual += parseFloat(md.actual as string);
        hasAnyActual = true;
      }
      if (md.target !== null && md.target !== '') {
        totalTarget += parseFloat(md.target as string);
        hasAnyTarget = true;
      }
      if (hasAnyActual && hasAnyTarget && totalTarget > 0) {
        lineDataPoints.push(parseFloat(calcRate(totalActual, totalTarget, kpi.unit).toFixed(2)));
      } else if (hasAnyActual || hasAnyTarget) {
        lineDataPoints.push(0);
      } else {
        lineDataPoints.push(null);
      }
      barActuals.push(md.actual !== null && md.actual !== '' ? parseFloat(md.actual as string) : null);
      barTargets.push(md.target !== null && md.target !== '' ? parseFloat(md.target as string) : null);
    });
  }

  const pointBgColors = lineDataPoints.map(val => {
    if (val === null) return '#fff';
    return checkPassTarget(val, kpi.operator, kpi.targetValue) ? '#10b981' : '#ef4444';
  });

  const pointBorderColors = lineDataPoints.map(val => {
    if (val === null) return '#8b5cf6';
    return checkPassTarget(val, kpi.operator, kpi.targetValue) ? '#059669' : '#b91c1c';
  });

  const lineData = {
    labels: MONTH_NAMES,
    datasets: [
      {
        label: 'ผลลัพธ์',
        data: lineDataPoints,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: pointBgColors,
        pointBorderColor: pointBorderColors,
        pointBorderWidth: 1.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.3
      },
      {
        label: 'เป้าหมาย',
        data: Array(12).fill(kpi.targetValue),
        borderColor: '#ef4444',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
        tension: 0
      }
    ]
  };

  const barData = {
    labels: MONTH_NAMES,
    datasets: [
      {
        label: kpi.numeratorLabel,
        data: barActuals,
        backgroundColor: '#14b8a6',
        borderRadius: 2
      },
      {
        label: kpi.denominatorLabel,
        data: barTargets,
        backgroundColor: '#94a3b8',
        borderRadius: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { boxWidth: 8, font: { size: 9.5 } } }
    },
    scales: {
      y: { beginAtZero: true, ticks: { font: { size: 8.5 } } },
      x: { ticks: { font: { size: 9.5 } } }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="bg-white rounded-lg shadow border border-purple-200 p-1.5" style={{ background: 'linear-gradient(135deg,#fff 0%,#faf5ff 100%)' }}>
        <h3 className="text-[10px] font-bold text-purple-700 mb-0.5 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block"></span>
          {kpi.isHDC ? 'ผลลัพธ์รายเดือน (HDC)' : 'ผลลัพธ์สะสม'}
        </h3>
        <div className="relative w-full" style={{ height: '130px' }}>
          <Line data={lineData as any} options={options} />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow border border-teal-200 p-1.5" style={{ background: 'linear-gradient(135deg,#fff 0%,#f0fdfa 100%)' }}>
        <h3 className="text-[10px] font-bold text-teal-700 mb-0.5 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block"></span>
          ปริมาณงาน (Volume)
        </h3>
        <div className="relative w-full" style={{ height: '130px' }}>
          <Bar data={barData as any} options={options} />
        </div>
      </div>
    </div>
  );
}
