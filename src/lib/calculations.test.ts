import { describe, it, expect } from 'vitest';
import {
  calculateCurrentState,
  calculateImprovedState,
  calculateScaledState,
  generateProjectionData,
  calculateROI,
  getQualificationTier,
  calculatePercentChange,
} from './calculations';
import type { InputMetrics, Scenario } from './types';

describe('calculateCurrentState', () => {
  it('calculates CVR correctly (passes through)', () => {
    const metrics: InputMetrics = {
      monthlyVisitors: 50000,
      currentCVR: 2.5,
      aov: 80,
      adSpend: 10000,
    };
    const result = calculateCurrentState(metrics);
    expect(result.cvr).toBe(2.5);
  });

  it('calculates orders correctly (visitors * CVR%)', () => {
    const metrics: InputMetrics = {
      monthlyVisitors: 50000,
      currentCVR: 2.5,
      aov: 80,
      adSpend: 10000,
    };
    const result = calculateCurrentState(metrics);
    // 50000 * (2.5 / 100) = 1250
    expect(result.orders).toBe(1250);
  });

  it('calculates revenue correctly (orders * AOV)', () => {
    const metrics: InputMetrics = {
      monthlyVisitors: 50000,
      currentCVR: 2.5,
      aov: 80,
      adSpend: 10000,
    };
    const result = calculateCurrentState(metrics);
    // 1250 * 80 = 100000
    expect(result.revenue).toBe(100000);
  });

  it('calculates ROAS correctly (revenue / adSpend)', () => {
    const metrics: InputMetrics = {
      monthlyVisitors: 50000,
      currentCVR: 2.5,
      aov: 80,
      adSpend: 10000,
    };
    const result = calculateCurrentState(metrics);
    // 100000 / 10000 = 10
    expect(result.roas).toBe(10);
  });

  it('calculates CPA correctly (adSpend / orders)', () => {
    const metrics: InputMetrics = {
      monthlyVisitors: 50000,
      currentCVR: 2.5,
      aov: 80,
      adSpend: 10000,
    };
    const result = calculateCurrentState(metrics);
    // 10000 / 1250 = 8
    expect(result.cpa).toBe(8);
  });

  it('calculates RPS correctly (revenue / visitors)', () => {
    const metrics: InputMetrics = {
      monthlyVisitors: 50000,
      currentCVR: 2.5,
      aov: 80,
      adSpend: 10000,
    };
    const result = calculateCurrentState(metrics);
    // 100000 / 50000 = 2
    expect(result.rps).toBe(2);
  });

  it('handles zero adSpend (ROAS = 0)', () => {
    const metrics: InputMetrics = {
      monthlyVisitors: 50000,
      currentCVR: 2.5,
      aov: 80,
      adSpend: 0,
    };
    const result = calculateCurrentState(metrics);
    expect(result.roas).toBe(0);
  });

  it('handles zero visitors (RPS = 0)', () => {
    const metrics: InputMetrics = {
      monthlyVisitors: 0,
      currentCVR: 2.5,
      aov: 80,
      adSpend: 10000,
    };
    const result = calculateCurrentState(metrics);
    expect(result.rps).toBe(0);
  });

  it('handles zero orders (CPA = 0)', () => {
    const metrics: InputMetrics = {
      monthlyVisitors: 50000,
      currentCVR: 0,
      aov: 80,
      adSpend: 10000,
    };
    const result = calculateCurrentState(metrics);
    expect(result.cpa).toBe(0);
  });
});

describe('calculateImprovedState', () => {
  const baseMetrics: InputMetrics = {
    monthlyVisitors: 50000,
    currentCVR: 2.5,
    aov: 80,
    adSpend: 10000,
  };

  // New realistic multipliers: conservative=1.15, expected=1.25, optimistic=1.40
  it('applies conservative multiplier (1.15x CVR)', () => {
    const result = calculateImprovedState(baseMetrics, 'conservative');
    // 2.5 * 1.15 = 2.875
    expect(result.cvr).toBe(2.875);
  });

  it('applies expected multiplier (1.25x CVR)', () => {
    const result = calculateImprovedState(baseMetrics, 'expected');
    // 2.5 * 1.25 = 3.125
    expect(result.cvr).toBe(3.125);
  });

  it('applies optimistic multiplier (1.40x CVR)', () => {
    const result = calculateImprovedState(baseMetrics, 'optimistic');
    // 2.5 * 1.40 = 3.5
    expect(result.cvr).toBe(3.5);
  });

  it('calculates improved orders correctly', () => {
    const result = calculateImprovedState(baseMetrics, 'expected');
    // 50000 * (3.125 / 100) = 1562.5
    expect(result.orders).toBe(1562.5);
  });

  it('calculates improved revenue correctly', () => {
    const result = calculateImprovedState(baseMetrics, 'expected');
    // 1562.5 * 80 = 125000
    expect(result.revenue).toBe(125000);
  });

  it('calculates improved ROAS correctly', () => {
    const result = calculateImprovedState(baseMetrics, 'expected');
    // 125000 / 10000 = 12.5
    expect(result.roas).toBe(12.5);
  });

  it('calculates improved CPA correctly (lower is better)', () => {
    const result = calculateImprovedState(baseMetrics, 'expected');
    // 10000 / 1562.5 = 6.4
    expect(result.cpa).toBe(6.4);
  });
});

describe('calculateScaledState', () => {
  const baseMetrics: InputMetrics = {
    monthlyVisitors: 50000,
    currentCVR: 2.5,
    aov: 80,
    adSpend: 10000,
  };

  it('calculates scaled state with gradual implementation curve and ongoing 1%', () => {
    const result = calculateScaledState(baseMetrics, 'expected', 0, 6);
    // New multiplier: expected = 1.25 (+25%)
    // Gradual implementation + ongoing 1% linear improvement after month 3
    // Month 1: +6.25% → CVR 2.65625 → revenue 106250
    // Month 2: +15% → CVR 2.875 → revenue 115000
    // Month 3: +25% → CVR 3.125 → revenue 125000
    // Month 4: +26% → CVR 3.15 → revenue 126000
    // Month 5: +27% → CVR 3.175 → revenue 127000
    // Month 6: +28% → CVR 3.2 → revenue 128000
    // Total: 106250 + 115000 + 125000 + 126000 + 127000 + 128000 = 727250
    expect(result.totalRevenue).toBe(727250);
  });

  it('calculates additional revenue with gradual implementation and ongoing 1%', () => {
    const result = calculateScaledState(baseMetrics, 'expected', 0, 6);
    // Current monthly: 100000
    // Additional per month: 6250, 15000, 25000, 26000, 27000, 28000
    // Total: 127250
    expect(result.totalAdditionalRevenue).toBe(127250);
  });

  it('compounds revenue with reinvestment', () => {
    const result = calculateScaledState(baseMetrics, 'expected', 50, 6);
    // With 50% reinvestment, revenue should be higher than without
    const resultNoReinvest = calculateScaledState(baseMetrics, 'expected', 0, 6);
    expect(result.totalRevenue).toBeGreaterThan(resultNoReinvest.totalRevenue);
  });

  it('tracks total ad spend', () => {
    const result = calculateScaledState(baseMetrics, 'expected', 0, 6);
    // With 0% reinvestment, ad spend stays constant
    // 10000 * 6 = 60000
    expect(result.totalAdSpent).toBe(60000);
  });

  it('applies ongoing 1% CVR improvement after month 3 (linear)', () => {
    // Test with 0% reinvestment to isolate CVR improvement effect
    const result = calculateScaledState(baseMetrics, 'expected', 0, 6);
    // Month 3 improvement: +25% (multiplier 1.25)
    // Month 4: +25% + 1% = +26%
    // Month 5: +25% + 2% = +27%
    // Month 6: +25% + 3% = +28% → CVR = 2.5 * 1.28 = 3.2
    // Linear growth avoids double-exponential when combined with reinvestment
    expect(result.cvr).toBeCloseTo(3.2, 2);
  });

  it('ROI stays reasonable with 50% reinvestment over 6 months', () => {
    // This test ensures the model doesn't explode to unrealistic values
    // With 50K visitors, 2.5% CVR, $80 AOV, $10K ad spend, 50% reinvestment:
    // ROI should be good (10-50x) but not absurd (1000x+)
    const result = calculateScaledState(baseMetrics, 'expected', 50, 6);
    const totalInvestment = 4000 * 6; // $4000/month CRO investment
    const roi = result.totalAdditionalRevenue / totalInvestment;
    expect(roi).toBeGreaterThan(5); // Should be very profitable with reinvestment
    expect(roi).toBeLessThan(50); // But not unrealistically so
  });
});

describe('generateProjectionData', () => {
  const baseMetrics: InputMetrics = {
    monthlyVisitors: 50000,
    currentCVR: 2.5,
    aov: 80,
    adSpend: 10000,
  };

  it('generates correct number of data points', () => {
    const data = generateProjectionData(baseMetrics, 'expected', 50, 6);
    expect(data).toHaveLength(6);
  });

  it('each point has correct month number', () => {
    const data = generateProjectionData(baseMetrics, 'expected', 50, 6);
    data.forEach((point, index) => {
      expect(point.month).toBe(index + 1);
    });
  });

  it('current revenue is consistent across months', () => {
    const data = generateProjectionData(baseMetrics, 'expected', 50, 6);
    // Current monthly: 100000
    data.forEach((point) => {
      expect(point.current).toBe(100000);
    });
  });

  it('improved revenue follows gradual implementation curve with ongoing 1% improvement', () => {
    const data = generateProjectionData(baseMetrics, 'expected', 0, 6);
    // New multiplier: expected = 1.25
    // Month 1: 25% of improvement → CVR 2.5 * (1 + 0.25*0.25) = 2.65625 → revenue 106250
    // Month 2: 60% of improvement → CVR 2.5 * (1 + 0.25*0.60) = 2.875 → revenue 115000
    // Month 3: 100% of improvement → CVR 2.5 * 1.25 = 3.125 → revenue 125000
    // Month 4+: CVR compounds by 1% monthly after month 3
    // Month 4: CVR 3.125 * 1.01 = 3.15625 → revenue 126250
    // Month 5: CVR 3.125 * 1.01^2 = 3.1878... → revenue ~127512.5
    // Month 6: CVR 3.125 * 1.01^3 = 3.2197... → revenue ~128787.6
    expect(data[0].improved).toBe(106250);
    expect(data[1].improved).toBe(115000);
    expect(data[2].improved).toBe(125000);
    expect(data[3].improved).toBe(126250);
    expect(data[4].improved).toBeCloseTo(127512.5, 0);
    expect(data[5].improved).toBeCloseTo(128787.6, 0);
  });

  it('cumulative values increase over time', () => {
    const data = generateProjectionData(baseMetrics, 'expected', 50, 6);
    for (let i = 1; i < data.length; i++) {
      expect(data[i].currentCumulative).toBeGreaterThan(data[i - 1].currentCumulative);
      expect(data[i].improvedCumulative).toBeGreaterThan(data[i - 1].improvedCumulative);
      expect(data[i].scaledCumulative).toBeGreaterThan(data[i - 1].scaledCumulative);
    }
  });

  it('scaled cumulative exceeds improved cumulative with reinvestment', () => {
    const data = generateProjectionData(baseMetrics, 'expected', 50, 6);
    const lastPoint = data[data.length - 1];
    expect(lastPoint.scaledCumulative).toBeGreaterThan(lastPoint.improvedCumulative);
  });
});

describe('calculateROI', () => {
  // Note: calculateROI now takes totalAdditionalRevenue and projectionData
  // It calculates payback using the real implementation curve from projectionData

  // Mock projection data for testing
  const mockProjectionData = [
    { month: 1, current: 100000, improved: 106250, scaled: 106250, currentCumulative: 100000, improvedCumulative: 106250, scaledCumulative: 106250 },
    { month: 2, current: 100000, improved: 115000, scaled: 115000, currentCumulative: 200000, improvedCumulative: 221250, scaledCumulative: 221250 },
    { month: 3, current: 100000, improved: 125000, scaled: 125000, currentCumulative: 300000, improvedCumulative: 346250, scaledCumulative: 346250 },
    { month: 4, current: 100000, improved: 126250, scaled: 126250, currentCumulative: 400000, improvedCumulative: 472500, scaledCumulative: 472500 },
    { month: 5, current: 100000, improved: 127500, scaled: 127500, currentCumulative: 500000, improvedCumulative: 600000, scaledCumulative: 600000 },
    { month: 6, current: 100000, improved: 128750, scaled: 128750, currentCumulative: 600000, improvedCumulative: 728750, scaledCumulative: 728750 },
  ];

  it('calculates total investment correctly', () => {
    const result = calculateROI(3000, 6, 128750, mockProjectionData);
    // 3000 * 6 = 18000
    expect(result.totalInvestment).toBe(18000);
  });

  it('passes through total additional revenue', () => {
    const result = calculateROI(3000, 6, 128750, mockProjectionData);
    expect(result.totalAdditionalRevenue).toBe(128750);
  });

  it('calculates ROI multiple correctly', () => {
    const result = calculateROI(3000, 6, 128750, mockProjectionData);
    // 128750 / 18000 = 7.15
    expect(result.roiMultiple).toBeCloseTo(7.15, 2);
  });

  it('calculates ROI percent correctly', () => {
    const result = calculateROI(3000, 6, 128750, mockProjectionData);
    // 7.15 * 100 = 715%
    expect(result.roiPercent).toBeCloseTo(715.28, 2);
  });

  it('calculates payback period using cumulative curve', () => {
    // With croInvestment = 3000:
    // Month 1: accumulated = 6250
    // Need to find when accumulated >= 3000
    // Month 1 additional = 6250, so payback = 3000/6250 = 0.48 months
    const result = calculateROI(3000, 6, 128750, mockProjectionData);
    expect(result.paybackMonths).toBeCloseTo(0.48, 2);
  });

  it('handles zero investment (ROI = 0)', () => {
    const result = calculateROI(0, 6, 128750, mockProjectionData);
    expect(result.roiMultiple).toBe(0);
  });

  it('handles zero additional revenue (payback = Infinity)', () => {
    const zeroRevenueData = mockProjectionData.map(p => ({ ...p, improved: p.current }));
    const result = calculateROI(3000, 6, 0, zeroRevenueData);
    expect(result.paybackMonths).toBe(Infinity);
  });
});

describe('getQualificationTier', () => {
  it('returns cro_recurring for 80K+ visitors', () => {
    expect(getQualificationTier(80000)).toBe('cro_recurring');
    expect(getQualificationTier(100000)).toBe('cro_recurring');
  });

  it('returns high_conversion_ecom for <80K visitors', () => {
    expect(getQualificationTier(79999)).toBe('high_conversion_ecom');
    expect(getQualificationTier(50000)).toBe('high_conversion_ecom');
  });
});

describe('calculatePercentChange', () => {
  it('calculates positive change correctly', () => {
    // 100 -> 150 = 50% increase
    expect(calculatePercentChange(100, 150)).toBe(50);
  });

  it('calculates negative change correctly', () => {
    // 100 -> 80 = -20% decrease
    expect(calculatePercentChange(100, 80)).toBe(-20);
  });

  it('handles zero original value', () => {
    expect(calculatePercentChange(0, 100)).toBe(100);
    expect(calculatePercentChange(0, 0)).toBe(0);
  });
});

describe('Integration Test - Full Calculator Flow', () => {
  // This test simulates exactly what the UI does with DEFAULT inputs
  // to ensure all numbers displayed are coherent and realistic
  const DEFAULT_METRICS: InputMetrics = {
    monthlyVisitors: 50000,
    currentCVR: 2.5,
    aov: 80,
    adSpend: 10000,
  };
  const DEFAULT_SCENARIO: Scenario = 'expected';
  const DEFAULT_REINVESTMENT = 50;
  const DEFAULT_CRO_INVESTMENT = 4000;
  const DEFAULT_MONTHS = 6;

  it('produces coherent values for default inputs', () => {
    // Step 1: Current state
    const currentState = calculateCurrentState(DEFAULT_METRICS);
    expect(currentState.revenue).toBe(100000); // 50K * 2.5% * $80

    // Step 2: Improved state (no reinvestment)
    const improvedState = calculateImprovedState(DEFAULT_METRICS, DEFAULT_SCENARIO);
    expect(improvedState.cvr).toBe(3.125); // 2.5% * 1.25
    expect(improvedState.revenue).toBe(125000); // 50K * 3.125% * $80

    // Step 3: Projection data
    const projectionData = generateProjectionData(
      DEFAULT_METRICS,
      DEFAULT_SCENARIO,
      DEFAULT_REINVESTMENT,
      DEFAULT_MONTHS
    );

    // Verify each month follows implementation curve
    // Month 1: 25% of improvement
    expect(projectionData[0].current).toBe(100000);
    expect(projectionData[0].improved).toBe(106250); // +6.25% = 100K * 1.0625

    // Month 2: 60% of improvement
    expect(projectionData[1].improved).toBe(115000); // +15% = 100K * 1.15

    // Month 3: 100% of improvement
    expect(projectionData[2].improved).toBe(125000); // +25% = 100K * 1.25

    // Step 4: Calculate total additional revenue (exactly as UI does)
    const totalAdditionalRevenueFromImproved = projectionData.reduce(
      (sum, point) => sum + (point.improved - point.current),
      0
    );

    // Should be realistic: ~$128K additional over 6 months (with 1% monthly improvement)
    expect(totalAdditionalRevenueFromImproved).toBeGreaterThan(100000);
    expect(totalAdditionalRevenueFromImproved).toBeLessThan(200000);

    // Step 5: Calculate ROI (exactly as UI does)
    const roiMetrics = calculateROI(
      DEFAULT_CRO_INVESTMENT,
      DEFAULT_MONTHS,
      totalAdditionalRevenueFromImproved,
      projectionData
    );

    // ROI should be reasonable (not 5000x!)
    expect(roiMetrics.totalInvestment).toBe(24000); // $4K * 6 months
    expect(roiMetrics.roiMultiple).toBeGreaterThan(3); // At least 3x
    expect(roiMetrics.roiMultiple).toBeLessThan(20); // But not absurdly high

    // Log actual values for debugging
    console.log('=== Integration Test Values ===');
    console.log('Current Monthly Revenue:', currentState.revenue);
    console.log('Improved Monthly Revenue (full):', improvedState.revenue);
    console.log('Total Additional Revenue:', totalAdditionalRevenueFromImproved);
    console.log('Total Investment:', roiMetrics.totalInvestment);
    console.log('ROI Multiple:', roiMetrics.roiMultiple.toFixed(2) + 'x');
  });

  it('scaled state with reinvestment stays realistic', () => {
    const scaledState = calculateScaledState(
      DEFAULT_METRICS,
      DEFAULT_SCENARIO,
      DEFAULT_REINVESTMENT,
      DEFAULT_MONTHS
    );

    // Total additional revenue should be higher than without reinvestment
    // but still realistic (not millions or billions!)
    expect(scaledState.totalAdditionalRevenue).toBeGreaterThan(100000);
    expect(scaledState.totalAdditionalRevenue).toBeLessThan(2000000); // Max $2M

    // Final monthly revenue should be higher but not crazy
    expect(scaledState.revenue).toBeGreaterThan(100000);
    expect(scaledState.revenue).toBeLessThan(1000000); // Max $1M/month

    // ROI from scaled state should be reasonable
    const roi = scaledState.totalAdditionalRevenue / (DEFAULT_CRO_INVESTMENT * DEFAULT_MONTHS);
    expect(roi).toBeGreaterThan(5);
    expect(roi).toBeLessThan(100); // Max 100x with scaling

    console.log('=== Scaled State Values ===');
    console.log('Total Additional Revenue (scaled):', scaledState.totalAdditionalRevenue);
    console.log('Final Monthly Revenue:', scaledState.revenue);
    console.log('ROI with scaling:', roi.toFixed(2) + 'x');
  });
});
