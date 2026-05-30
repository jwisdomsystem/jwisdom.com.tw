import { Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import { Save, X, Handshake, Type, Link2, ArrowUpDown, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import AdminLayout from '@/layouts/admin-layout';
import { inputCls, labelCls, errCls, helpCls, Card, PublishToggle, ImageUploadButton } from '@/components/admin/ui';

type Item = { id: number; name: string; logo?: string; url?: string; sort?: number; is_active: boolean };

export default function PartnerForm({ item }: { item: Item | null }) {
    const editing = !!item;
    const { data, setData, post, put, processing, errors } = useForm({
        name: item?.name ?? '', logo: item?.logo ?? '', url: item?.url ?? '', sort: item?.sort ?? 0, is_active: item?.is_active ?? true,
    });
    const submit = (e: FormEvent) => { e.preventDefault(); editing ? put(`/admin/partners/${item!.id}`) : post('/admin/partners'); };

    const actions = (
        <>
            <Link href="/admin/partners" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"><X className="h-4 w-4" /> 取消</Link>
            <button type="submit" form="partner-form" disabled={processing} className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-60"><Save className="h-4 w-4" /> {editing ? '儲存變更' : '新增夥伴'}</button>
        </>
    );

    return (
        <AdminLayout title={editing ? '編輯夥伴' : '新增夥伴'} actions={actions}>
            <form id="partner-form" onSubmit={submit} className="mx-auto max-w-3xl space-y-6">
                <Card title="夥伴資料" icon={Handshake}>
                    <div><label className={labelCls}><Type className="h-4 w-4 text-slate-400" /> 名稱 *</label><input className={cn(inputCls, 'font-semibold')} value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="例如 AWS" />{errors.name && <p className={errCls}>{errors.name}</p>}</div>
                    <div>
                        <label className={labelCls}><ImageIcon className="h-4 w-4 text-slate-400" /> Logo</label>
                        {data.logo && <div className="mb-2 flex h-16 w-40 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white"><img src={data.logo} alt="" className="max-h-12 max-w-[140px] object-contain" /></div>}
                        <div className="flex gap-2">
                            <input className={inputCls} value={data.logo} onChange={(e) => setData('logo', e.target.value)} placeholder="Logo 圖片網址" />
                            <ImageUploadButton onUploaded={(url) => setData('logo', url)} label="上傳" />
                        </div>
                        <p className={helpCls}>建議去背 PNG，前台會自動轉灰階、滑過顯示原色。</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div><label className={labelCls}><Link2 className="h-4 w-4 text-slate-400" /> 外連網址</label><input className={inputCls} value={data.url} onChange={(e) => setData('url', e.target.value)} placeholder="https://…（選填，點 Logo 開新分頁）" /></div>
                        <div><label className={labelCls}><ArrowUpDown className="h-4 w-4 text-slate-400" /> 排序（小到大）</label><input type="number" className={inputCls} value={data.sort} onChange={(e) => setData('sort', Number(e.target.value))} /></div>
                    </div>
                    <PublishToggle checked={data.is_active} onChange={(v) => setData('is_active', v)} onLabel="顯示於前台" offLabel="隱藏" onHint="會出現在合作夥伴跑馬燈。" offHint="不顯示於前台。" />
                </Card>
            </form>
        </AdminLayout>
    );
}
