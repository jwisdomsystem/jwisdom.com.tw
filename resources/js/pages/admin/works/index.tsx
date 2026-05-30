import { Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, ExternalLink, Star } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { StatusPill, IconBtn } from '@/components/admin/ui';

type Item = { id: number; name: string; slug: string; category?: string; summary?: string; year?: string; cover?: string; cover_gradient?: string; url?: string; is_published: boolean };
type Paginated = { data: Item[]; total: number; links: { url: string | null; label: string; active: boolean }[] };

export default function WorksIndex({ items }: { items: Paginated }) {
    const toggle = (id: number) => router.patch(`/admin/works/${id}/toggle`, {}, { preserveScroll: true, preserveState: true });
    const remove = (id: number) => { if (confirm('確定刪除這個案例？')) router.delete(`/admin/works/${id}`, { preserveScroll: true }); };
    const actions = <Link href="/admin/works/create" className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-sky-600"><Plus className="h-4 w-4" /> 新增案例</Link>;

    return (
        <AdminLayout title="精選實例" actions={actions}>
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-500"><Star className="h-4 w-4 text-sky-500" /> 共 <span className="font-bold text-slate-700">{items.total}</span> 個案例</div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] table-fixed text-left text-sm">
                        <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr><th className="px-5 py-3.5 font-semibold">案例</th><th className="w-44 px-5 py-3.5 font-semibold">分類</th><th className="w-20 px-5 py-3.5 font-semibold">年份</th><th className="w-24 px-5 py-3.5 font-semibold">狀態</th><th className="w-28 px-5 py-3.5 text-right font-semibold">操作</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.data.map((w) => (
                                <tr key={w.id} className="group transition hover:bg-sky-50/40">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            {w.cover ? <img src={w.cover} alt="" className="h-12 w-16 shrink-0 rounded-lg border border-slate-200 object-cover" /> : <div className={cn('h-12 w-16 shrink-0 rounded-lg bg-gradient-to-br', w.cover_gradient || 'from-slate-300 to-slate-400')} />}
                                            <div className="min-w-0 flex-1"><div className="truncate font-semibold text-slate-900">{w.name}</div>{w.summary && <div className="mt-0.5 truncate text-xs text-slate-400">{w.summary}</div>}</div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">{w.category ? <span className="inline-block whitespace-nowrap rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{w.category}</span> : <span className="text-slate-300">—</span>}</td>
                                    <td className="px-5 py-3 text-slate-500">{w.year || '—'}</td>
                                    <td className="px-5 py-3"><StatusPill active={w.is_published} onClick={() => toggle(w.id)} /></td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center justify-end gap-0.5">
                                            <IconBtn as="a" href={`/works/${w.slug}`} target="_blank" title="檢視前台"><ExternalLink className="h-4 w-4" /></IconBtn>
                                            <Link href={`/admin/works/${w.id}/edit`} title="編輯" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-sky-100 hover:text-sky-600"><Pencil className="h-4 w-4" /></Link>
                                            <IconBtn onClick={() => remove(w.id)} title="刪除" tone="rose"><Trash2 className="h-4 w-4" /></IconBtn>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {items.data.length === 0 && <tr><td colSpan={5} className="px-5 py-16 text-center text-slate-400">尚無案例，點右上角新增。</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            {items.links.length > 3 && (
                <div className="mt-6 flex flex-wrap gap-2">
                    {items.links.map((l, i) => <Link key={i} href={l.url ?? '#'} preserveScroll className={cn('rounded-lg border px-3 py-1.5 text-sm transition', l.active ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-sky-300', !l.url && 'pointer-events-none opacity-40')} dangerouslySetInnerHTML={{ __html: l.label }} />)}
                </div>
            )}
        </AdminLayout>
    );
}
