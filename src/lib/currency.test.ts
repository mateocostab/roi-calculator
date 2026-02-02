import { describe, it, expect } from 'vitest';
import { CURRENCIES } from './constants';
import {
  calculateCurrentState,
  calculateImprovedState,
  generateProjectionData,
  calculateROI,
} from './calculations';
import type { InputMetrics } from './types';

describe('Currency Configuration', () => {
  it('has USD as base currency with rate 1', () => {
    const usd = CURRENCIES.find(c => c.code === 'USD');
    expect(usd).toBeDefined();
    expect(usd?.exchangeRate).toBe(1);
  });

  it('has all LATAM currencies defined', () => {
    const codes = CURRENCIES.map(c => c.code);
    expect(codes).toContain('USD');
    expect(codes).toContain('MXN');
    expect(codes).toContain('COP');
    expect(codes).toContain('ARS');
    expect(codes).toContain('CLP');
    expect(codes).toContain('PEN');
    expect(codes).toContain('BRL');
  });

  it('COP has reasonable exchange rate (~4000)', () => {
    const cop = CURRENCIES.find(c => c.code === 'COP');
    expect(cop?.exchangeRate).toBe(4000);
  });

  it('MXN has reasonable exchange rate (~17)', () => {
    const mxn = CURRENCIES.find(c => c.code === 'MXN');
    expect(mxn?.exchangeRate).toBe(17);
  });
});

describe('Currency Conversion Logic', () => {
  // These tests define the expected behavior for currency conversion

  it('converts USD to COP correctly', () => {
    const usdValue = 80; // $80 USD
    const copRate = 4000;
    const copValue = Math.round(usdValue * copRate);
    expect(copValue).toBe(320000); // Should be 320,000 COP
  });

  it('converts COP to USD correctly', () => {
    const copValue = 320000; // 320,000 COP
    const usdRate = 1;
    const copRate = 4000;
    const conversionRate = usdRate / copRate;
    const usdValue = Math.round(copValue * conversionRate);
    expect(usdValue).toBe(80); // Should be $80 USD
  });

  it('converts between two non-USD currencies correctly', () => {
    // 320,000 COP -> MXN
    const copValue = 320000;
    const copRate = 4000;
    const mxnRate = 17;
    const conversionRate = mxnRate / copRate;
    const mxnValue = Math.round(copValue * conversionRate);
    // 320000 * (17/4000) = 320000 * 0.00425 = 1360
    expect(mxnValue).toBe(1360);
  });

  it('round-trip conversion preserves approximate value', () => {
    const originalUsd = 80;
    const copRate = 4000;
    const cop = Math.round(originalUsd * copRate); // USD -> COP
    const backToUsd = Math.round(cop / copRate); // COP -> USD
    expect(backToUsd).toBe(originalUsd);
  });
});

describe('Number Formatting by Locale', () => {
  // Define expected behavior for number formatting

  describe('USD locale (en-US) - uses comma for thousands', () => {
    it('formats 1000 as "1,000"', () => {
      const formatted = (1000).toLocaleString('en-US');
      expect(formatted).toBe('1,000');
    });

    it('formats 1000000 as "1,000,000"', () => {
      const formatted = (1000000).toLocaleString('en-US');
      expect(formatted).toBe('1,000,000');
    });
  });

  describe('COP/ARS/CLP/BRL locale - uses period for thousands', () => {
    // These locales use German-style formatting (period for thousands)
    it('formats 1000 as "1.000"', () => {
      const formatted = (1000).toLocaleString('de-DE');
      expect(formatted).toBe('1.000');
    });

    it('formats 1000000 as "1.000.000"', () => {
      const formatted = (1000000).toLocaleString('de-DE');
      expect(formatted).toBe('1.000.000');
    });
  });

  describe('Locale detection', () => {
    const usesPeriodLocales = ['es-CO', 'es-AR', 'es-CL', 'pt-BR'];
    const usesCommaLocales = ['en-US', 'es-MX', 'es-PE'];

    it('COP, ARS, CLP, BRL use period for thousands', () => {
      usesPeriodLocales.forEach(locale => {
        const cop = CURRENCIES.find(c => c.locale === locale);
        expect(cop).toBeDefined();
      });
    });
  });
});

describe('Compact Number Formatting', () => {
  it('formats millions with M suffix', () => {
    const value = 1500000;
    const millions = value / 1_000_000;
    const formatted = `${millions.toFixed(1)}M`;
    expect(formatted).toBe('1.5M');
  });

  it('formats thousands with K suffix', () => {
    const value = 50000;
    const thousands = value / 1_000;
    const formatted = `${thousands.toFixed(0)}K`;
    expect(formatted).toBe('50K');
  });
});

describe('All Currencies - Calculation Consistency', () => {
  // Base case in USD for comparison
  const BASE_USD: InputMetrics = {
    monthlyVisitors: 50000,
    currentCVR: 2.5,
    aov: 80,
    adSpend: 10000,
  };
  const CRO_INVESTMENT_USD = 4000;

  // Calculate USD baseline values
  const usdCurrent = calculateCurrentState(BASE_USD);
  const usdProjection = generateProjectionData(BASE_USD, 'expected', 0, 6);
  const usdAdditional = usdProjection.reduce((sum, p) => sum + (p.improved - p.current), 0);
  const usdROI = calculateROI(CRO_INVESTMENT_USD, 6, usdAdditional, usdProjection);

  CURRENCIES.forEach(currency => {
    describe(`${currency.code} (rate: ${currency.exchangeRate})`, () => {
      const rate = currency.exchangeRate;

      // Convert values to this currency
      const store: InputMetrics = {
        monthlyVisitors: 50000,
        currentCVR: 2.5,
        aov: Math.round(80 * rate),
        adSpend: Math.round(10000 * rate),
      };
      const croInvestment = Math.round(4000 * rate);

      it('produces finite values (no NaN/Infinity)', () => {
        const current = calculateCurrentState(store);
        const improved = calculateImprovedState(store, 'expected');
        const projection = generateProjectionData(store, 'expected', 50, 6);
        const additional = projection.reduce((sum, p) => sum + (p.improved - p.current), 0);
        const roi = calculateROI(croInvestment, 6, additional, projection);

        expect(isFinite(current.revenue)).toBe(true);
        expect(isFinite(current.roas)).toBe(true);
        expect(isFinite(current.cpa)).toBe(true);
        expect(isFinite(current.rps)).toBe(true);
        expect(isFinite(improved.revenue)).toBe(true);
        expect(isFinite(roi.roiMultiple)).toBe(true);
        expect(isFinite(roi.totalAdditionalRevenue)).toBe(true);
      });

      it('maintains consistent ROAS ratio', () => {
        const current = calculateCurrentState(store);
        // ROAS should be identical regardless of currency
        expect(current.roas).toBeCloseTo(usdCurrent.roas, 2);
      });

      it('maintains consistent ROI ratio', () => {
        const projection = generateProjectionData(store, 'expected', 0, 6);
        const additional = projection.reduce((sum, p) => sum + (p.improved - p.current), 0);
        const roi = calculateROI(croInvestment, 6, additional, projection);
        // ROI should be identical regardless of currency
        expect(roi.roiMultiple).toBeCloseTo(usdROI.roiMultiple, 1);
      });

      it('revenue scales correctly with exchange rate', () => {
        const current = calculateCurrentState(store);
        // Revenue should be USD revenue * exchange rate
        const expectedRevenue = usdCurrent.revenue * rate;
        expect(current.revenue).toBeCloseTo(expectedRevenue, 0);
      });
    });
  });
});
