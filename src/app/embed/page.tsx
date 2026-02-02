'use client';

import { I18nProvider } from '@/lib/i18n';
import { Calculator } from '@/components/calculator';

export default function EmbedPage() {
  return (
    <I18nProvider defaultLanguage="es">
      <div style={{ padding: '20px' }}>
        <Calculator />
      </div>
    </I18nProvider>
  );
}
