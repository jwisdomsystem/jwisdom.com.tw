import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import zhTW from './locales/zh-TW.json';

export const SUPPORTED_LOCALES = ['zh-TW', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'zh-TW';

export const resources = {
    'zh-TW': { translation: zhTW },
    en: { translation: en },
} as const;

export function normalizeLocale(value?: string | null): Locale {
    if (value && (SUPPORTED_LOCALES as readonly string[]).includes(value)) {
        return value as Locale;
    }
    return DEFAULT_LOCALE;
}

/**
 * Initialise (or re-sync) i18next. Safe to call on every page load on both the
 * client and during SSR — each SSR request passes the locale resolved from the
 * `locale` cookie via Inertia shared props.
 */
export function initI18n(locale?: string | null) {
    const lng = normalizeLocale(locale);

    if (!i18n.isInitialized) {
        i18n.use(initReactI18next).init({
            resources,
            lng,
            fallbackLng: DEFAULT_LOCALE,
            supportedLngs: SUPPORTED_LOCALES as unknown as string[],
            interpolation: { escapeValue: false },
            initImmediate: false,
            react: { useSuspense: false },
        });
    } else if (i18n.language !== lng) {
        i18n.changeLanguage(lng);
    }

    return i18n;
}

export default i18n;
