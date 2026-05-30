import { Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, ExternalLink, Package } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { StatusPill, IconBtn } from '@/components/admin/ui';

type Item = { id: number; name: string; en?: string; tag?: string; url?: string; accent?: string; sort: number; is_active: boolean };

export default function ProductsIndex({ items }: { items: Item[] }) {
    const toggle = (id: number) => router.patch(`/admin/products/${id}/toggle`, {}, { preserveScroll: true, preserveState: true });
    const remove = (id: number) => { if (confirm('確定刪除這個產品？')) router.delete(`/admin/products/${id}`, { preserveScroll: true }); };
    const actions = <Link href="/admin/products/create" className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-sky-600"><Plus className="h-4 w-4" /> 新增產品</Link>;

    return (
        <AdminLayout title="我們的產品" actions={actions}>
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-500"><Package className="h-4 w-4 text-sky-500" /> 共 <span className="font-bold text-slate-700">{items.length}</span> 項自有產品（顯示於首頁「我們的產品」與頁尾）</div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] table-fixed text-left text-sm">
                        <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr><th className="px-5 py-3.5 font-semibold">產品</th><th className="w-44 px-5 py-3.5 font-semibold">標籤</th><th className="w-16 px-5 py-3.5 font-semibold">排序</th><th className="w-24 px-5 py-3.5 font-semibold">狀態</th><th className="w-28 px-5 py-3.5 text-right font-semibold">操作</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((p) => (
                                <tr key={p.id} className="group transition hover:bg-sky-50/40">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className={cn('h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br', p.accent || 'from-sky-400 to-cyan-400')} />
                                            <div className="min-w-0 flex-1"><div className="truncate font-semibold text-slate-900">{p.name}</div>{p.en && <div className="truncate text-xs text-slate-400">{p.en}</div>}</div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">{p.tag ? <span className="inline-block whitespace-nowrap rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{p.tag}</span> : <span className="text-slate-300">—</span>}</td>
                                    <td className="px-5 py-3 text-slate-500">{p.sort}</td>
                                    <td className="px-5 py-3"><StatusPill active={p.is_active} onClick={() => toggle(p.id)} /></td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center justify-end gap-0.5">
                                            {p.url && <IconBtn as="a" href={p.url} target="_blank" title="前往網站"><ExternalLink className="h-4 w-4" /></IconBtn>}
                                            <Link href={`/admin/products/${p.id}/edit`} title="編輯" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-sky-100 hover:text-sky-600"><Pencil className="h-4 w-4" /></Link>
                                            <IconBtn onClick={() => remove(p.id)} title="刪除" tone="rose"><Trash2 className="h-4 w-4" /></IconBtn>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && <tr><td colSpan={5} className="px-5 py-16 text-center text-slate-400">尚無產品，點右上角新增。</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
