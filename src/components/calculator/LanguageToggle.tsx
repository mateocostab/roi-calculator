'use client';

import { useTranslation } from '@/lib/i18n';
import type { Language } from '@/lib/types';

export function LanguageToggle() {
  const { language, setLanguage } = useTranslation();

  const languages: { code: Language; label: string }[] = [
    { code: 'es', label: 'ES' },
    { code: 'en', label: 'EN' },
  ];

  return (
    <div className="flex items-center gap-1 rounded-lg bg-gray-800 p-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`rounded-md px-3 py-1 text-sm font-medium transition-all duration-200 ${
            language === lang.code
              ? 'bg-primary text-gray-900'
              : 'text-gray-400 hover:text-white'
          }`}
          aria-pressed={language === lang.code}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
