import { router, useForm } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import { Sparkles, Image as ImageIcon, Newspaper, ShieldCheck } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';

const fld = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100';
const lbl = 'mb-1.5 block text-sm font-semibold text-slate-700';

type Props = {
    gemini_api_keys: string; gemini_model: string; gemini_models: string[]; insights_daily_count: string;
    cf_account_id: string; cf_api_token: string; cf_image_model: string;
    turnstile_site_key: string; turnstile_secret_key: string;
};

function CardHead({ icon: Icon, title, desc }: { icon: typeof Sparkles; title: string; desc?: string }) {
    return (
        <div className="mb-5 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600"><Icon className="h-5 w-5" /></div>
            <div>
                <h2 className="text-base font-bold text-slate-900">{title}</h2>
                {desc && <p className="text-xs text-slate-400">{desc}</p>}
            </div>
        </div>
    );
}

export default function Integrations(props: Props) {
    const { data, setData, put, processing } = useForm({
        gemini_api_keys: props.gemini_api_keys ?? '',
        gemini_model: props.gemini_model ?? 'gemini-2.5-flash',
        insights_daily_count: props.insights_daily_count ?? '2',
        cf_account_id: props.cf_account_id ?? '',
        cf_api_token: props.cf_api_token ?? '',
        cf_image_model: props.cf_image_model ?? '@cf/black-forest-labs/flux-1-schnell',
        turnstile_site_key: props.turnstile_site_key ?? '',
        turnstile_secret_key: props.turnstile_secret_key ?? '',
    });
    const modelOptions = Array.from(new Set([data.gemini_model, ...(props.gemini_models ?? [])].filter(Boolean)));
    const save = (e: FormEvent) => { e.preventDefault(); put('/admin/integrations', { preserveScroll: true }); };
    const [fetching, setFetching] = useState(false);
    const fetchNow = () => {
        setFetching(true);
        router.post('/admin/integrations/fetch', {}, { preserveScroll: true, onFinish: () => setFetching(false) });
    };
    const [testing, setTesting] = useState(false);
    const [keyResults, setKeyResults] = useState<{ key: string; ok: boolean; message: string }[] | null>(null);
    const testKeys = async () => {
        setTesting(true); setKeyResults(null);
        try {
            const res = await fetch('/admin/integrations/test', { headers: { Accept: 'application/json' } });
            const json = await res.json();
            setKeyResults(json.results ?? []);
        } catch { setKeyResults([]); } finally { setTesting(false); }
    };

    return (
        <AdminLayout title="整合設定 (AI)">
            <form onSubmit={save}>
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    {/* Gemini */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <CardHead icon={Sparkles} title="Gemini AI（文案與技術洞察）" desc="用於 AI 產生草稿、每日技術洞察摘要" />
                        <div className="space-y-5">
                            <div>
                                <label className={lbl}>Gemini API Keys（一行一把，可多把輪巡）</label>
                                <textarea rows={5} autoComplete="off" spellCheck={false} className={`${fld} font-mono`} value={data.gemini_api_keys} onChange={(e) => setData('gemini_api_keys', e.target.value)} placeholder={'每行貼一把金鑰，可貼多把：\nAIza...第1把\nAIza...第2把\n…最多建議 5 把'} />
                                <p className="mt-1 text-xs text-slate-400">
                                    已填入 <span className="font-semibold text-emerald-600">{data.gemini_api_keys.split(/[\r\n,]+/).map((k) => k.trim()).filter(Boolean).length}</span> 把。系統會自動輪巡、遇配額限制（429）自動換下一把，以分散用量、降低成本。於 <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-sky-600 hover:underline">Google AI Studio</a> 取得。
                                </p>
                                <div className="mt-3 border-t border-slate-100 pt-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-slate-700">測試所有金鑰</span>
                                        <button type="button" onClick={testKeys} disabled={testing} className="rounded-full border border-sky-300 px-4 py-1.5 text-sm font-bold text-sky-600 transition hover:bg-sky-50 disabled:opacity-60">{testing ? '測試中⋯' : '測試'}</button>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-400">先儲存設定，再逐一檢查每把金鑰是否可用（送極小請求，幾乎不耗額度）。</p>
                                    {keyResults && (
                                        <ul className="mt-2 space-y-1.5">
                                            {keyResults.length === 0 && <li className="text-sm text-slate-400">沒有可測試的金鑰（請先儲存）</li>}
                                            {keyResults.map((r, i) => (
                                                <li key={i} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-1.5 text-sm">
                                                    <span className="font-mono text-slate-600">{r.key}</span>
                                                    <span className={r.ok ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-500'}>{r.ok ? '✓ ' : '✗ '}{r.message}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className={lbl}>Gemini 模型</label>
                                    <select className={fld} value={data.gemini_model} onChange={(e) => setData('gemini_model', e.target.value)}>
                                        {modelOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <p className="mt-1 text-xs text-slate-400">建議 gemini-2.5-flash（清單由 API 動態取得）。</p>
                                </div>
                                <div>
                                    <label className={lbl}>每日自動產生則數（1–3）</label>
                                    <input type="number" min={1} max={3} className={fld} value={data.insights_daily_count} onChange={(e) => setData('insights_daily_count', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Cloudflare Workers AI */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <CardHead icon={ImageIcon} title="Cloudflare Workers AI（封面圖生成）" desc="用於編輯頁「AI 生成封面圖」，免費額度內" />
                        <div className="space-y-5">
                            <div>
                                <label className={lbl}>Account ID</label>
                                <input type="text" autoComplete="off" spellCheck={false} className={`${fld} font-mono`} value={data.cf_account_id} onChange={(e) => setData('cf_account_id', e.target.value)} placeholder="Cloudflare 帳號 ID" />
                            </div>
                            <div>
                                <label className={lbl}>API Token（需 Workers AI 權限）</label>
                                <input type="text" autoComplete="off" spellCheck={false} className={`${fld} font-mono`} value={data.cf_api_token} onChange={(e) => setData('cf_api_token', e.target.value)} placeholder="Cloudflare API Token" />
                                <p className="mt-1 text-xs text-slate-400">
                                    狀態：{data.cf_api_token ? <span className="font-semibold text-emerald-600">已填入 ✓</span> : <span className="font-semibold text-rose-500">未設定</span>}
                                    ．在 Cloudflare → 我的個人檔案 → API Tokens 建立，權限選 <span className="font-mono">Workers AI（Read+Run）</span>
                                </p>
                            </div>
                            <div>
                                <label className={lbl}>生圖模型</label>
                                <select className={fld} value={data.cf_image_model} onChange={(e) => setData('cf_image_model', e.target.value)}>
                                    <option value="@cf/black-forest-labs/flux-1-schnell">Flux.1 schnell（推薦，快）</option>
                                    <option value="@cf/stabilityai/stable-diffusion-xl-base-1.0">Stable Diffusion XL</option>
                                </select>
                            </div>
                        </div>
                    </section>
                    {/* Cloudflare Turnstile（登入驗證碼） */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
                        <CardHead icon={ShieldCheck} title="Cloudflare Turnstile（後台登入驗證碼）" desc="防止機器人暴力登入。免費、無需點選圖片。留空則不啟用驗證。" />
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className={lbl}>Site Key（網站金鑰，公開）</label>
                                <input type="text" autoComplete="off" spellCheck={false} className={`${fld} font-mono`} value={data.turnstile_site_key} onChange={(e) => setData('turnstile_site_key', e.target.value)} placeholder="0x4AAAAAAA..." />
                            </div>
                            <div>
                                <label className={lbl}>Secret Key（密鑰，保密）</label>
                                <input type="text" autoComplete="off" spellCheck={false} className={`${fld} font-mono`} value={data.turnstile_secret_key} onChange={(e) => setData('turnstile_secret_key', e.target.value)} placeholder="0x4AAAAAAA..." />
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-slate-400">
                            狀態：{data.turnstile_site_key && data.turnstile_secret_key ? <span className="font-semibold text-emerald-600">已啟用，登入頁會顯示驗證 ✓</span> : <span className="font-semibold text-slate-500">未設定（登入頁不顯示驗證）</span>}
                            ．於 Cloudflare → Turnstile → Add widget 建立（hostname 填 <span className="font-mono">jwisdom.com.tw</span>，Mode 選 Managed），取得 Site Key 與 Secret Key。
                        </p>
                    </section>
                </div>

                <button type="submit" disabled={processing} className="mt-6 rounded-full bg-sky-500 px-6 py-2.5 font-bold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-60">儲存設定</button>
            </form>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <CardHead icon={Newspaper} title="技術洞察自動產生" desc="每日 08:30 自動抓產業新聞並用 Gemini 生成繁中摘要" />
                <button onClick={fetchNow} disabled={fetching} className="rounded-full border border-sky-300 px-6 py-2.5 font-bold text-sky-600 transition hover:bg-sky-50 disabled:opacity-60">
                    {fetching ? '抓取中⋯（約 10–30 秒）' : '立即抓取一則'}
                </button>
                <p className="mt-3 text-xs text-slate-400">抓取結果會顯示在頁面上方提示列；新洞察會出現在「技術洞察」與前台。</p>
            </div>
        </AdminLayout>
    );
}
