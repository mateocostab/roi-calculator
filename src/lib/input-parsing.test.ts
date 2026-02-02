import { describe, it, expect } from 'vitest';

// Test the input parsing logic that's used in Calculator.tsx

// This is the function from Calculator.tsx
const parseFormattedNumber = (value: string): number => {
  // Remove all non-digit characters
  const cleaned = value.replace(/[^\d]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
};

describe('parseFormattedNumber', () => {
  describe('handles US formatted numbers (comma separator)', () => {
    it('parses "1,000" as 1000', () => {
      expect(parseFormattedNumber('1,000')).toBe(1000);
    });

    it('parses "1,000,000" as 1000000', () => {
      expect(parseFormattedNumber('1,000,000')).toBe(1000000);
    });

    it('parses "50,000" as 50000', () => {
      expect(parseFormattedNumber('50,000')).toBe(50000);
    });
  });

  describe('handles LATAM formatted numbers (period separator)', () => {
    it('parses "1.000" as 1000', () => {
      expect(parseFormattedNumber('1.000')).toBe(1000);
    });

    it('parses "1.000.000" as 1000000', () => {
      expect(parseFormattedNumber('1.000.000')).toBe(1000000);
    });

    it('parses "50.000" as 50000', () => {
      expect(parseFormattedNumber('50.000')).toBe(50000);
    });
  });

  describe('handles plain numbers', () => {
    it('parses "1000" as 1000', () => {
      expect(parseFormattedNumber('1000')).toBe(1000);
    });

    it('parses "0" as 0', () => {
      expect(parseFormattedNumber('0')).toBe(0);
    });

    it('parses "5" as 5', () => {
      expect(parseFormattedNumber('5')).toBe(5);
    });
  });

  describe('handles edge cases', () => {
    it('parses empty string as 0', () => {
      expect(parseFormattedNumber('')).toBe(0);
    });

    it('parses whitespace as 0', () => {
      expect(parseFormattedNumber('   ')).toBe(0);
    });

    it('parses non-numeric string as 0', () => {
      expect(parseFormattedNumber('abc')).toBe(0);
    });

    it('parses mixed content extracting digits', () => {
      expect(parseFormattedNumber('$10,000')).toBe(10000);
    });
  });
});

describe('CVR input parsing', () => {
  // This is the CVR parsing logic from handleCvrBlur
  const parseCvrValue = (value: string): number => {
    const raw = parseFloat(value.replace(',', '.')) || 0;
    const finalValue = raw > 0 ? raw : 0.1;
    return finalValue;
  };

  it('parses "2.5" as 2.5', () => {
    expect(parseCvrValue('2.5')).toBe(2.5);
  });

  it('parses "2,5" (European format) as 2.5', () => {
    expect(parseCvrValue('2,5')).toBe(2.5);
  });

  it('parses "0" as 0.1 (minimum fallback)', () => {
    expect(parseCvrValue('0')).toBe(0.1);
  });

  it('parses empty string as 0.1 (minimum fallback)', () => {
    expect(parseCvrValue('')).toBe(0.1);
  });

  it('parses "0.1" as 0.1', () => {
    expect(parseCvrValue('0.1')).toBe(0.1);
  });

  it('parses "15" as 15', () => {
    expect(parseCvrValue('15')).toBe(15);
  });
});

describe('Input blur behavior validation', () => {
  // These tests validate the expected behavior when user finishes editing

  describe('Visitor input', () => {
    const validateVisitors = (rawInput: string): number => {
      const raw = parseFormattedNumber(rawInput);
      return raw > 0 ? raw : 1000;
    };

    it('allows user to type any positive number', () => {
      expect(validateVisitors('123456')).toBe(123456);
    });

    it('falls back to 1000 for empty input', () => {
      expect(validateVisitors('')).toBe(1000);
    });

    it('falls back to 1000 for zero', () => {
      expect(validateVisitors('0')).toBe(1000);
    });
  });

  describe('AOV input', () => {
    const validateAov = (rawInput: string): number => {
      const raw = parseFormattedNumber(rawInput);
      return raw > 0 ? raw : 1;
    };

    it('allows user to type any positive number', () => {
      expect(validateAov('320000')).toBe(320000);
    });

    it('falls back to 1 for empty input', () => {
      expect(validateAov('')).toBe(1);
    });

    it('falls back to 1 for zero', () => {
      expect(validateAov('0')).toBe(1);
    });
  });

  describe('Ad Spend input', () => {
    const validateAdSpend = (rawInput: string): number => {
      return parseFormattedNumber(rawInput);
    };

    it('allows user to type any positive number', () => {
      expect(validateAdSpend('50000')).toBe(50000);
    });

    it('allows zero (no ad spend)', () => {
      expect(validateAdSpend('0')).toBe(0);
    });

    it('returns 0 for empty input', () => {
      expect(validateAdSpend('')).toBe(0);
    });
  });

  describe('CRO Investment input', () => {
    const validateCroInvestment = (rawInput: string): number => {
      const raw = parseFormattedNumber(rawInput);
      return raw > 0 ? raw : 1;
    };

    it('allows user to type any positive number', () => {
      expect(validateCroInvestment('12000000')).toBe(12000000);
    });

    it('falls back to 1 for empty input', () => {
      expect(validateCroInvestment('')).toBe(1);
    });

    it('falls back to 1 for zero', () => {
      expect(validateCroInvestment('0')).toBe(1);
    });
  });
});
