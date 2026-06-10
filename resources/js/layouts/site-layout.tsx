import { Link, usePage } from '@inertiajs/react';
import { MapPin, Phone, Printer, Mail, MessageCircle, X } from 'lucide-react';
import { type PropsWithChildren, type ReactElement, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { track, trackOutbound } from '@/lib/analytics';
import LanguageSwitcher from '@/components/language-switcher';

type Banner = { title?: string; subtitle?: string; body?: string; url?: string; cta_label?: string };

function useBanner(zone: string): Banner | undefined {
    const { banners } = usePage().props as { banners?: Record<string, Banner[]> };
    return banners?.[zone]?.[0];
}

const navItems = [
    { key: 'services', href: '/#services' },
    { key: 'products', href: '/#products' },
    { key: 'works', href: '/#works' },
    { key: 'why', href: '/#why' },
    { key: 'news', href: '/news' },
    { key: 'insights', href: '/insights' },
    { key: 'contact', href: '/contact' },
];

function StartMenu() {
    const { t } = useTranslation();
    const startMenuItems = [
        { name: t('startMenu.shopName'), desc: t('startMenu.shopDesc'), url: 'https://shop.jwisdom.com.tw' },
        { name: t('startMenu.chataiName'), desc: t('startMenu.chataiDesc'), url: 'https://tw.chat-ai.app' },
        { name: t('startMenu.autogrowthName'), desc: t('startMenu.autogrowthDesc'), url: 'https://tw.auto-growth.app' },
    ];
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full bg-sky-400 px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:brightness-95"
            >
                {t('header.start')}
                <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>
            {open && (
                <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{t('header.chooseProduct')}</div>
                    {startMenuItems.map((m) => (
                        <a
                            key={m.name}
                            href={m.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => { trackOutbound(m.name, m.url, 'header_start_menu'); setOpen(false); }}
                            className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
                        >
                            <span>
                                <span className="block text-sm font-bold text-slate-900">{m.name}</span>
                                <span className="block text-xs text-slate-400">{m.desc}</span>
                            </span>
                            <span className="text-sky-500 transition group-hover:translate-x-0.5">→</span>
                        </a>
                    ))}
                    <div className="my-1 border-t border-slate-100" />
                    <a
                        href="/contact"
                        onClick={() => { track('cta_clicked', { button_text: 'contact_consultant', location: 'header_start_menu' }); setOpen(false); }}
                        className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                        {t('header.contactConsultant')} <span className="text-sky-500">→</span>
                    </a>
                </div>
            )}
        </div>
    );
}

function Logo() {
    return (
        <Link href="/" className="flex items-center">
            <img src="/images/jwisdom-logo.png" alt="宸揚資科 JWisdom" className="h-9 w-auto" />
        </Link>
    );
}

function Header() {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                <Logo />
                <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
                    {navItems.map((item) => (
                        <a key={item.href} href={item.href} className="transition hover:text-slate-900">
                            {t(`nav.${item.key}`)}
                        </a>
                    ))}
                </nav>
                <div className="flex items-center gap-3">
                    <LanguageSwitcher className="hidden sm:inline-flex" />
                    <StartMenu />
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        className="lg:hidden"
                        aria-label={t('header.menu')}
                    >
                        <svg viewBox="0 0 24 24" className="h-6 w-6 text-slate-700" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M3 6h18M3 12h18M3 18h18" />
                        </svg>
                    </button>
                </div>
            </div>
            {open && (
                <nav className="border-t border-slate-100 bg-white px-6 py-4 lg:hidden">
                    {navItems.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className="block py-2 text-sm font-medium text-slate-700"
                        >
                            {t(`nav.${item.key}`)}
                        </a>
                    ))}
                    <div className="mt-3 border-t border-slate-100 pt-3">
                        <LanguageSwitcher />
                    </div>
                </nav>
            )}
        </header>
    );
}

// 5 個社群品牌 icon（純色 SVG，依品牌實際 logo 路徑）
const SOCIAL_ICONS: Record<string, { label: string; path: string }> = {
    facebook: {
        label: 'Facebook',
        path: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.196 2.238.196v2.46h-1.26c-1.243 0-1.63.772-1.63 1.563V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z',
    },
    instagram: {
        label: 'Instagram',
        path: 'M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311 1.266-.058 1.646-.07 4.85-.07zM12 0C8.74 0 8.333.014 7.053.072 5.775.13 4.905.333 4.14.63a5.892 5.892 0 0 0-2.126 1.384A5.892 5.892 0 0 0 .63 4.14C.333 4.905.131 5.775.072 7.053.014 8.333 0 8.74 0 12s.014 3.667.072 4.947c.058 1.278.261 2.148.558 2.913a5.892 5.892 0 0 0 1.384 2.126 5.892 5.892 0 0 0 2.126 1.384c.765.297 1.635.499 2.913.558C8.333 23.986 8.74 24 12 24s3.667-.014 4.947-.072c1.278-.058 2.148-.261 2.913-.558a5.892 5.892 0 0 0 2.126-1.384 5.892 5.892 0 0 0 1.384-2.126c.297-.765.499-1.635.558-2.913.058-1.28.072-1.687.072-4.947s-.014-3.667-.072-4.947c-.058-1.278-.261-2.148-.558-2.913a5.892 5.892 0 0 0-1.384-2.126A5.892 5.892 0 0 0 19.86.63c-.765-.297-1.635-.499-2.913-.558C15.667.014 15.26 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z',
    },
    threads: {
        label: 'Threads',
        path: 'M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.066-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291 1.071-.061 2.073.018 2.978.222-.121-.726-.366-1.302-.728-1.717-.494-.563-1.255-.847-2.265-.852h-.038c-.808 0-1.905.224-2.602 1.253l-1.687-1.135c.933-1.385 2.451-2.149 4.291-2.149h.058c3.083.019 4.92 1.917 5.105 5.226.106.045.21.092.314.142 1.456.685 2.519 1.72 3.073 2.99.771 1.766.83 4.475-1.486 6.748-1.755 1.722-3.844 2.501-6.844 2.523l-.008-.001zm.092-7.31c-.243 0-.49.012-.74.027-1.836.106-2.973.985-2.918 1.948.058 1.012 1.197 1.482 2.32 1.422 1.024-.057 2.345-.456 2.567-3.066-.388-.083-.812-.127-1.234-.331h.005z',
    },
    youtube: {
        label: 'YouTube',
        path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    },
    tiktok: {
        label: 'TikTok',
        path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
    },
};

function SocialLinks() {
    const settings = (usePage().props as { settings?: Record<string, string> }).settings ?? {};
    const links = [
        { key: 'facebook', url: settings.social_facebook },
        { key: 'instagram', url: settings.social_instagram },
        { key: 'threads', url: settings.social_threads },
        { key: 'youtube', url: settings.social_youtube },
        { key: 'tiktok', url: settings.social_tiktok },
    ].filter((l) => l.url && l.url.trim() !== '');

    if (!links.length) return null;

    return (
        <div className="flex items-center gap-1">
            {links.map(({ key, url }) => {
                const ico = SOCIAL_ICONS[key];
                return (
                    <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={ico.label}
                        title={ico.label}
                        onClick={() => track('social_click', { network: key, location: 'footer' })}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-sky-400"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]"><path d={ico.path} /></svg>
                    </a>
                );
            })}
        </div>
    );
}

function Footer() {
    const { t } = useTranslation();
    const props = usePage().props as {
        settings?: Record<string, string>;
        siteProducts?: { name: string; url?: string }[];
        footerServices?: { title: string; slug: string }[];
    };
    const settings = props.settings ?? {};
    const email = settings.contact_email || 'service@jwisdom.com.tw';
    const phone = settings.contact_phone || '06-2340161';
    const fax = settings.contact_fax || '';
    const address = settings.contact_address || '臺南市東區東門路二段297號5F';
    const tagline = settings.footer_tagline || t('footer.tagline');
    const copyright = (settings.footer_copyright
        ? settings.footer_copyright.replace('{year}', String(new Date().getFullYear()))
        : t('footer.copyright', { year: new Date().getFullYear() }));
    const products = props.siteProducts ?? [];
    const services = props.footerServices ?? [];
    return (
        <footer className="bg-slate-950 text-slate-400">
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-8 gap-y-10 px-6 py-16 md:grid-cols-12">
                <div className="col-span-2 md:col-span-2">
                    <div className="mb-4 inline-flex rounded-md bg-white px-3 py-2">
                        <img src="/images/jwisdom-logo.png" alt="宸揚資科 JWisdom" className="h-7 w-auto" />
                    </div>
                    <p className="max-w-xs text-sm leading-relaxed text-slate-400">{tagline}</p>
                </div>
                <div className="md:col-span-2">
                    <h4 className="mb-4 text-sm font-semibold text-white">{t('footer.services')}</h4>
                    <ul className="space-y-2.5 text-sm">
                        {services.length > 0 ? services.map((s) => (
                            <li key={s.slug}><a href={`/services/${s.slug}`} className="hover:text-sky-400">{s.title}</a></li>
                        )) : <li><a href="/#services" className="hover:text-sky-400">{t('footer.services')}</a></li>}
                    </ul>
                </div>
                <div className="md:col-span-2">
                    <h4 className="mb-4 text-sm font-semibold text-white">{t('footer.products')}</h4>
                    <ul className="space-y-2.5 text-sm">
                        {products.length > 0 ? products.map((p) => (
                            <li key={p.name}><a href={p.url || '#'} target="_blank" rel="noopener noreferrer" onClick={() => p.url && trackOutbound(p.name, p.url, 'footer_products')} className="hover:text-sky-400">{p.name}</a></li>
                        )) : <li className="text-slate-500">{t('footer.noProducts')}</li>}
                    </ul>
                </div>
                <div className="md:col-span-2">
                    <h4 className="mb-4 text-sm font-semibold text-white">{t('footer.company')}</h4>
                    <ul className="space-y-2.5 text-sm">
                        <li><a href="/about" className="hover:text-sky-400">{t('footer.companyIntro')}</a></li>
                        <li><a href="/#works" className="hover:text-sky-400">{t('footer.works')}</a></li>
                        <li><a href="/news" className="hover:text-sky-400">{t('footer.news')}</a></li>
                        <li><a href="/insights" className="hover:text-sky-400">{t('footer.insights')}</a></li>
                        <li><a href="/faq" className="hover:text-sky-400">{t('footer.faq')}</a></li>
                    </ul>
                </div>
                <div className="col-span-2 md:col-span-4">
                    <h4 className="mb-4 text-sm font-semibold text-white">{t('footer.contactUs')}</h4>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-2.5">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                            <span><span className="font-semibold text-slate-300">Address：</span>{address}</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                            <span><span className="font-semibold text-slate-300">Phone：</span><a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="whitespace-nowrap hover:text-sky-400">{phone}</a></span>
                        </li>
                        {fax && (
                            <li className="flex items-start gap-2.5">
                                <Printer className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                                <span><span className="font-semibold text-slate-300">Fax：</span><span className="whitespace-nowrap">{fax}</span></span>
                            </li>
                        )}
                        <li className="flex items-start gap-2.5">
                            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                            <span><span className="font-semibold text-slate-300">Email：</span><a href={`mailto:${email}`} className="hover:text-sky-400">{email}</a></span>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-white/10">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-xs sm:flex-row">
                    <span className="order-3 sm:order-1">{copyright}</span>
                    <SocialLinks />
                    <div className="order-2 flex gap-5 sm:order-3">
                        <a href="/terms" className="hover:text-sky-400">{t('footer.terms')}</a>
                        <a href="/privacy" className="hover:text-sky-400">{t('footer.privacy')}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function AnnouncementBar() {
    const { t } = useTranslation();
    const [show, setShow] = useState(true);
    const banner = useBanner('announcement');
    if (!show || !banner) return null;
    const external = banner.url?.startsWith('http');
    return (
        <div className="relative bg-slate-900 text-white">
            <div className="mx-auto flex max-w-7xl items-center justify-center gap-2.5 px-10 py-2 text-center text-sm">
                {banner.title && <span className="hidden rounded bg-sky-400 px-2 py-0.5 text-xs font-bold text-slate-900 sm:inline">{banner.title}</span>}
                <span className="text-slate-200">{banner.body}</span>
                {banner.url && (
                    <a href={banner.url} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="font-semibold text-sky-400 hover:underline">
                        {banner.cta_label ?? t('common.learnMore')} →
                    </a>
                )}
            </div>
            <button
                type="button"
                onClick={() => setShow(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                aria-label={t('common.closeAnnouncement')}
            >
                ✕
            </button>
        </div>
    );
}

const defaultPartners = [
    { name: 'AWS', src: '/images/partners/aws.png' },
    { name: 'IBM', src: '/images/partners/p2.png' },
    { name: 'MAERSK', src: '/images/partners/p3.png' },
    { name: 'PHPoC', src: '/images/partners/p4.png' },
    { name: 'Shopify', src: '/images/partners/shopify.png' },
    { name: '長榮海運 EVERGREEN', src: '/images/partners/evergreen.png' },
];

function PartnersStrip() {
    const { t } = useTranslation();
    const shared = (usePage().props as { sitePartners?: { name: string; logo?: string; url?: string }[] }).sitePartners;
    const partners = (shared && shared.length)
        ? shared.map((p) => ({ name: p.name, src: p.logo || '', url: p.url }))
        : defaultPartners;
    if (!partners.length) return null;

    const logo = (p: { name: string; src: string; url?: string }) => {
        const img = (
            <img src={p.src} alt={p.name} loading="lazy" className="h-9 w-auto max-w-[140px] object-contain opacity-60 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0" />
        );
        return p.url
            ? <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" title={p.name} onClick={() => trackOutbound(p.name, p.url!, 'partners_strip')} className="shrink-0">{img}</a>
            : <span key={p.name} className="shrink-0">{img}</span>;
    };

    const useMarquee = partners.length > 6;

    return (
        <section className="border-t border-slate-100 bg-white py-14">
            <div className="mx-auto max-w-7xl px-6 text-center">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Strategic Technology Partners</p>
                <p className="mb-10 text-sm text-slate-500">{t('partners.subtitle')}</p>
            </div>
            {useMarquee ? (
                <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
                    <div className="flex w-max animate-marquee items-center gap-x-16 group-hover:[animation-play-state:paused]">
                        {partners.map(logo)}
                        {partners.map((p) => logo({ ...p, name: p.name + '__dup' }))}
                    </div>
                </div>
            ) : (
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-8 px-6">
                    {partners.map(logo)}
                </div>
            )}
        </section>
    );
}

function FloatingAd() {
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const banner = useBanner('floating');
    useEffect(() => {
        const t = setTimeout(() => setShow(true), 4000);
        return () => clearTimeout(t);
    }, []);
    if (!show || !banner) return null;
    const external = banner.url?.startsWith('http');
    return (
        <div className="fixed bottom-5 left-5 z-40 hidden w-72 sm:block">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
                <button
                    type="button"
                    onClick={() => setShow(false)}
                    className="absolute right-3 top-3 text-slate-400 transition hover:text-slate-700"
                    aria-label={t('common.closeAd')}
                >
                    ✕
                </button>
                {banner.subtitle && <div className="text-xs font-bold uppercase tracking-wider text-sky-500">{banner.subtitle}</div>}
                <h4 className="mt-1 font-bold text-slate-900 [word-break:keep-all]">{banner.title}</h4>
                {banner.body && <p className="mt-1 text-xs leading-relaxed text-slate-500 [word-break:keep-all]">{banner.body}</p>}
                {banner.url && (
                    <a
                        href={banner.url}
                        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        onClick={() => setShow(false)}
                        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                        {banner.cta_label ?? t('common.learnMore')} <span>→</span>
                    </a>
                )}
            </div>
        </div>
    );
}

// Brand icon paths
const FB_MESSENGER_PATH = 'M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z';
const LINE_PATH = 'M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314';
const TELEGRAM_PATH = 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z';

type ChatChannel = { key: string; label: string; sub: string; url: string; icon: ReactElement };

function ChatLauncher() {
    const { t } = useTranslation();
    const { settings } = usePage().props as { settings?: Record<string, string> };
    const messenger = settings?.chat_messenger?.trim() || 'https://m.me/1074307245769066';
    const line = settings?.chat_line?.trim() || 'https://line.me/R/ti/p/@748glpev';
    const telegram = settings?.chat_telegram?.trim() || 'https://t.me/jwisdomtw_bot';
    const [open, setOpen] = useState(false);

    const channels: ChatChannel[] = [
        {
            key: 'messenger',
            label: 'Messenger',
            sub: t('chat.messengerSub'),
            url: messenger,
            icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-[#0084FF]"><path d={FB_MESSENGER_PATH} /></svg>,
        },
        {
            key: 'line',
            label: 'LINE',
            sub: t('chat.lineSub'),
            url: line,
            icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-[#06C755]"><path d={LINE_PATH} /></svg>,
        },
        {
            key: 'telegram',
            label: 'Telegram',
            sub: t('chat.telegramSub'),
            url: telegram,
            icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-[#229ED9]"><path d={TELEGRAM_PATH} /></svg>,
        },
    ];

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
            {open && (
                <div className="w-72 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-xl">
                    <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-4">
                        <div className="text-sm font-bold text-white">{t('chat.title')}</div>
                        <div className="mt-0.5 text-xs text-white/80">{t('chat.welcome')}</div>
                    </div>
                    <div className="space-y-2 p-3">
                        {channels.map((c) => (
                            <a
                                key={c.key}
                                href={c.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => trackOutbound(c.label, c.url, 'chat_launcher')}
                                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 transition hover:border-white/25 hover:bg-white/10"
                            >
                                {c.icon}
                                <span>
                                    <span className="block text-sm font-bold text-white">{c.label}</span>
                                    <span className="block text-xs text-slate-400">{c.sub}</span>
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            )}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label={t('chat.aria')}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-400 text-slate-900 shadow-[0_0_25px_rgba(56,189,248,0.6)] transition hover:bg-sky-300"
            >
                {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
            </button>
        </div>
    );
}

export default function SiteLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col bg-white text-slate-700">
            <AnnouncementBar />
            <Header />
            <main className="flex-1">{children}</main>
            <PartnersStrip />
            <Footer />
            <ChatLauncher />
        </div>
    );
}
