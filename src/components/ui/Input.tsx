'use client';

import { InputHTMLAttributes, useState, useCallback, useEffect } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  format?: 'number' | 'currency' | 'percent';
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function Input({
  label,
  value,
  onChange,
  format = 'number',
  prefix,
  suffix,
  className = '',
  min,
  max,
  ...props
}: InputProps) {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toString());
    }
  }, [value, isFocused]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const parsed = parseFloat(inputValue.replace(/[^0-9.-]/g, ''));
    if (!isNaN(parsed)) {
      let clamped = parsed;
      if (min !== undefined) clamped = Math.max(Number(min), clamped);
      if (max !== undefined) clamped = Math.min(Number(max), clamped);
      onChange(clamped);
    } else {
      setInputValue(value.toString());
    }
  }, [inputValue, min, max, onChange, value]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  }, [handleBlur]);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-300">{label}</label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-gray-500">{prefix}</span>
        )}
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className={`w-full rounded-lg bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary ${
            prefix ? 'pl-8' : ''
          } ${suffix ? 'pr-12' : ''}`}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-gray-500">{suffix}</span>
        )}
      </div>
    </div>
  );
}
