/**
 * Format a number as currency (USD)
 */
export function formatCurrency(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1_000_000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }

  if (compact && Math.abs(value) >= 1_000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a number as a percentage
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1_000_000) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a decimal number (for ROAS, multipliers, etc.)
 */
export function formatDecimal(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

/**
 * Format ROAS as a multiplier (e.g., "4.5x")
 */
export function formatRoas(value: number): string {
  return `${value.toFixed(2)}x`;
}

type FormatTranslationKey = 'format.lessThanOneMonth' | 'format.month' | 'format.months';

/**
 * Format months (e.g., "3 months" or "< 1 month")
 */
export function formatMonths(value: number, t: (key: FormatTranslationKey) => string): string {
  if (!isFinite(value) || value <= 0) {
    return '∞';
  }
  if (value < 1) {
    return t('format.lessThanOneMonth');
  }
  const rounded = Math.ceil(value);
  return rounded === 1
    ? `${rounded} ${t('format.month')}`
    : `${rounded} ${t('format.months')}`;
}

/**
 * Parse a formatted currency string back to a number
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Parse a formatted number string back to a number
 */
export function parseNumber(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Format a change indicator (positive/negative)
 */
export function formatChange(value: number): string {
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${formatPercent(value)}`;
}
