/**
 * calculation.ts
 * Utility functions for calculating KPI results and pass status
 */

/**
 * Calculate the result value based on numerator, denominator, and unit
 */
export function calculateResult(numerator: number, denominator: number | null, unit: string): number | null {
  if (denominator === null || denominator === 0) return null;
  
  if (unit === '%') {
    return (numerator / denominator) * 100;
  } else if (unit === 'ต่อ 1,000 LB' || unit === 'ต่อ 1,000 วันนอน') {
    return (numerator / denominator) * 1000;
  }
  
  // Default fallback
  return numerator / denominator;
}

/**
 * Check if a result passes the target based on target type and target value
 */
export function checkIsPass(result: number | null, targetType: string, targetValue: number): boolean | null {
  if (result === null) return null;
  
  switch (targetType) {
    case '<':
      return result < targetValue;
    case '>':
      return result > targetValue;
    case '<=':
      return result <= targetValue;
    case '>=':
      return result >= targetValue;
    case '=':
      return result === targetValue;
    default:
      return null;
  }
}
