'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { es, type TranslationKey } from './es';
import { en } from './en';
import type { Language, Currency, CurrencyConfig } from '../types';
import { CURRENCIES, DEFAULT_CURRENCY } from '../constants';

const translations: Record<Language, Record<TranslationKey, string>> = {
  es,
  en,
};

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  currencyConfig: CurrencyConfig;
  formatCurrency: (value: number, compact?: boolean) => string;
  formatNumber: (value: number) => string;
  convertFromUSD: (usdValue: number) => number;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'roi-calculator-lang';
const CURRENCY_STORAGE_KEY = 'roi-calculator-currency';

interface I18nProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export function I18nProvider({ children, defaultLanguage = 'es' }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);

  useEffect(() => {
    // Load preferences from localStorage on client
    const storedLang = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (storedLang && (storedLang === 'es' || storedLang === 'en')) {
      setLanguageState(storedLang);
    }
    const storedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY) as Currency | null;
    if (storedCurrency && CURRENCIES.find(c => c.code === storedCurrency)) {
      setCurrencyState(storedCurrency);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const setCurrency = useCallback((curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem(CURRENCY_STORAGE_KEY, curr);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const value = translations[language][key];
      return value !== undefined ? value : key;
    },
    [language]
  );

  const currencyConfig = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  // Determine if locale uses period or comma for thousands
  const usesPeriodForThousands = ['es-CO', 'es-AR', 'es-CL', 'pt-BR'].includes(currencyConfig.locale);

  // Format number with locale-appropriate thousand separators
  const formatNumber = useCallback((value: number) => {
    const rounded = Math.round(value);
    if (usesPeriodForThousands) {
      // Spanish/Portuguese locales: 1.000.000
      return rounded.toLocaleString('de-DE'); // German uses same format as Spanish LATAM
    }
    // English locales: 1,000,000
    return rounded.toLocaleString('en-US');
  }, [usesPeriodForThousands]);

  // Format currency with locale-appropriate separators
  const formatCurrency = useCallback((value: number, compact = false) => {
    const symbol = currencyConfig.symbol;
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (compact && absValue >= 1_000_000) {
      const millions = absValue / 1_000_000;
      const decimalSep = usesPeriodForThousands ? ',' : '.';
      return `${sign}${symbol}${millions.toFixed(1).replace('.', decimalSep)}M`;
    }
    if (compact && absValue >= 1_000) {
      const thousands = absValue / 1_000;
      const decimalSep = usesPeriodForThousands ? ',' : '.';
      return `${sign}${symbol}${thousands.toFixed(0)}K`;
    }

    return `${sign}${symbol}${formatNumber(absValue)}`;
  }, [currencyConfig, formatNumber, usesPeriodForThousands]);

  // Convert USD value to current currency
  const convertFromUSD = useCallback((usdValue: number) => {
    return Math.round(usdValue * currencyConfig.exchangeRate);
  }, [currencyConfig]);

  return (
    <I18nContext.Provider value={{
      language,
      setLanguage,
      t,
      currency,
      setCurrency,
      currencyConfig,
      formatCurrency,
      formatNumber,
      convertFromUSD,
    }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}

export { type TranslationKey };
