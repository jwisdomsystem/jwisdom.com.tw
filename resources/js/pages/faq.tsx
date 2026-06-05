import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SiteLayout from '@/layouts/site-layout';

type FaqItem = { question: string; answer: string };
type Group = { group: string; items: FaqItem[] };

function Item({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-slate-100">
            <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-4 py-5 text-left">
                <span className="font-bold text-slate-900">{q}</span>
                <span className={`shrink-0 text-sky-500 transition-transform ${open ? 'rotate-45' : ''}`}>＋</span>
            </button>
            {open && <div className="prose prose-sm prose-slate max-w-none pb-5 text-slate-600" dangerouslySetInnerHTML={{ __html: a }} />}
        </div>
    );
}

export default function FaqPage({ groups }: { groups: Group[] }) {
    const { t } = useTranslation();
    const faqItems = groups.flatMap((g) => g.items).filter((f) => f.question && f.answer);
    const faqLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer.replace(/<[^>]+>/g, '').trim() },
        })),
    };
    return (
        <SiteLayout>
            <Head title={t('faq.seoTitle')}>
                <meta name="description" content={t('faq.seoDesc')} />
                <link rel="canonical" href="https://www.jwisdom.com.tw/faq" />
                <meta property="og:title" content={t('faq.seoTitle')} />
                <meta property="og:description" content={t('faq.seoDesc')} />
                <meta property="og:url" content="https://www.jwisdom.com.tw/faq" />
                <meta property="og:image" content="https://www.jwisdom.com.tw/images/jwisdom-logo.png" />
                <meta name="twitter:card" content="summary_large_image" />
                {faqItems.length > 0 && (
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
                )}
            </Head>

            <section className="bg-slate-900 py-20 text-white">
                <div className="mx-auto max-w-7xl px-6">
                    <span className="text-sm font-bold uppercase tracking-wider text-sky-400">FAQ</span>
                    <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">{t('faq.title')}</h1>
                </div>
            </section>

            <section className="bg-white py-16">
                <div className="mx-auto max-w-3xl px-6">
                    {groups.map((g) => (
                        <div key={g.group} className="mb-12">
                            <h2 className="mb-2 text-lg font-bold text-sky-600">{g.group}</h2>
                            {g.items.map((it, i) => (
                                <Item key={i} q={it.question} a={it.answer} />
                            ))}
                        </div>
                    ))}
                </div>
            </section>
        </SiteLayout>
    );
}
