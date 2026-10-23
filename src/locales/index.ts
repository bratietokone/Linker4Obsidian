import { EN, type TranslationKey } from './en';
import { RU } from './ru';
import { ES } from './es';
import { ZH_CN } from './zh-CN';
export type { TranslationKey } from './en';
export type UiLocale = 'en' | 'ru' | 'es' | 'zh-CN';
export type LanguagePreference = 'auto' | UiLocale;
export const TRANSLATIONS: Record<UiLocale, Record<TranslationKey, string>> = {
  en: EN, ru: RU, es: ES, 'zh-CN': ZH_CN
};
/** The traditional-Chinese variants intentionally use the English fallback. */
export function localeFromLanguage(raw: string): UiLocale {
  const value = raw.toLowerCase().replace(/_/g, '-');
  if (value === 'ru' || value.startsWith('ru-')) return 'ru';
  if (value === 'es' || value.startsWith('es-')) return 'es';
  if (value === 'zh' || value === 'zh-cn' || value === 'zh-sg' || value === 'zh-hans' || value.startsWith('zh-hans-')) return 'zh-CN';
  return 'en';
}
