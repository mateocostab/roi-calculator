export type Scenario = 'conservative' | 'expected' | 'optimistic';
export type QualificationTier = 'cro_recurring' | 'high_conversion_ecom';
export type Language = 'es' | 'en';
export type Currency = 'USD' | 'MXN' | 'COP' | 'ARS' | 'CLP' | 'PEN' | 'BRL';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  locale: string;
  exchangeRate: number; // Approximate exchange rate vs USD for realistic defaults
}

export interface InputMetrics {
  monthlyVisitors: number;
  currentCVR: number;
  aov: number;
  adSpend: number;
}

export interface CalculatorInputs extends InputMetrics {
  scenario: Scenario;
  reinvestmentPercent: number;
  croInvestment: number;
  projectionMonths: number;
}

export interface StateMetrics {
  cvr: number;
  orders: number;
  revenue: number;
  roas: number;
  cpa: number;
  rps: number;
}

export interface ScaledMetrics extends StateMetrics {
  totalRevenue: number;
  totalAdditionalRevenue: number;
  totalAdSpent: number;
}

export interface ProjectionDataPoint {
  month: number;
  current: number;
  improved: number;
  scaled: number;
  scaledNoCro: number;
  currentCumulative: number;
  improvedCumulative: number;
  scaledCumulative: number;
  scaledNoCroCumulative: number;
}

export interface ROIMetrics {
  totalInvestment: number;
  totalAdditionalRevenue: number;
  roiMultiple: number;
  roiPercent: number;
  paybackMonths: number;
  roiAt3Months: number; // ROI at 3 months, aligned with guarantee
  firstProfitableMonth: number; // First month where monthly revenue >= monthly CRO
}

export interface CalculatorState {
  inputs: CalculatorInputs;
  currentState: StateMetrics;
  improvedState: StateMetrics;
  scaledState: ScaledMetrics;
  projectionData: ProjectionDataPoint[];
  roiMetrics: ROIMetrics;
  qualificationTier: QualificationTier;
}

export interface InputRange {
  min: number;
  max: number;
  step: number;
  default: number;
}

export interface ScenarioConfig {
  id: Scenario;
  multiplier: number;
  labelKey: string;
}
