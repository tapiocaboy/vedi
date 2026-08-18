import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { translations, interpolate, type Lang, type TranslationKey } from './translations';

const LANG_KEY = 'trytellme_lang';
const STORED_LANGS: Lang[] = ['si', 'ta', 'zh', 'hi', 'ja', 'ko', 'ar', 'ml'];

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  t: key => translations.en[key],
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(LANG_KEY);
    return saved && (STORED_LANGS as string[]).includes(saved) ? (saved as Lang) : 'en';
  });

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    localStorage.setItem(LANG_KEY, next);
  }, []);

  // Keep <html lang> in sync (Sinhala needs it for correct glyph shaping CSS)
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const raw = translations[lang][key] ?? translations.en[key];
      return vars ? interpolate(raw, vars) : raw;
    },
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLang(): LanguageContextValue {
  return useContext(LanguageContext);
}
