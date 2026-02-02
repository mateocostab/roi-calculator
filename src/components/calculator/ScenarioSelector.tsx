'use client';

import { useTranslation } from '@/lib/i18n';
import { SCENARIOS } from '@/lib/constants';
import type { Scenario } from '@/lib/types';

interface ScenarioSelectorProps {
  selected: Scenario;
  onChange: (scenario: Scenario) => void;
}

export function ScenarioSelector({ selected, onChange }: ScenarioSelectorProps) {
  const { t } = useTranslation();

  const scenarioDetails: Record<Scenario, { label: string; desc: string }> = {
    conservative: {
      label: t('scenarios.conservative'),
      desc: t('scenarios.conservativeDesc'),
    },
    expected: {
      label: t('scenarios.expected'),
      desc: t('scenarios.expectedDesc'),
    },
    optimistic: {
      label: t('scenarios.optimistic'),
      desc: t('scenarios.optimisticDesc'),
    },
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-300">{t('scenarios.title')}</h3>
      <div className="grid grid-cols-3 gap-2">
        {SCENARIOS.map((scenario) => {
          const isSelected = selected === scenario.id;
          const { label, desc } = scenarioDetails[scenario.id];

          return (
            <button
              key={scenario.id}
              onClick={() => onChange(scenario.id)}
              className={`rounded-lg px-3 py-3 text-center transition-all duration-200 ${
                isSelected
                  ? 'bg-primary text-gray-900 shadow-lg shadow-primary/20'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              aria-pressed={isSelected}
            >
              <div className="text-sm font-semibold">{label}</div>
              <div className={`text-xs ${isSelected ? 'text-gray-800' : 'text-gray-500'}`}>
                {desc}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
