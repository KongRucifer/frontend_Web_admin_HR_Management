import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import lo from './lo.json';

export const LANGS = [
  { code: 'lo', label: 'ລາວ' },
  { code: 'en', label: 'English' },
] as const;

const stored =
  typeof localStorage !== 'undefined' ? localStorage.getItem('hrapp-lang') : null;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    lo: { translation: lo },
  },
  lng: stored || 'lo',
  fallbackLng: 'lo',
  interpolation: { escapeValue: false },
});

export function setLanguage(code: string) {
  i18n.changeLanguage(code);
  localStorage.setItem('hrapp-lang', code);
  document.documentElement.lang = code;
}

export default i18n;
