import React from 'react';

export type AvailableLocale = 'en' | 'af';

type AvailableLanguageObject = Record<
  string,
  { code: AvailableLocale; display: string }
>;

export const availableLanguages: AvailableLanguageObject = {
  en: {
    code: 'en',
    display: 'English',
  },
  af: {
    code: 'af',
    display: 'Afrikaans',
  },
};

export interface LanguageContextProps {
  locale: AvailableLocale;
  children: (locale: string) => React.ReactNode;
  setLocale?: React.Dispatch<React.SetStateAction<AvailableLocale>>;
}

export const LanguageContext = React.createContext<
  Omit<LanguageContextProps, 'children'>
>({
  locale: 'en',
});
