"use client";

import { ReactNode } from 'react';
import { I18nProvider } from '@/lib/i18n/I18nContext';
import { LanguageSwitch } from './LanguageSwitch';
import { ClientProviders } from '@/app/ClientProviders';

export function ClientRoot({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <div className="relative">
        <LanguageSwitch />
        <ClientProviders>
          {children}
        </ClientProviders>
      </div>
    </I18nProvider>
  );
}