'use client';

import { Card } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import { formatCurrency } from '@/lib/formatters';
import type { StateMetrics, ScaledMetrics } from '@/lib/types';

interface RevenueResultsProps {
  currentState: StateMetrics;
  improvedState: StateMetrics;
  scaledState: ScaledMetrics;
  incrementalRevenue: number;
  projectionMonths: number;
}

export function RevenueResults({
  currentState,
  improvedState,
  scaledState,
  incrementalRevenue,
  projectionMonths,
}: RevenueResultsProps) {
  const { t } = useTranslation();

  const results = [
    {
      key: 'current',
      label: t('revenue.current'),
      desc: t('revenue.currentDesc'),
      monthly: currentState.revenue,
      total: currentState.revenue * projectionMonths,
      color: 'text-gray-400',
      bgColor: 'bg-gray-800',
    },
    {
      key: 'improved',
      label: t('revenue.improved'),
      desc: t('revenue.improvedDesc'),
      monthly: improvedState.revenue,
      total: improvedState.revenue * projectionMonths,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      key: 'scaled',
      label: t('revenue.scaled'),
      desc: t('revenue.scaledDesc'),
      monthly: scaledState.revenue,
      total: scaledState.totalRevenue,
      color: 'text-scaling',
      bgColor: 'bg-scaling/10',
    },
    {
      key: 'increment',
      label: t('revenue.increment'),
      desc: t('revenue.incrementDesc'),
      monthly: improvedState.revenue - currentState.revenue,
      total: incrementalRevenue,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      highlight: true,
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-300">{t('revenue.title')}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {results.map((result) => (
          <Card
            key={result.key}
            className={`p-4 ${result.highlight ? 'border-green-500/30' : ''}`}
            variant={result.highlight ? 'highlight' : 'default'}
            hover
          >
            <div className="mb-3">
              <div className={`text-xs font-semibold uppercase tracking-wide ${result.color}`}>
                {result.label}
              </div>
              <div className="text-xs text-gray-500">{result.desc}</div>
            </div>
            <div className="space-y-2">
              <div>
                <div className={`text-2xl font-bold ${result.color}`}>
                  {formatCurrency(result.monthly, true)}
                </div>
                <div className="text-xs text-gray-500">{t('revenue.monthly')}</div>
              </div>
              <div className={`rounded-lg ${result.bgColor} px-2 py-1`}>
                <div className={`text-sm font-semibold ${result.color}`}>
                  {formatCurrency(result.total, true)}
                </div>
                <div className="text-xs text-gray-500">
                  {t('revenue.total')} ({projectionMonths} {projectionMonths === 1 ? t('format.month') : t('format.months')})
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
