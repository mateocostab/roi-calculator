'use client';

import { Card, Button } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import { formatNumber } from '@/lib/formatters';
import { QUALIFICATION_THRESHOLD } from '@/lib/constants';
import type { QualificationTier } from '@/lib/types';

interface QualificationBadgeProps {
  tier: QualificationTier;
  monthlyVisitors: number;
}

export function QualificationBadge({ tier, monthlyVisitors }: QualificationBadgeProps) {
  const { t } = useTranslation();

  const isCroRecurring = tier === 'cro_recurring';

  const config = isCroRecurring
    ? {
        title: t('qualification.croRecurring'),
        description: t('qualification.croRecurringDesc'),
        cta: t('qualification.croRecurringCta'),
        ctaUrl: 'https://calendly.com/convertmate/strategy-call',
        gradient: 'from-primary/20 to-primary/5',
        border: 'border-primary/30',
        badge: 'bg-primary text-gray-900',
      }
    : {
        title: t('qualification.highConversion'),
        description: t('qualification.highConversionDesc'),
        cta: t('qualification.highConversionCta'),
        ctaUrl: 'https://calendly.com/convertmate/cro-roadmap',
        gradient: 'from-scaling/20 to-scaling/5',
        border: 'border-scaling/30',
        badge: 'bg-scaling text-white',
      };

  const progress = Math.min((monthlyVisitors / QUALIFICATION_THRESHOLD) * 100, 100);

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${config.gradient} ${config.border} p-5`}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-400">{t('qualification.title')}</h3>
          <div className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-bold ${config.badge}`}>
            {config.title}
          </div>
        </div>
        {isCroRecurring && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
            <svg
              className="h-5 w-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </div>

      <p className="mb-4 text-sm text-gray-300">{config.description}</p>

      {!isCroRecurring && (
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-gray-500">{t('qualification.threshold')}</span>
            <span className="text-gray-400">
              {formatNumber(monthlyVisitors)} / {formatNumber(QUALIFICATION_THRESHOLD)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full bg-scaling transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <a
        href={config.ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <Button
          variant={isCroRecurring ? 'primary' : 'outline'}
          className="w-full"
          size="lg"
        >
          {config.cta}
        </Button>
      </a>
    </Card>
  );
}
