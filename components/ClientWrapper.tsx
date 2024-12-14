"use client";

import { ReactNode } from 'react';
import { LanguageSwitch } from './LanguageSwitch';

export function ClientWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <LanguageSwitch />
      {children}
    </div>
  );
}