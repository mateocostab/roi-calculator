'use client';

import { Card, Slider } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import { formatCurrency, formatDecimal, formatMonths } from '@/lib/formatters';
import { INPUT_RANGES } from '@/lib/constants';
import type { ROIMetrics } from '@/lib/types';

interface ROICalculatorProps {
  croInvestment: number;
  projectionMonths: number;
  roiMetrics: ROIMetrics;
  onCroInvestmentChange: (value: number) => void;
}

export function ROICalculator({
  croInvestment,
  projectionMonths,
  roiMetrics,
  onCroInvestmentChange,
}: ROICalculatorProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-5" variant="highlight">
      <h3 className="mb-4 text-lg font-semibold text-white">{t('roi.title')}</h3>

      <div className="mb-6">
        <Slider
          label={t('roi.investment')}
          value={croInvestment}
          min={INPUT_RANGES.croInvestment.min}
          max={INPUT_RANGES.croInvestment.max}
          step={INPUT_RANGES.croInvestment.step}
          onChange={onCroInvestmentChange}
          format="currency"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-gray-800 p-3">
          <div className="text-xs text-gray-500">{t('roi.totalInvestment')}</div>
          <div className="text-xl font-bold text-white">
            {formatCurrency(roiMetrics.totalInvestment)}
          </div>
          <div className="text-xs text-gray-500">
            {projectionMonths} {projectionMonths === 1 ? t('format.month') : t('format.months')}
          </div>
        </div>

        <div className="rounded-lg bg-gray-800 p-3">
          <div className="text-xs text-gray-500">{t('roi.additionalRevenue')}</div>
          <div className="text-xl font-bold text-primary">
            {formatCurrency(roiMetrics.totalAdditionalRevenue)}
          </div>
        </div>

        <div className="rounded-lg bg-primary/10 p-3">
          <div className="text-xs text-gray-500">{t('roi.roiMultiple')}</div>
          <div className="text-xl font-bold text-primary">
            {formatDecimal(roiMetrics.roiMultiple)}x
          </div>
          <div className="text-xs text-primary">
            +{formatDecimal(roiMetrics.roiPercent, 0)}%
          </div>
        </div>

        <div className="rounded-lg bg-gray-800 p-3">
          <div className="text-xs text-gray-500">{t('roi.payback')}</div>
          <div className="text-xl font-bold text-white">
            {formatMonths(roiMetrics.paybackMonths, t)}
          </div>
        </div>
      </div>
    </Card>
  );
}
