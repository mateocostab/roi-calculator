'use client';

import { Slider } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import { INPUT_RANGES } from '@/lib/constants';

interface InputSectionProps {
  monthlyVisitors: number;
  currentCVR: number;
  aov: number;
  adSpend: number;
  onMonthlyVisitorsChange: (value: number) => void;
  onCurrentCVRChange: (value: number) => void;
  onAovChange: (value: number) => void;
  onAdSpendChange: (value: number) => void;
}

export function InputSection({
  monthlyVisitors,
  currentCVR,
  aov,
  adSpend,
  onMonthlyVisitorsChange,
  onCurrentCVRChange,
  onAovChange,
  onAdSpendChange,
}: InputSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Slider
        label={t('inputs.visitors')}
        value={monthlyVisitors}
        min={INPUT_RANGES.monthlyVisitors.min}
        max={INPUT_RANGES.monthlyVisitors.max}
        step={INPUT_RANGES.monthlyVisitors.step}
        onChange={onMonthlyVisitorsChange}
        format="number"
      />
      <Slider
        label={t('inputs.cvr')}
        value={currentCVR}
        min={INPUT_RANGES.currentCVR.min}
        max={INPUT_RANGES.currentCVR.max}
        step={INPUT_RANGES.currentCVR.step}
        onChange={onCurrentCVRChange}
        format="percent"
      />
      <Slider
        label={t('inputs.aov')}
        value={aov}
        min={INPUT_RANGES.aov.min}
        max={INPUT_RANGES.aov.max}
        step={INPUT_RANGES.aov.step}
        onChange={onAovChange}
        format="currency"
      />
      <Slider
        label={t('inputs.adSpend')}
        value={adSpend}
        min={INPUT_RANGES.adSpend.min}
        max={INPUT_RANGES.adSpend.max}
        step={INPUT_RANGES.adSpend.step}
        onChange={onAdSpendChange}
        format="currency"
      />
    </div>
  );
}
