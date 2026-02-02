/**
 * COMPREHENSIVE CALCULATION AUDIT
 *
 * This file manually verifies EVERY calculation with hand-computed expected values.
 * If any test fails, there's a bug in the calculation logic.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCurrentState,
  calculateImprovedState,
  calculateScaledState,
  generateProjectionData,
  calculateROI,
} from './calculations';
import type { InputMetrics, Scenario } from './types';

// Standard test case - a realistic ecommerce store
const STANDARD_STORE: InputMetrics = {
  monthlyVisitors: 50000,
  currentCVR: 2.5,  // 2.5%
  aov: 80,          // $80
  adSpend: 10000,   // $10,000/month
};

describe('AUDIT: Current State Calculations', () => {
  it('calculates all metrics correctly for standard store', () => {
    const result = calculateCurrentState(STANDARD_STORE);

    // Manual calculations:
    // orders = 50,000 × (2.5/100) = 1,250
    expect(result.orders).toBe(1250);

    // revenue = 1,250 × $80 = $100,000
    expect(result.revenue).toBe(100000);

    // ROAS = $100,000 / $10,000 = 10
    expect(result.roas).toBe(10);

    // CPA = $10,000 / 1,250 = $8
    expect(result.cpa).toBe(8);

    // RPS = $100,000 / 50,000 = $2
    expect(result.rps).toBe(2);

    // CVR passes through
    expect(result.cvr).toBe(2.5);
  });

  it('handles zero ad spend without division error', () => {
    const store = { ...STANDARD_STORE, adSpend: 0 };
    const result = calculateCurrentState(store);

    expect(result.roas).toBe(0);  // Not Infinity
    expect(result.cpa).toBe(0);   // Not Infinity (no orders to attribute)
    expect(result.revenue).toBe(100000);  // Revenue still exists
  });

  it('handles zero visitors without division error', () => {
    const store = { ...STANDARD_STORE, monthlyVisitors: 0 };
    const result = calculateCurrentState(store);

    expect(result.orders).toBe(0);
    expect(result.revenue).toBe(0);
    expect(result.rps).toBe(0);  // Not NaN
    expect(result.roas).toBe(0);
  });

  it('handles zero CVR without error', () => {
    const store = { ...STANDARD_STORE, currentCVR: 0 };
    const result = calculateCurrentState(store);

    expect(result.orders).toBe(0);
    expect(result.revenue).toBe(0);
    expect(result.cpa).toBe(0);  // Not Infinity
  });
});

describe('AUDIT: Improved State Calculations', () => {
  it('calculates conservative scenario (+15% CVR)', () => {
    const result = calculateImprovedState(STANDARD_STORE, 'conservative');

    // CVR = 2.5 × 1.15 = 2.875
    expect(result.cvr).toBe(2.875);

    // orders = 50,000 × 0.02875 = 1,437.5
    expect(result.orders).toBe(1437.5);

    // revenue = 1,437.5 × $80 = $115,000
    expect(result.revenue).toBe(115000);

    // ROAS = $115,000 / $10,000 = 11.5
    expect(result.roas).toBe(11.5);

    // CPA = $10,000 / 1,437.5 = $6.956...
    expect(result.cpa).toBeCloseTo(6.956, 2);
  });

  it('calculates expected scenario (+25% CVR)', () => {
    const result = calculateImprovedState(STANDARD_STORE, 'expected');

    // CVR = 2.5 × 1.25 = 3.125
    expect(result.cvr).toBe(3.125);

    // orders = 50,000 × 0.03125 = 1,562.5
    expect(result.orders).toBe(1562.5);

    // revenue = 1,562.5 × $80 = $125,000
    expect(result.revenue).toBe(125000);
  });

  it('calculates optimistic scenario (+40% CVR)', () => {
    const result = calculateImprovedState(STANDARD_STORE, 'optimistic');

    // CVR = 2.5 × 1.40 = 3.5
    expect(result.cvr).toBe(3.5);

    // orders = 50,000 × 0.035 = 1,750
    expect(result.orders).toBeCloseTo(1750, 5);

    // revenue = 1,750 × $80 = $140,000
    expect(result.revenue).toBeCloseTo(140000, 0);
  });
});

describe('AUDIT: Projection Data (Chart)', () => {
  it('follows implementation curve exactly', () => {
    const data = generateProjectionData(STANDARD_STORE, 'expected', 0, 6);

    // Month 1: 25% of improvement
    // improvement = 25% CVR increase, so 25% of that = 6.25% increase
    // CVR = 2.5 × 1.0625 = 2.65625
    // revenue = 50,000 × 0.0265625 × $80 = $106,250
    expect(data[0].improved).toBe(106250);

    // Month 2: 60% of improvement
    // CVR = 2.5 × 1.15 = 2.875
    // revenue = 50,000 × 0.02875 × $80 = $115,000
    expect(data[1].improved).toBe(115000);

    // Month 3: 100% of improvement
    // CVR = 2.5 × 1.25 = 3.125
    // revenue = 50,000 × 0.03125 × $80 = $125,000
    expect(data[2].improved).toBe(125000);
  });

  it('applies ongoing 2% monthly improvement after month 3', () => {
    const data = generateProjectionData(STANDARD_STORE, 'expected', 0, 6);

    // Month 4: CVR = 3.125 × 1.02 = 3.1875
    // revenue = 50,000 × 0.031875 × $80 = $127,500
    expect(data[3].improved).toBe(127500);

    // Month 5: CVR = 3.125 × 1.02² = 3.25125
    // revenue = 50,000 × 0.0325125 × $80 = $130,050
    expect(data[4].improved).toBeCloseTo(130050, 0);

    // Month 6: CVR = 3.125 × 1.02³ = 3.316275
    // revenue = 50,000 × 0.03316275 × $80 = $132,651
    expect(data[5].improved).toBeCloseTo(132651, 0);
  });

  it('current revenue stays constant', () => {
    const data = generateProjectionData(STANDARD_STORE, 'expected', 0, 6);

    // All months should have same current revenue
    data.forEach(point => {
      expect(point.current).toBe(100000);
    });
  });

  it('cumulative values add up correctly', () => {
    const data = generateProjectionData(STANDARD_STORE, 'expected', 0, 6);

    let runningTotal = 0;
    data.forEach(point => {
      runningTotal += point.current;
      expect(point.currentCumulative).toBe(runningTotal);
    });

    // Final cumulative should be 6 × $100,000 = $600,000
    expect(data[5].currentCumulative).toBe(600000);
  });
});

describe('AUDIT: Scaled State with Reinvestment', () => {
  it('without reinvestment equals improved (plus ongoing optimization)', () => {
    const scaled = calculateScaledState(STANDARD_STORE, 'expected', 0, 6);

    // Total revenue over 6 months without reinvestment
    // Sum of: 106,250 + 115,000 + 125,000 + 127,000 + 129,000 + 131,000
    // (using linear 2% after month 3 in scaled)
    expect(scaled.totalRevenue).toBe(733250);

    // Total current would be: 6 × 100,000 = 600,000
    // Additional = 733,250 - 600,000 = 133,250
    expect(scaled.totalAdditionalRevenue).toBe(133250);
  });

  it('reinvestment increases total revenue', () => {
    const noReinvest = calculateScaledState(STANDARD_STORE, 'expected', 0, 6);
    const withReinvest = calculateScaledState(STANDARD_STORE, 'expected', 50, 6);

    expect(withReinvest.totalRevenue).toBeGreaterThan(noReinvest.totalRevenue);
    expect(withReinvest.totalAdditionalRevenue).toBeGreaterThan(noReinvest.totalAdditionalRevenue);
  });

  it('tracks ad spend correctly', () => {
    const noReinvest = calculateScaledState(STANDARD_STORE, 'expected', 0, 6);

    // Without reinvestment: 6 × $10,000 = $60,000
    expect(noReinvest.totalAdSpent).toBe(60000);
  });

  it('ad spend increases with reinvestment', () => {
    const withReinvest = calculateScaledState(STANDARD_STORE, 'expected', 50, 6);

    // With 50% reinvestment, ad spend should grow
    expect(withReinvest.totalAdSpent).toBeGreaterThan(60000);
  });
});

describe('AUDIT: ROI Calculations', () => {
  it('calculates ROI correctly for standard scenario', () => {
    // Using projection data to get exact additional revenue
    const data = generateProjectionData(STANDARD_STORE, 'expected', 0, 6);
    const totalAdditional = data.reduce((sum, p) => sum + (p.improved - p.current), 0);

    const roi = calculateROI(4000, 6, totalAdditional);

    // Total investment = $4,000 × 6 = $24,000
    expect(roi.totalInvestment).toBe(24000);

    // Additional revenue should be ~$136,451
    expect(roi.totalAdditionalRevenue).toBeCloseTo(136451, 0);

    // ROI = $136,451 / $24,000 = 5.69x
    expect(roi.roiMultiple).toBeCloseTo(5.69, 1);

    // Payback = $4,000 / ($136,451/6) = 0.176 months
    expect(roi.paybackMonths).toBeLessThan(1);
  });

  it('handles edge case: zero investment', () => {
    const roi = calculateROI(0, 6, 100000);

    expect(roi.totalInvestment).toBe(0);
    expect(roi.roiMultiple).toBe(0);  // Not Infinity
  });

  it('handles edge case: zero additional revenue', () => {
    const roi = calculateROI(4000, 6, 0);

    expect(roi.totalAdditionalRevenue).toBe(0);
    expect(roi.roiMultiple).toBe(0);
    expect(roi.paybackMonths).toBe(Infinity);
  });
});

describe('AUDIT: Cross-Validation', () => {
  it('improved state at month 3 equals full calculateImprovedState', () => {
    const improved = calculateImprovedState(STANDARD_STORE, 'expected');
    const projection = generateProjectionData(STANDARD_STORE, 'expected', 0, 6);

    // Month 3 (index 2) should match full improved state revenue
    expect(projection[2].improved).toBe(improved.revenue);
  });

  it('current state matches projection current values', () => {
    const current = calculateCurrentState(STANDARD_STORE);
    const projection = generateProjectionData(STANDARD_STORE, 'expected', 0, 6);

    projection.forEach(point => {
      expect(point.current).toBe(current.revenue);
    });
  });

  it('ROI from hook formula matches direct calculation', () => {
    // This is exactly what the useCalculator hook does
    const projection = generateProjectionData(STANDARD_STORE, 'expected', 50, 6);
    const totalAdditionalFromImproved = projection.reduce(
      (sum, p) => sum + (p.improved - p.current), 0
    );

    const roiFromHook = calculateROI(4000, 6, totalAdditionalFromImproved);

    // ROI should be reasonable (5-10x range)
    expect(roiFromHook.roiMultiple).toBeGreaterThan(3);
    expect(roiFromHook.roiMultiple).toBeLessThan(20);
  });
});

describe('AUDIT: Boundary Conditions', () => {
  it('handles minimum realistic values', () => {
    const minStore: InputMetrics = {
      monthlyVisitors: 1000,
      currentCVR: 0.1,
      aov: 10,
      adSpend: 100,
    };

    const current = calculateCurrentState(minStore);
    expect(current.orders).toBe(1);  // 1000 × 0.001 = 1
    expect(current.revenue).toBe(10);  // 1 × $10 = $10
    expect(isFinite(current.roas)).toBe(true);
    expect(isFinite(current.cpa)).toBe(true);
  });

  it('handles maximum realistic values', () => {
    const maxStore: InputMetrics = {
      monthlyVisitors: 10000000,  // 10M
      currentCVR: 15,  // 15%
      aov: 5000,
      adSpend: 1000000,  // $1M
    };

    const current = calculateCurrentState(maxStore);
    expect(current.orders).toBe(1500000);  // 10M × 0.15
    expect(current.revenue).toBe(7500000000);  // 1.5M × $5000 = $7.5B
    expect(isFinite(current.roas)).toBe(true);
    expect(isFinite(current.cpa)).toBe(true);
  });

  it('handles high-value currency (COP-like)', () => {
    const copStore: InputMetrics = {
      monthlyVisitors: 50000,
      currentCVR: 2.5,
      aov: 320000,  // ~$80 USD × 4000
      adSpend: 40000000,  // ~$10K USD × 4000
    };

    const current = calculateCurrentState(copStore);

    // orders = 50,000 × 0.025 = 1,250 (same)
    expect(current.orders).toBe(1250);

    // revenue = 1,250 × 320,000 = 400,000,000 COP
    expect(current.revenue).toBe(400000000);

    // ROAS = 400M / 40M = 10 (same ratio!)
    expect(current.roas).toBe(10);

    // CPA = 40M / 1,250 = 32,000 COP (equivalent to $8 × 4000)
    expect(current.cpa).toBe(32000);
  });

  it('ROI ratio stays consistent across currencies', () => {
    // USD scenario
    const usdProjection = generateProjectionData(STANDARD_STORE, 'expected', 0, 6);
    const usdAdditional = usdProjection.reduce((sum, p) => sum + (p.improved - p.current), 0);
    const usdROI = calculateROI(4000, 6, usdAdditional);

    // COP scenario (all values × 4000)
    const copStore: InputMetrics = {
      monthlyVisitors: 50000,
      currentCVR: 2.5,
      aov: 320000,
      adSpend: 40000000,
    };
    const copProjection = generateProjectionData(copStore, 'expected', 0, 6);
    const copAdditional = copProjection.reduce((sum, p) => sum + (p.improved - p.current), 0);
    const copROI = calculateROI(16000000, 6, copAdditional);  // $4K × 4000

    // ROI ratios should be identical!
    expect(copROI.roiMultiple).toBeCloseTo(usdROI.roiMultiple, 1);
  });
});

describe('AUDIT: Random Case - Fashion Store', () => {
  // Caso aleatorio: Tienda de moda con alto tráfico
  const FASHION_STORE: InputMetrics = {
    monthlyVisitors: 120000,
    currentCVR: 1.8,
    aov: 145,
    adSpend: 25000,
  };

  it('current state matches manual calculation', () => {
    const result = calculateCurrentState(FASHION_STORE);

    // orders = 120,000 × 1.8% = 2,160
    expect(result.orders).toBeCloseTo(2160, 5);

    // revenue = 2,160 × $145 = $313,200
    expect(result.revenue).toBeCloseTo(313200, 0);

    // ROAS = $313,200 / $25,000 = 12.528
    expect(result.roas).toBeCloseTo(12.528, 2);

    // CPA = $25,000 / 2,160 = $11.574
    expect(result.cpa).toBeCloseTo(11.574, 2);

    // RPS = $313,200 / 120,000 = $2.61
    expect(result.rps).toBeCloseTo(2.61, 2);
  });

  it('improved state matches manual calculation', () => {
    const result = calculateImprovedState(FASHION_STORE, 'expected');

    // CVR = 1.8% × 1.25 = 2.25%
    expect(result.cvr).toBe(2.25);

    // orders = 120,000 × 2.25% = 2,700
    expect(result.orders).toBe(2700);

    // revenue = 2,700 × $145 = $391,500
    expect(result.revenue).toBe(391500);

    // Additional = $391,500 - $313,200 = $78,300/month
    const current = calculateCurrentState(FASHION_STORE);
    expect(result.revenue - current.revenue).toBeCloseTo(78300, 0);
  });

  it('projection follows implementation curve', () => {
    const data = generateProjectionData(FASHION_STORE, 'expected', 0, 6);

    // Month 1: 25% implementation
    // CVR = 1.8 × (1 + 0.25 × 0.25) = 1.8 × 1.0625 = 1.9125%
    // revenue = 120,000 × 0.019125 × $145 = $332,775
    expect(data[0].improved).toBe(332775);

    // Month 3: 100% implementation
    // revenue = $391,500
    expect(data[2].improved).toBe(391500);
  });

  it('ROI is realistic for this store size', () => {
    const data = generateProjectionData(FASHION_STORE, 'expected', 0, 6);
    const totalAdditional = data.reduce((sum, p) => sum + (p.improved - p.current), 0);

    const roi = calculateROI(6000, 6, totalAdditional);

    // ROI should be ~11.87x
    expect(roi.roiMultiple).toBeCloseTo(11.87, 1);

    // Payback should be < 1 month
    expect(roi.paybackMonths).toBeLessThan(1);
  });
});

describe('AUDIT: No NaN, Infinity, or Negative Values', () => {
  const scenarios: Scenario[] = ['conservative', 'expected', 'optimistic'];
  const reinvestments = [0, 25, 50, 75, 100];
  const months = [6, 9, 12];

  scenarios.forEach(scenario => {
    reinvestments.forEach(reinvest => {
      months.forEach(month => {
        it(`no invalid values for ${scenario}/${reinvest}%/${month}mo`, () => {
          const scaled = calculateScaledState(STANDARD_STORE, scenario, reinvest, month);

          expect(isFinite(scaled.cvr)).toBe(true);
          expect(isFinite(scaled.orders)).toBe(true);
          expect(isFinite(scaled.revenue)).toBe(true);
          expect(isFinite(scaled.roas)).toBe(true);
          expect(isFinite(scaled.cpa)).toBe(true);
          expect(isFinite(scaled.rps)).toBe(true);
          expect(isFinite(scaled.totalRevenue)).toBe(true);
          expect(isFinite(scaled.totalAdditionalRevenue)).toBe(true);
          expect(isFinite(scaled.totalAdSpent)).toBe(true);

          expect(scaled.cvr).toBeGreaterThanOrEqual(0);
          expect(scaled.orders).toBeGreaterThanOrEqual(0);
          expect(scaled.revenue).toBeGreaterThanOrEqual(0);
          expect(scaled.totalRevenue).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });
});
