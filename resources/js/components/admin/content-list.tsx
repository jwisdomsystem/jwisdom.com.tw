import { Link, router } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import {
    Search, Plus, Pencil, Trash2, ExternalLink,
    ArrowDown, Newspaper, Lightbulb, Sparkles,
} from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

export type ListItem = {
    id: number; title: string; slug: string; category?: string; excerpt?: string;
    cover?: string; cover_gradient?: string; source_name?: string;
    is_published: boolean; published_at?: string; views_total: number; views_7d: number;
};
type Paginated = { data: ListItem[]; total: number; from: number; to: number; links: { url: string | null; label: string; active: boolean }[] };
type Filters = { q: string; status: string; category: string; sort: string };

const CAT_COLORS = [
    'bg-sky-50 text-sky-700', 'bg-emerald-50 text-emerald-700', 'bg-violet-50 text-violet-700',
    'bg-amber-50 text-amber-700', 'bg-rose-50 text-rose-700', 'bg-indigo-50 text-indigo-700',
    'bg-teal-50 text-teal-700', 'bg-orange-50 text-orange-700',
];
const catColor = (c: string) => CAT_COLORS[Math.abs([...c].reduce((a, ch) => a + ch.charCodeAt(0), 0)) % CAT_COLORS.length];

export default function ContentList({ kind, items, categories, filters }: { kind: 'news' | 'insight'; items: Paginated; categories: string[]; filters: Filters }) {
    const isInsight = kind === 'insight';
    const base = isInsight ? '/admin/insights' : '/admin/news';
    const noun = isInsight ? '技術洞察' : '消息';
    const accentRow = isInsight ? 'hover:bg-indigo-50/40' : 'hover:bg-sky-50/40';
    const accentEdit = isInsight ? 'hover:bg-indigo-100 hover:text-indigo-600' : 'hover:bg-sky-100 hover:text-sky-600';

    const [q, setQ] = useState(filters.q || '');

    const apply = (patch: Partial<Filters> = {}) => {
        const params: Record<string, string> = { q, status: filters.status, category: filters.category, sort: filters.sort, ...patch } as Record<string, string>;
        Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
        router.get(base, params, { preserveState: true, preserveScroll: true, replace: true });
    };

    const search = (e: FormEvent) => { e.preventDefault(); apply(); };
    const toggle = (id: number) => router.patch(`${base}/${id}/toggle`, {}, { preserveScroll: true, preserveState: true });
    const remove = (id: number) => { if (confirm(`確定刪除這則${noun}？`)) router.delete(`${base}/${id}`, { preserveScroll: true }); };

    const sortBtn = (key: 'date' | 'views', label: string) => (
        <button type="button" onClick={() => apply({ sort: key })} className={cn('inline-flex items-center gap-1 font-semibold transition', filters.sort === key ? 'text-sky-600' : 'hover:text-slate-700')}>
            {label}{filters.sort === key && <ArrowDown className="h-3.5 w-3.5" />}
        </button>
    );

    const actions = (
        <Link href={`${base}/create`} className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-sky-600">
            <Plus className="h-4 w-4" /> 新增{noun}
        </Link>
    );

    return (
        <AdminLayout title={isInsight ? '技術洞察' : '最新消息'} actions={actions}>
            {isInsight && (
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
                    <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
                    <div className="text-sm text-slate-600">
                        技術洞察可由「<Link href="/admin/integrations" className="font-semibold text-indigo-600 hover:underline">整合設定 (AI)</Link>」每日自動產生，也可在此手動新增與編輯。
                    </div>
                </div>
            )}

            {/* 工具列：搜尋 + 篩選 */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <form onSubmit={search} className="relative flex-1 min-w-[220px]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="搜尋標題…"
                        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                </form>
                <select value={filters.status} onChange={(e) => apply({ status: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-sky-400">
                    <option value="">全部狀態</option>
                    <option value="published">已發佈</option>
                    <option value="draft">草稿</option>
                </select>
                <select value={filters.category} onChange={(e) => apply({ category: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-sky-400">
                    <option value="">全部分類</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {(filters.q || filters.status || filters.category || filters.sort !== 'date') && (
                    <button type="button" onClick={() => { setQ(''); router.get(base, {}, { preserveScroll: true, replace: true }); }} className="text-sm font-semibold text-slate-400 transition hover:text-slate-700">
                        清除
                    </button>
                )}
                <span className="ml-auto text-sm text-slate-400">共 <span className="font-bold text-slate-600">{items.total}</span> 則</span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] table-fixed text-left text-sm">
                        <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-5 py-3.5 font-semibold">內容</th>
                                <th className="w-32 px-5 py-3.5 font-semibold">分類</th>
                                <th className="w-24 px-5 py-3.5 font-semibold">{sortBtn('views', '瀏覽')}</th>
                                <th className="w-28 px-5 py-3.5 font-semibold">{sortBtn('date', '日期')}</th>
                                <th className="w-28 px-5 py-3.5 font-semibold">狀態</th>
                                <th className="w-48 px-5 py-3.5 text-right font-semibold">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.data.map((n) => (
                                <tr key={n.id} className={cn('group transition', accentRow)}>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            {n.cover ? (
                                                <img src={n.cover} alt="" className="h-12 w-16 shrink-0 rounded-lg border border-slate-200 object-cover" />
                                            ) : (
                                                <div className={cn('h-12 w-16 shrink-0 rounded-lg bg-gradient-to-br', n.cover_gradient || 'from-slate-300 to-slate-400')} />
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate font-semibold text-slate-900">{n.title}</div>
                                                {isInsight && n.source_name && <div className="mt-0.5 truncate text-xs text-slate-400">{n.source_name}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        {n.category ? <span className={cn('rounded-md px-2 py-1 text-xs font-semibold', catColor(n.category))}>{n.category}</span> : <span className="text-slate-300">—</span>}
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="font-bold text-slate-800">{n.views_total.toLocaleString()}</div>
                                        <div className="text-xs text-slate-400">近7日 {n.views_7d > 0 ? `+${n.views_7d}` : 0}</div>
                                    </td>
                                    <td className="px-5 py-3 text-slate-500">{n.published_at}</td>
                                    <td className="px-5 py-3">
                                        <button onClick={() => toggle(n.id)} title="點擊切換發佈/草稿" className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold transition', n.is_published ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}>
                                            <span className={cn('h-1.5 w-1.5 rounded-full', n.is_published ? 'bg-emerald-500' : 'bg-slate-400')} />
                                            {n.is_published ? '已發佈' : '草稿'}
                                        </button>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center justify-end gap-0.5">
                                            <a href={`/news/${n.slug}`} target="_blank" rel="noreferrer" title="檢視前台" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                            <Link href={`${base}/${n.id}/edit`} title="編輯" className={cn('inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition', accentEdit)}>
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                            <button onClick={() => remove(n.id)} title="刪除" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-100 hover:text-rose-600">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {items.data.length === 0 && (
                                <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-400">
                                    {(isInsight ? <Lightbulb className="mx-auto mb-2 h-8 w-8 text-slate-300" /> : <Newspaper className="mx-auto mb-2 h-8 w-8 text-slate-300" />)}
                                    {filters.q || filters.status || filters.category ? '找不到符合條件的內容。' : `尚無${noun}，點右上角新增。`}
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {items.links.length > 3 && (
                <div className="mt-6 flex flex-wrap gap-2">
                    {items.links.map((l, i) => (
                        <Link key={i} href={l.url ?? '#'} preserveScroll className={cn('rounded-lg border px-3 py-1.5 text-sm transition', l.active ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-sky-300', !l.url && 'pointer-events-none opacity-40')} dangerouslySetInnerHTML={{ __html: l.label }} />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
