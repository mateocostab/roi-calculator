'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useCalculator } from '@/hooks/useCalculator';
import { useTranslation } from '@/lib/i18n';
import { INPUT_RANGES, SCENARIOS, QUALIFICATION_THRESHOLD, CURRENCIES } from '@/lib/constants';
import type { Scenario, Currency } from '@/lib/types';

const formatPercent = (value: number, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

const formatRoas = (value: number) => `${value.toFixed(2)}x`;

// ROI values above this threshold indicate inconsistent inputs (currency mismatch, etc.)
const MAX_REALISTIC_ROI = 500;

// Format ROI safely - show "—" for absurd values that indicate data inconsistency
const formatROI = (value: number) => {
  if (!isFinite(value) || value > MAX_REALISTIC_ROI) return '—';
  return `${value.toFixed(1)}x`;
};

const formatROIPercent = (value: number) => {
  if (!isFinite(value) || value > MAX_REALISTIC_ROI * 100) return '—';
  return `+${value.toFixed(0)}%`;
};

// Parse formatted number back to raw number (handles both , and . as separators)
const parseFormattedNumber = (value: string) => {
  // Remove all non-digit characters
  const cleaned = value.replace(/[^\d]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
};

// Tooltip component with hover
const InfoTooltip = ({ text, green }: { text: string; green?: boolean }) => (
  <span className="tooltip-wrapper">
    <span className={`tooltip-icon ${green ? 'tooltip-icon-green' : ''}`} tabIndex={0}>?</span>
    <span className="tooltip-content">{text}</span>
  </span>
);

export function Calculator() {
  const { t, language, setLanguage, currency, setCurrency, currencyConfig, formatCurrency, formatNumber, convertFromUSD } = useTranslation();
  const calc = useCalculator();
  const prevCurrencyRef = useRef<Currency>(currency);

  // Refs for uncontrolled inputs
  const visitorRef = useRef<HTMLInputElement>(null);
  const cvrRef = useRef<HTMLInputElement>(null);
  const aovRef = useRef<HTMLInputElement>(null);
  const adSpendRef = useRef<HTMLInputElement>(null);
  const croInvestmentRef = useRef<HTMLInputElement>(null);

  // Track which input is focused to prevent external updates while typing
  const focusedInputRef = useRef<string | null>(null);

  // Selected guarantee for the guarantees section
  const [selectedGuarantee, setSelectedGuarantee] = useState(1);

  // Store current values in refs for currency conversion
  const aovValueRef = useRef(calc.inputs.aov);
  const adSpendValueRef = useRef(calc.inputs.adSpend);
  const croInvestmentValueRef = useRef(calc.inputs.croInvestment);

  // Keep refs in sync with calc values
  useEffect(() => {
    aovValueRef.current = calc.inputs.aov;
    adSpendValueRef.current = calc.inputs.adSpend;
    croInvestmentValueRef.current = calc.inputs.croInvestment;
  }, [calc.inputs.aov, calc.inputs.adSpend, calc.inputs.croInvestment]);

  // Initialize monetary inputs with converted defaults on mount
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      // Always set converted defaults on initial mount
      const newAov = convertFromUSD(INPUT_RANGES.aov.default);
      const newAdSpend = convertFromUSD(INPUT_RANGES.adSpend.default);
      const newCroInvestment = convertFromUSD(INPUT_RANGES.croInvestment.default);

      calc.setAov(newAov);
      calc.setAdSpend(newAdSpend);
      calc.setCroInvestment(newCroInvestment);
    }
  }, [convertFromUSD, calc.setAov, calc.setAdSpend, calc.setCroInvestment]);

  // Reset monetary inputs to defaults when currency changes
  useEffect(() => {
    const prevCurrency = prevCurrencyRef.current;
    if (prevCurrency !== currency) {
      // Reset to default values converted to new currency
      const newAov = convertFromUSD(INPUT_RANGES.aov.default);
      const newAdSpend = convertFromUSD(INPUT_RANGES.adSpend.default);
      const newCroInvestment = convertFromUSD(INPUT_RANGES.croInvestment.default);

      calc.setAov(newAov);
      calc.setAdSpend(newAdSpend);
      calc.setCroInvestment(newCroInvestment);

      prevCurrencyRef.current = currency;
    }
  }, [currency, calc.setAov, calc.setAdSpend, calc.setCroInvestment, convertFromUSD]);

  // Currency-converted ranges for monetary inputs
  const ranges = useMemo(() => ({
    aov: {
      min: convertFromUSD(INPUT_RANGES.aov.min),
      max: convertFromUSD(INPUT_RANGES.aov.max),
      step: convertFromUSD(INPUT_RANGES.aov.step),
    },
    adSpend: {
      min: convertFromUSD(INPUT_RANGES.adSpend.min),
      max: convertFromUSD(INPUT_RANGES.adSpend.max),
      step: convertFromUSD(INPUT_RANGES.adSpend.step),
    },
    croInvestment: {
      min: convertFromUSD(INPUT_RANGES.croInvestment.min),
      max: convertFromUSD(INPUT_RANGES.croInvestment.max),
      step: convertFromUSD(INPUT_RANGES.croInvestment.step),
    },
  }), [convertFromUSD]);

  const qualifiesForCRO = calc.inputs.monthlyVisitors >= QUALIFICATION_THRESHOLD;
  const progressPercent = Math.min((calc.inputs.monthlyVisitors / QUALIFICATION_THRESHOLD) * 100, 100);

  // Update input display values when calc values change (from sliders or currency change)
  // Only update if the input is NOT currently focused (user is not typing)
  useEffect(() => {
    if (visitorRef.current && focusedInputRef.current !== 'visitors') {
      visitorRef.current.value = formatNumber(calc.inputs.monthlyVisitors);
    }
  }, [calc.inputs.monthlyVisitors, formatNumber]);

  useEffect(() => {
    if (cvrRef.current && focusedInputRef.current !== 'cvr') {
      cvrRef.current.value = String(calc.inputs.currentCVR);
    }
  }, [calc.inputs.currentCVR]);

  useEffect(() => {
    if (aovRef.current && focusedInputRef.current !== 'aov') {
      aovRef.current.value = formatNumber(calc.inputs.aov);
    }
  }, [calc.inputs.aov, formatNumber]);

  useEffect(() => {
    if (adSpendRef.current && focusedInputRef.current !== 'adSpend') {
      adSpendRef.current.value = formatNumber(calc.inputs.adSpend);
    }
  }, [calc.inputs.adSpend, formatNumber]);

  useEffect(() => {
    if (croInvestmentRef.current && focusedInputRef.current !== 'croInvestment') {
      croInvestmentRef.current.value = formatNumber(calc.inputs.croInvestment);
    }
  }, [calc.inputs.croInvestment, formatNumber]);

  // Focus handlers - track which input is focused
  const handleFocus = (inputName: string) => () => {
    focusedInputRef.current = inputName;
  };

  // Blur handlers - validate and update calc, clear focus tracking
  const handleVisitorBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    focusedInputRef.current = null;
    const raw = parseFormattedNumber(e.target.value);
    const value = raw > 0 ? raw : 1000;
    calc.setMonthlyVisitors(value);
    e.target.value = formatNumber(value);
  };

  const handleCvrBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    focusedInputRef.current = null;
    const raw = parseFloat(e.target.value.replace(',', '.')) || 0;
    const value = raw > 0 ? raw : 0.1;
    calc.setCurrentCVR(value);
    e.target.value = String(value);
  };

  const handleAovBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    focusedInputRef.current = null;
    const raw = parseFormattedNumber(e.target.value);
    const value = raw > 0 ? raw : 1;
    calc.setAov(value);
    e.target.value = formatNumber(value);
  };

  const handleAdSpendBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    focusedInputRef.current = null;
    const raw = parseFormattedNumber(e.target.value);
    calc.setAdSpend(raw);
    e.target.value = formatNumber(raw);
  };

  const handleCroInvestmentBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    focusedInputRef.current = null;
    const raw = parseFormattedNumber(e.target.value);
    const value = raw > 0 ? raw : 1;
    calc.setCroInvestment(value);
    e.target.value = formatNumber(value);
  };

  // Reset handler - resets all inputs and updates text fields
  // Uses currency-converted defaults for monetary values
  const handleReset = () => {
    // Reset to defaults converted to current currency
    calc.setMonthlyVisitors(INPUT_RANGES.monthlyVisitors.default);
    calc.setCurrentCVR(INPUT_RANGES.currentCVR.default);
    calc.setAov(convertFromUSD(INPUT_RANGES.aov.default));
    calc.setAdSpend(convertFromUSD(INPUT_RANGES.adSpend.default));
    calc.setCroInvestment(convertFromUSD(INPUT_RANGES.croInvestment.default));
    calc.setScenario('expected');
    calc.setReinvestmentPercent(INPUT_RANGES.reinvestmentPercent.default);
    calc.setProjectionMonths(INPUT_RANGES.projectionMonths.default);

    // Update input refs to show converted default values
    if (visitorRef.current) visitorRef.current.value = formatNumber(INPUT_RANGES.monthlyVisitors.default);
    if (cvrRef.current) cvrRef.current.value = String(INPUT_RANGES.currentCVR.default);
    if (aovRef.current) aovRef.current.value = formatNumber(convertFromUSD(INPUT_RANGES.aov.default));
    if (adSpendRef.current) adSpendRef.current.value = formatNumber(convertFromUSD(INPUT_RANGES.adSpend.default));
    if (croInvestmentRef.current) croInvestmentRef.current.value = formatNumber(convertFromUSD(INPUT_RANGES.croInvestment.default));
  };

  // Chart data with translated labels
  // Chart data - monthly values (not cumulative)
  const chartData = useMemo(() => {
    return calc.projectionData.map((point) => ({
      name: `${t('chart.month')} ${point.month}`,
      [t('chart.current')]: point.current,
      [t('chart.improved')]: point.improved,
      [t('chart.scaled')]: point.scaled,
      [t('chart.scaledNoCro')]: point.scaledNoCro,
    }));
  }, [calc.projectionData, t]);

  return (
    <div className="app-container">
      <div className="main-content">

        {/* ═══════════════ HEADER ═══════════════ */}
        <header className="animate-in" style={{ textAlign: 'center', marginBottom: 56 }}>
          {/* Logo */}
          <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'center' }}>
            <img
              src="/convert-mate-logo.svg"
              alt="ConvertMate"
              style={{ height: 32, width: 'auto' }}
            />
          </div>

          {/* Pre-title */}
          <p style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 12,
          }}>
            {t('header.pretitle')}
          </p>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 56px)',
            fontWeight: 700,
            margin: 0,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: 16,
          }}>
            {t('header.titleBefore')}
            <span style={{
              background: 'linear-gradient(135deg, #00ff84 0%, #00c05f 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>{t('header.titleHighlight')}</span>
            {t('header.titleAfter')}
          </h1>

          <p style={{
            fontSize: 18,
            color: 'rgba(255,255,255,0.5)',
            margin: '0 auto',
            maxWidth: 500,
          }}>
            {t('header.subtitle')}
          </p>

          {/* Language & Currency Toggle */}
          <div className="header-toggles" style={{ marginTop: 32 }}>
            <div className="lang-toggle" style={{ display: 'inline-flex' }}>
              <button
                className={`lang-btn ${language === 'es' ? 'lang-btn-active' : ''}`}
                onClick={() => setLanguage('es')}
              >ES</button>
              <button
                className={`lang-btn ${language === 'en' ? 'lang-btn-active' : ''}`}
                onClick={() => setLanguage('en')}
              >EN</button>
            </div>

            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as typeof currency)}
              className="currency-select"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* ═══════════════ SOCIAL PROOF ═══════════════ */}
        <div className="social-proof animate-in" style={{ marginBottom: 48 }}>
          <p className="social-proof-text">{t('socialProof.trusted')}</p>
          <div className="logo-strip">
            <img src="/logos/lummia.png" alt="Lummia" className="client-logo" />
            <img src="/logos/dynamo.png" alt="Dynamo" className="client-logo" />
            <img src="/logos/coraje.png" alt="Coraje" className="client-logo" />
            <img src="/logos/ugreen.png" alt="UGREEN" className="client-logo" />
            <img src="/logos/mumu.png" alt="Mumu" className="client-logo" />
            <img src="/logos/the-gummy-box.png" alt="The Gummy Box" className="client-logo" />
            <img src="/logos/kiper.png" alt="Kiper" className="client-logo" />
            <img src="/logos/neat.png" alt="Neat" className="client-logo" />
            <img src="/logos/grupo-coomeva.png" alt="Grupo Coomeva" className="client-logo" />
          </div>
        </div>

        {/* ═══════════════ INPUTS ═══════════════ */}
        <section className="glass-card animate-in delay-1" style={{ padding: 32, marginBottom: 24 }}>
          <div className="section-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="section-dot" />
              <h2 className="section-title">{t('inputs.title')}</h2>
            </div>
            <button
              onClick={handleReset}
              title={t('actions.resetTooltip')}
              style={{
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.5)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              {t('actions.reset')}
            </button>
          </div>

          <div className="inputs-grid">
            {/* Visitors */}
            <div className="input-group">
              <label className="input-label">{t('inputs.visitors')}</label>
              <input
                ref={visitorRef}
                type="text"
                className="input-field"
                defaultValue={formatNumber(calc.inputs.monthlyVisitors)}
                onFocus={handleFocus('visitors')}
                onBlur={handleVisitorBlur}
              />
              <input
                type="range"
                value={calc.inputs.monthlyVisitors}
                onChange={(e) => calc.setMonthlyVisitors(Number(e.target.value))}
                min={INPUT_RANGES.monthlyVisitors.min}
                max={INPUT_RANGES.monthlyVisitors.max}
                step={INPUT_RANGES.monthlyVisitors.step}
              />
              <div className="slider-labels">
                <span>{formatNumber(INPUT_RANGES.monthlyVisitors.min)}</span>
                <span>{formatNumber(INPUT_RANGES.monthlyVisitors.max)}</span>
              </div>
            </div>

            {/* CVR */}
            <div className="input-group">
              <label className="input-label">{t('inputs.cvr')}</label>
              <input
                ref={cvrRef}
                type="text"
                className="input-field"
                defaultValue={calc.inputs.currentCVR}
                onFocus={handleFocus('cvr')}
                onBlur={handleCvrBlur}
              />
              <input
                type="range"
                value={calc.inputs.currentCVR}
                onChange={(e) => calc.setCurrentCVR(Number(e.target.value))}
                min={INPUT_RANGES.currentCVR.min}
                max={INPUT_RANGES.currentCVR.max}
                step={INPUT_RANGES.currentCVR.step}
              />
              <div className="slider-labels">
                <span>{formatPercent(INPUT_RANGES.currentCVR.min)}</span>
                <span>{formatPercent(INPUT_RANGES.currentCVR.max)}</span>
              </div>
            </div>

            {/* AOV */}
            <div className="input-group">
              <label className="input-label">{t('inputs.aov')}</label>
              <div style={{ position: 'relative' }}>
                <span className="input-prefix">{currencyConfig.symbol}</span>
                <input
                  ref={aovRef}
                  type="text"
                  className="input-field input-field-with-prefix"
                  defaultValue={formatNumber(calc.inputs.aov)}
                  onFocus={handleFocus('aov')}
                  onBlur={handleAovBlur}
                />
              </div>
              <input
                type="range"
                value={calc.inputs.aov}
                onChange={(e) => calc.setAov(Number(e.target.value))}
                min={1}
                max={ranges.aov.max}
                step={ranges.aov.step || 1}
              />
              <div className="slider-labels">
                <span>{currencyConfig.symbol}1</span>
                <span>{currencyConfig.symbol}{formatNumber(ranges.aov.max)}</span>
              </div>
            </div>

            {/* Ad Spend */}
            <div className="input-group">
              <label className="input-label">{t('inputs.adSpend')}</label>
              <div style={{ position: 'relative' }}>
                <span className="input-prefix">{currencyConfig.symbol}</span>
                <input
                  ref={adSpendRef}
                  type="text"
                  className="input-field input-field-with-prefix"
                  defaultValue={formatNumber(calc.inputs.adSpend)}
                  onFocus={handleFocus('adSpend')}
                  onBlur={handleAdSpendBlur}
                />
              </div>
              <input
                type="range"
                value={calc.inputs.adSpend}
                onChange={(e) => calc.setAdSpend(Number(e.target.value))}
                min={0}
                max={ranges.adSpend.max}
                step={ranges.adSpend.step || 1}
              />
              <div className="slider-labels">
                <span>{currencyConfig.symbol}0</span>
                <span>{currencyConfig.symbol}{formatNumber(ranges.adSpend.max)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ SCENARIO SELECTOR ═══════════════ */}
        <section className="animate-in delay-2" style={{ marginBottom: 24 }}>
          <div className="section-header" style={{ paddingLeft: 8, marginBottom: 20 }}>
            <div className="section-dot" />
            <h2 className="section-title">{t('scenarios.title')}</h2>
          </div>

          {/* Data source credibility */}
          <p style={{
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.4)',
            marginBottom: 16,
            paddingLeft: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            {t('scenarios.dataSource')}
          </p>

          <div className="scenario-grid">
            {SCENARIOS.map((scenario) => {
              const isActive = calc.inputs.scenario === scenario.id;
              const improvementPercent = Math.round((scenario.multiplier - 1) * 100);
              const projectedCvr = calc.inputs.currentCVR * scenario.multiplier;

              return (
                <button
                  key={scenario.id}
                  className="scenario-card"
                  onClick={() => calc.setScenario(scenario.id)}
                  style={{
                    position: 'relative',
                    padding: 24,
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(0, 255, 132, 0.15) 0%, rgba(0, 255, 132, 0.05) 100%)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isActive
                      ? '2px solid rgba(0, 255, 132, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 16,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }
                  }}
                >
                  {/* Selection indicator */}
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      width: 24,
                      height: 24,
                      background: '#00ff84',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}

                  {/* Scenario name */}
                  <p style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: isActive ? '#00ff84' : 'rgba(255, 255, 255, 0.5)',
                    marginBottom: 12,
                  }}>
                    {t(`scenarios.${scenario.id}` as keyof typeof import('@/lib/i18n/es').es)}
                  </p>

                  {/* Big improvement number */}
                  <p className="scenario-card-number" style={{
                    margin: 0,
                    fontSize: 44,
                    fontWeight: 700,
                    fontFamily: "'Space Mono', monospace",
                    color: isActive ? '#00ff84' : 'rgba(255, 255, 255, 0.9)',
                    lineHeight: 1,
                    marginBottom: 12,
                  }}>
                    +{improvementPercent}%
                  </p>

                  {/* CVR projection */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 16,
                  }}>
                    <span style={{
                      fontSize: 14,
                      color: 'rgba(255, 255, 255, 0.4)',
                      textDecoration: 'line-through',
                    }}>
                      {formatPercent(calc.inputs.currentCVR)}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <span style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: isActive ? '#00ff84' : 'rgba(255, 255, 255, 0.9)',
                    }}>
                      {formatPercent(projectedCvr)}
                    </span>
                  </div>

                  {/* Visual progress bar */}
                  <div style={{
                    height: 6,
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(improvementPercent, 100)}%`,
                      background: isActive
                        ? 'linear-gradient(90deg, #00ff84 0%, #00c05f 100%)'
                        : 'rgba(255, 255, 255, 0.3)',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                    }} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Loss Aversion + Monthly Impact Grid */}
          <div className="loss-impact-grid" style={{ marginTop: 20 }}>
            {/* Fire-themed loss aversion banner */}
            <div style={{
              position: 'relative',
              padding: '24px',
              borderRadius: 12,
              overflow: 'hidden',
              background: `
                radial-gradient(ellipse 80% 40% at 50% 100%, rgba(255, 107, 53, 0.35) 0%, transparent 60%),
                linear-gradient(180deg, rgba(20, 20, 20, 0.98) 0%, rgba(35, 18, 12, 0.98) 100%)
              `,
              border: '1px solid rgba(255, 107, 53, 0.4)',
              boxShadow: '0 0 30px rgba(255, 107, 53, 0.1)',
            }}>
              {/* Stylized flame silhouette - shorter, sharper flames */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50%',
                opacity: 0.2,
                pointerEvents: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 40' preserveAspectRatio='xMidYMax slice'%3E%3Cpath fill='%23ff6633' d='M0,40 L0,38 C2,36 3,38 5,36 C7,32 6,26 8,20 C9,14 11,10 13,14 C15,20 14,28 17,34 C19,38 21,36 23,38 C25,34 26,28 28,22 C30,16 32,12 35,16 C38,22 36,30 40,36 C42,38 44,36 47,38 C49,32 51,24 54,18 C57,12 60,8 63,12 C66,18 64,28 68,35 C70,38 73,36 76,38 C78,34 80,26 83,20 C86,14 89,10 92,14 C95,20 93,30 97,36 C99,38 102,36 105,38 C107,32 110,24 114,16 C118,8 122,4 126,10 C130,18 127,30 132,36 C134,38 137,36 140,38 C142,34 145,28 148,22 C151,16 154,12 157,16 C160,22 158,32 162,37 C164,38 167,36 170,38 C172,34 174,28 177,22 C180,16 183,12 186,16 C189,22 187,32 191,37 C193,38 196,36 200,38 L200,40 Z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat-x',
                backgroundPosition: 'bottom center',
                backgroundSize: 'auto 100%',
              }} />

              {/* Front flames layer */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '30%',
                opacity: 0.15,
                pointerEvents: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 150 25' preserveAspectRatio='xMidYMax slice'%3E%3Cpath fill='%23ff8844' d='M0,25 L0,23 C3,21 5,23 8,21 C11,17 10,12 13,8 C15,5 18,7 20,12 C22,18 24,22 27,23 C30,21 33,23 36,19 C39,14 38,9 42,6 C45,4 48,8 50,14 C52,20 55,23 58,23 C61,21 64,23 67,19 C70,14 69,9 73,6 C76,4 79,8 81,14 C83,20 86,23 89,23 C92,21 95,23 98,19 C101,14 100,9 104,6 C107,4 110,8 112,14 C114,20 117,23 120,23 C123,21 126,23 129,19 C132,14 131,9 135,6 C138,4 141,8 143,14 C145,20 148,22 150,23 L150,25 Z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat-x',
                backgroundPosition: 'bottom center',
                backgroundSize: 'auto 100%',
              }} />

              {/* Bottom glow line */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, transparent, rgba(255, 100, 50, 0.6), rgba(255, 150, 50, 0.8), rgba(255, 100, 50, 0.6), transparent)',
              }} />

              {/* Content */}
              <div style={{ position: 'relative' }}>
                <p style={{
                  margin: 0,
                  fontSize: 11,
                  color: 'rgba(255, 200, 170, 0.8)',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 500,
                }}>
                  {t('loss.title')}
                </p>
                <div className="fire-numbers">
                  <div>
                    <p style={{
                      margin: 0,
                      fontSize: 'clamp(22px, 3vw, 32px)',
                      fontWeight: 700,
                      background: 'linear-gradient(180deg, #ffe066 0%, #ffaa33 40%, #ff6633 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontFamily: "'Space Mono', monospace",
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 15px rgba(255, 150, 50, 0.3))',
                    }}>
                      {formatCurrency(calc.additionalMonthlyRevenue)}
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: 11, color: 'rgba(255, 180, 130, 0.6)' }}>
                      {t('loss.monthly')}
                    </p>
                  </div>
                  <div className="divider" style={{ width: 1, height: 40, background: 'linear-gradient(180deg, transparent, rgba(255, 120, 60, 0.5), transparent)' }} />
                  <div>
                    <p style={{
                      margin: 0,
                      fontSize: 'clamp(22px, 3vw, 32px)',
                      fontWeight: 700,
                      background: 'linear-gradient(180deg, #ffe066 0%, #ffaa33 40%, #ff6633 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontFamily: "'Space Mono', monospace",
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 15px rgba(255, 150, 50, 0.3))',
                    }}>
                      {formatCurrency(calc.additionalMonthlyRevenue * 12)}
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: 11, color: 'rgba(255, 180, 130, 0.6)' }}>
                      {t('loss.annually')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Impact */}
            <div style={{
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(0, 255, 132, 0.1) 0%, rgba(0, 150, 77, 0.05) 100%)',
              borderRadius: 12,
              border: '1px solid rgba(0, 255, 132, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255, 255, 255, 0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {t('scenarios.monthlyImpact')}
                </p>
                <p style={{ margin: 0, fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, color: '#00ff84', fontFamily: "'Space Mono', monospace" }}>
                  +{formatCurrency(calc.improvedState.revenue - calc.currentState.revenue)}
                </p>
                <div className="impact-stats" style={{ marginTop: 12 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: 'rgba(255, 255, 255, 0.4)', marginBottom: 2 }}>
                      {t('scenarios.extraOrders')}
                    </p>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#fff' }}>
                      +{formatNumber(Math.round(calc.improvedState.orders - calc.currentState.orders))}
                    </p>
                  </div>
                  <div className="stat-divider" style={{ width: 1, height: 28, background: 'rgba(255, 255, 255, 0.1)' }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: 'rgba(255, 255, 255, 0.4)', marginBottom: 2 }}>
                      {t('scenarios.newRoas')}
                    </p>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#fff' }}>
                      {formatRoas(calc.improvedState.roas)}
                    </p>
                  </div>
                </div>
              </div>
              {/* Gradual implementation note - inside green box */}
              <p style={{
                margin: '16px 0 0 0',
                fontSize: 11,
                color: 'rgba(0, 255, 132, 0.5)',
                borderTop: '1px solid rgba(0, 255, 132, 0.15)',
                paddingTop: 12,
              }}>
                {t('scenarios.gradualNote')}
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════ EFFICIENCY METRICS ═══════════════ */}
        <section className="animate-in delay-2" style={{ marginBottom: 24 }}>
          <div className="section-header" style={{ paddingLeft: 8 }}>
            <div className="section-dot" />
            <h2 className="section-title">{t('efficiency.title')}</h2>
          </div>

          <div className="efficiency-grid">
            {/* RPS - Primary Metric */}
            <div className="glass-card-highlight" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <p className="metric-label metric-label-green" style={{ margin: 0 }}>{t('efficiency.rps')}</p>
                <InfoTooltip text={t('efficiency.rpsTooltip')} green />
                <span style={{
                  fontSize: 9,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  padding: '2px 6px',
                  background: 'rgba(0, 255, 132, 0.15)',
                  border: '1px solid rgba(0, 255, 132, 0.3)',
                  borderRadius: 4,
                  color: '#00ff84',
                }}>
                  #1
                </span>
              </div>
              <p className="metric-sublabel">{t('efficiency.rpsDesc')}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <span className="metric-value metric-value-dim" style={{ fontSize: 18, textDecoration: 'line-through' }}>
                  {currencyConfig.symbol}{calc.currentState.rps.toFixed(2)}
                </span>
                <span className="metric-arrow">→</span>
                <span className="metric-value metric-value-green" style={{ fontSize: 24 }}>
                  {currencyConfig.symbol}{calc.improvedState.rps.toFixed(2)}
                </span>
              </div>
              <p style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#00ff84',
                marginTop: 8,
                marginBottom: 0,
              }}>
                +{((calc.improvedState.rps / calc.currentState.rps - 1) * 100).toFixed(0)}%
              </p>
            </div>

            {/* ROAS */}
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <p className="metric-label" style={{ margin: 0 }}>{t('efficiency.roas')}</p>
                <InfoTooltip text={t('efficiency.roasTooltip')} />
              </div>
              <p className="metric-sublabel">{t('efficiency.roasDesc')}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <span className="metric-value metric-value-dim" style={{ fontSize: 18, textDecoration: 'line-through' }}>
                  {formatRoas(calc.currentState.roas)}
                </span>
                <span className="metric-arrow">→</span>
                <span className="metric-value metric-value-green" style={{ fontSize: 24 }}>
                  {formatRoas(calc.improvedState.roas)}
                </span>
              </div>
              <p style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#00ff84',
                marginTop: 8,
                marginBottom: 0,
              }}>
                +{((calc.improvedState.roas / calc.currentState.roas - 1) * 100).toFixed(0)}%
              </p>
            </div>

            {/* CPA */}
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <p className="metric-label" style={{ margin: 0 }}>{t('efficiency.cpa')}</p>
                <InfoTooltip text={t('efficiency.cpaTooltip')} />
              </div>
              <p className="metric-sublabel">{t('efficiency.cpaDesc')}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <span className="metric-value metric-value-dim" style={{ fontSize: 18, textDecoration: 'line-through' }}>
                  {formatCurrency(calc.currentState.cpa)}
                </span>
                <span className="metric-arrow">→</span>
                <span className="metric-value metric-value-green" style={{ fontSize: 24 }}>
                  {formatCurrency(calc.improvedState.cpa)}
                </span>
              </div>
              <p style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#00ff84',
                marginTop: 8,
                marginBottom: 0,
              }}>
                -{((1 - calc.improvedState.cpa / calc.currentState.cpa) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════ REVENUE RESULTS ═══════════════ */}
        <section className="animate-in delay-3" style={{ marginBottom: 24 }}>
          <div className="section-header" style={{ paddingLeft: 8 }}>
            <div className="section-dot" />
            <h2 className="section-title">{t('revenue.title')}</h2>
          </div>

          <div className="revenue-cards-grid">
            {/* Current */}
            <div className="glass-card-static" style={{ padding: '20px 16px', overflow: 'hidden' }}>
              <p className="metric-label">{t('revenue.current')}</p>
              <p className="metric-sublabel">{t('revenue.currentDesc')}</p>
              <p className="metric-value" style={{ marginTop: 12, fontSize: 'clamp(18px, 2.5vw, 28px)' }}>{formatCurrency(calc.currentState.revenue, true)}</p>
              <p className="metric-sublabel">{t('revenue.monthly')}</p>
            </div>

            {/* Improved */}
            <div className="glass-card-highlight" style={{ padding: '20px 16px', overflow: 'hidden' }}>
              <p className="metric-label metric-label-green">{t('revenue.improved')}</p>
              <p className="metric-sublabel">{t('revenue.improvedDesc')}</p>
              <p className="metric-value metric-value-green" style={{ marginTop: 12, fontSize: 'clamp(18px, 2.5vw, 28px)' }}>{formatCurrency(calc.improvedState.revenue, true)}</p>
              <p className="metric-sublabel">{t('revenue.monthly')}</p>
            </div>

            {/* Scaled */}
            <div className="glass-card-scaling" style={{ padding: '20px 16px', overflow: 'hidden' }}>
              <p className="metric-label metric-label-purple">{t('revenue.scaled')}</p>
              <p className="metric-sublabel">{t('revenue.scaledDesc')}</p>
              <p className="metric-value metric-value-purple" style={{ marginTop: 12, fontSize: 'clamp(18px, 2.5vw, 28px)' }}>{formatCurrency(calc.scaledState.revenue, true)}</p>
              <p className="metric-sublabel">{t('revenue.monthly')}</p>
            </div>

            {/* Increment */}
            <div className="glass-card" style={{ padding: '20px 16px', overflow: 'hidden', borderColor: 'rgba(0, 255, 132, 0.2)' }}>
              <p className="metric-label metric-label-green">{t('revenue.increment')}</p>
              <p className="metric-sublabel">{t('revenue.incrementDesc')}</p>
              <p className="metric-value metric-value-green" style={{ marginTop: 12, fontSize: 'clamp(18px, 2.5vw, 28px)' }}>+{formatCurrency(calc.additionalMonthlyRevenue, true)}</p>
              <p className="metric-sublabel">{t('revenue.monthly')}</p>
            </div>
          </div>
        </section>

        {/* ═══════════════ CHART + SCALING CONTROLS ═══════════════ */}
        <section className="glass-card animate-in delay-3" style={{ padding: 32, marginBottom: 24 }}>
          <div className="section-header">
            <div className="section-dot section-dot-purple" />
            <h2 className="section-title">{t('chart.title')} ({t('revenue.monthly')})</h2>
          </div>

          {/* Scaling controls - compact row above chart */}
          <div className="scaling-controls" style={{
            marginBottom: 24,
            padding: '20px 24px',
            background: 'rgba(139, 92, 246, 0.08)',
            borderRadius: 12,
            border: '1px solid rgba(139, 92, 246, 0.15)',
          }}>
            {/* Reinvestment */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label className="input-label" style={{ margin: 0 }}>{t('scaling.reinvestment')}</label>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#a78bfa',
                }}>{calc.inputs.reinvestmentPercent}%</span>
              </div>
              <input
                type="range"
                value={calc.inputs.reinvestmentPercent}
                onChange={(e) => calc.setReinvestmentPercent(Number(e.target.value))}
                min={INPUT_RANGES.reinvestmentPercent.min}
                max={INPUT_RANGES.reinvestmentPercent.max}
                step={INPUT_RANGES.reinvestmentPercent.step}
                style={{ margin: 0 }}
              />
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8, lineHeight: 1.4 }}>
                {t('scaling.reinvestmentDesc')}
              </p>
            </div>

            {/* Months */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label className="input-label" style={{ margin: 0 }}>{t('scaling.months')}</label>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#a78bfa',
                }}>{calc.inputs.projectionMonths} {calc.inputs.projectionMonths === 1 ? t('format.month') : t('format.months')}</span>
              </div>
              <input
                type="range"
                value={calc.inputs.projectionMonths}
                onChange={(e) => calc.setProjectionMonths(Number(e.target.value))}
                min={INPUT_RANGES.projectionMonths.min}
                max={INPUT_RANGES.projectionMonths.max}
                step={INPUT_RANGES.projectionMonths.step}
                style={{ margin: 0 }}
              />
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8, lineHeight: 1.4 }}>
                {t('scaling.monthsDesc')}
              </p>
            </div>
          </div>

          <div className="chart-container">
            {/* Shaded zone - BEHIND the chart */}
            {calc.inputs.projectionMonths >= 3 && (
              <div
                style={{
                  position: 'absolute',
                  left: '80px',
                  top: '10px',
                  width: `calc((100% - 90px) * ${3 / calc.inputs.projectionMonths})`,
                  height: 'calc(100% - 56px)',
                  background: 'linear-gradient(180deg, rgba(0, 255, 132, 0.06) 0%, rgba(0, 255, 132, 0.01) 100%)',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />
            )}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#666" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#666" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradImproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff84" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00ff84" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradScaled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradScaledNoCro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                  width={80}
                  tickFormatter={(v) => formatCurrency(v, true)}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10, 10, 18, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                  labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: 8 }}
                  formatter={(value) => [formatCurrency(value as number, true), '']}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 16 }}
                  formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{value}</span>}
                />
                <Area
                  type="monotone"
                  dataKey={t('chart.current')}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth={2}
                  fill="url(#gradCurrent)"
                />
                <Area
                  type="monotone"
                  dataKey={t('chart.scaledNoCro')}
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="url(#gradScaledNoCro)"
                />
                <Area
                  type="monotone"
                  dataKey={t('chart.improved')}
                  stroke="#00ff84"
                  strokeWidth={2}
                  fill="url(#gradImproved)"
                />
                <Area
                  type="monotone"
                  dataKey={t('chart.scaled')}
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#gradScaled)"
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Overlays ON TOP of chart */}
            {calc.inputs.projectionMonths >= 3 && (
              <>
                {/* Vertical dashed line at month 3 */}
                <div
                  style={{
                    position: 'absolute',
                    left: `calc(80px + (100% - 90px) * ${3 / calc.inputs.projectionMonths})`,
                    top: '10px',
                    width: '0',
                    height: 'calc(100% - 56px)',
                    borderLeft: '2px dashed rgba(255, 255, 255, 0.2)',
                    pointerEvents: 'none',
                  }}
                />
                {/* Implementation label */}
                <span
                  className="chart-overlay-label"
                  style={{
                    position: 'absolute',
                    left: `calc(80px + (100% - 90px) * ${1.5 / calc.inputs.projectionMonths})`,
                    top: '20px',
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'rgba(0, 255, 132, 0.35)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t('chart.implementationPeriod')}
                </span>
              </>
            )}
          </div>
        </section>

        {/* ═══════════════ ROI CALCULATOR ═══════════════ */}
        <section className="glass-card animate-in delay-4" style={{ padding: 32, marginBottom: 24 }}>
          <div className="section-header">
            <div className="section-dot" />
            <h2 className="section-title">{t('roi.title')}</h2>
          </div>

          {/* Main ROI Layout: Left side input + metrics, Right side big ROI */}
          <div className="roi-main-layout">
            {/* Left column: Input + Stats */}
            <div className="roi-left-column">
              {/* Investment Input */}
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label">{t('roi.investment')}</label>
                <div style={{ position: 'relative' }}>
                  <span className="input-prefix">{currencyConfig.symbol}</span>
                  <input
                    ref={croInvestmentRef}
                    type="text"
                    className="input-field input-field-with-prefix"
                    defaultValue={formatNumber(calc.inputs.croInvestment)}
                    onFocus={handleFocus('croInvestment')}
                    onBlur={handleCroInvestmentBlur}
                  />
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
                  {t('roi.totalInvestment')}: {formatCurrency(calc.roiMetrics.totalInvestment)}
                </p>
              </div>

              {/* Stats Row - 2 equal boxes */}
              <div className="roi-stats-row-2">
                {/* Additional Revenue */}
                <div className="glass-card-static roi-stat-box">
                  <p className="metric-label">{t('roi.additionalRevenue')}</p>
                  <p className="roi-stat-value metric-value-green">
                    {calc.roiMetrics.roiMultiple > MAX_REALISTIC_ROI ? '—' : formatCurrency(calc.roiMetrics.totalAdditionalRevenue, true)}
                  </p>
                </div>

                {/* Payback */}
                <div className="glass-card-static roi-stat-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <p className="metric-label" style={{ margin: 0 }}>
                      {t('roi.payback').replace('{amount}', formatCurrency(calc.roiMetrics.totalInvestment))}
                    </p>
                    <InfoTooltip text={t('roi.paybackTooltip')} />
                  </div>
                  <p className="roi-stat-value metric-value-green">
                    {calc.roiMetrics.paybackMonths === Infinity
                      ? '—'
                      : `${t('chart.month')} ${Math.ceil(calc.roiMetrics.paybackMonths)}`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Right column: Big ROI Box */}
            <div className="roi-box">
              <p className="roi-label">ROI ({calc.inputs.projectionMonths} {t('format.months')})</p>
              <p className="roi-value">{formatROI(calc.roiMetrics.roiMultiple)}</p>
              <p className="roi-sublabel">{formatROIPercent(calc.roiMetrics.roiPercent)}</p>
            </div>
          </div>

        </section>

        {/* ═══════════════ GUARANTEES SECTION ═══════════════ */}
        <section className="animate-in delay-4" style={{ marginBottom: 40 }}>
          {/* Title */}
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 700,
            marginBottom: 40,
            lineHeight: 1.2,
          }}>
            {t('guarantees.title')}{' '}
            <span style={{ color: '#00ff84' }}>{t('guarantees.titleAccent')}</span>{' '}
            {t('guarantees.subtitle')}
          </h2>

          {/* Guarantees grid */}
          <div className="guarantees-grid">
            {/* Left: Guarantee list */}
            <div className="guarantees-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                const isSelected = selectedGuarantee === num;
                return (
                  <button
                    key={num}
                    onClick={() => setSelectedGuarantee(num)}
                    style={{
                      padding: '16px 20px',
                      background: isSelected
                        ? 'linear-gradient(90deg, rgba(0, 255, 132, 0.15) 0%, transparent 100%)'
                        : 'transparent',
                      border: 'none',
                      borderLeft: isSelected ? '3px solid #00ff84' : '3px solid transparent',
                      borderRadius: '0 8px 8px 0',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <span style={{
                      fontSize: 15,
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? '#00ff84' : 'rgba(255, 255, 255, 0.5)',
                    }}>
                      {num} - {t(`guarantees.${num}.name` as keyof typeof import('@/lib/i18n/es').es)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right: Selected guarantee description */}
            <div style={{
              padding: 32,
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 16,
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}>
              <div>
                <p style={{
                  fontSize: 18,
                  lineHeight: 1.7,
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: 0,
                }}>
                  <span style={{ fontWeight: 700, color: '#fff' }}>
                    {t('guarantees.prefix')}
                  </span>{' '}
                  {t(`guarantees.${selectedGuarantee}.description` as keyof typeof import('@/lib/i18n/es').es)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ QUALIFICATION BADGE ═══════════════ */}
        <section className={`animate-in delay-4 qualification-section ${qualifiesForCRO ? 'glass-card-highlight' : 'glass-card'}`} style={{ padding: 40, textAlign: 'center', marginBottom: 40 }}>
          {qualifiesForCRO ? (
            <>
              <div className="badge badge-green" style={{ marginBottom: 20 }}>
                <div className="badge-dot badge-dot-green" />
                {t('qualification.croRecurring')}
              </div>
              <h3 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>
                {t('qualification.croRecurringReady')}
              </h3>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 480, margin: '0 auto 28px' }}>
                {t('qualification.croRecurringDesc')}
              </p>
              <a
                href="https://calendly.com/mateocosta/ecom?utm_source=roi-calculator&utm_medium=web&utm_campaign=cro&utm_content=cro-recurring"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                {t('qualification.croRecurringCta')}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </>
          ) : (
            <>
              <div className="badge badge-purple" style={{ marginBottom: 20 }}>
                <div className="badge-dot badge-dot-purple" />
                {t('qualification.highConversion')}
              </div>
              <h3 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>
                {t('qualification.highConversionReady')}
              </h3>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 480, margin: '0 auto 20px' }}>
                {t('qualification.highConversionDesc')}
              </p>

              {/* Progress bar */}
              <div style={{ maxWidth: 320, margin: '0 auto 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{t('qualification.threshold')}</span>
                  <span style={{ color: '#8b5cf6' }}>{formatNumber(calc.inputs.monthlyVisitors)} / {formatNumber(QUALIFICATION_THRESHOLD)}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              <a
                href="https://calendly.com/mateocosta/ecom?utm_source=roi-calculator&utm_medium=web&utm_campaign=cro&utm_content=high-conversion"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                {t('qualification.highConversionCta')}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </>
          )}
        </section>

        {/* ═══════════════ FOOTER ═══════════════ */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 32, paddingBottom: 100 }}>
          <p className="disclaimer">
            {language === 'es'
              ? '* Las proyecciones están basadas en resultados típicos de clientes de ConvertMate. Los resultados reales pueden variar según el producto, mercado y ejecución.'
              : '* Projections are based on typical ConvertMate client results. Actual results may vary based on product, market, and execution.'
            }
          </p>
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
            {t('footer.poweredBy')}{' '}
            <a
              href="https://convertmate.co"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#00ff84', textDecoration: 'none' }}
            >
              {t('footer.brand')}
            </a>
          </p>
        </footer>
      </div>

      {/* ═══════════════ STICKY CTA BAR ═══════════════ */}
      <div className="sticky-cta-bar">
        {/* Top glow line */}
        <div className="sticky-cta-glow" />

        <a
          href={qualifiesForCRO
            ? 'https://calendly.com/mateocosta/ecom?utm_source=roi-calculator&utm_medium=web&utm_campaign=cro&utm_content=cro-recurring-sticky'
            : 'https://calendly.com/mateocosta/ecom?utm_source=roi-calculator&utm_medium=web&utm_campaign=cro&utm_content=high-conversion-sticky'
          }
          target="_blank"
          rel="noopener noreferrer"
          className="sticky-cta-button"
        >
          {qualifiesForCRO ? t('qualification.croRecurringCta') : t('qualification.highConversionCta')}
        </a>

        {/* Bottom handle indicator */}
        <div className="sticky-cta-handle" />
      </div>
    </div>
  );
}
