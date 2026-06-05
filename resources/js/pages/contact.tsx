import { Head, useForm, usePage } from '@inertiajs/react';
import { type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import SiteLayout from '@/layouts/site-layout';
import { track } from '@/lib/analytics';

type Settings = Record<string, string>;

export default function Contact() {
    const { t } = useTranslation();
    const page = usePage().props as { flash?: { success?: string }; settings?: Settings };
    const settings = page.settings ?? {};
    const email = settings.contact_email ?? 'service@jwisdom.com.tw';
    const phone = settings.contact_phone ?? '+886-2-xxxx-xxxx';
    const fax = settings.contact_fax ?? '';
    const address = settings.contact_address ?? '台北市';
    const hours = settings.contact_hours ?? t('contact.hoursDefault');
    const mapQuery = settings.contact_map_query ?? `宸揚資科 ${address}`;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', phone: '', company: '', subject: '', message: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        track('contact_form_submitted', { form_type: 'contact', has_company: !!data.company, has_phone: !!data.phone });
        post('/contact', {
            preserveScroll: true,
            onSuccess: () => {
                track('generate_lead', { form_type: 'contact', value: 1 });
                reset();
            },
        });
    };

    const field = 'w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100';

    const contactLd = {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: '介紹與聯絡｜宸揚資科 JWisdom',
        url: 'https://www.jwisdom.com.tw/contact',
        description: '與宸揚資科 JWisdom 聯絡——軟體開發、系統整合、AI 應用與數位轉型諮詢。',
        isPartOf: { '@type': 'WebSite', name: '宸揚資科 JWisdom', url: 'https://www.jwisdom.com.tw' },
    };
    const orgLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: '宸揚資科 JWisdom System Inc.',
        alternateName: 'JWisdom',
        url: 'https://www.jwisdom.com.tw',
        logo: 'https://www.jwisdom.com.tw/images/jwisdom-logo.png',
        email,
        telephone: phone,
        address: { '@type': 'PostalAddress', streetAddress: address, addressCountry: 'TW' },
        contactPoint: [{
            '@type': 'ContactPoint',
            telephone: phone,
            contactType: 'customer service',
            email,
            availableLanguage: ['zh-Hant', 'en'],
            hoursAvailable: hours,
        }],
    };
    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://www.jwisdom.com.tw/' },
            { '@type': 'ListItem', position: 2, name: '介紹與聯絡', item: 'https://www.jwisdom.com.tw/contact' },
        ],
    };
    return (
        <SiteLayout>
            <Head title={t('contact.seoTitle')}>
                <meta name="description" content={t('contact.seoDesc')} />
                <link rel="canonical" href="https://www.jwisdom.com.tw/contact" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={t('contact.seoTitle')} />
                <meta property="og:description" content={t('contact.ogDesc')} />
                <meta property="og:url" content="https://www.jwisdom.com.tw/contact" />
                <meta property="og:site_name" content="宸揚資科 JWisdom" />
                <meta property="og:image" content="https://www.jwisdom.com.tw/images/jwisdom-logo.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactLd) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
            </Head>

            {/* HERO */}
            <header className="relative overflow-hidden bg-slate-900 py-20 text-white">
                <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(56,189,248,0.12), transparent 45%), radial-gradient(circle at 85% 80%, rgba(34,211,238,0.10), transparent 45%)' }} />
                <div className="relative mx-auto max-w-7xl px-6">
                    <span className="text-sm font-bold uppercase tracking-wider text-sky-400">Contact</span>
                    <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">{t('contact.title')}</h1>
                    <p className="mt-4 max-w-2xl text-lg text-slate-300">{t('contact.lead')}</p>
                </div>
            </header>

            <section className="bg-white py-16">
                <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-5">
                    {/* 左：聯絡資訊 */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-extrabold text-slate-900">{t('contact.infoTitle')}</h2>
                        <p className="mt-3 leading-relaxed text-slate-500">{t('contact.infoSubtitle')}</p>
                        <div className="mt-8 space-y-6">
                            <div className="flex items-start gap-4">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 6 10-6" /></svg></span>
                                <div><div className="text-sm text-slate-400">Email</div><a href={`mailto:${email}`} onClick={() => track('contact_channel_clicked', { channel: 'email', location: 'contact_page' })} className="font-bold text-slate-900 hover:text-sky-600">{email}</a></div>
                            </div>
                            <div className="flex items-start gap-4">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg></span>
                                <div><div className="text-sm text-slate-400">{t('contact.labelPhone')}</div><a href={`tel:${phone.replace(/[^\d+]/g, '')}`} onClick={() => track('contact_channel_clicked', { channel: 'phone', location: 'contact_page' })} className="font-bold text-slate-900 hover:text-sky-600">{phone}</a></div>
                            </div>
                            {fax && (
                                <div className="flex items-start gap-4">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg></span>
                                    <div><div className="text-sm text-slate-400">{t('contact.labelFax')}</div><div className="font-bold text-slate-900">{fax}</div></div>
                                </div>
                            )}
                            <div className="flex items-start gap-4">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg></span>
                                <div><div className="text-sm text-slate-400">{t('contact.labelAddress')}</div><div className="font-bold text-slate-900">{address}</div></div>
                            </div>
                        </div>
                        <div className="mt-8 rounded-2xl bg-slate-50 p-6">
                            <div className="font-bold text-slate-900">{t('contact.hoursTitle')}</div>
                            <div className="mt-1 text-sm text-slate-500">{hours}</div>
                        </div>
                        {settings.line_qr_image && (
                            <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 sm:flex-row sm:items-center sm:gap-5">
                                <img src={settings.line_qr_image} alt={settings.line_qr_label || t('contact.lineJoin')} className="h-32 w-32 shrink-0 rounded-xl border border-slate-200 bg-white object-contain p-1.5 shadow-sm" loading="lazy" />
                                <div className="text-center sm:text-left">
                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-bold text-white">LINE</div>
                                    <div className="mt-2 text-lg font-extrabold text-slate-900">{settings.line_qr_label || t('contact.lineJoin')}</div>
                                    <div className="mt-1 text-sm text-slate-500">{t('contact.lineScan')}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 右：聯絡表單 */}
                    <div className="lg:col-span-3">
                        <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm md:p-8">
                            <h2 className="text-2xl font-extrabold text-slate-900">{t('contact.formTitle')}</h2>
                            <p className="mt-2 text-sm text-slate-500">{t('contact.formNote')}</p>

                            {page.flash?.success && (
                                <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                    {page.flash.success}
                                </div>
                            )}

                            <form onSubmit={submit} className="mt-6 space-y-5">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">{t('contact.fieldName')}</label>
                                        <input className={field} value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">{t('contact.fieldCompany')}</label>
                                        <input className={field} value={data.company} onChange={(e) => setData('company', e.target.value)} />
                                        {errors.company && <p className="mt-1 text-sm text-red-500">{errors.company}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email *</label>
                                        <input type="email" className={field} value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">{t('contact.fieldPhone')}</label>
                                        <input className={field} value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                                        {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">{t('contact.fieldSubject')}</label>
                                    <input className={field} value={data.subject} onChange={(e) => setData('subject', e.target.value)} placeholder={t('contact.subjectPlaceholder')} />
                                    {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">{t('contact.fieldMessage')}</label>
                                    <textarea rows={5} className={field} value={data.message} onChange={(e) => setData('message', e.target.value)} placeholder={t('contact.messagePlaceholder')} />
                                    {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
                                </div>
                                <button type="submit" disabled={processing} className="inline-flex items-center gap-2 rounded-full bg-sky-400 px-8 py-3.5 font-bold text-slate-900 transition hover:brightness-95 disabled:opacity-60">
                                    {processing ? t('contact.submitting') : t('contact.submit')} <span>→</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* GOOGLE MAP */}
            <section className="bg-slate-50 pb-20">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="mb-6 flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        </span>
                        <h2 className="text-xl font-bold text-slate-900">{t('contact.mapTitle')}</h2>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                        <iframe
                            title="宸揚資科 JWisdom 位置地圖"
                            src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&hl=zh-TW&output=embed`}
                            className="h-[380px] w-full md:h-[440px]"
                            style={{ border: 0 }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            allowFullScreen
                        />
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
