import { Link } from '@inertiajs/react';
import { Cpu, Network, ShieldCheck } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

const features = [
    { icon: Cpu, title: 'AIoT 應用整合', desc: '從感測到雲端的智慧物聯解決方案' },
    { icon: Network, title: '軟體開發', desc: '客製化系統與數位轉型顧問' },
    { icon: ShieldCheck, title: '穩定可靠', desc: '企業級資安與維運支援' },
];

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="relative grid min-h-dvh lg:grid-cols-2">
            {/* 左側品牌區 */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-sky-600 via-sky-700 to-blue-900 p-10 text-white lg:flex">
                <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-sky-300/20 blur-3xl" />

                <Link href={route('home')} className="relative z-10 flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-white p-1.5 shadow-lg">
                        <img src="/images/jwisdom-mark.png" alt="宸揚資科" className="size-full object-contain" />
                    </span>
                    <span className="text-lg font-semibold tracking-wide">宸揚資科 JWISDOM</span>
                </Link>

                <div className="relative z-10 space-y-8">
                    <div className="space-y-3">
                        <h2 className="text-3xl leading-snug font-bold">
                            AIoT 應用專家
                            <br />
                            讓智慧落地
                        </h2>
                        <p className="max-w-sm text-sm text-sky-100">
                            宸揚資科提供物聯網、軟體開發與系統整合，協助企業數位轉型。
                        </p>
                    </div>
                    <ul className="space-y-4">
                        {features.map((f) => (
                            <li key={f.title} className="flex items-start gap-3">
                                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
                                    <f.icon className="size-5" />
                                </span>
                                <span>
                                    <span className="block text-sm font-medium">{f.title}</span>
                                    <span className="block text-xs text-sky-100/80">{f.desc}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="relative z-10 text-xs text-sky-200/70">© {new Date().getFullYear()} 宸揚資科 JWISDOM SYSTEM INC.</p>
            </div>

            {/* 右側表單區 */}
            <div className="bg-background flex items-center justify-center px-6 py-12 sm:px-10">
                <div className="w-full max-w-sm space-y-8">
                    <Link href={route('home')} className="flex items-center justify-center lg:hidden">
                        <img src="/images/jwisdom-logo.png" alt="宸揚資科 JWISDOM SYSTEM INC." className="h-11 w-auto" />
                    </Link>
                    <div className="space-y-2 text-center">
                        <h1 className="text-foreground text-2xl font-bold tracking-tight">{title}</h1>
                        <p className="text-muted-foreground text-sm">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
