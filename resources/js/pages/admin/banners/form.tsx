import { Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import { Save, X, Megaphone, Image as ImageIcon, Link2, Palette, ArrowUpDown, Settings2 } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { inputCls, labelCls, errCls, helpCls, Card, PublishToggle, ImageUploadButton } from '@/components/admin/ui';

type Banner = { id: number; zone: string; title?: string; subtitle?: string; body?: string; image?: string; url?: string; cta_label?: string; accent?: string; sort?: number; is_active: boolean };

const ZONES = [['announcement', '頂部公告條'], ['carousel', 'Hero 輪播'], ['promo', '推廣橫幅'], ['floating', '浮動廣告']];
const GRADIENTS = ['from-sky-600 to-cyan-500', 'from-indigo-600 to-sky-500', 'from-emerald-600 to-teal-500', 'from-violet-600 to-fuchsia-500', 'from-rose-500 to-orange-400', 'from-amber-500 to-yellow-400', 'from-slate-700 to-slate-900', 'from-blue-700 to-indigo-600'];

export default function BannerForm({ item }: { item: Banner | null }) {
    const editing = !!item;
    const { data, setData, post, put, processing, errors } = useForm({
        zone: item?.zone ?? 'carousel', title: item?.title ?? '', subtitle: item?.subtitle ?? '',
        body: item?.body ?? '', image: item?.image ?? '', url: item?.url ?? '',
        cta_label: item?.cta_label ?? '', accent: item?.accent ?? '', sort: item?.sort ?? 0, is_active: item?.is_active ?? true,
    });
    const submit = (e: FormEvent) => { e.preventDefault(); editing ? put(`/admin/banners/${item!.id}`) : post('/admin/banners'); };

    const actions = (
        <>
            <Link href="/admin/banners" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"><X className="h-4 w-4" /> 取消</Link>
            <button type="submit" form="banner-form" disabled={processing} className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-60"><Save className="h-4 w-4" /> {editing ? '儲存變更' : '新增廣告'}</button>
        </>
    );

    return (
        <AdminLayout title={editing ? '編輯廣告' : '新增廣告'} actions={actions}>
            <form id="banner-form" onSubmit={submit} className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-6">
                    <Card title="文案內容" icon={Megaphone}>
                        <div><label className={labelCls}>主標題</label><input className={cn(inputCls, 'text-base font-semibold')} value={data.title} onChange={(e) => setData('title', e.target.value)} /></div>
                        <div><label className={labelCls}>副標 / 小標</label><input className={inputCls} value={data.subtitle} onChange={(e) => setData('subtitle', e.target.value)} /></div>
                        <div><label className={labelCls}>內文</label><textarea rows={3} className={inputCls} value={data.body} onChange={(e) => setData('body', e.target.value)} /></div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div><label className={labelCls}><Link2 className="h-4 w-4 text-slate-400" /> 連結網址</label><input className={inputCls} value={data.url} onChange={(e) => setData('url', e.target.value)} placeholder="/contact 或 https://…" /></div>
                            <div><label className={labelCls}>按鈕文字</label><input className={inputCls} value={data.cta_label} onChange={(e) => setData('cta_label', e.target.value)} placeholder="免費體驗" /></div>
                        </div>
                    </Card>

                    <Card title="圖片" icon={ImageIcon}>
                        {data.image && <div className="overflow-hidden rounded-xl border border-slate-200"><img src={data.image} alt="" className="max-h-48 w-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0.2')} /></div>}
                        <div>
                            <label className={labelCls}>圖片網址</label>
                            <input className={inputCls} value={data.image} onChange={(e) => setData('image', e.target.value)} placeholder="https://…/banner.jpg（選填）" />
                            <div className="mt-2"><ImageUploadButton onUploaded={(url) => setData('image', url)} /></div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
                    <Card title="版位設定" icon={Settings2}>
                        <PublishToggle checked={data.is_active} onChange={(v) => setData('is_active', v)} onLabel="啟用中" offLabel="停用" onHint="會顯示於前台對應版位。" offHint="不顯示於前台。" />
                        <div>
                            <label className={labelCls}>版位 *</label>
                            <select className={inputCls} value={data.zone} onChange={(e) => setData('zone', e.target.value)}>{ZONES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                            {errors.zone && <p className={errCls}>{errors.zone}</p>}
                        </div>
                        <div><label className={labelCls}><ArrowUpDown className="h-4 w-4 text-slate-400" /> 排序（小到大）</label><input type="number" className={inputCls} value={data.sort} onChange={(e) => setData('sort', Number(e.target.value))} /></div>
                    </Card>

                    <Card title="漸層配色" icon={Palette}>
                        <div className={cn('flex h-20 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-semibold text-white/90', data.accent || 'from-slate-400 to-slate-500')}>預覽</div>
                        <div className="grid grid-cols-4 gap-2">
                            {GRADIENTS.map((g) => <button key={g} type="button" onClick={() => setData('accent', g)} title={g} className={cn('h-9 rounded-lg bg-gradient-to-br ring-2 ring-offset-1 transition', g, data.accent === g ? 'ring-sky-500' : 'ring-transparent hover:ring-slate-300')} />)}
                        </div>
                        <p className={helpCls}>未設圖片時，版位以此漸層為底色。</p>
                    </Card>
                </div>
            </form>
        </AdminLayout>
    );
}
