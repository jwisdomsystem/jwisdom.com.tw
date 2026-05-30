import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Crop, Eye, EyeOff, Sparkles, Target, Upload, Loader2, X, ZoomIn, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/** 共用：把 Blob 上傳到 /admin/uploads/image，回傳網址（失敗丟出錯誤訊息）。 */
async function uploadImageBlob(blob: Blob, filename: string): Promise<string> {
    const xsrf = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || '');
    const fd = new FormData();
    fd.append('file', blob, filename);
    const r = await fetch('/admin/uploads/image', {
        method: 'POST',
        headers: { Accept: 'application/json', 'X-XSRF-TOKEN': xsrf },
        credentials: 'same-origin',
        body: fd,
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.url) throw new Error(j.message || `上傳失敗（${r.status}）`);
    return j.url as string;
}

/** 上傳圖片按鈕：選檔→上傳到 /admin/uploads/image→回呼網址。 */
export function ImageUploadButton({ onUploaded, label = '上傳圖片' }: { onUploaded: (url: string) => void; label?: string }) {
    const ref = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError(null);
        setLoading(true);
        try {
            const xsrf = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || '');
            const fd = new FormData();
            fd.append('file', file);
            const r = await fetch('/admin/uploads/image', {
                method: 'POST',
                headers: { Accept: 'application/json', 'X-XSRF-TOKEN': xsrf },
                credentials: 'same-origin',
                body: fd,
            });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) { setError(j.message || `上傳失敗（${r.status}）`); return; }
            if (j.url) onUploaded(j.url);
        } catch {
            setError('上傳失敗，請稍後再試。');
        } finally {
            setLoading(false);
            if (ref.current) ref.current.value = '';
        }
    };

    return (
        <span className="inline-flex flex-col">
            <button type="button" onClick={() => ref.current?.click()} disabled={loading} className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-60">
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}{loading ? '上傳中…' : label}
            </button>
            <input ref={ref} type="file" accept="image/*" className="hidden" onChange={onChange} />
            {error && <span className="mt-1 text-xs font-medium text-red-500">{error}</span>}
        </span>
    );
}

/**
 * 圖片裁切 Modal：拖曳平移 + 縮放滑桿，把圖片裁成指定比例（預設 16:9），
 * 輸出 webp 後上傳，回傳新網址。適合處理「圖片太大／構圖被切掉」的情況。
 */
export function CropModal({ src, aspect = 16 / 9, onClose, onCropped }: {
    src: string; aspect?: number; onClose: () => void; onCropped: (url: string) => void;
}) {
    const FRAME_W = 480;
    const FRAME_H = Math.round(FRAME_W / aspect);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
    const [base, setBase] = useState(1); // 剛好覆蓋裁切框的最小縮放
    const [zoom, setZoom] = useState(1); // base 的倍率（1~4）
    const [pos, setPos] = useState({ x: 0, y: 0 }); // 圖片左上角相對裁切框（顯示 px，<=0）
    const [loadErr, setLoadErr] = useState(false);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const drag = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);

    const scale = base * zoom;

    const clampPos = useCallback((x: number, y: number, s: number, n: { w: number; h: number }) => {
        const minX = FRAME_W - n.w * s, minY = FRAME_H - n.h * s;
        return { x: Math.min(0, Math.max(minX, x)), y: Math.min(0, Math.max(minY, y)) };
    }, [FRAME_W, FRAME_H]);

    const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const el = e.currentTarget;
        const n = { w: el.naturalWidth, h: el.naturalHeight };
        const b = Math.max(FRAME_W / n.w, FRAME_H / n.h);
        setNat(n); setBase(b); setZoom(1);
        setPos({ x: (FRAME_W - n.w * b) / 2, y: (FRAME_H - n.h * b) / 2 });
    };

    const onPointerDown = (e: React.PointerEvent) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        drag.current = { px: e.clientX, py: e.clientY, ox: pos.x, oy: pos.y };
    };
    const onPointerMove = (e: React.PointerEvent) => {
        if (!drag.current || !nat) return;
        const nx = drag.current.ox + (e.clientX - drag.current.px);
        const ny = drag.current.oy + (e.clientY - drag.current.py);
        setPos(clampPos(nx, ny, scale, nat));
    };
    const onPointerUp = () => { drag.current = null; };

    const onZoom = (z: number) => {
        if (!nat) { setZoom(z); return; }
        const s2 = base * z;
        // 以裁切框中心為焦點縮放
        const fx = (FRAME_W / 2 - pos.x) / scale, fy = (FRAME_H / 2 - pos.y) / scale;
        const nx = FRAME_W / 2 - fx * s2, ny = FRAME_H / 2 - fy * s2;
        setZoom(z);
        setPos(clampPos(nx, ny, s2, nat));
    };

    const apply = async () => {
        if (!nat || !imgRef.current) return;
        setErr(null); setBusy(true);
        try {
            const outW = Math.min(1600, Math.round(nat.w));
            const outH = Math.round(outW / aspect);
            const canvas = document.createElement('canvas');
            canvas.width = outW; canvas.height = outH;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('瀏覽器不支援 canvas。');
            const srcX = -pos.x / scale, srcY = -pos.y / scale;
            const srcW = FRAME_W / scale, srcH = FRAME_H / scale;
            ctx.drawImage(imgRef.current, srcX, srcY, srcW, srcH, 0, 0, outW, outH);
            const blob: Blob = await new Promise((res, rej) =>
                canvas.toBlob((b) => (b ? res(b) : rej(new Error('裁切失敗'))), 'image/webp', 0.85));
            const url = await uploadImageBlob(blob, `crop-${Date.now()}.webp`);
            onCropped(url);
            onClose();
        } catch (e) {
            setErr(e instanceof Error ? e.message : '裁切失敗，若為外部圖片網址請先「上傳圖片」後再裁切。');
        } finally {
            setBusy(false);
        }
    };

    useEffect(() => {
        const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', esc);
        return () => window.removeEventListener('keydown', esc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" onMouseDown={onClose}>
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl" onMouseDown={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800"><Crop className="h-[18px] w-[18px] text-sky-500" /> 裁切封面（16:9）</h3>
                    <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button>
                </div>
                <div className="space-y-4 p-5">
                    <div
                        className="relative mx-auto touch-none overflow-hidden rounded-xl border border-slate-200 bg-slate-100 select-none"
                        style={{ width: FRAME_W, height: FRAME_H, cursor: drag.current ? 'grabbing' : 'grab' }}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={onPointerUp}
                    >
                        <img
                            ref={imgRef}
                            src={src}
                            crossOrigin="anonymous"
                            alt="裁切預覽"
                            draggable={false}
                            onLoad={onImgLoad}
                            onError={() => setLoadErr(true)}
                            className="pointer-events-none absolute max-w-none"
                            style={{ left: pos.x, top: pos.y, width: nat ? nat.w * scale : undefined, height: nat ? nat.h * scale : undefined }}
                        />
                        {/* 構圖參考線 */}
                        <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                            {Array.from({ length: 9 }).map((_, i) => <div key={i} className="border border-white/20" />)}
                        </div>
                    </div>
                    {loadErr && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">圖片載入失敗或為外部網址，請改用「上傳圖片」後再裁切。</p>}
                    <div className="flex items-center gap-3">
                        <ZoomIn className="h-4 w-4 shrink-0 text-slate-400" />
                        <input type="range" min={1} max={4} step={0.01} value={zoom} onChange={(e) => onZoom(Number(e.target.value))} className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-sky-500" />
                    </div>
                    <p className="text-xs text-slate-400">拖曳圖片調整位置、滑桿縮放，框內範圍即為前台顯示的封面。</p>
                    {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{err}</p>}
                    <div className="flex justify-end gap-2 pt-1">
                        <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100">取消</button>
                        <button type="button" onClick={apply} disabled={busy || !nat} className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-60">
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crop className="h-4 w-4" />}{busy ? '處理中…' : '套用裁切'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** 裁切按鈕：開啟 CropModal，裁切完成後回呼新網址。沒有 src 時不顯示。 */
export function CropButton({ src, aspect, onCropped }: { src?: string; aspect?: number; onCropped: (url: string) => void }) {
    const [open, setOpen] = useState(false);
    if (!src) return null;
    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100" title="裁切／調整封面構圖">
                <Crop className="h-3.5 w-3.5" /> 裁切調整
            </button>
            {open && <CropModal src={src} aspect={aspect} onClose={() => setOpen(false)} onCropped={onCropped} />}
        </>
    );
}

/** 呼叫 /admin/ai/generate 產生文案。回傳的物件依 kind 含 excerpt/body/summary/answer。 */
export function useAi() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const run = async (kind: 'news' | 'insight' | 'work' | 'service' | 'faq', subject: string): Promise<Record<string, string> | null> => {
        if (!subject.trim()) { setError('請先輸入主題（標題／名稱／問題）。'); return null; }
        setError(null);
        setLoading(true);
        try {
            const xsrf = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || '');
            const r = await fetch('/admin/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': xsrf },
                credentials: 'same-origin',
                body: JSON.stringify({ title: subject, kind }),
            });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) { setError(j.message || `產生失敗（${r.status}）`); return null; }
            return j as Record<string, string>;
        } catch {
            setError('連線失敗，請稍後再試。');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, setError, run };
}

/** 呼叫 /admin/ai/generate-image，回傳封面圖網址。 */
export function useAiImage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const run = async (kind: 'news' | 'insight' | 'work' | 'service', subject: string): Promise<string | null> => {
        if (!subject.trim()) { setError('請先輸入標題／名稱，AI 會依此生成封面。'); return null; }
        setError(null);
        setLoading(true);
        try {
            const xsrf = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || '');
            const r = await fetch('/admin/ai/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': xsrf },
                credentials: 'same-origin',
                body: JSON.stringify({ title: subject, kind }),
            });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) { setError(j.message || `生成失敗（${r.status}）`); return null; }
            return (j.cover as string) || null;
        } catch {
            setError('連線失敗，請稍後再試。');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, setError, run };
}

export type AngleVariation = {
    angle: string;
    angle_label: string;
    title: string;
    excerpt: string;
    meta_description: string;
};

/**
 * 「3 角度標題與摘要」測試按鈕（依 ad-creative 多版本測試思維）。
 * 按下後讓 AI 用 3 種不同切入動機產出 3 組「標題 + 摘要 + SEO 描述」，由使用者挑最強的版本套用。
 */
export function HeadlinesButton({ kind, title, excerptLabel = '摘要', onApply }: {
    kind: 'news' | 'insight' | 'work' | 'service';
    title: string;
    excerptLabel?: string;
    onApply: (v: AngleVariation) => void;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [variations, setVariations] = useState<AngleVariation[]>([]);

    const run = async () => {
        if (!title.trim()) { setError('請先輸入標題／名稱，AI 會依此產出 3 個角度版本。'); setOpen(true); return; }
        setError(null);
        setVariations([]);
        setOpen(true);
        setLoading(true);
        try {
            const xsrf = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || '');
            const r = await fetch('/admin/ai/headlines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': xsrf },
                credentials: 'same-origin',
                body: JSON.stringify({ kind, title }),
            });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) { setError(j.message || `產生失敗（${r.status}）`); return; }
            setVariations(j.variations ?? []);
        } catch {
            setError('連線失敗，請稍後再試。');
        } finally {
            setLoading(false);
        }
    };

    const apply = (v: AngleVariation) => {
        onApply(v);
        setOpen(false);
    };

    useEffect(() => {
        if (!open) return;
        const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', esc);
        return () => window.removeEventListener('keydown', esc);
    }, [open]);

    return (
        <>
            <button type="button" onClick={run} className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-200 bg-fuchsia-50 px-3.5 py-1.5 text-xs font-bold text-fuchsia-600 transition hover:bg-fuchsia-100" title="依 ad-creative 多版本測試思維，產出 3 個不同切入角度的標題／摘要／SEO 描述">
                <Target className="h-3.5 w-3.5" /> 3 角度試試看
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4" onMouseDown={() => setOpen(false)}>
                    <div className="my-8 w-full max-w-4xl rounded-2xl bg-white shadow-xl" onMouseDown={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                <Target className="h-[18px] w-[18px] text-fuchsia-500" /> 3 個角度版本（挑一個套用）
                            </h3>
                            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="space-y-4 p-5">
                            {loading && (
                                <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-slate-500">
                                    <Loader2 className="h-6 w-6 animate-spin text-fuchsia-500" />
                                    AI 正在用 3 種角度撰寫…約需 5–10 秒
                                </div>
                            )}
                            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}
                            {!loading && variations.length > 0 && (
                                <div className="space-y-4">
                                    <p className="text-xs text-slate-500">套用 ad-creative 多版本測試思維。三個版本切入 3 種不同的讀者點擊動機，點下方按鈕直接覆寫對應欄位。</p>
                                    {variations.map((v, idx) => (
                                        <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-fuchsia-300 hover:shadow-sm">
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <span className={cn(
                                                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold',
                                                    v.angle === 'pain' ? 'bg-rose-100 text-rose-700' : v.angle === 'outcome' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                                                )}>{v.angle_label}</span>
                                                <button type="button" onClick={() => apply(v)} className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-fuchsia-600">套用此版本 →</button>
                                            </div>
                                            <div className="space-y-2">
                                                <div>
                                                    <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">標題（{v.title.length} 字）</div>
                                                    <div className="mt-0.5 text-base font-bold text-slate-900">{v.title}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{excerptLabel}（{v.excerpt.length} 字）</div>
                                                    <div className="mt-0.5 text-sm text-slate-700">{v.excerpt}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">SEO 描述（{v.meta_description.length} 字）</div>
                                                    <div className="mt-0.5 text-sm text-slate-500">{v.meta_description}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export function AiButton({ loading, onClick, label = 'AI 產生草稿' }: { loading: boolean; onClick: () => void; label?: string }) {
    return (
        <button type="button" onClick={onClick} disabled={loading} className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100 disabled:opacity-60">
            <Sparkles className={cn('h-3.5 w-3.5', loading && 'animate-pulse')} />
            {loading ? 'AI 撰寫中…' : label}
        </button>
    );
}

export const inputCls =
    'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100';
export const labelCls = 'mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700';
export const helpCls = 'mt-1 text-xs text-slate-400';
export const errCls = 'mt-1 text-xs font-medium text-red-500';

export function Card({ title, icon: Icon, right, children }: { title: string; icon?: LucideIcon; right?: ReactNode; children: ReactNode }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-3.5">
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    {Icon && <Icon className="h-[18px] w-[18px] text-sky-500" />}{title}
                </h2>
                {right}
            </div>
            <div className="space-y-4 p-5">{children}</div>
        </section>
    );
}

export function PublishToggle({ checked, onChange, onLabel = '已發佈', offLabel = '草稿', onHint = '前台會顯示這項內容。', offHint = '不顯示於前台。' }: {
    checked: boolean; onChange: (v: boolean) => void; onLabel?: string; offLabel?: string; onHint?: string; offHint?: string;
}) {
    return (
        <div>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={cn('flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition', checked ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50')}
            >
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    {checked ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                    {checked ? onLabel : offLabel}
                </span>
                <span className={cn('relative h-6 w-11 rounded-full transition', checked ? 'bg-emerald-500' : 'bg-slate-300')}>
                    <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
                </span>
            </button>
            <p className={helpCls}>{checked ? onHint : offHint}</p>
        </div>
    );
}

export function StatusPill({ active, onClick, onLabel = '顯示', offLabel = '隱藏' }: { active: boolean; onClick?: () => void; onLabel?: string; offLabel?: string }) {
    const Tag = onClick ? 'button' : 'span';
    return (
        <Tag
            {...(onClick ? { onClick, title: '點擊切換', type: 'button' as const } : {})}
            className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold transition', active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500', onClick && (active ? 'hover:bg-emerald-100' : 'hover:bg-slate-200'))}
        >
            <span className={cn('h-1.5 w-1.5 rounded-full', active ? 'bg-emerald-500' : 'bg-slate-400')} />
            {active ? onLabel : offLabel}
        </Tag>
    );
}

// 服務項目圖示（與前台 home.tsx 一致的 code/app/gov/ai/mkt）
const SERVICE_SVGS: Record<string, ReactNode> = {
    code: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>,
    app: <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></>,
    gov: <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-7h6v7" />,
    ai: <><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1M7.7 16.3l-2.1 2.1" /><circle cx="12" cy="12" r="3.5" /></>,
    mkt: <><path d="M3 11v3l16 5V6L3 11Z" /><path d="M11.5 15.5a3 3 0 0 1-5.5-1.7" /></>,
};

export function ServiceIcon({ code, className = 'h-5 w-5' }: { code?: string; className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
            {SERVICE_SVGS[code ?? 'code'] ?? SERVICE_SVGS.code}
        </svg>
    );
}

// 列表操作圖示鈕
export function IconBtn({ as = 'button', href, target, onClick, title, tone = 'slate', children }: {
    as?: 'button' | 'a' | 'link'; href?: string; target?: string; onClick?: () => void; title: string; tone?: 'slate' | 'sky' | 'rose' | 'indigo'; children: ReactNode;
}) {
    const tones: Record<string, string> = {
        slate: 'hover:bg-slate-100 hover:text-slate-700',
        sky: 'hover:bg-sky-100 hover:text-sky-600',
        rose: 'hover:bg-rose-100 hover:text-rose-600',
        indigo: 'hover:bg-indigo-100 hover:text-indigo-600',
    };
    const cls = cn('inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition', tones[tone]);
    if (as === 'a') return <a href={href} target={target} rel="noreferrer" title={title} className={cls}>{children}</a>;
    return <button type="button" onClick={onClick} title={title} className={cls}>{children}</button>;
}
