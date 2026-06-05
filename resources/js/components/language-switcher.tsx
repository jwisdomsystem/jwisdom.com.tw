import { useTranslation } from 'react-i18next';
import { normalizeLocale, SUPPORTED_LOCALES, type Locale } from '@/i18n';

const LABELS: Record<Locale, string> = {
    'zh-TW': '繁',
    en: 'EN',
};

function setLocaleCookie(locale: Locale) {
    if (typeof document === 'undefined') return;
    // Plain (un-encrypted) cookie — see EncryptCookies `except` list on the server.
    document.cookie = `locale=${locale};path=/;max-age=31536000;samesite=lax`;
}

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
    const { i18n } = useTranslation();
    const current = normalizeLocale(i18n.language);

    const choose = (locale: Locale) => {
        if (locale === current) return;
        setLocaleCookie(locale);
        i18n.changeLanguage(locale);
    };

    return (
        <div
            className={`inline-flex items-center rounded-full border border-slate-200 bg-white p-0.5 text-xs font-bold ${className}`}
            role="group"
            aria-label="Language"
        >
            {SUPPORTED_LOCALES.map((locale) => (
                <button
                    key={locale}
                    type="button"
                    onClick={() => choose(locale)}
                    aria-pressed={current === locale}
                    className={`rounded-full px-2.5 py-1 transition ${
                        current === locale ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                    {LABELS[locale]}
                </button>
            ))}
        </div>
    );
}
