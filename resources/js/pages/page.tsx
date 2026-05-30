import { Head } from '@inertiajs/react';
import SiteLayout from '@/layouts/site-layout';

type PageData = { key: string; title: string; body?: string; meta_title?: string; meta_description?: string };

export default function GenericPage({ page }: { page: PageData }) {
    const url = `https://www.jwisdom.com.tw/${page.key}`;
    const desc = page.meta_description ?? page.title;
    // 公司介紹頁 → AboutPage；條款／隱私 → WebPage
    const pageType = page.key === 'about' ? 'AboutPage' : 'WebPage';
    const webPageLd = {
        '@context': 'https://schema.org',
        '@type': pageType,
        name: page.meta_title ?? page.title,
        description: desc,
        url,
        isPartOf: { '@type': 'WebSite', name: '宸揚資科 JWisdom', url: 'https://www.jwisdom.com.tw' },
        ...(page.key === 'about' && {
            about: {
                '@type': 'Organization',
                name: '宸揚資科 JWisdom System Inc.',
                url: 'https://www.jwisdom.com.tw',
            },
        }),
    };
    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://www.jwisdom.com.tw/' },
            { '@type': 'ListItem', position: 2, name: page.title, item: url },
        ],
    };
    return (
        <SiteLayout>
            <Head title={`${page.meta_title ?? page.title}｜宸揚資科 JWisdom`}>
                <meta name="description" content={desc} />
                <link rel="canonical" href={url} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={`${page.title}｜宸揚資科 JWisdom`} />
                <meta property="og:description" content={desc} />
                <meta property="og:url" content={url} />
                <meta property="og:site_name" content="宸揚資科 JWisdom" />
                <meta property="og:image" content="https://www.jwisdom.com.tw/images/jwisdom-logo.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
            </Head>

            <section className="bg-slate-900 py-20 text-white">
                <div className="mx-auto max-w-3xl px-6">
                    <h1 className="text-4xl font-extrabold md:text-5xl">{page.title}</h1>
                </div>
            </section>

            <section className="bg-white py-14">
                <div className="mx-auto max-w-3xl px-6">
                    <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: page.body ?? '' }} />
                </div>
            </section>
        </SiteLayout>
    );
}
