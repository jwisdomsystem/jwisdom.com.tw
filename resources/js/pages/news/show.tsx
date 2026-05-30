import { Head, Link } from '@inertiajs/react';
import SiteLayout from '@/layouts/site-layout';

type Item = {
    title: string; slug: string; type?: string; category?: string; body?: string; cover?: string; cover_gradient?: string;
    published_at?: string; source_name?: string; source_url?: string;
    meta_title?: string; meta_description?: string; excerpt?: string;
};
type Related = { title: string; slug: string; category?: string; cover?: string; cover_gradient?: string };

function fmt(d?: string) {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('zh-TW'); } catch { return d; }
}

export default function NewsShow({ item, related }: { item: Item; related: Related[] }) {
    const desc = item.meta_description ?? item.excerpt ?? item.title;
    const ogImg = item.cover
        ? (item.cover.startsWith('http') ? item.cover : `https://www.jwisdom.com.tw${item.cover}`)
        : 'https://www.jwisdom.com.tw/images/jwisdom-logo.png';
    return (
        <SiteLayout>
            <Head title={`${item.meta_title ?? item.title}｜宸揚資科 JWisdom`}>
                <meta name="description" content={desc} />
                <link rel="canonical" href={`https://www.jwisdom.com.tw/news/${item.slug}`} />
                <meta property="og:type" content="article" />
                <meta property="og:title" content={item.title} />
                <meta property="og:description" content={desc} />
                <meta property="og:url" content={`https://www.jwisdom.com.tw/news/${item.slug}`} />
                <meta property="og:site_name" content="宸揚資科 JWisdom" />
                <meta property="og:image" content={ogImg} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={item.title} />
                <meta name="twitter:description" content={desc} />
                <meta name="twitter:image" content={ogImg} />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Article',
                            headline: item.title,
                            articleSection: item.category,
                            datePublished: item.published_at,
                            image: item.cover ? [item.cover] : undefined,
                            publisher: {
                                '@type': 'Organization',
                                name: '宸揚資科 JWisdom',
                                logo: { '@type': 'ImageObject', url: 'https://www.jwisdom.com.tw/images/jwisdom-logo.png' },
                            },
                            mainEntityOfPage: `https://www.jwisdom.com.tw/news/${item.slug}`,
                        }),
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'BreadcrumbList',
                            itemListElement: [
                                { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://www.jwisdom.com.tw/' },
                                item.type === 'insight'
                                    ? { '@type': 'ListItem', position: 2, name: '技術洞察', item: 'https://www.jwisdom.com.tw/insights' }
                                    : { '@type': 'ListItem', position: 2, name: '最新消息', item: 'https://www.jwisdom.com.tw/news' },
                                { '@type': 'ListItem', position: 3, name: item.title, item: `https://www.jwisdom.com.tw/news/${item.slug}` },
                            ],
                        }),
                    }}
                />
            </Head>

            <article>
                {item.cover ? (
                    <header className="relative h-72 overflow-hidden md:h-96">
                        <img src={item.cover} alt={item.title} className="absolute inset-0 h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/65" />
                        <div className="relative mx-auto flex h-full max-w-3xl flex-col justify-end px-6 py-10 text-white">
                            <div className="text-sm font-semibold text-white/80">{fmt(item.published_at)} · {item.category}</div>
                            <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">{item.title}</h1>
                        </div>
                    </header>
                ) : (
                    <header className={`bg-gradient-to-br ${item.cover_gradient ?? 'from-sky-500 to-cyan-400'} py-20 text-white`}>
                        <div className="mx-auto max-w-3xl px-6">
                            <div className="text-sm font-semibold text-white/80">{fmt(item.published_at)} · {item.category}</div>
                            <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">{item.title}</h1>
                        </div>
                    </header>
                )}

                <div className="mx-auto max-w-3xl px-6 py-14">
                    <div className="prose prose-slate max-w-none prose-a:text-sky-600" dangerouslySetInnerHTML={{ __html: item.body ?? '' }} />
                    {item.source_url && (
                        <p className="mt-8 text-sm text-slate-400">
                            資料來源：
                            <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">{item.source_name ?? item.source_url}</a>
                        </p>
                    )}
                    <div className="mt-10 border-t border-slate-100 pt-6">
                        <Link href={item.type === 'insight' ? '/insights' : '/news'} className="font-semibold text-sky-600 hover:underline">
                            ← 回{item.type === 'insight' ? '技術洞察' : '最新消息'}
                        </Link>
                    </div>
                </div>
            </article>

            {related.length > 0 && (
                <section className="bg-slate-50 py-16">
                    <div className="mx-auto max-w-7xl px-6">
                        <h2 className="mb-8 text-xl font-bold text-slate-900">{item.type === 'insight' ? '其他技術洞察' : '其他消息'}</h2>
                        <div className="grid gap-6 sm:grid-cols-3">
                            {related.map((r) => (
                                <Link key={r.slug} href={`/news/${r.slug}`} className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                                    {r.cover ? (
                                        <div className="h-32 overflow-hidden"><img src={r.cover} alt={r.title} loading="lazy" className="h-32 w-full object-cover transition duration-500 group-hover:scale-105" /></div>
                                    ) : (
                                        <div className={`h-32 bg-gradient-to-br ${r.cover_gradient ?? 'from-sky-500 to-cyan-400'}`} />
                                    )}
                                    <div className="p-5">
                                        <div className="text-xs font-semibold text-sky-500">{r.category}</div>
                                        <h3 className="mt-1 font-bold text-slate-900 group-hover:text-sky-600">{r.title}</h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </SiteLayout>
    );
}
