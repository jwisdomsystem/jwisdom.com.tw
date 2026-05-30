import { Head, Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren, type ReactNode } from 'react';
import {
    LayoutDashboard, BarChart3, Mail, Newspaper, Lightbulb, Star, Wrench,
    HelpCircle, FileText, Megaphone, Settings, Sparkles, ExternalLink, LogOut, Package, LayoutTemplate, Handshake,
    type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = { label: string; href: string; icon: LucideIcon };
type NavGroup = { title: string; items: NavItem[] };

const groups: NavGroup[] = [
    {
        // 每天會看的：總覽、數據、客戶來信
        title: '儀表板',
        items: [
            { label: '總覽', href: '/admin', icon: LayoutDashboard },
            { label: '網站分析', href: '/admin/analytics', icon: BarChart3 },
            { label: '聯絡訊息', href: '/admin/contacts', icon: Mail },
        ],
    },
    {
        // 會持續更新的動態文章
        title: '文章內容',
        items: [
            { label: '最新消息', href: '/admin/news', icon: Newspaper },
            { label: '技術洞察', href: '/admin/insights', icon: Lightbulb },
        ],
    },
    {
        // 官網各區塊的展示內容（首頁→服務→產品→案例→夥伴→FAQ→固定頁）
        title: '官網內容',
        items: [
            { label: '首頁區塊', href: '/admin/home-content', icon: LayoutTemplate },
            { label: '服務項目', href: '/admin/services', icon: Wrench },
            { label: '我們的產品', href: '/admin/products', icon: Package },
            { label: '精選實例', href: '/admin/works', icon: Star },
            { label: '策略夥伴', href: '/admin/partners', icon: Handshake },
            { label: '常見問題', href: '/admin/faqs', icon: HelpCircle },
            { label: '頁面內容', href: '/admin/pages', icon: FileText },
        ],
    },
    {
        title: '行銷推廣',
        items: [{ label: '廣告管理', href: '/admin/banners', icon: Megaphone }],
    },
    {
        title: '系統設定',
        items: [
            { label: '網站設定', href: '/admin/settings', icon: Settings },
            { label: '整合設定 (AI)', href: '/admin/integrations', icon: Sparkles },
        ],
    },
];

type PageProps = { auth?: { user?: { name?: string; email?: string } }; flash?: { success?: string } };

export default function AdminLayout({ children, title, actions }: PropsWithChildren<{ title?: string; actions?: ReactNode }>) {
    const page = usePage();
    const props = page.props as PageProps;
    const flash = props.flash;
    const user = props.auth?.user;
    const current = page.url;

    const isActive = (href: string) => (href === '/admin' ? current === '/admin' : current === href || current.startsWith(href + '/'));

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-800">
            <Head title={`${title ?? '後台'}｜宸揚資科 JWisdom`} />

            <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-slate-900 text-slate-300">
                <div className="flex items-center gap-2 border-b border-white/10 px-6 py-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 font-black text-white">宸</div>
                    <div>
                        <div className="text-sm font-extrabold leading-tight text-white">宸揚資科</div>
                        <div className="text-[11px] leading-tight text-sky-400">後台管理</div>
                    </div>
                </div>

                <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {groups.map((g) => (
                        <div key={g.title}>
                            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">{g.title}</div>
                            <div className="space-y-0.5">
                                {g.items.map((n) => {
                                    const Icon = n.icon;
                                    const active = isActive(n.href);
                                    return (
                                        <Link
                                            key={n.href}
                                            href={n.href}
                                            className={cn(
                                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                                                active ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white',
                                            )}
                                        >
                                            <Icon className={cn('h-[18px] w-[18px] shrink-0', active ? 'text-white' : 'text-slate-400')} />
                                            {n.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="border-t border-white/10 p-3">
                    {user && (
                        <div className="mb-2 flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white">
                                {(user.name ?? 'A').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-white">{user.name}</div>
                                <div className="truncate text-[11px] text-slate-400">{user.email}</div>
                            </div>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <a href="/" target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white">
                            <ExternalLink className="h-3.5 w-3.5" /> 前台
                        </a>
                        <Link href="/logout" method="post" as="button" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white">
                            <LogOut className="h-3.5 w-3.5" /> 登出
                        </Link>
                    </div>
                </div>
            </aside>

            <main className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-8 py-4 backdrop-blur">
                    <h1 className="text-xl font-bold text-slate-900">{title ?? '後台'}</h1>
                    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
                </header>

                {flash?.success && (
                    <div className="mx-8 mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
