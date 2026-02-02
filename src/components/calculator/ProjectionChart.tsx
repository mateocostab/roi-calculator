'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from '@/lib/i18n';
import { formatCurrency } from '@/lib/formatters';
import { CHART_COLORS } from '@/lib/constants';
import type { ProjectionDataPoint } from '@/lib/types';

interface ProjectionChartProps {
  data: ProjectionDataPoint[];
  showCumulative?: boolean;
}

export function ProjectionChart({ data, showCumulative = true }: ProjectionChartProps) {
  const { t } = useTranslation();

  const chartData = data.map((point) => ({
    month: `${t('chart.month')} ${point.month}`,
    [t('chart.current')]: showCumulative ? point.currentCumulative : point.current,
    [t('chart.improved')]: showCumulative ? point.improvedCumulative : point.improved,
    [t('chart.scaled')]: showCumulative ? point.scaledCumulative : point.scaled,
  }));

  const currentKey = t('chart.current');
  const improvedKey = t('chart.improved');
  const scaledKey = t('chart.scaled');

  // Implementation period: first 3 months out of total
  const showImplementationPeriod = data.length > 3;
  // Calculate width percentage for implementation zone (3 months out of total)
  // Account for chart margins (left ~60px for Y axis, right ~10px)
  const implementationWidthPercent = showImplementationPeriod ? (3 / data.length) * 100 : 0;

  // Accessible description for screen readers
  const accessibleDescription = t('chart.accessibleDescription').replace('{months}', String(data.length));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">
          {t('chart.title')} {showCumulative ? `(${t('chart.cumulative')})` : ''}
        </h3>
      </div>
      {/* Screen reader description */}
      <p className="sr-only" aria-live="polite">{accessibleDescription}</p>
      <div className="h-[300px] w-full relative" role="img" aria-label={accessibleDescription}>
        {/* Implementation period overlay - CSS positioned */}
        {showImplementationPeriod && (
          <>
            {/* Shaded zone for first 3 months */}
            <div
              style={{
                position: 'absolute',
                left: '60px', // Approximate Y-axis width
                top: '10px',
                width: `calc((100% - 70px) * ${implementationWidthPercent / 100})`,
                height: 'calc(100% - 60px)', // Account for X-axis and legend
                background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                borderRight: '2px dashed rgba(255,255,255,0.2)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              {/* Label */}
              <span
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  fontSize: 10,
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {t('chart.implementationPeriod')}
              </span>
            </div>
          </>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.current} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.current} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorImproved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.improved} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.improved} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorScaled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.scaled} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.scaled} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="month"
              stroke="#666"
              tick={{ fill: '#888', fontSize: 12 }}
              tickLine={{ stroke: '#444' }}
            />
            <YAxis
              stroke="#666"
              tick={{ fill: '#888', fontSize: 12 }}
              tickLine={{ stroke: '#444' }}
              tickFormatter={(value) => formatCurrency(value, true)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#fff', fontWeight: 'bold' }}
              itemStyle={{ color: '#ccc' }}
              formatter={(value) => typeof value === 'number' ? formatCurrency(value) : ''}
            />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey={currentKey}
              stroke={CHART_COLORS.current}
              fill="url(#colorCurrent)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey={improvedKey}
              stroke={CHART_COLORS.improved}
              fill="url(#colorImproved)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey={scaledKey}
              stroke={CHART_COLORS.scaled}
              fill="url(#colorScaled)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
