import { Head, Link } from '@inertiajs/react';
import SiteLayout from '@/layouts/site-layout';
import { track } from '@/lib/analytics';

type Service = { title: string; slug: string; summary?: string; body?: string; icon_bg?: string; icon_text?: string; meta_title?: string; meta_description?: string };
type Other = { title: string; slug: string; icon_bg?: string; icon_text?: string };

export default function ServiceShow({ service, others }: { service: Service; others: Other[] }) {
    const desc = service.meta_description ?? service.summary ?? service.title;
    return (
        <SiteLayout>
            <Head title={`${service.meta_title ?? service.title}｜服務項目｜宸揚資科 JWisdom`}>
                <meta name="description" content={desc} />
                <link rel="canonical" href={`https://www.jwisdom.com.tw/services/${service.slug}`} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={`${service.title}｜服務項目`} />
                <meta property="og:description" content={desc} />
                <meta property="og:url" content={`https://www.jwisdom.com.tw/services/${service.slug}`} />
                <meta property="og:site_name" content="宸揚資科 JWisdom" />
                <meta property="og:image" content="https://www.jwisdom.com.tw/images/jwisdom-logo.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'BreadcrumbList',
                            itemListElement: [
                                { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://www.jwisdom.com.tw/' },
                                { '@type': 'ListItem', position: 2, name: '服務項目', item: 'https://www.jwisdom.com.tw/#services' },
                                { '@type': 'ListItem', position: 3, name: service.title, item: `https://www.jwisdom.com.tw/services/${service.slug}` },
                            ],
                        }),
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Service',
                            name: service.title,
                            description: desc,
                            serviceType: service.title,
                            areaServed: 'TW',
                            provider: {
                                '@type': 'Organization',
                                name: '宸揚資科 JWisdom',
                                url: 'https://www.jwisdom.com.tw',
                            },
                            url: `https://www.jwisdom.com.tw/services/${service.slug}`,
                        }),
                    }}
                />
            </Head>

            <header className="bg-slate-900 py-20 text-white">
                <div className="mx-auto max-w-4xl px-6">
                    <span className="text-sm font-bold uppercase tracking-wider text-sky-400">Service</span>
                    <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">{service.title}</h1>
                    {service.summary && <p className="mt-4 max-w-2xl text-lg text-slate-300">{service.summary}</p>}
                </div>
            </header>

            <div className="mx-auto max-w-3xl px-6 py-14">
                {service.body ? (
                    <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: service.body }} />
                ) : (
                    <p className="leading-relaxed text-slate-600">{service.summary}</p>
                )}
                <a href="/contact" onClick={() => track('cta_clicked', { button_text: '免費諮詢這項服務', location: 'service_page', service: service.slug })} className="mt-8 inline-flex items-center gap-2 rounded-full bg-sky-400 px-6 py-3 font-bold text-slate-900 transition hover:brightness-95">免費諮詢這項服務 <span>→</span></a>
            </div>

            {others.length > 0 && (
                <section className="bg-slate-50 py-16">
                    <div className="mx-auto max-w-7xl px-6">
                        <h2 className="mb-8 text-xl font-bold text-slate-900">其他服務</h2>
                        <div className="flex flex-wrap gap-3">
                            {others.map((o) => (
                                <Link key={o.slug} href={`/services/${o.slug}`} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-600">
                                    {o.title}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </SiteLayout>
    );
}
