import { Link, useForm } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import { Save, X, HelpCircle, Sparkles, Loader2, ArrowUpDown, Layers } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { inputCls, labelCls, errCls, helpCls, Card, PublishToggle, useAi } from '@/components/admin/ui';

type Item = { id: number; group: string; question: string; answer: string; sort?: number; is_published: boolean };

const GROUPS = ['一般', '服務流程', '報價合作', '技術', '售後支援'];

export default function FaqForm({ item }: { item: Item | null }) {
    const editing = !!item;
    const ai = useAi();
    const [preview, setPreview] = useState(false);
    const { data, setData, post, put, processing, errors } = useForm({
        group: item?.group ?? '一般', question: item?.question ?? '', answer: item?.answer ?? '',
        sort: item?.sort ?? 0, is_published: item?.is_published ?? true,
    });
    const customGroup = !!data.group && !GROUPS.includes(data.group);
    const submit = (e: FormEvent) => { e.preventDefault(); editing ? put(`/admin/faqs/${item!.id}`) : post('/admin/faqs'); };
    const runAi = async () => {
        if (data.answer.trim() && !confirm('將以 AI 產生的答案覆蓋現有答案，確定嗎？')) return;
        const r = await ai.run('faq', data.question);
        if (r?.answer) setData('answer', r.answer);
    };

    const actions = (
        <>
            <Link href="/admin/faqs" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"><X className="h-4 w-4" /> 取消</Link>
            <button type="submit" form="faq-form" disabled={processing} className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-60"><Save className="h-4 w-4" /> {editing ? '儲存變更' : '新增問答'}</button>
        </>
    );

    return (
        <AdminLayout title={editing ? '編輯問答' : '新增問答'} actions={actions}>
            <form id="faq-form" onSubmit={submit} className="mx-auto max-w-4xl space-y-6">
                <Card title="問題與答案" icon={HelpCircle} right={
                    <button type="button" onClick={runAi} disabled={ai.loading} className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100 disabled:opacity-60">
                        {ai.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}{ai.loading ? 'AI 撰寫中…' : 'AI 依問題產生答案'}
                    </button>
                }>
                    {ai.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{ai.error}</p>}
                    <div>
                        <label className={labelCls}>問題 *</label>
                        <input className={cn(inputCls, 'text-base font-semibold')} value={data.question} onChange={(e) => setData('question', e.target.value)} placeholder="例如：專案大約需要多久時間？" />
                        {errors.question && <p className={errCls}>{errors.question}</p>}
                    </div>
                    <div>
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                            <label className={cn(labelCls, 'mb-0')}>答案 *（可用 HTML）</label>
                            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 text-xs font-semibold">
                                <button type="button" onClick={() => setPreview(false)} className={cn('rounded-md px-3 py-1 transition', !preview ? 'bg-sky-500 text-white' : 'text-slate-500 hover:text-slate-700')}>編輯</button>
                                <button type="button" onClick={() => setPreview(true)} className={cn('rounded-md px-3 py-1 transition', preview ? 'bg-sky-500 text-white' : 'text-slate-500 hover:text-slate-700')}>預覽</button>
                            </div>
                        </div>
                        {preview ? (
                            <div className="min-h-[160px] rounded-lg border border-slate-200 bg-white p-5">
                                {data.answer.trim() ? <article className="prose prose-slate max-w-none prose-a:text-sky-600" dangerouslySetInnerHTML={{ __html: data.answer }} /> : <p className="text-sm text-slate-400">（尚無答案）</p>}
                            </div>
                        ) : (
                            <textarea rows={8} className={cn(inputCls, 'font-mono text-[13px] leading-relaxed')} value={data.answer} onChange={(e) => setData('answer', e.target.value)} placeholder="<p>答案內容…</p>" />
                        )}
                        {errors.answer && <p className={errCls}>{errors.answer}</p>}
                    </div>
                </Card>

                <Card title="分組與顯示" icon={Layers}>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                            <label className={labelCls}>分組</label>
                            <select className={inputCls} value={customGroup ? '' : data.group} onChange={(e) => setData('group', e.target.value)}>
                                {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                                {customGroup && <option value={data.group}>{data.group}</option>}
                            </select>
                            <p className={helpCls}>同分組的問答會在前台歸在一起。</p>
                        </div>
                        <div><label className={labelCls}><ArrowUpDown className="h-4 w-4 text-slate-400" /> 排序</label><input type="number" className={inputCls} value={data.sort} onChange={(e) => setData('sort', Number(e.target.value))} /></div>
                    </div>
                    <PublishToggle checked={data.is_published} onChange={(v) => setData('is_published', v)} onLabel="顯示於前台" offLabel="隱藏" onHint="會出現在前台常見問題。" offHint="不顯示於前台。" />
                </Card>
            </form>
        </AdminLayout>
    );
}
