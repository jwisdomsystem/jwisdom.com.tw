import { Link } from '@inertiajs/react';
import { Mail, Newspaper, Megaphone, Star, Wrench, HelpCircle, ArrowRight, type LucideIcon } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

type Stats = { contacts: number; unread: number; news: number; works: number; services: number; banners: number; faqs: number };
type Contact = { id: number; name: string; email: string; subject?: string; is_read: boolean; created_at?: string };

export default function AdminDashboard({ stats, recentContacts }: { stats: Stats; recentContacts: Contact[] }) {
    const cards: { label: string; value: number; sub?: string; href?: string; icon: LucideIcon; tone: string }[] = [
        { label: '聯絡訊息', value: stats.contacts, sub: stats.unread > 0 ? `${stats.unread} 則未讀` : undefined, href: '/admin/contacts', icon: Mail, tone: 'bg-sky-50 text-sky-600' },
        { label: '消息 / 洞察', value: stats.news, href: '/admin/news', icon: Newspaper, tone: 'bg-indigo-50 text-indigo-600' },
        { label: '廣告', value: stats.banners, href: '/admin/banners', icon: Megaphone, tone: 'bg-emerald-50 text-emerald-600' },
        { label: '精選實例', value: stats.works, href: '/admin/works', icon: Star, tone: 'bg-amber-50 text-amber-600' },
        { label: '服務項目', value: stats.services, href: '/admin/services', icon: Wrench, tone: 'bg-rose-50 text-rose-600' },
        { label: '常見問題', value: stats.faqs, href: '/admin/faqs', icon: HelpCircle, tone: 'bg-violet-50 text-violet-600' },
    ];
    return (
        <AdminLayout title="總覽">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((c) => (
                    <Link key={c.label} href={c.href ?? '#'} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', c.tone)}><c.icon className="h-5 w-5" /></div>
                            <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-sky-500" />
                        </div>
                        <div className="mt-4 text-3xl font-black text-slate-900">{c.value}</div>
                        <div className="mt-0.5 text-sm text-slate-500">{c.label}</div>
                        {c.sub && <div className="mt-1 text-xs font-semibold text-rose-500">{c.sub}</div>}
                    </Link>
                ))}
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-bold text-slate-900">最近聯絡訊息</h2>
                    <Link href="/admin/contacts" className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 hover:underline">查看全部 <ArrowRight className="h-3.5 w-3.5" /></Link>
                </div>
                {recentContacts.length === 0 ? (
                    <p className="py-6 text-center text-sm text-slate-400">目前沒有聯絡訊息。</p>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {recentContacts.map((c) => (
                            <li key={c.id} className="flex items-center justify-between py-3">
                                <div className="min-w-0">
                                    <span className="font-medium text-slate-900">{c.name}</span>
                                    <span className="ml-2 text-sm text-slate-400">{c.subject ?? c.email}</span>
                                </div>
                                <div className="flex shrink-0 items-center gap-3">
                                    {!c.is_read && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-600">未讀</span>}
                                    <span className="text-xs text-slate-400">{c.created_at}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </AdminLayout>
    );
}
