'use client';

import { I18nProvider } from '@/lib/i18n';
import { Calculator } from '@/components/calculator';

export default function Home() {
  return (
    <I18nProvider defaultLanguage="es">
      <Calculator />
    </I18nProvider>
  );
}
