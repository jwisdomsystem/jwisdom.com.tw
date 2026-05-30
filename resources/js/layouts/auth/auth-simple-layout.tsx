import { Link } from '@inertiajs/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div
            className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#f5f6f8] p-6 md:p-10"
            style={{ fontFamily: "'Noto Sans TC', sans-serif" }}
        >
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center">
                    <Link href={route('home')}>
                        <img src="/images/jwisdom-logo.png" alt="宸揚資科 JWISDOM SYSTEM INC." className="h-12 w-auto" />
                    </Link>
                </div>
                <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                    <div className="mb-6 space-y-1 text-center">
                        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
                        <p className="text-sm text-gray-500">{description}</p>
                    </div>
                    {children}
                </div>
                <p className="mt-6 text-center text-xs text-gray-400">© {new Date().getFullYear()} 宸揚資科 JWISDOM SYSTEM INC.</p>
            </div>
        </div>
    );
}
