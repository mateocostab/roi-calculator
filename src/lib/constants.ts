import type { InputRange, Scenario, ScenarioConfig, Currency, CurrencyConfig } from './types';

// Qualification threshold (80K visitors/month)
export const QUALIFICATION_THRESHOLD = 80_000;

// Currency configurations for LATAM with approximate exchange rates vs USD
export const CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'USD', locale: 'en-US', exchangeRate: 1 },
  { code: 'MXN', symbol: '$', name: 'MXN', locale: 'es-MX', exchangeRate: 17 },
  { code: 'COP', symbol: '$', name: 'COP', locale: 'es-CO', exchangeRate: 4000 },
  { code: 'ARS', symbol: '$', name: 'ARS', locale: 'es-AR', exchangeRate: 900 },
  { code: 'CLP', symbol: '$', name: 'CLP', locale: 'es-CL', exchangeRate: 900 },
  { code: 'PEN', symbol: 'S/', name: 'PEN', locale: 'es-PE', exchangeRate: 3.7 },
  { code: 'BRL', symbol: 'R$', name: 'BRL', locale: 'pt-BR', exchangeRate: 5 },
];

export const DEFAULT_CURRENCY: Currency = 'USD';

// Scenario multipliers for CVR improvement
// Based on results from 100+ ecommerce stores
export const SCENARIO_MULTIPLIERS: Record<Scenario, number> = {
  conservative: 1.15, // 15% improvement - Gradual
  expected: 1.25,     // 25% improvement - Typical
  optimistic: 1.40,   // 40% improvement - Accelerated
};

// Gradual implementation curve - CRO results ramp up over time
// Month 1: 25%, Month 2: 60%, Month 3+: 100%
export const IMPLEMENTATION_CURVE: Record<number, number> = {
  1: 0.25,  // 25% of improvement in month 1
  2: 0.60,  // 60% of improvement in month 2
  3: 1.00,  // 100% from month 3 onwards
};

// Get the implementation factor for a given month
export function getImplementationFactor(month: number): number {
  if (month <= 0) return 0;
  if (month >= 3) return 1;
  return IMPLEMENTATION_CURVE[month] ?? 1;
}

// CVR degradation when scaling - reflects that new visitors from increased
// ad spend are typically less qualified
// 0.3 = moderate degradation, 0.5 = aggressive, 0 = none
export const CVR_DEGRADATION_FACTOR = 0.3;

// Monthly CVR improvement after implementation (month 3+)
// CRO work continues - ongoing optimization improves CVR by ~1% each month
// Conservative estimate for realistic sales projections
export const MONTHLY_CVR_IMPROVEMENT = 0.01;

export const SCENARIOS: ScenarioConfig[] = [
  { id: 'conservative', multiplier: 1.15, labelKey: 'scenarios.conservative' },
  { id: 'expected', multiplier: 1.25, labelKey: 'scenarios.expected' },
  { id: 'optimistic', multiplier: 1.40, labelKey: 'scenarios.optimistic' },
];

// Input ranges
export const INPUT_RANGES: Record<string, InputRange> = {
  monthlyVisitors: {
    min: 1_000,
    max: 10_000_000,
    step: 1_000,
    default: 50_000,
  },
  currentCVR: {
    min: 0.1,
    max: 15,
    step: 0.1,
    default: 2.5,
  },
  aov: {
    min: 10,
    max: 5_000,
    step: 5,
    default: 80,
  },
  adSpend: {
    min: 0,
    max: 1_000_000,
    step: 100,
    default: 10_000,
  },
  reinvestmentPercent: {
    min: 0,
    max: 100,
    step: 5,
    default: 50,
  },
  croInvestment: {
    min: 500,
    max: 50_000,
    step: 100,
    default: 4_000,
  },
  projectionMonths: {
    min: 6,  // Minimum 6 months for realistic projections
    max: 12,
    step: 1,
    default: 6,
  },
};

// Brand colors (for use in charts and dynamic styles)
export const BRAND_COLORS = {
  green500: '#00ff84',
  green600: '#00c05f',
  green700: '#00964d',
  green950: '#00371d',
  purple500: '#8b5cf6',
} as const;

// Chart colors - accessible & colorblind-friendly
// Using distinct hues with sufficient luminance contrast
export const CHART_COLORS = {
  current: '#9ca3af',     // Light gray for current state (improved contrast)
  improved: '#00ff84',    // Green for CRO improved
  scaled: '#a78bfa',      // Lighter purple for scaled (better visibility)
} as const;

// Default calculator inputs
export const DEFAULT_INPUTS = {
  monthlyVisitors: INPUT_RANGES.monthlyVisitors.default,
  currentCVR: INPUT_RANGES.currentCVR.default,
  aov: INPUT_RANGES.aov.default,
  adSpend: INPUT_RANGES.adSpend.default,
  scenario: 'expected' as Scenario,
  reinvestmentPercent: INPUT_RANGES.reinvestmentPercent.default,
  croInvestment: INPUT_RANGES.croInvestment.default,
  projectionMonths: INPUT_RANGES.projectionMonths.default,
};
