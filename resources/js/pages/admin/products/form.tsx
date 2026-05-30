import { Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import { Save, X, Package, Type, AlignLeft, Link2, ArrowUpDown, Settings2, Palette, ListChecks, Sparkles, Loader2 } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { inputCls, labelCls, errCls, helpCls, Card, PublishToggle, useAi } from '@/components/admin/ui';

type Item = { id: number; name: string; en?: string; tag?: string; description?: string; url?: string; features?: string[]; accent?: string; sort?: number; is_active: boolean };

const GRADIENTS = ['from-sky-400 to-cyan-400', 'from-indigo-400 to-sky-400', 'from-cyan-400 to-emerald-400', 'from-violet-400 to-fuchsia-400', 'from-rose-400 to-orange-400', 'from-amber-400 to-yellow-400', 'from-emerald-400 to-teal-400', 'from-blue-500 to-indigo-400'];

export default function ProductForm({ item }: { item: Item | null }) {
    const editing = !!item;
    const { data, setData, post, put, processing, errors } = useForm({
        name: item?.name ?? '', en: item?.en ?? '', tag: item?.tag ?? '', description: item?.description ?? '',
        url: item?.url ?? '', features: item?.features ?? [], accent: item?.accent ?? 'from-sky-400 to-cyan-400',
        sort: item?.sort ?? 0, is_active: item?.is_active ?? true,
    });
    const submit = (e: FormEvent) => { e.preventDefault(); editing ? put(`/admin/products/${item!.id}`) : post('/admin/products'); };

    const ai = useAi();
    const runAi = async () => {
        if (data.description.trim() && !confirm('將以 AI 產生的內容覆蓋現有介紹與特色，確定嗎？')) return;
        const r = await ai.run('product', data.name);
        if (!r) return;
        const features = Array.isArray((r as { features?: string[] }).features) ? (r as { features?: string[] }).features! : data.features;
        setData({ ...data, description: r.description || data.description, tag: data.tag || (r.tag ?? ''), features });
    };

    const actions = (
        <>
            <Link href="/admin/products" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"><X className="h-4 w-4" /> 取消</Link>
            <button type="submit" form="product-form" disabled={processing} className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-60"><Save className="h-4 w-4" /> {editing ? '儲存變更' : '新增產品'}</button>
        </>
    );

    return (
        <AdminLayout title={editing ? '編輯產品' : '新增產品'} actions={actions}>
            <form id="product-form" onSubmit={submit} className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-6">
                    <Card title="產品內容" icon={Package} right={
                        <button type="button" onClick={runAi} disabled={ai.loading} className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100 disabled:opacity-60">
                            {ai.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}{ai.loading ? 'AI 撰寫中…' : 'AI 產生文案'}
                        </button>
                    }>
                        {ai.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{ai.error}</p>}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div><label className={labelCls}><Type className="h-4 w-4 text-slate-400" /> 產品名稱 *</label><input className={cn(inputCls, 'font-semibold')} value={data.name} onChange={(e) => setData('name', e.target.value)} />{errors.name && <p className={errCls}>{errors.name}</p>}</div>
                            <div><label className={labelCls}>英文名 / 副標</label><input className={inputCls} value={data.en} onChange={(e) => setData('en', e.target.value)} placeholder="JWisdom Shop" /></div>
                        </div>
                        <div><label className={labelCls}>標籤</label><input className={inputCls} value={data.tag} onChange={(e) => setData('tag', e.target.value)} placeholder="電子商務 · 創客零件" /></div>
                        <div><label className={labelCls}><AlignLeft className="h-4 w-4 text-slate-400" /> 介紹文字</label><textarea rows={4} className={inputCls} value={data.description} onChange={(e) => setData('description', e.target.value)} /></div>
                        <div>
                            <label className={labelCls}><ListChecks className="h-4 w-4 text-slate-400" /> 特色亮點（每行一項）</label>
                            <textarea rows={4} className={cn(inputCls, 'text-[13px] leading-relaxed')} value={data.features.join('\n')} onChange={(e) => setData('features', e.target.value.split('\n'))} placeholder={'上千種開發板與模組\n線上金流與會員系統\n技術選型建議'} />
                            <p className={helpCls}>每行一個亮點，前台會以勾選清單呈現。</p>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
                    <Card title="顯示設定" icon={Settings2}>
                        <PublishToggle checked={data.is_active} onChange={(v) => setData('is_active', v)} onLabel="顯示於前台" offLabel="隱藏" onHint="會出現在首頁與頁尾。" offHint="不顯示於前台。" />
                        <div><label className={labelCls}><Link2 className="h-4 w-4 text-slate-400" /> 產品網址</label><input className={inputCls} value={data.url} onChange={(e) => setData('url', e.target.value)} placeholder="https://…" /></div>
                        <div><label className={labelCls}><ArrowUpDown className="h-4 w-4 text-slate-400" /> 排序（小到大）</label><input type="number" className={inputCls} value={data.sort} onChange={(e) => setData('sort', Number(e.target.value))} /></div>
                    </Card>
                    <Card title="配色" icon={Palette}>
                        <div className={cn('h-2 w-full rounded-full bg-gradient-to-r', data.accent || 'from-sky-400 to-cyan-400')} />
                        <div className="grid grid-cols-4 gap-2">
                            {GRADIENTS.map((g) => <button key={g} type="button" onClick={() => setData('accent', g)} title={g} className={cn('h-9 rounded-lg bg-gradient-to-br ring-2 ring-offset-1 transition', g, data.accent === g ? 'ring-sky-500' : 'ring-transparent hover:ring-slate-300')} />)}
                        </div>
                    </Card>
                </div>
            </form>
        </AdminLayout>
    );
}
