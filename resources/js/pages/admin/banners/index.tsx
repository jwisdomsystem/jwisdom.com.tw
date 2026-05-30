import { Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Megaphone } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { StatusPill, IconBtn } from '@/components/admin/ui';

type Banner = { id: number; zone: string; title?: string; subtitle?: string; body?: string; image?: string; accent?: string; url?: string; is_active: boolean; sort: number };

const zoneLabel: Record<string, string> = { announcement: '頂部公告條', carousel: 'Hero 輪播', promo: '推廣橫幅', floating: '浮動廣告' };
const zoneColor: Record<string, string> = { announcement: 'bg-amber-50 text-amber-700', carousel: 'bg-sky-50 text-sky-700', promo: 'bg-emerald-50 text-emerald-700', floating: 'bg-violet-50 text-violet-700' };

export default function BannersIndex({ items }: { items: Banner[] }) {
    const toggle = (id: number) => router.patch(`/admin/banners/${id}/toggle`, {}, { preserveScroll: true, preserveState: true });
    const remove = (id: number) => { if (confirm('確定刪除這則廣告？')) router.delete(`/admin/banners/${id}`, { preserveScroll: true }); };
    const actions = <Link href="/admin/banners/create" className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-sky-600"><Plus className="h-4 w-4" /> 新增廣告</Link>;

    return (
        <AdminLayout title="廣告管理" actions={actions}>
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-500"><Megaphone className="h-4 w-4 text-sky-500" /> 共 <span className="font-bold text-slate-700">{items.length}</span> 則廣告，分 4 個版位</div>
            <div className="grid gap-4 lg:grid-cols-2">
                {items.map((b) => (
                    <div key={b.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                        <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-slate-200">
                            {b.image ? <img src={b.image} alt="" className="h-full w-full object-cover" /> : <div className={cn('h-full w-full bg-gradient-to-br', b.accent || 'from-slate-300 to-slate-400')} />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className={cn('rounded-full px-2 py-0.5 text-xs font-bold', zoneColor[b.zone] || 'bg-slate-100 text-slate-600')}>{zoneLabel[b.zone] ?? b.zone}</span>
                                <StatusPill active={b.is_active} onClick={() => toggle(b.id)} onLabel="啟用中" offLabel="停用" />
                            </div>
                            <div className="mt-1.5 truncate font-bold text-slate-900">{b.title || b.subtitle || b.body?.slice(0, 30) || '（無標題）'}</div>
                            {b.url && <div className="truncate text-xs text-slate-400">{b.url}</div>}
                        </div>
                        <div className="flex shrink-0 items-center gap-0.5">
                            <Link href={`/admin/banners/${b.id}/edit`} title="編輯" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-sky-100 hover:text-sky-600"><Pencil className="h-4 w-4" /></Link>
                            <IconBtn onClick={() => remove(b.id)} title="刪除" tone="rose"><Trash2 className="h-4 w-4" /></IconBtn>
                        </div>
                    </div>
                ))}
                {items.length === 0 && <div className="col-span-full rounded-2xl border border-slate-200 bg-white py-16 text-center text-slate-400">尚無廣告，點右上角新增。</div>}
            </div>
        </AdminLayout>
    );
}
