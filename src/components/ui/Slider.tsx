'use client';

import { useCallback, useState, useEffect } from 'react';
import { formatNumber, formatCurrency, formatPercent } from '@/lib/formatters';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: 'number' | 'currency' | 'percent';
  className?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format = 'number',
  className = '',
}: SliderProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const formatValue = useCallback((val: number): string => {
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percent':
        return formatPercent(val, 0);
      default:
        return formatNumber(val);
    }
  }, [format]);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  }, [onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleInputBlur = useCallback(() => {
    const parsed = parseFloat(inputValue.replace(/[^0-9.-]/g, ''));
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    } else {
      setInputValue(value.toString());
    }
  }, [inputValue, min, max, onChange, value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  }, [handleInputBlur]);

  // Calculate percentage for slider fill
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="w-32 rounded-lg bg-gray-800 px-3 py-1.5 text-right text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={`${label} value`}
        />
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="w-full"
          style={{
            background: `linear-gradient(to right, #00ff84 0%, #00ff84 ${percentage}%, #333 ${percentage}%, #333 100%)`,
          }}
          aria-label={`${label} slider`}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}
