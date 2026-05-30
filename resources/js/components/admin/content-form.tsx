import { Link, useForm } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import {
    Save, X, Newspaper, Lightbulb, Eye, EyeOff, Calendar, Tag, Hash,
    Image as ImageIcon, Link2, AlignLeft, Type, Settings2, Wand2, Sparkles, Loader2, Palette, Search,
} from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { ImageUploadButton, CropButton, HeadlinesButton } from '@/components/admin/ui';

export type ContentItem = {
    id: number; title: string; slug?: string; category?: string; type?: string;
    excerpt?: string; body?: string; cover?: string; cover_gradient?: string;
    source_name?: string; source_url?: string; is_published: boolean; published_at?: string;
    meta_title?: string; meta_description?: string;
};

const DEFAULT_CATEGORIES: Record<'news' | 'insight', string[]> = {
    news: ['公司動態', '技術分享', '合作案例', '活動公告', '媒體報導'],
    insight: ['AI 應用', '資訊安全', '系統架構', '雲端與 DevOps', '資料與分析', '產業新聞'],
};

const GRADIENTS = [
    'from-sky-600 to-cyan-500', 'from-indigo-600 to-sky-500', 'from-emerald-600 to-teal-500',
    'from-violet-600 to-fuchsia-500', 'from-rose-500 to-orange-400', 'from-amber-500 to-yellow-400',
    'from-slate-700 to-slate-900', 'from-blue-700 to-indigo-600',
];

const CUSTOM = '__custom__';

const input =
    'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100';
const label = 'mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700';
const help = 'mt-1 text-xs text-slate-400';
const err = 'mt-1 text-xs font-medium text-red-500';

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function Card({ title, icon: Icon, children }: { title: string; icon: typeof Save; children: React.ReactNode }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
                <Icon className="h-[18px] w-[18px] text-sky-500" />
                <h2 className="text-sm font-bold text-slate-800">{title}</h2>
            </div>
            <div className="space-y-4 p-5">{children}</div>
        </section>
    );
}

export default function ContentForm({ item, kind, categories = [] }: { item: ContentItem | null; kind: 'news' | 'insight'; categories?: string[] }) {
    const editing = !!item;
    const isInsight = kind === 'insight';
    const base = isInsight ? '/admin/insights' : '/admin/news';
    const noun = isInsight ? '技術洞察' : '消息';
    const KindIcon = isInsight ? Lightbulb : Newspaper;

    const catOptions = Array.from(new Set([...DEFAULT_CATEGORIES[kind], ...categories]));

    const { data, setData, post, put, processing, errors } = useForm({
        title: item?.title ?? '', slug: item?.slug ?? '', category: item?.category ?? '',
        excerpt: item?.excerpt ?? '', body: item?.body ?? '',
        cover: item?.cover ?? '', cover_gradient: item?.cover_gradient ?? '',
        source_name: item?.source_name ?? '', source_url: item?.source_url ?? '',
        is_published: item?.is_published ?? true,
        published_at: item?.published_at ? item.published_at.substring(0, 10) : '',
        meta_title: item?.meta_title ?? '', meta_description: item?.meta_description ?? '',
    });

    const [customCat, setCustomCat] = useState<boolean>(!!data.category && !catOptions.includes(data.category));
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [imgLoading, setImgLoading] = useState(false);
    const [imgError, setImgError] = useState<string | null>(null);
    const [preview, setPreview] = useState(false);

    const runAi = async () => {
        if (!data.title.trim()) { setAiError('請先輸入標題，AI 會依標題撰寫。'); return; }
        if (data.body.trim() && !confirm('將以 AI 產生的內容覆蓋現有的摘要與內文，確定嗎？')) return;
        setAiError(null);
        setAiLoading(true);
        try {
            const xsrf = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || '');
            const r = await fetch('/admin/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': xsrf },
                credentials: 'same-origin',
                body: JSON.stringify({ title: data.title, kind }),
            });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) { setAiError(j.message || `產生失敗（${r.status}）`); return; }
            setData({
                ...data,
                excerpt: j.excerpt || data.excerpt,
                body: j.body || data.body,
                meta_description: j.meta_description || data.meta_description,
            });
        } catch {
            setAiError('連線失敗，請稍後再試。');
        } finally {
            setAiLoading(false);
        }
    };

    const runImage = async () => {
        if (!data.title.trim()) { setImgError('請先輸入標題，AI 會依標題生成封面。'); return; }
        setImgError(null);
        setImgLoading(true);
        try {
            const xsrf = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || '');
            const r = await fetch('/admin/ai/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': xsrf },
                credentials: 'same-origin',
                body: JSON.stringify({ title: data.title, kind }),
            });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) { setImgError(j.message || `生成失敗（${r.status}）`); return; }
            if (j.cover) setData('cover', j.cover);
        } catch {
            setImgError('連線失敗，請稍後再試。');
        } finally {
            setImgLoading(false);
        }
    };

    const autoGradient = () => {
        const seed = [...(data.title || noun)].reduce((a, c) => a + c.charCodeAt(0), 0);
        setData('cover_gradient', GRADIENTS[Math.abs(seed) % GRADIENTS.length]);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (editing) put(`${base}/${item!.id}`);
        else post(base);
    };

    const actions = (
        <>
            <Link href={base} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
                <X className="h-4 w-4" /> 取消
            </Link>
            <button
                type="submit"
                form="content-editor"
                disabled={processing}
                className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-60"
            >
                <Save className="h-4 w-4" /> {editing ? '儲存變更' : `新增${noun}`}
            </button>
        </>
    );

    return (
        <AdminLayout title={`${editing ? '編輯' : '新增'}${noun}`} actions={actions}>
            <form id="content-editor" onSubmit={submit} className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                {/* 主內容 */}
                <div className="space-y-6">
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                                <KindIcon className="h-4 w-4 text-sky-500" /> {noun}內容
                            </div>
                            <div className="flex items-center gap-2">
                                <HeadlinesButton
                                    kind={kind}
                                    title={data.title}
                                    excerptLabel="摘要"
                                    onApply={(v) => setData({ ...data, title: v.title || data.title, excerpt: v.excerpt || data.excerpt, meta_description: v.meta_description || data.meta_description })}
                                />
                                <button
                                    type="button"
                                    onClick={runAi}
                                    disabled={aiLoading}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100 disabled:opacity-60"
                                    title="依標題用 AI 產生摘要與內文"
                                >
                                    {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                                    {aiLoading ? 'AI 撰寫中…' : 'AI 產生草稿'}
                                </button>
                            </div>
                        </div>
                        {aiError && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{aiError}</p>}
                        <div className="space-y-5">
                            <div>
                                <label className={label}><Type className="h-4 w-4 text-slate-400" /> 標題 *</label>
                                <input
                                    className={cn(input, 'px-4 py-3 text-base font-semibold')}
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder={isInsight ? '例如：零信任架構：企業資安的最後一道防線' : '例如：宸揚資科完成新版企業官網改版'}
                                />
                                {errors.title && <p className={err}>{errors.title}</p>}
                            </div>
                            <div>
                                <label className={label}><AlignLeft className="h-4 w-4 text-slate-400" /> 摘要</label>
                                <textarea rows={3} className={input} value={data.excerpt} onChange={(e) => setData('excerpt', e.target.value)} placeholder="一兩句話的重點摘要，會顯示在列表卡片上。可用上方「AI 產生草稿」自動撰寫。" />
                            </div>
                            <div>
                                <div className="mb-1.5 flex items-center justify-between gap-3">
                                    <label className={cn(label, 'mb-0')}><AlignLeft className="h-4 w-4 text-slate-400" /> 內文（可用 HTML）</label>
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
                                    <textarea
                                        rows={18}
                                        className={cn(input, 'font-mono text-[13px] leading-relaxed')}
                                        value={data.body}
                                        onChange={(e) => setData('body', e.target.value)}
                                        placeholder="<p>段落內容…</p>"
                                    />
                                )}
                                <p className={help}>支援 HTML 標籤；「預覽」以前台排版樣式（prose）顯示，與實際前台幾乎一致。</p>
                            </div>
                        </div>
                    </section>

                    {isInsight && (
                        <Card title="來源" icon={Link2}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={label}>來源名稱</label>
                                    <input className={input} value={data.source_name} onChange={(e) => setData('source_name', e.target.value)} placeholder="例如 中央社 CNA" />
                                </div>
                                <div>
                                    <label className={label}>來源連結</label>
                                    <input className={input} value={data.source_url} onChange={(e) => setData('source_url', e.target.value)} placeholder="原始文章連結（選填）" />
                                    {errors.source_url && <p className={err}>{errors.source_url}</p>}
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* 側欄設定 */}
                <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
                    <Card title="發佈設定" icon={Settings2}>
                        <button
                            type="button"
                            onClick={() => setData('is_published', !data.is_published)}
                            className={cn(
                                'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition',
                                data.is_published ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50',
                            )}
                        >
                            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                {data.is_published ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                                {data.is_published ? '已發佈' : '草稿'}
                            </span>
                            <span className={cn('relative h-6 w-11 rounded-full transition', data.is_published ? 'bg-emerald-500' : 'bg-slate-300')}>
                                <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', data.is_published ? 'left-[22px]' : 'left-0.5')} />
                            </span>
                        </button>
                        <p className={help}>{data.is_published ? '前台會顯示這篇內容。' : '草稿不會顯示在前台。'}</p>

                        <div>
                            <label className={label}><Calendar className="h-4 w-4 text-slate-400" /> 發佈日期</label>
                            <input type="date" className={input} value={data.published_at} onChange={(e) => setData('published_at', e.target.value)} />
                        </div>

                        <div>
                            <label className={label}><Tag className="h-4 w-4 text-slate-400" /> 分類</label>
                            {!customCat ? (
                                <select
                                    className={input}
                                    value={catOptions.includes(data.category) ? data.category : ''}
                                    onChange={(e) => {
                                        if (e.target.value === CUSTOM) { setCustomCat(true); setData('category', ''); }
                                        else setData('category', e.target.value);
                                    }}
                                >
                                    <option value="">（未分類）</option>
                                    {catOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                                    <option value={CUSTOM}>＋ 其他（自訂）…</option>
                                </select>
                            ) : (
                                <div className="flex gap-2">
                                    <input autoFocus className={input} value={data.category} onChange={(e) => setData('category', e.target.value)} placeholder="輸入新分類名稱" />
                                    <button type="button" onClick={() => { setCustomCat(false); setData('category', ''); }} className="shrink-0 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100" title="回到下拉選單">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                            <p className={help}>從清單挑選可避免打錯造成分類不一致；需要新分類選「其他（自訂）」。</p>
                        </div>

                        <div>
                            <label className={label}><Hash className="h-4 w-4 text-slate-400" /> 網址代稱 slug</label>
                            <div className="flex gap-2">
                                <input
                                    className={input}
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
                                    onBlur={(e) => setData('slug', slugify(e.target.value))}
                                    placeholder="留空自動產生"
                                />
                                <button type="button" onClick={() => setData('slug', slugify(data.title))} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-100" title="從標題重新產生">
                                    <Wand2 className="h-3.5 w-3.5" /> 產生
                                </button>
                            </div>
                            {errors.slug && <p className={err}>{errors.slug}</p>}
                            <p className={help}>只能是小寫英文、數字與連字號；中文標題請按「產生」或自行輸入英文。留空會自動產生。</p>
                        </div>
                    </Card>

                    <Card title="封面圖" icon={ImageIcon}>
                        {data.cover ? (
                            <div className="overflow-hidden rounded-xl border border-slate-200">
                                <img src={data.cover} alt="封面預覽" className="aspect-video w-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0.2')} />
                            </div>
                        ) : (
                            <div className={cn('flex aspect-video items-center justify-center rounded-xl bg-gradient-to-br text-sm font-semibold text-white/90', data.cover_gradient || 'from-slate-400 to-slate-500')}>
                                無封面圖（顯示漸層底色）
                            </div>
                        )}
                        <div>
                            <label className={label}>封面圖網址</label>
                            <div className="flex gap-2">
                                <input className={input} value={data.cover} onChange={(e) => setData('cover', e.target.value)} placeholder="https://…/cover.jpg（留空則用下方漸層）" />
                                {data.cover && (
                                    <button type="button" onClick={() => setData('cover', '')} className="shrink-0 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100" title="清除封面圖">
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <ImageUploadButton onUploaded={(url) => setData('cover', url)} />
                                <CropButton src={data.cover} onCropped={(url) => setData('cover', url)} />
                                <button
                                    type="button"
                                    onClick={runImage}
                                    disabled={imgLoading}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100 disabled:opacity-60"
                                    title="用 Cloudflare AI 依標題生成封面圖"
                                >
                                    {imgLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                                    {imgLoading ? 'AI 生成中…（約 10–20 秒）' : 'AI 生成封面圖'}
                                </button>
                            </div>
                            {imgError && <p className="mt-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{imgError}</p>}
                        </div>
                        <div>
                            <label className={label}><Palette className="h-4 w-4 text-slate-400" /> 漸層底色（無圖時顯示）</label>
                            <div className="grid grid-cols-4 gap-2">
                                {GRADIENTS.map((g) => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => setData('cover_gradient', g)}
                                        title={g}
                                        className={cn(
                                            'h-9 rounded-lg bg-gradient-to-br ring-2 ring-offset-1 transition',
                                            g,
                                            data.cover_gradient === g ? 'ring-sky-500' : 'ring-transparent hover:ring-slate-300',
                                        )}
                                    />
                                ))}
                            </div>
                            <button type="button" onClick={autoGradient} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:underline">
                                <Wand2 className="h-3.5 w-3.5" /> 依標題自動配色
                            </button>
                        </div>
                    </Card>

                    <Card title="SEO 設定" icon={Search}>
                        <div>
                            <label className={label}>SEO 標題</label>
                            <input className={input} value={data.meta_title} onChange={(e) => setData('meta_title', e.target.value)} placeholder="留空則用文章標題" />
                        </div>
                        <div>
                            <label className={label}>SEO 描述</label>
                            <textarea rows={3} className={input} value={data.meta_description} onChange={(e) => setData('meta_description', e.target.value)} placeholder="搜尋結果顯示的描述（留空則用摘要），約 80–120 字" />
                        </div>
                        <p className={help}>影響 Google 搜尋結果的標題與描述；留空會自動用文章標題／摘要。</p>
                    </Card>
                </div>
            </form>
        </AdminLayout>
    );
}
