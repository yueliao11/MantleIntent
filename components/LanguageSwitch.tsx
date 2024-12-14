"use client";

import { useI18n } from '@/lib/i18n/I18nContext';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitch() {
  const { locale, setLocale } = useI18n();

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'zh' : 'en';
    setLocale(newLocale);
    document.documentElement.lang = newLocale;
  };

  return (
    <Button
      variant="outline"
      onClick={toggleLanguage}
      className="fixed top-4 right-20 z-50 min-w-[80px] flex items-center gap-2"
    >
      <Globe className="h-4 w-4" />
      {locale === 'en' ? '中文' : 'English'}
    </Button>
  );
}