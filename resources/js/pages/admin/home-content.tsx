import { useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import { Save, Plus, Trash2, Award, Workflow } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { inputCls, labelCls, Card } from '@/components/admin/ui';

type Why = { title: string; desc: string };
type Step = { title: string; desc: string };

export default function HomeContent({ why, process }: { why: Why[]; process: Step[] }) {
    const { data, setData, put, processing } = useForm({
        why: why.length ? why : [{ title: '', desc: '' }],
        process: process.length ? process : [{ title: '', desc: '' }],
    });
    const submit = (e: FormEvent) => { e.preventDefault(); put('/admin/home-content', { preserveScroll: true }); };

    const upd = <T,>(key: 'why' | 'process', i: number, field: string, value: string) => {
        const arr = [...(data[key] as T[])] as Record<string, string>[];
        arr[i] = { ...arr[i], [field]: value };
        setData(key, arr as never);
    };
    const add = (key: 'why' | 'process', blank: Record<string, string>) => setData(key, [...(data[key] as Record<string, string>[]), blank] as never);
    const del = (key: 'why' | 'process', i: number) => setData(key, (data[key] as Record<string, string>[]).filter((_, idx) => idx !== i) as never);

    const actions = (
        <button type="submit" form="home-content-form" disabled={processing} className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-60"><Save className="h-4 w-4" /> 儲存變更</button>
    );

    const addBtn = (onClick: () => void, label: string) => (
        <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-3.5 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100"><Plus className="h-3.5 w-3.5" /> {label}</button>
    );
    const delBtn = (onClick: () => void) => (
        <button type="button" onClick={onClick} title="刪除" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-100 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
    );

    return (
        <AdminLayout title="首頁區塊" actions={actions}>
            <form id="home-content-form" onSubmit={submit} className="space-y-6">
                <Card title="為什麼選擇我們" icon={Award} right={addBtn(() => add('why', { title: '', desc: '' }), '新增一項')}>
                    {data.why.map((w, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sm font-bold text-sky-600">{String(i + 1).padStart(2, '0')}</div>
                            <div className="grid flex-1 gap-3 sm:grid-cols-[200px_1fr]">
                                <input className={inputCls} value={w.title} onChange={(e) => upd('why', i, 'title', e.target.value)} placeholder="標題（如 策略先行）" />
                                <input className={inputCls} value={w.desc} onChange={(e) => upd('why', i, 'desc', e.target.value)} placeholder="說明文字" />
                            </div>
                            {delBtn(() => del('why', i))}
                        </div>
                    ))}
                </Card>

                <Card title="合作流程" icon={Workflow} right={addBtn(() => add('process', { title: '', desc: '' }), '新增步驟')}>
                    {data.process.map((p, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-600">{String(i + 1).padStart(2, '0')}</div>
                            <div className="grid flex-1 gap-3 sm:grid-cols-[200px_1fr]">
                                <input className={inputCls} value={p.title} onChange={(e) => upd('process', i, 'title', e.target.value)} placeholder="步驟名稱（如 需求諮詢）" />
                                <input className={inputCls} value={p.desc} onChange={(e) => upd('process', i, 'desc', e.target.value)} placeholder="說明文字" />
                            </div>
                            {delBtn(() => del('process', i))}
                        </div>
                    ))}
                </Card>

                <p className="text-center text-sm text-slate-400">策略夥伴 Logo 已移至獨立的「<a href="/admin/partners" className="font-semibold text-sky-600 hover:underline">策略夥伴</a>」管理（適合大量 Logo）。</p>
            </form>
        </AdminLayout>
    );
}
