import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCalculator } from './useCalculator';
import { DEFAULT_INPUTS } from '@/lib/constants';

describe('useCalculator hook', () => {
  describe('Initial state', () => {
    it('starts with default inputs', () => {
      const { result } = renderHook(() => useCalculator());
      expect(result.current.inputs).toEqual(DEFAULT_INPUTS);
    });

    it('computes initial states correctly', () => {
      const { result } = renderHook(() => useCalculator());
      expect(result.current.currentState).toBeDefined();
      expect(result.current.improvedState).toBeDefined();
      expect(result.current.scaledState).toBeDefined();
    });
  });

  describe('Input setters', () => {
    it('setMonthlyVisitors updates visitors', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => {
        result.current.setMonthlyVisitors(100000);
      });
      expect(result.current.inputs.monthlyVisitors).toBe(100000);
    });

    it('setCurrentCVR updates CVR', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => {
        result.current.setCurrentCVR(3.5);
      });
      expect(result.current.inputs.currentCVR).toBe(3.5);
    });

    it('setAov updates AOV', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => {
        result.current.setAov(150);
      });
      expect(result.current.inputs.aov).toBe(150);
    });

    it('setAdSpend updates ad spend', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => {
        result.current.setAdSpend(20000);
      });
      expect(result.current.inputs.adSpend).toBe(20000);
    });

    it('setScenario updates scenario', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => {
        result.current.setScenario('optimistic');
      });
      expect(result.current.inputs.scenario).toBe('optimistic');
    });

    it('setReinvestmentPercent updates reinvestment', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => {
        result.current.setReinvestmentPercent(75);
      });
      expect(result.current.inputs.reinvestmentPercent).toBe(75);
    });

    it('setCroInvestment updates CRO investment', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => {
        result.current.setCroInvestment(5000);
      });
      expect(result.current.inputs.croInvestment).toBe(5000);
    });

    it('setProjectionMonths updates months', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => {
        result.current.setProjectionMonths(12);
      });
      expect(result.current.inputs.projectionMonths).toBe(12);
    });
  });

  describe('Computed values update correctly', () => {
    it('changing visitors updates computed states', () => {
      const { result } = renderHook(() => useCalculator());
      const initialRevenue = result.current.currentState.revenue;

      act(() => {
        result.current.setMonthlyVisitors(100000); // Double visitors
      });

      // Revenue should double
      expect(result.current.currentState.revenue).toBe(initialRevenue * 2);
    });

    it('changing CVR updates computed states', () => {
      const { result } = renderHook(() => useCalculator());
      const initialOrders = result.current.currentState.orders;

      act(() => {
        result.current.setCurrentCVR(5); // Double CVR
      });

      // Orders should double
      expect(result.current.currentState.orders).toBe(initialOrders * 2);
    });

    it('changing scenario updates improved state', () => {
      const { result } = renderHook(() => useCalculator());

      act(() => {
        result.current.setScenario('conservative');
      });
      const conservativeCVR = result.current.improvedState.cvr;

      act(() => {
        result.current.setScenario('optimistic');
      });
      const optimisticCVR = result.current.improvedState.cvr;

      expect(optimisticCVR).toBeGreaterThan(conservativeCVR);
    });

    it('changing reinvestment updates scaled state', () => {
      const { result } = renderHook(() => useCalculator());

      act(() => {
        result.current.setReinvestmentPercent(0);
      });
      const noReinvestRevenue = result.current.scaledState.totalRevenue;

      act(() => {
        result.current.setReinvestmentPercent(100);
      });
      const fullReinvestRevenue = result.current.scaledState.totalRevenue;

      expect(fullReinvestRevenue).toBeGreaterThan(noReinvestRevenue);
    });
  });

  describe('Qualification tier', () => {
    it('returns high_conversion_ecom below 80K visitors', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => {
        result.current.setMonthlyVisitors(50000);
      });
      expect(result.current.qualificationTier).toBe('high_conversion_ecom');
    });

    it('returns cro_recurring at 80K+ visitors', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => {
        result.current.setMonthlyVisitors(80000);
      });
      expect(result.current.qualificationTier).toBe('cro_recurring');
    });
  });

  describe('Edge cases - no clamping should occur', () => {
    it('allows very large AOV values', () => {
      const { result } = renderHook(() => useCalculator());
      const largeValue = 1000000; // 1M - could be COP
      act(() => {
        result.current.setAov(largeValue);
      });
      expect(result.current.inputs.aov).toBe(largeValue);
    });

    it('allows very large ad spend values', () => {
      const { result } = renderHook(() => useCalculator());
      const largeValue = 10000000; // 10M - could be COP
      act(() => {
        result.current.setAdSpend(largeValue);
      });
      expect(result.current.inputs.adSpend).toBe(largeValue);
    });

    it('allows zero ad spend', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => {
        result.current.setAdSpend(0);
      });
      expect(result.current.inputs.adSpend).toBe(0);
      expect(result.current.currentState.roas).toBe(0);
    });

    it('handles very small CVR', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => {
        result.current.setCurrentCVR(0.1);
      });
      expect(result.current.inputs.currentCVR).toBe(0.1);
    });
  });

  describe('ROI metrics', () => {
    it('calculates ROI based on CRO investment', () => {
      const { result } = renderHook(() => useCalculator());
      expect(result.current.roiMetrics.totalInvestment).toBe(
        result.current.inputs.croInvestment * result.current.inputs.projectionMonths
      );
    });

    it('updating CRO investment updates ROI metrics', () => {
      const { result } = renderHook(() => useCalculator());

      act(() => {
        result.current.setCroInvestment(6000);
      });

      expect(result.current.roiMetrics.totalInvestment).toBe(
        6000 * result.current.inputs.projectionMonths
      );
    });

    it('ROI with default inputs is realistic (not 1000x+)', () => {
      const { result } = renderHook(() => useCalculator());

      // Default inputs should produce reasonable ROI (3-20x range)
      // This catches bugs where values get miscalculated
      expect(result.current.roiMetrics.roiMultiple).toBeGreaterThan(3);
      expect(result.current.roiMetrics.roiMultiple).toBeLessThan(20);

      // Total additional revenue should be realistic
      expect(result.current.roiMetrics.totalAdditionalRevenue).toBeGreaterThan(100000);
      expect(result.current.roiMetrics.totalAdditionalRevenue).toBeLessThan(500000);

      // Log actual values for debugging
      console.log('Hook ROI Test - Default Values:', {
        totalInvestment: result.current.roiMetrics.totalInvestment,
        totalAdditionalRevenue: result.current.roiMetrics.totalAdditionalRevenue,
        roiMultiple: result.current.roiMetrics.roiMultiple,
      });
    });

    it('ROI with high-value currency inputs stays consistent', () => {
      const { result } = renderHook(() => useCalculator());

      // Simulate COP-like values (multiplied by ~4000)
      act(() => {
        result.current.setAov(320000); // 80 USD * 4000
        result.current.setAdSpend(40000000); // 10K USD * 4000
        result.current.setCroInvestment(16000000); // 4K USD * 4000
      });

      // ROI ratio should stay similar (within 5-20x range)
      // because all values scale proportionally
      expect(result.current.roiMetrics.roiMultiple).toBeGreaterThan(3);
      expect(result.current.roiMetrics.roiMultiple).toBeLessThan(20);

      console.log('Hook ROI Test - High Currency Values:', {
        aov: result.current.inputs.aov,
        adSpend: result.current.inputs.adSpend,
        croInvestment: result.current.inputs.croInvestment,
        roiMultiple: result.current.roiMetrics.roiMultiple,
      });
    });
  });
});
