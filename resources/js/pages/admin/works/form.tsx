import { Link, useForm } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import { Save, X, Star, Calendar, Hash, Tag, Image as ImageIcon, Link2, Wand2, Sparkles, Loader2, Settings2, Type, AlignLeft, ArrowUpDown, Search } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { inputCls, labelCls, helpCls, errCls, Card, PublishToggle, useAi, useAiImage, ImageUploadButton, CropButton, HeadlinesButton } from '@/components/admin/ui';

type Item = {
    id: number; name: string; slug?: string; category?: string; summary?: string; body?: string;
    cover?: string; cover_gradient?: string; year?: string; url?: string; sort?: number; is_published: boolean;
    meta_title?: string; meta_description?: string;
};

const GRADIENTS = ['from-sky-600 to-cyan-500', 'from-indigo-600 to-sky-500', 'from-emerald-600 to-teal-500', 'from-violet-600 to-fuchsia-500', 'from-rose-500 to-orange-400', 'from-amber-500 to-yellow-400', 'from-slate-700 to-slate-900', 'from-blue-700 to-indigo-600'];
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export default function WorkForm({ item }: { item: Item | null }) {
    const editing = !!item;
    const ai = useAi();
    const aiImg = useAiImage();
    const { data, setData, post, put, processing, errors } = useForm({
        name: item?.name ?? '', slug: item?.slug ?? '', category: item?.category ?? '',
        summary: item?.summary ?? '', body: item?.body ?? '', cover: item?.cover ?? '',
        cover_gradient: item?.cover_gradient ?? '', year: item?.year ?? '', url: item?.url ?? '',
        sort: item?.sort ?? 0, is_published: item?.is_published ?? true,
        meta_title: item?.meta_title ?? '', meta_description: item?.meta_description ?? '',
    });
    const [preview, setPreview] = useState(false);

    const submit = (e: FormEvent) => { e.preventDefault(); editing ? put(`/admin/works/${item!.id}`) : post('/admin/works'); };

    const runAi = async () => {
        if (data.body.trim() && !confirm('將以 AI 產生的內容覆蓋現有摘要與內文，確定嗎？')) return;
        const r = await ai.run('work', data.name);
        if (r) setData({
            ...data,
            summary: r.summary || data.summary,
            body: r.body || data.body,
            meta_description: r.meta_description || data.meta_description,
        });
    };
    const runImg = async () => { const url = await aiImg.run('work', data.name); if (url) setData('cover', url); };

    const actions = (
        <>
            <Link href="/admin/works" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"><X className="h-4 w-4" /> 取消</Link>
            <button type="submit" form="work-form" disabled={processing} className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-60"><Save className="h-4 w-4" /> {editing ? '儲存變更' : '新增案例'}</button>
        </>
    );

    return (
        <AdminLayout title={editing ? '編輯案例' : '新增案例'} actions={actions}>
            <form id="work-form" onSubmit={submit} className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-6">
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400"><Star className="h-4 w-4 text-sky-500" /> 案例內容</div>
                            <div className="flex items-center gap-2">
                                <HeadlinesButton
                                    kind="work"
                                    title={data.name}
                                    excerptLabel="專案摘要"
                                    onApply={(v) => setData({ ...data, name: v.title || data.name, summary: v.excerpt || data.summary, meta_description: v.meta_description || data.meta_description })}
                                />
                                <button type="button" onClick={runAi} disabled={ai.loading} className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100 disabled:opacity-60">
                                    {ai.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}{ai.loading ? 'AI 撰寫中…' : 'AI 產生草稿'}
                                </button>
                            </div>
                        </div>
                        {ai.error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{ai.error}</p>}
                        <div className="space-y-5">
                            <div>
                                <label className={labelCls}><Type className="h-4 w-4 text-slate-400" /> 案例名稱 *</label>
                                <input className={cn(inputCls, 'px-4 py-3 text-base font-semibold')} value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                {errors.name && <p className={errCls}>{errors.name}</p>}
                            </div>
                            <div>
                                <label className={labelCls}><AlignLeft className="h-4 w-4 text-slate-400" /> 摘要</label>
                                <textarea rows={3} className={inputCls} value={data.summary} onChange={(e) => setData('summary', e.target.value)} placeholder="一兩句話的專案重點。可用上方「AI 產生草稿」。" />
                            </div>
                            <div>
                                <div className="mb-1.5 flex items-center justify-between gap-3">
                                    <label className={cn(labelCls, 'mb-0')}><AlignLeft className="h-4 w-4 text-slate-400" /> 內文（可用 HTML）</label>
                                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 text-xs font-semibold">
                                        <button type="button" onClick={() => setPreview(false)} className={cn('rounded-md px-3 py-1 transition', !preview ? 'bg-sky-500 text-white' : 'text-slate-500 hover:text-slate-700')}>編輯</button>
                                        <button type="button" onClick={() => setPreview(true)} className={cn('rounded-md px-3 py-1 transition', preview ? 'bg-sky-500 text-white' : 'text-slate-500 hover:text-slate-700')}>預覽</button>
                                    </div>
                                </div>
                                {preview ? (
                                    <div className="min-h-[420px] rounded-lg border border-slate-200 bg-white p-6">
                                        {data.body.trim()
                                            ? <article className="prose prose-slate max-w-none prose-a:text-sky-600" dangerouslySetInnerHTML={{ __html: data.body }} />
                                            : <p className="text-sm text-slate-400">（尚無內文，切回「編輯」輸入後即可預覽前台樣式）</p>}
                                    </div>
                                ) : (
                                    <textarea rows={14} className={cn(inputCls, 'font-mono text-[13px] leading-relaxed')} value={data.body} onChange={(e) => setData('body', e.target.value)} placeholder="<p>專案背景、解決方案、成果…</p>" />
                                )}
                                <p className={helpCls}>支援 HTML 標籤；「預覽」以前台排版樣式（prose）顯示，與實際前台幾乎一致。</p>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
                    <Card title="顯示設定" icon={Settings2}>
                        <PublishToggle checked={data.is_published} onChange={(v) => setData('is_published', v)} onLabel="顯示於前台" offLabel="隱藏" onHint="會出現在前台精選實例。" offHint="不顯示於前台。" />
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className={labelCls}><Calendar className="h-4 w-4 text-slate-400" /> 年份</label><input className={inputCls} value={data.year} onChange={(e) => setData('year', e.target.value)} placeholder="2025" /></div>
                            <div><label className={labelCls}><ArrowUpDown className="h-4 w-4 text-slate-400" /> 排序</label><input type="number" className={inputCls} value={data.sort} onChange={(e) => setData('sort', Number(e.target.value))} /></div>
                        </div>
                        <div><label className={labelCls}><Tag className="h-4 w-4 text-slate-400" /> 分類</label><input className={inputCls} value={data.category} onChange={(e) => setData('category', e.target.value)} placeholder="APP / WEB・系統整合" /></div>
                        <div>
                            <label className={labelCls}><Hash className="h-4 w-4 text-slate-400" /> 網址代稱 slug</label>
                            <div className="flex gap-2">
                                <input className={inputCls} value={data.slug} onChange={(e) => setData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))} onBlur={(e) => setData('slug', slugify(e.target.value))} placeholder="留空自動產生" />
                                <button type="button" onClick={() => setData('slug', slugify(data.name))} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-100"><Wand2 className="h-3.5 w-3.5" /> 產生</button>
                            </div>
                            {errors.slug && <p className={errCls}>{errors.slug}</p>}
                        </div>
                        <div><label className={labelCls}><Link2 className="h-4 w-4 text-slate-400" /> 外部連結</label><input className={inputCls} value={data.url} onChange={(e) => setData('url', e.target.value)} placeholder="https://…（選填）" /></div>
                    </Card>

                    <Card title="封面圖" icon={ImageIcon}>
                        {data.cover ? (
                            <div className="overflow-hidden rounded-xl border border-slate-200"><img src={data.cover} alt="" className="aspect-video w-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0.2')} /></div>
                        ) : (
                            <div className={cn('flex aspect-video items-center justify-center rounded-xl bg-gradient-to-br text-sm font-semibold text-white/90', data.cover_gradient || 'from-slate-400 to-slate-500')}>無封面圖（顯示漸層底色）</div>
                        )}
                        <div className="flex gap-2">
                            <input className={inputCls} value={data.cover} onChange={(e) => setData('cover', e.target.value)} placeholder="封面圖網址" />
                            {data.cover && <button type="button" onClick={() => setData('cover', '')} className="shrink-0 rounded-lg border border-slate-300 px-3 text-sm text-slate-500 transition hover:bg-slate-100"><X className="h-4 w-4" /></button>}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <ImageUploadButton onUploaded={(url) => setData('cover', url)} />
                            <CropButton src={data.cover} onCropped={(url) => setData('cover', url)} />
                            <button type="button" onClick={runImg} disabled={aiImg.loading} className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100 disabled:opacity-60">
                                {aiImg.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}{aiImg.loading ? 'AI 生成中…' : 'AI 生成封面圖'}
                            </button>
                        </div>
                        {aiImg.error && <p className={errCls}>{aiImg.error}</p>}
                        <div>
                            <label className={labelCls}>漸層底色（無圖時顯示）</label>
                            <div className="grid grid-cols-4 gap-2">
                                {GRADIENTS.map((g) => <button key={g} type="button" onClick={() => setData('cover_gradient', g)} title={g} className={cn('h-9 rounded-lg bg-gradient-to-br ring-2 ring-offset-1 transition', g, data.cover_gradient === g ? 'ring-sky-500' : 'ring-transparent hover:ring-slate-300')} />)}
                            </div>
                        </div>
                    </Card>

                    <Card title="SEO 設定" icon={Search}>
                        <div>
                            <label className={labelCls}>SEO 標題</label>
                            <input className={inputCls} value={data.meta_title} onChange={(e) => setData('meta_title', e.target.value)} placeholder="留空則用案例名稱" />
                        </div>
                        <div>
                            <label className={labelCls}>SEO 描述</label>
                            <textarea rows={3} className={inputCls} value={data.meta_description} onChange={(e) => setData('meta_description', e.target.value)} placeholder="搜尋結果顯示的描述（留空則用摘要），約 80–120 字。可按上方「AI 產生草稿」自動帶入。" />
                        </div>
                        <p className={helpCls}>影響 Google 搜尋結果的標題與描述；留空會自動用案例名稱／摘要。</p>
                    </Card>
                </div>
            </form>
        </AdminLayout>
    );
}
