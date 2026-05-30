import { Head, Link } from '@inertiajs/react';
import SiteLayout from '@/layouts/site-layout';

type Work = {
    name: string; slug: string; category?: string; summary?: string; body?: string;
    cover?: string; cover_gradient?: string; year?: string; url?: string;
    meta_title?: string; meta_description?: string;
};

export default function WorkShow({ work, related }: { work: Work; related: Work[] }) {
    const desc = work.meta_description ?? work.summary ?? work.name;
    const ogImg = work.cover
        ? (work.cover.startsWith('http') ? work.cover : `https://www.jwisdom.com.tw${work.cover}`)
        : 'https://www.jwisdom.com.tw/images/jwisdom-logo.png';
    const workLd = {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: work.name,
        description: desc,
        url: `https://www.jwisdom.com.tw/works/${work.slug}`,
        image: ogImg,
        ...(work.category && { genre: work.category }),
        ...(work.year && { dateCreated: work.year }),
        creator: { '@type': 'Organization', name: '宸揚資科 JWisdom', url: 'https://www.jwisdom.com.tw' },
        publisher: {
            '@type': 'Organization',
            name: '宸揚資科 JWisdom',
            logo: { '@type': 'ImageObject', url: 'https://www.jwisdom.com.tw/images/jwisdom-logo.png' },
        },
    };
    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://www.jwisdom.com.tw/' },
            { '@type': 'ListItem', position: 2, name: '精選實例', item: 'https://www.jwisdom.com.tw/#works' },
            { '@type': 'ListItem', position: 3, name: work.name, item: `https://www.jwisdom.com.tw/works/${work.slug}` },
        ],
    };
    return (
        <SiteLayout>
            <Head title={`${work.meta_title ?? work.name}｜精選實例｜宸揚資科 JWisdom`}>
                <meta name="description" content={desc} />
                <link rel="canonical" href={`https://www.jwisdom.com.tw/works/${work.slug}`} />
                <meta property="og:type" content="article" />
                <meta property="og:title" content={work.name} />
                <meta property="og:description" content={desc} />
                <meta property="og:url" content={`https://www.jwisdom.com.tw/works/${work.slug}`} />
                <meta property="og:site_name" content="宸揚資科 JWisdom" />
                <meta property="og:image" content={ogImg} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content={ogImg} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(workLd) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
            </Head>

            {work.cover ? (
                <header className="relative h-80 overflow-hidden md:h-[28rem]">
                    <img src={work.cover} alt={work.name} className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/60" />
                    <div className="relative mx-auto flex h-full max-w-4xl flex-col justify-end px-6 py-12 text-white">
                        <div className="text-sm font-semibold text-white/80">{work.category} · {work.year}</div>
                        <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">{work.name}</h1>
                        {work.summary && <p className="mt-4 max-w-2xl text-lg text-white/90">{work.summary}</p>}
                    </div>
                </header>
            ) : (
                <header className={`bg-gradient-to-br ${work.cover_gradient ?? 'from-sky-500 to-cyan-400'} py-24 text-white`}>
                    <div className="mx-auto max-w-4xl px-6">
                        <div className="text-sm font-semibold text-white/80">{work.category} · {work.year}</div>
                        <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">{work.name}</h1>
                        {work.summary && <p className="mt-4 max-w-2xl text-lg text-white/90">{work.summary}</p>}
                    </div>
                </header>
            )}

            <div className="mx-auto max-w-3xl px-6 py-14">
                {work.body ? (
                    <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: work.body }} />
                ) : (
                    <p className="leading-relaxed text-slate-600">{work.summary}</p>
                )}
                {work.url && (
                    <a href={work.url} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-bold text-white transition hover:bg-slate-800">前往網站 <span>→</span></a>
                )}
                <div className="mt-10 border-t border-slate-100 pt-6">
                    <Link href="/#works" className="font-semibold text-sky-600 hover:underline">← 回精選實例</Link>
                </div>
            </div>

            {related.length > 0 && (
                <section className="bg-slate-50 py-16">
                    <div className="mx-auto max-w-7xl px-6">
                        <h2 className="mb-8 text-xl font-bold text-slate-900">其他案例</h2>
                        <div className="grid gap-6 sm:grid-cols-3">
                            {related.map((r) => (
                                <Link key={r.slug} href={`/works/${r.slug}`} className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                                    <div className={`flex h-32 items-center justify-center bg-gradient-to-br ${r.cover_gradient ?? 'from-sky-500 to-cyan-400'}`}>
                                        <span className="font-bold text-white drop-shadow">{r.name}</span>
                                    </div>
                                    <div className="p-5">
                                        <div className="text-xs font-semibold text-sky-500">{r.category}</div>
                                        <h3 className="mt-1 font-bold text-slate-900 group-hover:text-sky-600">{r.name}</h3>
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
