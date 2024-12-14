"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import en from './translations/en';
import zh from './translations/zh';

const I18nContext = createContext<{
  t: (key: string, params?: Record<string, string>) => string;
  locale: string;
  setLocale: (locale: string) => void;
}>({
  t: () => '',
  locale: 'en',
  setLocale: () => {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState('en');
  
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale) {
      setLocale(savedLocale);
    }
  }, []);

  const translations = {
    en,
    zh,
  };

  const t = (key: string, params?: Record<string, string>) => {
    const keys = key.split('.');
    let value = translations[locale as keyof typeof translations];
    
    for (const k of keys) {
      value = value?.[k];
    }

    if (typeof value !== 'string') return key;

    if (params) {
      return Object.entries(params).reduce(
        (acc, [key, value]) => acc.replace(`{{${key}}}`, value),
        value
      );
    }

    return value;
  };

  const handleSetLocale = (newLocale: string) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  return (
    <I18nContext.Provider value={{ t, locale, setLocale: handleSetLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext); 