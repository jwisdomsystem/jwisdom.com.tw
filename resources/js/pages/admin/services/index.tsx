import { Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Wrench } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { StatusPill, IconBtn, ServiceIcon } from '@/components/admin/ui';

type Item = { id: number; title: string; slug: string; summary?: string; icon?: string; icon_bg?: string; icon_text?: string; sort: number; is_published: boolean };

export default function ServicesIndex({ items }: { items: Item[] }) {
    const toggle = (id: number) => router.patch(`/admin/services/${id}/toggle`, {}, { preserveScroll: true, preserveState: true });
    const remove = (id: number) => { if (confirm('確定刪除這個服務？')) router.delete(`/admin/services/${id}`, { preserveScroll: true }); };
    const actions = <Link href="/admin/services/create" className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-sky-600"><Plus className="h-4 w-4" /> 新增服務</Link>;

    return (
        <AdminLayout title="服務項目" actions={actions}>
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-500"><Wrench className="h-4 w-4 text-sky-500" /> 共 <span className="font-bold text-slate-700">{items.length}</span> 項服務（依排序顯示）</div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] table-fixed text-left text-sm">
                        <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr><th className="px-5 py-3.5 font-semibold">服務</th><th className="w-20 px-5 py-3.5 font-semibold">排序</th><th className="w-28 px-5 py-3.5 font-semibold">狀態</th><th className="w-28 px-5 py-3.5 text-right font-semibold">操作</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((s) => (
                                <tr key={s.id} className="group transition hover:bg-sky-50/40">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', s.icon_bg || 'bg-sky-100', s.icon_text || 'text-sky-600')}><ServiceIcon code={s.icon} className="h-5 w-5" /></div>
                                            <div className="min-w-0 flex-1"><div className="truncate font-semibold text-slate-900">{s.title}</div>{s.summary && <div className="mt-0.5 truncate text-xs text-slate-400">{s.summary}</div>}</div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-slate-500">{s.sort}</td>
                                    <td className="px-5 py-3"><StatusPill active={s.is_published} onClick={() => toggle(s.id)} /></td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center justify-end gap-0.5">
                                            <Link href={`/admin/services/${s.id}/edit`} title="編輯" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-sky-100 hover:text-sky-600"><Pencil className="h-4 w-4" /></Link>
                                            <IconBtn onClick={() => remove(s.id)} title="刪除" tone="rose"><Trash2 className="h-4 w-4" /></IconBtn>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && <tr><td colSpan={4} className="px-5 py-16 text-center text-slate-400">尚無服務，點右上角新增。</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
