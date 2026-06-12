export interface MonthlyData {
  id?: string;
  actual: string | null;
  target: string | null;
}

export interface KPI {
  id: number;
  category: string;
  name: string;
  isHDC: boolean;
  numeratorLabel: string;
  denominatorLabel: string;
  targetText: string;
  targetValue: number;
  operator: string;
  unit: string;
  monthlyData: MonthlyData[];
  analysis: string[];
  year: number;
}

export const MONTH_NAMES = ['ต.ค.','พ.ย.','ธ.ค.','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.'];
export const MONTH_FULL = ['ตุลาคม','พฤศจิกายน','ธันวาคม','มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน'];

/** Safe parseFloat that returns 0 instead of NaN to prevent NaN propagation */
export function safeParseFloat(val: string | number | null | undefined): number {
  if (val === null || val === undefined || val === '') return 0;
  const num = typeof val === 'number' ? val : parseFloat(val);
  return isNaN(num) ? 0 : num;
}

export function calcRate(num: number, den: number, unit: string) {
  return den > 0 ? (num / den) * (unit === '%' ? 100 : 1000) : 0;
}

export function checkPassTarget(value: number | null, operator: string, target: number) {
  if (value === null || isNaN(value)) return false;
  switch (operator) {
    case '<':  return value <  target;
    case '<=': return value <= target;
    case '>':  return value >  target;
    case '>=': return value >= target;
    case '=':  return value === target;
    default:   return false;
  }
}

export function getLatestMonthData(kpi: KPI, maxIdx: number) {
  let latestActual: number | null = null;
  let latestTarget: number | null = null;
  for (let i = maxIdx; i >= 0; i--) {
    const md = kpi.monthlyData[i];
    if (md) {
      if (latestActual === null && md.actual !== null && md.actual !== '') latestActual = safeParseFloat(md.actual);
      if (latestTarget === null && md.target !== null && md.target !== '') latestTarget = safeParseFloat(md.target);
    }
    if (latestActual !== null && latestTarget !== null) break;
  }
  return { latestActual, latestTarget };
}

export function _computeKpiResult(kpi: KPI, maxIdx: number) {
  if (kpi.isHDC) {
    const { latestActual, latestTarget } = getLatestMonthData(kpi, maxIdx);
    const hasData = latestActual !== null;
    const rate = (latestActual !== null && latestTarget !== null && latestTarget > 0)
        ? calcRate(latestActual, latestTarget, kpi.unit) : 0;
    return { hasData, rate };
  }
  let sumNum = 0, sumDen = 0, hasData = false;
  for (let i = 0; i <= maxIdx; i++) {
    const md = kpi.monthlyData[i];
    if (md && md.actual !== null && md.actual !== '') { sumNum += safeParseFloat(md.actual); hasData = true; }
    if (md && md.target !== null && md.target !== '') sumDen += safeParseFloat(md.target);
  }
  if (!hasData) return { hasData: false, rate: 0 };
  return { hasData: true, rate: calcRate(sumNum, sumDen, kpi.unit) };
}

export function getAccumulatedSnapshot(kpi: KPI, maxIdx: number) {
  if (kpi.isHDC) {
    let latestActual: number | null = null;
    let latestTarget: number | null = null;
    for (let i = maxIdx; i >= 0; i--) {
      const md = kpi.monthlyData[i];
      if (md) {
        if (latestActual === null && md.actual !== null && md.actual !== '')
            latestActual = safeParseFloat(md.actual);
        if (latestTarget === null && md.target !== null && md.target !== '')
            latestTarget = safeParseFloat(md.target);
      }
      if (latestActual !== null && latestTarget !== null) break;
    }
    const hasResult = latestActual !== null && latestTarget !== null && latestTarget > 0;
    return {
      hasData: latestActual !== null || latestTarget !== null,
      hasResult,
      totalActual: latestActual !== null ? latestActual : 0,
      totalTarget: latestTarget !== null ? latestTarget : 0,
      rate: hasResult ? calcRate(latestActual!, latestTarget!, kpi.unit) : 0
    };
  }

  let totalActual = 0, totalTarget = 0;
  let hasAnyActual = false, hasAnyTarget = false;

  for (let i = 0; i <= maxIdx; i++) {
    const md = kpi.monthlyData[i];
    if (md && md.actual !== null && md.actual !== '') {
        totalActual += safeParseFloat(md.actual);
        hasAnyActual = true;
    }
    if (md && md.target !== null && md.target !== '') {
        totalTarget += safeParseFloat(md.target);
        hasAnyTarget = true;
    }
  }

  const hasResult = hasAnyActual && hasAnyTarget && totalTarget > 0;
  return {
      hasData: hasAnyActual || hasAnyTarget,
      hasResult,
      totalActual,
      totalTarget,
      rate: hasResult ? calcRate(totalActual, totalTarget, kpi.unit) : 0
  };
}

export function evaluateKpiSummaryStatus(kpi: KPI, maxIdx: number) {
  const res = _computeKpiResult(kpi, maxIdx);
  if (!res.hasData) {
      return { status: 'noData', hasData: false, isPass: false, rate: res.rate };
  }
  const isPass = checkPassTarget(res.rate, kpi.operator, kpi.targetValue);
  return { status: isPass ? 'pass' : 'fail', hasData: true, isPass, rate: res.rate };
}

export function evaluateKpiYtdStatus(kpi: KPI) {
  const res = _computeKpiResult(kpi, 11);
  if (!res.hasData) {
      return { status: 'noData', hasData: false, isPass: false, rate: res.rate };
  }
  const isPass = checkPassTarget(res.rate, kpi.operator, kpi.targetValue);
  return { status: isPass ? 'pass' : 'fail', hasData: true, isPass, rate: res.rate };
}
