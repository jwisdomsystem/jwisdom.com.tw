import { Eye, CalendarDays, Users, TrendingUp, Database } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

type Stats = { today: number; week: number; month: number; total: number; uniqueWeek: number };
type Trend = { date: string; count: number };
type Top = { path: string; c: number };
type Recent = { path: string; referrer?: string | null; created_at?: string };

export default function Analytics({ stats, trend, topPages, recent }: { stats: Stats; trend: Trend[]; topPages: Top[]; recent: Recent[] }) {
    const max = Math.max(1, ...trend.map((t) => t.count));
    const topMax = Math.max(1, ...topPages.map((p) => p.c));
    const cards = [
        { label: '今日瀏覽', value: stats.today, icon: Eye, tone: 'bg-sky-50 text-sky-600' },
        { label: '近 7 日瀏覽', value: stats.week, icon: CalendarDays, tone: 'bg-indigo-50 text-indigo-600' },
        { label: '近 7 日不重複訪客', value: stats.uniqueWeek, icon: Users, tone: 'bg-emerald-50 text-emerald-600' },
        { label: '近 30 日瀏覽', value: stats.month, icon: TrendingUp, tone: 'bg-amber-50 text-amber-600' },
        { label: '累計瀏覽', value: stats.total, icon: Database, tone: 'bg-rose-50 text-rose-600' },
    ];

    return (
        <AdminLayout title="網站分析">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {cards.map((c) => (
                    <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-xl', c.tone)}><c.icon className="h-5 w-5" /></div>
                        <div className="text-2xl font-black text-slate-900">{c.value.toLocaleString()}</div>
                        <div className="mt-0.5 text-xs text-slate-500">{c.label}</div>
                    </div>
                ))}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-6 font-bold text-slate-900">近 14 日瀏覽趨勢</h2>
                <div className="flex h-48 items-end gap-2">
                    {trend.map((t) => (
                        <div key={t.date} className="flex h-full flex-1 flex-col items-center gap-2">
                            <div className="flex w-full flex-1 items-end">
                                <div className="w-full rounded-t bg-gradient-to-t from-sky-500 to-cyan-400 transition-all hover:from-sky-600" style={{ height: `${t.count > 0 ? Math.max(4, (t.count / max) * 100) : 0}%` }} title={`${t.date}：${t.count} 次`} />
                            </div>
                            <span className="text-[10px] text-slate-400">{t.date}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 font-bold text-slate-900">熱門頁面（近 30 日）</h2>
                    {topPages.length === 0 ? <p className="text-sm text-slate-400">尚無資料。</p> : (
                        <ul className="space-y-3">
                            {topPages.map((p, i) => (
                                <li key={p.path} className="flex items-center gap-3 text-sm">
                                    <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold', i < 3 ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-500')}>{i + 1}</span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3"><span className="truncate text-slate-700">{p.path}</span><span className="shrink-0 font-bold text-slate-900">{p.c}</span></div>
                                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-sky-400" style={{ width: `${(p.c / topMax) * 100}%` }} /></div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 font-bold text-slate-900">最近訪問</h2>
                    {recent.length === 0 ? <p className="text-sm text-slate-400">尚無資料。</p> : (
                        <ul className="divide-y divide-slate-100">
                            {recent.map((r, i) => (
                                <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                                    <span className="truncate text-slate-700">{r.path}</span>
                                    <span className="shrink-0 text-xs text-slate-400">{r.created_at}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <p className="mt-6 text-xs text-slate-400">此為網站內建即時分析。更深入的來源/裝置/轉換分析可至 <a href="https://analytics.google.com/" target="_blank" rel="noreferrer" className="text-sky-600 hover:underline">Google Analytics 4</a>（已安裝 G-D43Z4Q46V7）查看。</p>
        </AdminLayout>
    );
}
