'use client';

import { Slider } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import { INPUT_RANGES } from '@/lib/constants';

interface ScalingSimulatorProps {
  reinvestmentPercent: number;
  projectionMonths: number;
  onReinvestmentChange: (value: number) => void;
  onProjectionMonthsChange: (value: number) => void;
}

export function ScalingSimulator({
  reinvestmentPercent,
  projectionMonths,
  onReinvestmentChange,
  onProjectionMonthsChange,
}: ScalingSimulatorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-300">{t('scaling.title')}</h3>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Slider
            label={t('scaling.reinvestment')}
            value={reinvestmentPercent}
            min={INPUT_RANGES.reinvestmentPercent.min}
            max={INPUT_RANGES.reinvestmentPercent.max}
            step={INPUT_RANGES.reinvestmentPercent.step}
            onChange={onReinvestmentChange}
            format="percent"
          />
          <p className="mt-1 text-xs text-gray-500">{t('scaling.reinvestmentDesc')}</p>
        </div>
        <Slider
          label={t('scaling.months')}
          value={projectionMonths}
          min={INPUT_RANGES.projectionMonths.min}
          max={INPUT_RANGES.projectionMonths.max}
          step={INPUT_RANGES.projectionMonths.step}
          onChange={onProjectionMonthsChange}
          format="number"
        />
      </div>
    </div>
  );
}
