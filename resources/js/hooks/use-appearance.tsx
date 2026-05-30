import { useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const isClient = typeof window !== 'undefined';

const prefersDark = () =>
    isClient && window.matchMedia('(prefers-color-scheme: dark)').matches;

const applyTheme = (appearance: Appearance) => {
    if (typeof document === 'undefined') return;
    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());
    document.documentElement.classList.toggle('dark', isDark);
};

const mediaQuery = isClient
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

const handleSystemThemeChange = () => {
    if (typeof localStorage === 'undefined') return;
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    applyTheme(currentAppearance || 'system');
};

export function initializeTheme() {
    if (typeof localStorage === 'undefined') return;
    const savedAppearance = (localStorage.getItem('appearance') as Appearance) || 'system';
    applyTheme(savedAppearance);
    mediaQuery?.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('system');

    const updateAppearance = (mode: Appearance) => {
        setAppearance(mode);
        if (typeof localStorage !== 'undefined') localStorage.setItem('appearance', mode);
        applyTheme(mode);
    };

    useEffect(() => {
        const savedAppearance = (typeof localStorage !== 'undefined'
            ? localStorage.getItem('appearance')
            : null) as Appearance | null;
        updateAppearance(savedAppearance || 'system');

        return () => mediaQuery?.removeEventListener('change', handleSystemThemeChange);
    }, []);

    return { appearance, updateAppearance };
}
