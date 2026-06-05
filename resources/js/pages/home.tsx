import { Head, usePage } from '@inertiajs/react';
import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Scissors, Palette, Stethoscope, Globe, X, type LucideIcon } from 'lucide-react';
import SiteLayout from '@/layouts/site-layout';
import { track, trackOutbound } from '@/lib/analytics';

// ChatAI 擬真客服 — 官方網站 + 4 行業 LINE live demo
const CHATAI_APP_URL = 'https://tw.chat-ai.app';
const CHATAI_DEMOS: { key: string; zh: string; en: string; line: string; Icon: LucideIcon; accent: string }[] = [
    { key: 'spa', zh: '美容 SPA', en: 'Beauty Spa', line: 'https://line.me/R/ti/p/@307gwntc', Icon: Sparkles, accent: 'text-rose-500 bg-rose-50' },
    { key: 'hair', zh: '美髮沙龍', en: 'Hair Salon', line: 'https://line.me/R/ti/p/@052gypeu', Icon: Scissors, accent: 'text-amber-500 bg-amber-50' },
    { key: 'nail', zh: '美甲美睫', en: 'Nail & Lash', line: 'https://line.me/R/ti/p/@619nolqm', Icon: Palette, accent: 'text-fuchsia-500 bg-fuchsia-50' },
    { key: 'clinic', zh: '醫美診所', en: 'Aesthetic Clinic', line: 'https://line.me/R/ti/p/@126ypdbn', Icon: Stethoscope, accent: 'text-sky-500 bg-sky-50' },
];

type Service = { title: string; slug: string; summary: string; icon: string; icon_bg: string; icon_text: string };
type Work = { name: string; slug: string; category: string; summary: string; year: string; cover_gradient: string; cover?: string };
type Banner = { title?: string; subtitle?: string; body?: string; url?: string; cta_label?: string; accent?: string };
type Insight = { title: string; slug: string; category?: string; excerpt?: string; cover?: string; published_at?: string };

const serviceIcons: Record<string, ReactNode> = {
    code: <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
    app: <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>,
    gov: <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-7h6v7" /></svg>,
    ai: <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1M7.7 16.3l-2.1 2.1" /><circle cx="12" cy="12" r="3.5" /></svg>,
    mkt: <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 11v3l16 5V6L3 11Z" /><path d="M11.5 15.5a3 3 0 0 1-5.5-1.7" /></svg>,
};

// Language-independent product metadata; text comes from i18n (home.defaults.products)
const PRODUCT_META = [
    { url: 'https://shop.jwisdom.com.tw', accent: 'from-sky-400 to-cyan-400' },
    { url: 'https://tw.chat-ai.app', accent: 'from-indigo-400 to-sky-400' },
    { url: 'https://tw.auto-growth.app', accent: 'from-cyan-400 to-emerald-400' },
];
const WHY_COLORS = [['bg-sky-100', 'text-sky-600'], ['bg-indigo-100', 'text-indigo-600'], ['bg-emerald-100', 'text-emerald-600'], ['bg-amber-100', 'text-amber-600']];
const PROC_COLORS = ['text-sky-500', 'text-indigo-500', 'text-emerald-500', 'text-amber-500'];

function parseJson<T>(s: string | undefined, fallback: T[]): T[] {
    if (!s) return fallback;
    try { const a = JSON.parse(s); return Array.isArray(a) && a.length ? a : fallback; } catch { return fallback; }
}

const isExternal = (href?: string) => !!href && href.startsWith('http');

function HeroCarousel({ slides }: { slides: Banner[] }) {
    const { t } = useTranslation();
    const [i, setI] = useState(0);
    useEffect(() => {
        if (slides.length <= 1) return;
        const t = setInterval(() => setI((p) => (p + 1) % slides.length), 5500);
        return () => clearInterval(t);
    }, [slides.length]);

    if (!slides.length) return null;

    return (
        <section className="bg-white py-10">
            <div className="mx-auto max-w-7xl px-6">
                <div className="relative overflow-hidden rounded-2xl shadow-lg">
                    {slides.map((s, idx) => (
                        <div
                            key={idx}
                            className={`bg-gradient-to-r ${s.accent ?? 'from-slate-800 to-slate-900'} transition-opacity duration-700 ${idx === i ? 'relative opacity-100' : 'pointer-events-none absolute inset-0 opacity-0'}`}
                        >
                            <div className="flex flex-col items-start gap-4 px-8 py-8 md:flex-row md:items-center md:justify-between md:px-12">
                                <div>
                                    {s.subtitle && <div className="text-xs font-bold uppercase tracking-wider text-white/70">{s.subtitle}</div>}
                                    <h3 className="mt-1 text-2xl font-extrabold text-white">{s.title}</h3>
                                    {s.body && <p className="mt-1 text-white/85">{s.body}</p>}
                                </div>
                                {s.url && (
                                    <a
                                        href={s.url}
                                        {...(isExternal(s.url) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-slate-900 transition hover:bg-slate-100"
                                    >
                                        {s.cta_label ?? t('common.learnMore')} <span>→</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {slides.length > 1 && (
                    <div className="mt-4 flex justify-center gap-2">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setI(idx)}
                                aria-label={`${idx + 1}`}
                                className={`h-2 rounded-full transition-all ${idx === i ? 'w-7 bg-sky-500' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default function Home({ services, works, insights = [] }: { services: Service[]; works: Work[]; insights?: Insight[] }) {
    const { t, i18n } = useTranslation();
    const [chatModal, setChatModal] = useState(false);
    const { banners, settings, siteProducts } = usePage().props as { banners: Record<string, Banner[]>; settings?: Record<string, string>; siteProducts?: { name: string; en?: string; tag?: string; description?: string; url?: string; features?: string[]; accent?: string }[] };
    const carousel = banners?.carousel ?? [];
    const promo = banners?.promo?.[0];
    const defaultProducts = (t('home.defaults.products', { returnObjects: true }) as { name: string; en: string; tag: string; desc: string; features: string[] }[])
        .map((p, i) => ({ ...p, url: PRODUCT_META[i]?.url ?? '#', accent: PRODUCT_META[i]?.accent ?? 'from-sky-400 to-cyan-400' }));
    const defaultWhy = t('home.defaults.why', { returnObjects: true }) as { title: string; desc: string }[];
    const defaultProcess = t('home.defaults.process', { returnObjects: true }) as { title: string; desc: string }[];
    const defaultStats = t('home.defaults.stats', { returnObjects: true }) as { value: string; label: string }[];
    const products = (siteProducts && siteProducts.length)
        ? siteProducts.map((p) => ({ name: p.name, en: p.en ?? '', tag: p.tag ?? '', desc: p.description ?? '', url: p.url ?? '#', features: p.features ?? [], accent: p.accent ?? 'from-sky-400 to-cyan-400' }))
        : defaultProducts;
    const why = parseJson<{ title: string; desc: string }>(settings?.home_why, defaultWhy).map((w, i) => ({
        no: String(i + 1).padStart(2, '0'), title: w.title, desc: w.desc,
        badgeBg: WHY_COLORS[i % WHY_COLORS.length][0], badgeText: WHY_COLORS[i % WHY_COLORS.length][1],
    }));
    const process = parseJson<{ title: string; desc: string }>(settings?.home_process, defaultProcess).map((p, i) => ({
        no: String(i + 1).padStart(2, '0'), title: p.title, desc: p.desc, numColor: PROC_COLORS[i % PROC_COLORS.length],
    }));
    const metaDesc = settings?.home_meta_description || t('home.seo.desc');
    const ogRaw = settings?.og_image || '/images/jwisdom-logo.png';
    const ogImage = ogRaw.startsWith('http') ? ogRaw : `https://www.jwisdom.com.tw${ogRaw}`;
    const stats = defaultStats.map((d, i) => ({
        value: settings?.[`stat_${i + 1}_value`] || d.value,
        label: settings?.[`stat_${i + 1}_label`] || d.label,
    }));

    useEffect(() => {
        if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
        const io = new IntersectionObserver(
            (entries) =>
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add('in');
                        io.unobserve(e.target);
                    }
                }),
            { threshold: 0.12 },
        );
        document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);

    return (
        <SiteLayout>
            <Head title={t('home.seo.title')}>
                <meta name="description" content={metaDesc} />
                <meta property="og:title" content={t('home.seo.ogTitle')} />
                <meta property="og:description" content={metaDesc} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.jwisdom.com.tw/" />
                <meta property="og:site_name" content="宸揚資科 JWisdom" />
                <meta property="og:image" content={ogImage} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={t('home.seo.ogTitle')} />
                <meta name="twitter:description" content={metaDesc} />
                <meta name="twitter:image" content={ogImage} />
                <link rel="canonical" href="https://www.jwisdom.com.tw/" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Organization',
                            name: '宸揚資科 JWisdom',
                            alternateName: 'JWisdom System Inc.',
                            url: 'https://www.jwisdom.com.tw',
                            logo: 'https://www.jwisdom.com.tw/images/jwisdom-logo.png',
                            image: ogImage,
                            description: metaDesc,
                            email: settings?.contact_email || 'service@jwisdom.com.tw',
                            telephone: settings?.contact_phone || '+886-6-234-0161',
                            address: {
                                '@type': 'PostalAddress',
                                streetAddress: settings?.contact_address || '臺南市東區東門路二段297號5F',
                                addressCountry: 'TW',
                            },
                            contactPoint: {
                                '@type': 'ContactPoint',
                                telephone: settings?.contact_phone || '+886-6-234-0161',
                                email: settings?.contact_email || 'service@jwisdom.com.tw',
                                contactType: 'customer service',
                                areaServed: 'TW',
                                availableLanguage: ['zh-Hant', 'zh-TW'],
                            },
                        }),
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebSite',
                            name: '宸揚資科 JWisdom',
                            url: 'https://www.jwisdom.com.tw',
                            inLanguage: 'zh-Hant-TW',
                        }),
                    }}
                />
            </Head>

            {/* HERO */}
            <section className="relative overflow-hidden bg-slate-900 pt-20 text-white">
                <div className="absolute inset-0 opacity-70" style={{ backgroundImage: 'radial-gradient(circle at 12% 18%, rgba(34,211,238,0.12), transparent 45%), radial-gradient(circle at 88% 30%, rgba(56,189,248,0.14), transparent 45%)' }} />
                <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.6) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
                <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 lg:grid-cols-2">
                    <div>
                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                            <span className="text-sm font-medium text-cyan-300">{t('home.hero.badge')}</span>
                        </div>
                        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                            {t('home.hero.titlePre')}<br />{t('home.hero.titleMid')}<span className="text-sky-400">{t('home.hero.titleHighlight')}</span>
                        </h1>
                        <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-300">
                            {t('home.hero.lead')}
                        </p>
                        <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                            <a href="/contact" onClick={() => track('cta_clicked', { button_text: 'evaluate_project', location: 'home_hero' })} className="inline-flex items-center gap-2 rounded-lg bg-sky-400 px-7 py-3.5 font-bold text-slate-900 transition hover:brightness-95">{t('home.hero.ctaEval')}</a>
                            <a href="/#works" className="inline-flex items-center gap-2 font-semibold text-slate-200 transition hover:text-white">{t('home.hero.ctaCases')} <span>→</span></a>
                        </div>
                        <div className="mt-8 flex flex-wrap gap-3">
                            {(t('home.hero.tags', { returnObjects: true }) as string[]).map((tag) => (
                                <span key={tag} className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">{tag}</span>
                            ))}
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <div className="relative min-h-[460px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold tracking-[0.2em] text-slate-400">INTEGRATED SOLUTION</span>
                                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400"><span className="jw-blink h-2 w-2 rounded-full bg-emerald-400" />LIVE</span>
                            </div>
                            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <line x1="22" y1="32" x2="52" y2="55" stroke="rgba(148,163,184,0.25)" strokeWidth="0.4" />
                                <line x1="52" y1="55" x2="83" y2="80" stroke="rgba(148,163,184,0.25)" strokeWidth="0.4" />
                                <line x1="22" y1="32" x2="52" y2="55" stroke="#38bdf8" strokeWidth="0.55" className="jw-flow" />
                                <line x1="52" y1="55" x2="83" y2="80" stroke="#38bdf8" strokeWidth="0.55" className="jw-flow" />
                            </svg>
                            <div className="absolute" style={{ left: '22%', top: '32%', transform: 'translate(-50%,-50%)' }}>
                                <div className="jw-float flex flex-col items-center gap-2">
                                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200"><svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}><rect x="5" y="2" width="14" height="20" rx="3" /><path d="M12 18h.01" /></svg></span>
                                    <span className="whitespace-nowrap text-base text-slate-50">{t('home.diagram.client')}</span>
                                </div>
                            </div>
                            <div className="absolute" style={{ left: '52%', top: '55%', transform: 'translate(-50%,-50%)' }}>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="jw-core flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-400 text-slate-900"><svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M4 17a8 8 0 0 0 16 0" /></svg></span>
                                    <span className="whitespace-nowrap text-base font-medium text-slate-50">{t('home.diagram.core')}</span>
                                </div>
                            </div>
                            <div className="absolute" style={{ left: '83%', top: '80%', transform: 'translate(-50%,-50%)' }}>
                                <div className="jw-float-2 flex flex-col items-center gap-2">
                                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200"><svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 9.5 12 3l9 6.5V21H3z" /><path d="M9 21v-6h6v6" /></svg></span>
                                    <span className="whitespace-nowrap text-base text-slate-50">{t('home.diagram.field')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* HERO 下方輪播 banner */}
            <HeroCarousel slides={carousel} />

            {/* STATS */}
            <section className="border-y border-slate-100 bg-white">
                <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 text-center md:grid-cols-4">
                    {stats.map((s) => {
                        const m = s.value.match(/^([\d.,]+)(.*)$/);
                        const num = m ? m[1] : s.value;
                        const sym = m ? m[2] : '';
                        return (
                            <div key={s.label}>
                                <div className="text-3xl font-black text-sky-600 md:text-4xl">{num}<span className="text-cyan-500">{sym}</span></div>
                                <div className="mt-1 text-sm text-slate-500">{s.label}</div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* SERVICES */}
            <section id="services" className="bg-slate-50 py-24">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="reveal mx-auto mb-14 max-w-2xl text-center">
                        <span className="text-sm font-bold uppercase tracking-wider text-sky-500">Services</span>
                        <h2 className="mt-3 text-3xl font-extrabold text-slate-900 md:text-4xl">{t('home.services.title')}</h2>
                        <p className="mt-4 leading-relaxed text-slate-500">{t('home.services.subtitle')}</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {services.map((s, i) => (
                            <a key={s.slug} href={`/services/${s.slug}`} className={`reveal d${(i % 5) + 1} group rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl`}>
                                <span className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${s.icon_bg} ${s.icon_text} transition duration-300 group-hover:scale-110`}>{serviceIcons[s.icon] ?? serviceIcons.code}</span>
                                <h3 className="text-xl font-bold text-slate-900">{s.title}</h3>
                                <p className="mt-2.5 text-sm leading-relaxed text-slate-500">{s.summary}</p>
                            </a>
                        ))}
                        <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-white">
                            <h3 className="text-xl font-bold">{t('home.services.ctaCardTitle')}</h3>
                            <p className="mt-2.5 text-sm leading-relaxed text-slate-300">{t('home.services.ctaCardDesc')}</p>
                            <a href="/contact" onClick={() => track('cta_clicked', { button_text: 'free_consultation', location: 'home_process' })} className="mt-5 inline-flex items-center gap-2 font-bold text-sky-400">{t('home.services.ctaCardBtn')} →</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* AI 品牌宣言 BAND */}
            <section className="bg-white py-20">
                <div className="reveal mx-auto max-w-4xl px-6 text-center">
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-sky-600">AI · Generative</span>
                    <h2 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 md:text-5xl">{t('home.ai.titlePre')}<span className="bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent">{t('home.ai.titleHighlight')}</span></h2>
                    <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-500">{t('home.ai.subtitle')}</p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <a href="https://tw.chat-ai.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-7 py-3 font-bold text-white transition hover:bg-slate-800">{t('home.ai.btnChatai')} <span>→</span></a>
                        <a href="https://tw.auto-growth.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-7 py-3 font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">{t('home.ai.btnAutogrowth')} <span>→</span></a>
                    </div>
                </div>
            </section>

            {/* PRODUCTS */}
            <section id="products" className="bg-slate-50 py-24">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="reveal mx-auto mb-14 max-w-2xl text-center">
                        <span className="text-sm font-bold uppercase tracking-wider text-sky-600">Our Products</span>
                        <h2 className="mt-3 text-3xl font-extrabold text-slate-900 md:text-4xl">{t('home.products.title')}</h2>
                        <p className="mt-4 leading-relaxed text-slate-500">{t('home.products.subtitle')}</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        {products.map((p, i) => {
                            const isChatAI = (p.url ?? '').includes('chat-ai');
                            return (
                            <a
                                key={p.name}
                                href={p.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={isChatAI ? (e) => { e.preventDefault(); setChatModal(true); } : undefined}
                                className={`reveal d${i + 1} group flex flex-col rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl`}
                            >
                                <div className={`mb-5 h-1.5 w-12 rounded-full bg-gradient-to-r ${p.accent}`} />
                                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{p.tag}</div>
                                <h3 className="mt-2 text-xl font-bold text-slate-900">{p.name}</h3>
                                <div className="text-sm text-slate-400">{p.en}</div>
                                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{p.desc}</p>
                                <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                                    {p.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2"><svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" fill="none" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg><span>{f}</span></li>
                                    ))}
                                </ul>
                                <span className="mt-auto inline-flex items-center gap-1.5 pt-6 font-semibold text-sky-600 transition-all group-hover:gap-3">{t('home.products.gotoSite')} <span>→</span></span>
                            </a>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* PROMO BANNER */}
            {promo && (
                <section className="bg-white py-14">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className={`reveal relative overflow-hidden rounded-3xl bg-gradient-to-r ${promo.accent ?? 'from-sky-500 to-cyan-400'} px-8 py-10 md:flex md:items-center md:justify-between md:p-12`}>
                            <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.6), transparent 40%)' }} />
                            <div className="relative">
                                {promo.subtitle && <div className="text-xs font-bold uppercase tracking-wider text-white/80">{promo.subtitle}</div>}
                                <h3 className="mt-2 text-2xl font-extrabold text-white md:text-3xl">{promo.title}</h3>
                                {promo.body && <p className="mt-2 max-w-xl text-white/90">{promo.body}</p>}
                            </div>
                            {promo.url && (
                                <a href={promo.url} {...(isExternal(promo.url) ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="relative mt-6 inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-7 py-3.5 font-bold text-slate-900 transition hover:bg-slate-100 md:mt-0">{promo.cta_label ?? t('home.promoLearnMore')} <span>→</span></a>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* WORKS */}
            <section id="works" className="bg-white py-24">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <span className="text-sm font-bold uppercase tracking-wider text-sky-500">Works</span>
                            <h2 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">{t('home.works.title')}</h2>
                        </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        {works.map((w, i) => (
                            <a key={w.slug} href={`/works/${w.slug}`} className={`reveal d${(i % 5) + 1} group block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}>
                                {w.cover ? (
                                    <div className="h-44 overflow-hidden bg-slate-100">
                                        <img src={w.cover} alt={w.name} loading="lazy" className="h-44 w-full object-cover transition duration-500 group-hover:scale-105" />
                                    </div>
                                ) : (
                                    <div className={`flex h-44 items-center justify-center bg-gradient-to-br ${w.cover_gradient}`}>
                                        <span className="text-lg font-bold text-white drop-shadow">{w.name}</span>
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="text-xs font-semibold text-sky-500">{w.category}</div>
                                    <div className="mt-1 flex items-baseline justify-between">
                                        <h3 className="text-lg font-bold text-slate-900">{w.name}</h3>
                                        <span className="text-xs text-slate-400">{w.year}</span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-500">{w.summary}</p>
                                </div>
                            </a>
                        ))}
                        <a href="/contact" className="flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center transition hover:border-sky-300">
                            <div>
                                <div className="mb-2 text-3xl text-slate-400">＋</div>
                                <div className="font-bold text-slate-900">{t('home.works.nextTitle')}</div>
                                <div className="mt-1 text-sm text-slate-500">{t('home.works.nextDesc')}</div>
                            </div>
                        </a>
                    </div>
                </div>
            </section>

            {/* 技術洞察 INSIGHTS */}
            {insights.length > 0 && (
                <section id="insights" className="bg-slate-50 py-24">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <span className="text-sm font-bold uppercase tracking-wider text-sky-500">Insights</span>
                                <h2 className="mt-3 text-3xl font-extrabold text-slate-900 md:text-4xl">{t('home.insights.title')}</h2>
                                <p className="mt-3 text-slate-500">{t('home.insights.subtitle')}</p>
                            </div>
                            <a href="/insights" className="text-sm font-semibold text-slate-900">{t('home.insights.more')} →</a>
                        </div>
                        <div className="grid gap-6 md:grid-cols-3">
                            {insights.map((n, i) => (
                                <a key={n.slug} href={`/news/${n.slug}`} className={`reveal d${(i % 3) + 1} group block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}>
                                    {n.cover ? (
                                        <div className="h-44 overflow-hidden bg-slate-100"><img src={n.cover} alt={n.title} loading="lazy" className="h-44 w-full object-cover transition duration-500 group-hover:scale-105" /></div>
                                    ) : (
                                        <div className="h-44 bg-gradient-to-br from-slate-700 to-slate-900" />
                                    )}
                                    <div className="p-6">
                                        <div className="text-xs font-semibold text-sky-500">{n.published_at} · {n.category}</div>
                                        <h3 className="mt-2 font-bold leading-snug text-slate-900 group-hover:text-sky-600">{n.title}</h3>
                                        {n.excerpt && <p className="mt-2 line-clamp-2 text-sm text-slate-500">{n.excerpt}</p>}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* WHY */}
            <section id="why" className="bg-white py-24">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="reveal mx-auto mb-14 max-w-2xl text-center">
                        <span className="text-sm font-bold uppercase tracking-wider text-sky-500">Why Us</span>
                        <h2 className="mt-3 text-3xl font-extrabold text-slate-900 md:text-4xl">{t('home.why.title')}</h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {why.map((w, i) => (
                            <div key={w.no} className={`reveal d${(i % 5) + 1} rounded-2xl border border-slate-100 bg-white p-7 shadow-sm`}>
                                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${w.badgeBg} font-black ${w.badgeText}`}>{w.no}</div>
                                <h3 className="text-lg font-bold text-slate-900">{w.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-500">{w.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PROCESS */}
            <section className="bg-white py-24">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="reveal mx-auto mb-14 max-w-2xl text-center">
                        <span className="text-sm font-bold uppercase tracking-wider text-sky-500">Process</span>
                        <h2 className="mt-3 text-3xl font-extrabold text-slate-900 md:text-4xl">{t('home.process.title')}</h2>
                        <p className="mt-4 leading-relaxed text-slate-500">{t('home.process.subtitle')}</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-4">
                        {process.map((p, i) => (
                            <div key={p.no} className={`reveal d${i + 1} rounded-2xl border border-slate-100 bg-slate-50 p-7`}>
                                <div className={`text-4xl font-black ${p.numColor}`}>{p.no}</div>
                                <h3 className="mt-2 text-lg font-bold text-slate-900">{p.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-500">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CONTACT CTA */}
            <section id="contact" className="bg-slate-950 py-24">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 text-center text-white shadow-lg md:p-16" style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(34,211,238,0.12), transparent 45%), radial-gradient(circle at 85% 80%, rgba(56,189,248,0.12), transparent 45%)' }}>
                        <h2 className="text-3xl font-black md:text-4xl">{t('home.cta.title')}</h2>
                        <p className="mx-auto mt-4 max-w-xl text-slate-300">{t('home.cta.subtitle')}</p>
                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            <a href="/contact" onClick={() => track('cta_clicked', { button_text: 'free_project_assessment', location: 'home_footer_cta' })} className="inline-flex items-center gap-2 rounded-lg bg-sky-400 px-8 py-3.5 font-bold text-slate-900 transition hover:brightness-95">{t('home.cta.btnEval')} →</a>
                            <a href="/#works" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-8 py-3.5 font-semibold transition hover:bg-white/10">{t('home.cta.btnCases')}</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ChatAI 擬真客服 — 體驗選單 (官網 + 4 行業 LINE demo) */}
            {chatModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setChatModal(false)} />
                    <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
                        <div className="flex items-start justify-between bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-5 text-white">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-white/80">ChatAI · AI Realistic CS</div>
                                <h3 className="mt-0.5 text-lg font-extrabold">{t('chatai.modalTitle')}</h3>
                            </div>
                            <button type="button" onClick={() => setChatModal(false)} aria-label={t('common.close')} className="shrink-0 rounded-full p-1 text-white/80 transition hover:bg-white/15 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            <a
                                href={CHATAI_APP_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => trackOutbound('ChatAI Official', CHATAI_APP_URL, 'chatai_modal')}
                                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-sky-300 hover:bg-sky-50"
                            >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white"><Globe className="h-5 w-5" /></span>
                                <span className="flex-1">
                                    <span className="block text-sm font-bold text-slate-900">{t('chatai.officialSite')}</span>
                                    <span className="block text-xs text-slate-400">tw.chat-ai.app</span>
                                </span>
                                <span className="text-sky-500">→</span>
                            </a>

                            <div className="my-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                <span className="h-px flex-1 bg-slate-100" />{t('chatai.demoDivider')}<span className="h-px flex-1 bg-slate-100" />
                            </div>

                            <div className="space-y-2">
                                {CHATAI_DEMOS.map((d) => (
                                    <a
                                        key={d.key}
                                        href={d.line}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => trackOutbound(`ChatAI Demo ${d.key}`, d.line, 'chatai_modal')}
                                        className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-2.5 transition hover:border-emerald-300 hover:bg-emerald-50"
                                    >
                                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${d.accent}`}><d.Icon className="h-5 w-5" /></span>
                                        <span className="flex-1">
                                            <span className="block text-sm font-bold text-slate-900">{i18n.language === 'en' ? d.en : d.zh}</span>
                                            <span className="block text-xs text-slate-400">{t('chatai.tryLine')}</span>
                                        </span>
                                        <span className="text-[#06C755]">→</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </SiteLayout>
    );
}
