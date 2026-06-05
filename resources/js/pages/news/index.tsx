import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import SiteLayout from '@/layouts/site-layout';

type NewsItem = { title: string; slug: string; category?: string; type?: string; excerpt?: string; cover?: string; cover_gradient?: string; published_at?: string };
type Paginated = {
    data: NewsItem[];
    links: { url: string | null; label: string; active: boolean }[];
};
type Meta = { eyebrow: string; title: string; desc: string; path: string };

export default function NewsIndex({ news, meta }: { news: Paginated; meta: Meta }) {
    const { t } = useTranslation();
    const brand = t('common.brand');
    const collectionLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: meta.title,
        description: meta.desc,
        url: `https://www.jwisdom.com.tw${meta.path}`,
        isPartOf: { '@type': 'WebSite', name: '宸揚資科 JWisdom', url: 'https://www.jwisdom.com.tw' },
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: news.data.length,
            itemListElement: news.data.map((n, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `https://www.jwisdom.com.tw/news/${n.slug}`,
                name: n.title,
            })),
        },
    };
    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: t('common.home'), item: 'https://www.jwisdom.com.tw/' },
            { '@type': 'ListItem', position: 2, name: meta.title, item: `https://www.jwisdom.com.tw${meta.path}` },
        ],
    };
    return (
        <SiteLayout>
            <Head title={`${meta.title}｜${brand}`}>
                <meta name="description" content={meta.desc} />
                <link rel="canonical" href={`https://www.jwisdom.com.tw${meta.path}`} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={`${meta.title}｜${brand}`} />
                <meta property="og:description" content={meta.desc} />
                <meta property="og:url" content={`https://www.jwisdom.com.tw${meta.path}`} />
                <meta property="og:site_name" content={brand} />
                <meta property="og:image" content="https://www.jwisdom.com.tw/images/jwisdom-logo.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
            </Head>

            <section className="bg-slate-900 py-20 text-white">
                <div className="mx-auto max-w-7xl px-6">
                    <span className="text-sm font-bold uppercase tracking-wider text-sky-400">{meta.eyebrow}</span>
                    <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">{meta.title}</h1>
                    <p className="mt-4 max-w-xl text-slate-300">{meta.desc}</p>
                </div>
            </section>

            <section className="bg-white py-16">
                <div className="mx-auto max-w-7xl px-6">
                    {news.data.length === 0 ? (
                        <p className="text-center text-slate-500">{t('news.empty')}</p>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {news.data.map((n) => (
                                <Link key={n.slug} href={`/news/${n.slug}`} className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                                    {n.cover ? (
                                        <div className="h-40 overflow-hidden bg-slate-100"><img src={n.cover} alt={n.title} loading="lazy" className="h-40 w-full object-cover transition duration-500 group-hover:scale-105" /></div>
                                    ) : (
                                        <div className={`h-40 bg-gradient-to-br ${n.cover_gradient ?? 'from-sky-500 to-cyan-400'}`} />
                                    )}
                                    <div className="p-6">
                                        <div className="text-xs font-semibold text-sky-500">{n.published_at} · {n.category}</div>
                                        <h2 className="mt-2 font-bold leading-snug text-slate-900 group-hover:text-sky-600">{n.title}</h2>
                                        {n.excerpt && <p className="mt-2 text-sm text-slate-500">{n.excerpt}</p>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {news.links.length > 3 && (
                        <div className="mt-12 flex flex-wrap justify-center gap-2">
                            {news.links.map((l, i) => (
                                <Link
                                    key={i}
                                    href={l.url ?? '#'}
                                    className={`rounded-lg border px-4 py-2 text-sm ${l.active ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'} ${!l.url ? 'pointer-events-none opacity-40' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: l.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </SiteLayout>
    );
}
