import { Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, HelpCircle } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { StatusPill, IconBtn } from '@/components/admin/ui';

type Item = { id: number; group: string; question: string; sort: number; is_published: boolean };

export default function FaqsIndex({ items }: { items: Item[] }) {
    const toggle = (id: number) => router.patch(`/admin/faqs/${id}/toggle`, {}, { preserveScroll: true, preserveState: true });
    const remove = (id: number) => { if (confirm('確定刪除這則問答？')) router.delete(`/admin/faqs/${id}`, { preserveScroll: true }); };
    const actions = <Link href="/admin/faqs/create" className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-sky-600"><Plus className="h-4 w-4" /> 新增問答</Link>;

    return (
        <AdminLayout title="常見問題" actions={actions}>
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-500"><HelpCircle className="h-4 w-4 text-sky-500" /> 共 <span className="font-bold text-slate-700">{items.length}</span> 則問答</div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] table-fixed text-left text-sm">
                        <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr><th className="w-32 px-5 py-3.5 font-semibold">分組</th><th className="px-5 py-3.5 font-semibold">問題</th><th className="w-28 px-5 py-3.5 font-semibold">狀態</th><th className="w-28 px-5 py-3.5 text-right font-semibold">操作</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((f) => (
                                <tr key={f.id} className="group transition hover:bg-sky-50/40">
                                    <td className="px-5 py-3"><span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{f.group}</span></td>
                                    <td className="px-5 py-3"><div className="truncate font-medium text-slate-900">{f.question}</div></td>
                                    <td className="px-5 py-3"><StatusPill active={f.is_published} onClick={() => toggle(f.id)} /></td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center justify-end gap-0.5">
                                            <Link href={`/admin/faqs/${f.id}/edit`} title="編輯" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-sky-100 hover:text-sky-600"><Pencil className="h-4 w-4" /></Link>
                                            <IconBtn onClick={() => remove(f.id)} title="刪除" tone="rose"><Trash2 className="h-4 w-4" /></IconBtn>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && <tr><td colSpan={4} className="px-5 py-16 text-center text-slate-400">尚無問答，點右上角新增。</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
