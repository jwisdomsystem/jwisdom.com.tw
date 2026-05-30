import { Head, Link } from '@inertiajs/react';
import SiteLayout from '@/layouts/site-layout';

const messages: Record<number, { t: string; d: string }> = {
    403: { t: '沒有權限', d: '您沒有權限存取此頁面。' },
    404: { t: '找不到頁面', d: '您要找的頁面不存在或已被移除。' },
    419: { t: '連線逾時', d: '頁面已過期，請重新整理後再試。' },
    429: { t: '請求過於頻繁', d: '請稍候片刻再試。' },
    500: { t: '伺服器發生錯誤', d: '系統暫時出了點問題，我們正在處理。' },
    503: { t: '服務維護中', d: '網站正在維護，請稍後再回來。' },
};

export default function ErrorPage({ status }: { status: number }) {
    const m = messages[status] ?? { t: '發生錯誤', d: '請稍後再試。' };
    return (
        <SiteLayout>
            <Head title={`${status} ${m.t}｜宸揚資科 JWisdom`} />
            <section className="flex min-h-[60vh] items-center justify-center bg-white px-6 py-24 text-center">
                <div>
                    <div className="text-7xl font-black text-sky-500 md:text-8xl">{status}</div>
                    <h1 className="mt-4 text-2xl font-extrabold text-slate-900 md:text-3xl">{m.t}</h1>
                    <p className="mx-auto mt-3 max-w-md text-slate-500">{m.d}</p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-bold text-white transition hover:bg-slate-800">回首頁</Link>
                        <Link href="/news" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-50">看最新消息</Link>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
