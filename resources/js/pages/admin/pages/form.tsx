import { Link, useForm } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import { Save, X, FileText, Type, AlignLeft, Search, Sparkles, Loader2 } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { inputCls, labelCls, errCls, helpCls, Card, useAi } from '@/components/admin/ui';

type Item = { id: number; key: string; title: string; body?: string; meta_title?: string; meta_description?: string };

export default function PageForm({ item }: { item: Item }) {
    const [preview, setPreview] = useState(false);
    const { data, setData, put, processing, errors } = useForm({
        title: item.title ?? '', body: item.body ?? '', meta_title: item.meta_title ?? '', meta_description: item.meta_description ?? '',
    });
    const submit = (e: FormEvent) => { e.preventDefault(); put(`/admin/pages/${item.key}`); };

    const ai = useAi();
    const runAi = async () => {
        if (data.body.trim() && !confirm('將以 AI 產生的內容覆蓋現有內文，確定嗎？')) return;
        const r = await ai.run('page', data.title);
        if (!r) return;
        setData({ ...data, body: r.body || data.body, meta_description: data.meta_description || (r.meta_description ?? '') });
    };

    const actions = (
        <>
            <Link href="/admin/pages" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"><X className="h-4 w-4" /> 取消</Link>
            <button type="submit" form="page-form" disabled={processing} className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-60"><Save className="h-4 w-4" /> 儲存變更</button>
        </>
    );

    return (
        <AdminLayout title={`編輯頁面：${item.title}`} actions={actions}>
            <form id="page-form" onSubmit={submit} className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-6">
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400"><FileText className="h-4 w-4 text-sky-500" /> 頁面內容</div>
                            <button type="button" onClick={runAi} disabled={ai.loading} className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100 disabled:opacity-60">
                                {ai.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}{ai.loading ? 'AI 撰寫中…' : 'AI 產生內容'}
                            </button>
                        </div>
                        {ai.error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{ai.error}</p>}
                        <div className="space-y-5">
                            <div><label className={labelCls}><Type className="h-4 w-4 text-slate-400" /> 頁面標題 *</label><input className={cn(inputCls, 'px-4 py-3 text-base font-semibold')} value={data.title} onChange={(e) => setData('title', e.target.value)} />{errors.title && <p className={errCls}>{errors.title}</p>}</div>
                            <div>
                                <div className="mb-1.5 flex items-center justify-between gap-3">
                                    <label className={cn(labelCls, 'mb-0')}><AlignLeft className="h-4 w-4 text-slate-400" /> 內文（可用 HTML）</label>
                                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 text-xs font-semibold">
                                        <button type="button" onClick={() => setPreview(false)} className={cn('rounded-md px-3 py-1 transition', !preview ? 'bg-sky-500 text-white' : 'text-slate-500 hover:text-slate-700')}>編輯</button>
                                        <button type="button" onClick={() => setPreview(true)} className={cn('rounded-md px-3 py-1 transition', preview ? 'bg-sky-500 text-white' : 'text-slate-500 hover:text-slate-700')}>預覽</button>
                                    </div>
                                </div>
                                {preview ? (
                                    <div className="min-h-[360px] rounded-lg border border-slate-200 bg-white p-6">
                                        {data.body.trim() ? <article className="prose prose-slate max-w-none prose-a:text-sky-600" dangerouslySetInnerHTML={{ __html: data.body }} /> : <p className="text-sm text-slate-400">（尚無內文）</p>}
                                    </div>
                                ) : (
                                    <textarea rows={16} className={cn(inputCls, 'font-mono text-[13px] leading-relaxed')} value={data.body} onChange={(e) => setData('body', e.target.value)} />
                                )}
                                <p className={helpCls}>「預覽」以前台排版樣式（prose）顯示。</p>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
                    <Card title="SEO 設定" icon={Search}>
                        <div><label className={labelCls}>SEO 標題</label><input className={inputCls} value={data.meta_title} onChange={(e) => setData('meta_title', e.target.value)} placeholder="留空則用頁面標題" /></div>
                        <div><label className={labelCls}>SEO 描述</label><textarea rows={3} className={inputCls} value={data.meta_description} onChange={(e) => setData('meta_description', e.target.value)} placeholder="搜尋結果顯示的描述（約 80-120 字）" /></div>
                    </Card>
                </div>
            </form>
        </AdminLayout>
    );
}
