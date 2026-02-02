'use client';

import { Card } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import { formatRoas, formatCurrency, formatDecimal } from '@/lib/formatters';
import type { StateMetrics } from '@/lib/types';

interface EfficiencyMetricsProps {
  currentState: StateMetrics;
  improvedState: StateMetrics;
}

export function EfficiencyMetrics({ currentState, improvedState }: EfficiencyMetricsProps) {
  const { t } = useTranslation();

  const metrics = [
    {
      key: 'roas',
      label: t('efficiency.roas'),
      desc: t('efficiency.roasDesc'),
      current: formatRoas(currentState.roas),
      improved: formatRoas(improvedState.roas),
      isPositive: improvedState.roas > currentState.roas,
    },
    {
      key: 'cpa',
      label: t('efficiency.cpa'),
      desc: t('efficiency.cpaDesc'),
      current: formatCurrency(currentState.cpa),
      improved: formatCurrency(improvedState.cpa),
      isPositive: improvedState.cpa < currentState.cpa,
    },
    {
      key: 'rps',
      label: t('efficiency.rps'),
      desc: t('efficiency.rpsDesc'),
      current: `$${formatDecimal(currentState.rps)}`,
      improved: `$${formatDecimal(improvedState.rps)}`,
      isPositive: improvedState.rps > currentState.rps,
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-300">{t('efficiency.title')}</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.key} className="p-4" hover>
            <div className="mb-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {metric.label}
              </div>
              <div className="text-xs text-gray-600">{metric.desc}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{t('efficiency.current')}</span>
                <span className="text-sm font-medium text-gray-400">{metric.current}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-primary">{t('efficiency.improved')}</span>
                <span className={`text-sm font-bold ${metric.isPositive ? 'text-primary' : 'text-red-400'}`}>
                  {metric.improved}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
