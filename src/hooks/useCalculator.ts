'use client';

import { useState, useMemo, useCallback } from 'react';
import type { CalculatorInputs, Scenario } from '@/lib/types';
import { DEFAULT_INPUTS } from '@/lib/constants';
import {
  calculateCurrentState,
  calculateImprovedState,
  calculateScaledState,
  generateProjectionData,
  calculateROI,
  getQualificationTier,
} from '@/lib/calculations';

export function useCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  // Input setters
  const setMonthlyVisitors = useCallback((value: number) => {
    setInputs(prev => ({ ...prev, monthlyVisitors: value }));
  }, []);

  const setCurrentCVR = useCallback((value: number) => {
    setInputs(prev => ({ ...prev, currentCVR: value }));
  }, []);

  const setAov = useCallback((value: number) => {
    setInputs(prev => ({ ...prev, aov: value }));
  }, []);

  const setAdSpend = useCallback((value: number) => {
    setInputs(prev => ({ ...prev, adSpend: value }));
  }, []);

  const setScenario = useCallback((value: Scenario) => {
    setInputs(prev => ({ ...prev, scenario: value }));
  }, []);

  const setReinvestmentPercent = useCallback((value: number) => {
    setInputs(prev => ({ ...prev, reinvestmentPercent: value }));
  }, []);

  const setCroInvestment = useCallback((value: number) => {
    setInputs(prev => ({ ...prev, croInvestment: value }));
  }, []);

  const setProjectionMonths = useCallback((value: number) => {
    setInputs(prev => ({ ...prev, projectionMonths: value }));
  }, []);

  // Reset all inputs to defaults
  const resetToDefaults = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
  }, []);

  // Extract input metrics for calculations
  const inputMetrics = useMemo(() => ({
    monthlyVisitors: inputs.monthlyVisitors,
    currentCVR: inputs.currentCVR,
    aov: inputs.aov,
    adSpend: inputs.adSpend,
  }), [inputs.monthlyVisitors, inputs.currentCVR, inputs.aov, inputs.adSpend]);

  // Computed values
  const currentState = useMemo(
    () => calculateCurrentState(inputMetrics),
    [inputMetrics]
  );

  const improvedState = useMemo(
    () => calculateImprovedState(inputMetrics, inputs.scenario),
    [inputMetrics, inputs.scenario]
  );

  const scaledState = useMemo(
    () => calculateScaledState(
      inputMetrics,
      inputs.scenario,
      inputs.reinvestmentPercent,
      inputs.projectionMonths
    ),
    [inputMetrics, inputs.scenario, inputs.reinvestmentPercent, inputs.projectionMonths]
  );

  const projectionData = useMemo(
    () => generateProjectionData(
      inputMetrics,
      inputs.scenario,
      inputs.reinvestmentPercent,
      inputs.projectionMonths
    ),
    [inputMetrics, inputs.scenario, inputs.reinvestmentPercent, inputs.projectionMonths]
  );

  // Additional monthly revenue at full improvement (for display)
  const additionalMonthlyRevenue = useMemo(
    () => improvedState.revenue - currentState.revenue,
    [improvedState.revenue, currentState.revenue]
  );

  // Total additional revenue considering gradual implementation curve
  const totalAdditionalRevenueWithCurve = useMemo(
    () => projectionData.reduce((sum, point) => sum + (point.improved - point.current), 0),
    [projectionData]
  );

  const roiMetrics = useMemo(
    () => calculateROI(
      inputs.croInvestment,
      inputs.projectionMonths,
      totalAdditionalRevenueWithCurve
    ),
    [inputs.croInvestment, inputs.projectionMonths, totalAdditionalRevenueWithCurve]
  );

  const qualificationTier = useMemo(
    () => getQualificationTier(inputs.monthlyVisitors),
    [inputs.monthlyVisitors]
  );

  // Total values for the projection period
  const totalCurrentRevenue = useMemo(
    () => currentState.revenue * inputs.projectionMonths,
    [currentState.revenue, inputs.projectionMonths]
  );

  const totalImprovedRevenue = useMemo(
    () => improvedState.revenue * inputs.projectionMonths,
    [improvedState.revenue, inputs.projectionMonths]
  );

  const incrementalRevenue = useMemo(
    () => scaledState.totalRevenue - totalCurrentRevenue,
    [scaledState.totalRevenue, totalCurrentRevenue]
  );

  return {
    // Inputs
    inputs,
    setMonthlyVisitors,
    setCurrentCVR,
    setAov,
    setAdSpend,
    setScenario,
    setReinvestmentPercent,
    setCroInvestment,
    setProjectionMonths,
    resetToDefaults,

    // Computed states
    currentState,
    improvedState,
    scaledState,
    projectionData,
    roiMetrics,
    qualificationTier,

    // Aggregates
    additionalMonthlyRevenue,
    totalCurrentRevenue,
    totalImprovedRevenue,
    incrementalRevenue,
  };
}

export type UseCalculatorReturn = ReturnType<typeof useCalculator>;
