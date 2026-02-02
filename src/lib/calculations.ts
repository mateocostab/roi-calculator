import type {
  InputMetrics,
  StateMetrics,
  ScaledMetrics,
  ProjectionDataPoint,
  ROIMetrics,
  QualificationTier,
  Scenario,
} from './types';
import { SCENARIO_MULTIPLIERS, QUALIFICATION_THRESHOLD, getImplementationFactor, CVR_DEGRADATION_FACTOR, MONTHLY_CVR_IMPROVEMENT } from './constants';

/**
 * Calculate current state metrics from input data
 */
export function calculateCurrentState(metrics: InputMetrics): StateMetrics {
  const { monthlyVisitors, currentCVR, aov, adSpend } = metrics;

  const cvr = currentCVR;
  const orders = monthlyVisitors * (cvr / 100);
  const revenue = orders * aov;
  const roas = adSpend > 0 ? revenue / adSpend : 0;
  const cpa = orders > 0 ? adSpend / orders : 0;
  const rps = monthlyVisitors > 0 ? revenue / monthlyVisitors : 0;

  return { cvr, orders, revenue, roas, cpa, rps };
}

/**
 * Calculate improved state metrics with CRO multiplier applied
 */
export function calculateImprovedState(
  metrics: InputMetrics,
  scenario: Scenario
): StateMetrics {
  const multiplier = SCENARIO_MULTIPLIERS[scenario];
  const { monthlyVisitors, currentCVR, aov, adSpend } = metrics;

  const cvr = currentCVR * multiplier;
  const orders = monthlyVisitors * (cvr / 100);
  const revenue = orders * aov;
  const roas = adSpend > 0 ? revenue / adSpend : 0;
  const cpa = orders > 0 ? adSpend / orders : 0;
  const rps = monthlyVisitors > 0 ? revenue / monthlyVisitors : 0;

  return { cvr, orders, revenue, roas, cpa, rps };
}

/**
 * Calculate scaled state with compound reinvestment over time
 * Applies gradual implementation curve: Month 1 = 25%, Month 2 = 60%, Month 3+ = 100%
 */
export function calculateScaledState(
  metrics: InputMetrics,
  scenario: Scenario,
  reinvestmentPercent: number,
  months: number
): ScaledMetrics {
  const multiplier = SCENARIO_MULTIPLIERS[scenario];
  const { monthlyVisitors, currentCVR, aov, adSpend } = metrics;

  // Full improved CVR (for final month display when month >= 3)
  const fullImprovedCVR = currentCVR * multiplier;

  // Calculate current monthly revenue for comparison
  const currentMonthlyRevenue = monthlyVisitors * (currentCVR / 100) * aov;

  let cumulativeRevenue = 0;
  let cumulativeAdditionalRevenue = 0;
  let cumulativeAdSpent = 0;
  let currentAdSpend = adSpend;

  // Final month metrics (for display)
  let finalOrders = 0;
  let finalRevenue = 0;
  let finalCVR = currentCVR;

  for (let month = 1; month <= months; month++) {
    // Get implementation factor for gradual ramp-up
    const implFactor = getImplementationFactor(month);

    // Base improvement percentage from scenario (e.g., 0.25 for expected = +25%)
    let improvementPercent = (multiplier - 1) * implFactor;

    // After month 3, CRO continues optimizing - add 2% per month (LINEAR, not compound)
    // This avoids double-exponential growth when combined with reinvestment
    if (month > 3) {
      const ongoingMonths = month - 3;
      improvementPercent += MONTHLY_CVR_IMPROVEMENT * ongoingMonths;
    }

    const effectiveCVR = currentCVR * (1 + improvementPercent);

    // Calculate this month's metrics with current ad spend
    // Use square root scaling to model diminishing returns on ad spend
    const adSpendRatio = adSpend > 0 ? currentAdSpend / adSpend : 1;
    const scaledVisitorRatio = Math.sqrt(adSpendRatio); // Diminishing returns
    const scaledVisitors = monthlyVisitors * scaledVisitorRatio;

    // CVR degrades when scaling - new visitors are less qualified
    const cvrDegradation = Math.pow(scaledVisitorRatio, -CVR_DEGRADATION_FACTOR);
    const scaledCVR = effectiveCVR * cvrDegradation;

    const monthOrders = scaledVisitors * (scaledCVR / 100);
    const monthRevenue = monthOrders * aov;
    const additionalRevenue = monthRevenue - currentMonthlyRevenue;

    cumulativeRevenue += monthRevenue;
    cumulativeAdditionalRevenue += additionalRevenue;
    cumulativeAdSpent += currentAdSpend;

    // Reinvest portion of additional revenue into next month's ad spend
    const reinvestment = additionalRevenue * (reinvestmentPercent / 100);
    currentAdSpend += reinvestment;

    // Store final month values
    if (month === months) {
      finalOrders = monthOrders;
      finalRevenue = monthRevenue;
      finalCVR = effectiveCVR;
    }
  }

  const finalRoas = cumulativeAdSpent > 0 ? cumulativeRevenue / cumulativeAdSpent : 0;
  const finalCpa = finalOrders > 0 ? currentAdSpend / finalOrders : 0;
  const finalRps = monthlyVisitors > 0 ? finalRevenue / monthlyVisitors : 0;

  return {
    cvr: finalCVR,
    orders: finalOrders,
    revenue: finalRevenue,
    roas: finalRoas,
    cpa: finalCpa,
    rps: finalRps,
    totalRevenue: cumulativeRevenue,
    totalAdditionalRevenue: cumulativeAdditionalRevenue,
    totalAdSpent: cumulativeAdSpent,
  };
}

/**
 * Generate projection data for chart visualization
 * Applies gradual implementation curve: Month 1 = 25%, Month 2 = 60%, Month 3+ = 100%
 */
export function generateProjectionData(
  metrics: InputMetrics,
  scenario: Scenario,
  reinvestmentPercent: number,
  months: number
): ProjectionDataPoint[] {
  const multiplier = SCENARIO_MULTIPLIERS[scenario];
  const { monthlyVisitors, currentCVR, aov, adSpend } = metrics;

  const currentMonthlyRevenue = monthlyVisitors * (currentCVR / 100) * aov;

  const data: ProjectionDataPoint[] = [];

  let currentAdSpend = adSpend;
  let currentCumulative = 0;
  let improvedCumulative = 0;
  let scaledCumulative = 0;

  for (let month = 1; month <= months; month++) {
    // Get implementation factor for gradual ramp-up
    const implFactor = getImplementationFactor(month);

    // Base CVR improvement from scenario multiplier with implementation curve
    const baseCVR = currentCVR * (1 + (multiplier - 1) * implFactor);

    // For "improved" line: apply ongoing 2% monthly improvement after month 3
    let improvedCVR = baseCVR;
    if (month > 3) {
      const ongoingMonths = month - 3;
      improvedCVR *= Math.pow(1 + MONTHLY_CVR_IMPROVEMENT, ongoingMonths);
    }

    // Current state (no improvement)
    currentCumulative += currentMonthlyRevenue;

    // Improved state (CRO with gradual ramp-up + ongoing optimization, no scaling)
    const improvedMonthlyRevenue = monthlyVisitors * (improvedCVR / 100) * aov;
    improvedCumulative += improvedMonthlyRevenue;

    // Scaled state (CRO with gradual ramp-up + reinvestment)
    // Note: Does NOT include ongoing 2% improvement to avoid double-compounding
    // Use square root scaling to model diminishing returns on ad spend
    const adSpendRatio = adSpend > 0 ? currentAdSpend / adSpend : 1;
    const scaledVisitorRatio = Math.sqrt(adSpendRatio); // Diminishing returns
    const scaledVisitors = monthlyVisitors * scaledVisitorRatio;

    // CVR degrades when scaling - new visitors are less qualified
    const cvrDegradation = Math.pow(scaledVisitorRatio, -CVR_DEGRADATION_FACTOR);
    const scaledCVR = baseCVR * cvrDegradation;

    const scaledRevenue = scaledVisitors * (scaledCVR / 100) * aov;
    scaledCumulative += scaledRevenue;

    data.push({
      month,
      current: currentMonthlyRevenue,
      improved: improvedMonthlyRevenue,
      scaled: scaledRevenue,
      currentCumulative,
      improvedCumulative,
      scaledCumulative,
    });

    // Calculate reinvestment for next month
    const additionalRevenue = scaledRevenue - currentMonthlyRevenue;
    const reinvestment = additionalRevenue * (reinvestmentPercent / 100);
    currentAdSpend += reinvestment;
  }

  return data;
}

/**
 * Calculate ROI metrics for the CRO investment
 * Accepts projection data for accurate payback calculation using implementation curve
 */
export function calculateROI(
  croInvestment: number,
  months: number,
  totalAdditionalRevenue: number,
  projectionData: ProjectionDataPoint[]
): ROIMetrics {
  const totalInvestment = croInvestment * months;

  const roiMultiple = totalInvestment > 0
    ? totalAdditionalRevenue / totalInvestment
    : 0;

  const roiPercent = roiMultiple * 100;

  // Payback period - calculate when cumulative revenue covers TOTAL investment
  // This is more realistic: when do you recover your full commitment, not just one month
  let paybackMonths = Infinity;
  let accumulated = 0;
  for (let i = 0; i < projectionData.length; i++) {
    const monthAdditional = projectionData[i].improved - projectionData[i].current;
    accumulated += monthAdditional;
    if (accumulated >= totalInvestment && paybackMonths === Infinity) {
      const prevAccumulated = accumulated - monthAdditional;
      const needed = totalInvestment - prevAccumulated;
      const fraction = monthAdditional > 0 ? needed / monthAdditional : 0;
      paybackMonths = i + 1 + fraction; // +1 because months are 1-indexed for display
    }
  }

  return {
    totalInvestment,
    totalAdditionalRevenue,
    roiMultiple,
    roiPercent,
    paybackMonths,
  };
}

/**
 * Determine qualification tier based on monthly visitors
 */
export function getQualificationTier(monthlyVisitors: number): QualificationTier {
  return monthlyVisitors >= QUALIFICATION_THRESHOLD
    ? 'cro_recurring'
    : 'high_conversion_ecom';
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentChange(original: number, updated: number): number {
  if (original === 0) return updated > 0 ? 100 : 0;
  return ((updated - original) / original) * 100;
}
