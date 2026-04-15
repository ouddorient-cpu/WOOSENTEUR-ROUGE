'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fr } from './fr';
import { en } from './en';
import type { Translations } from './types';

type Lang = 'fr' | 'en';

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const dicts: Record<Lang, Translations> = { fr, en };

const LangContext = createContext<LangContextValue>({
  lang: 'fr',
  setLang: () => {},
  t: fr,
});

export const LangProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Lang>('fr');

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null;
    if (saved === 'en' || saved === 'fr') {
      setLangState(saved);
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  }, []);

  return (
    <LangContext.Provider value={{ lang, setLang, t: dicts[lang] }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
