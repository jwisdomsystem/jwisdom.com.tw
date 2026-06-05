import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import SiteLayout from '@/layouts/site-layout';

const KNOWN = [403, 404, 419, 429, 500, 503];

export default function ErrorPage({ status }: { status: number }) {
    const { t } = useTranslation();
    const base = KNOWN.includes(status) ? `errors.${status}` : 'errors.generic';
    const title = t(`${base}.title`);
    const desc = t(`${base}.desc`);
    return (
        <SiteLayout>
            <Head title={`${status} ${title}｜${t('common.brand')}`} />
            <section className="flex min-h-[60vh] items-center justify-center bg-white px-6 py-24 text-center">
                <div>
                    <div className="text-7xl font-black text-sky-500 md:text-8xl">{status}</div>
                    <h1 className="mt-4 text-2xl font-extrabold text-slate-900 md:text-3xl">{title}</h1>
                    <p className="mx-auto mt-3 max-w-md text-slate-500">{desc}</p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-bold text-white transition hover:bg-slate-800">{t('common.backHome')}</Link>
                        <Link href="/news" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-50">{t('common.viewNews')}</Link>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
