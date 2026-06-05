import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useRef } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
    cf_turnstile_response: string;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

declare global {
    interface Window {
        turnstile?: {
            render: (el: HTMLElement, opts: Record<string, unknown>) => string;
            reset: (id?: string) => void;
        };
    }
}

export default function Login({ status }: LoginProps) {
    const { turnstileSiteKey } = usePage().props as { turnstileSiteKey?: string };
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
        cf_turnstile_response: '',
    });

    const tsRef = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);

    // 載入並渲染 Cloudflare Turnstile（後台有設定 site key 才啟用）
    useEffect(() => {
        if (!turnstileSiteKey || typeof window === 'undefined') return;

        const renderWidget = () => {
            if (!window.turnstile || !tsRef.current || widgetId.current) return;
            widgetId.current = window.turnstile.render(tsRef.current, {
                sitekey: turnstileSiteKey,
                language: 'zh-tw',
                callback: (token: string) => setData('cf_turnstile_response', token),
                'expired-callback': () => setData('cf_turnstile_response', ''),
                'error-callback': () => setData('cf_turnstile_response', ''),
            });
        };

        if (window.turnstile) {
            renderWidget();
        } else if (!document.getElementById('cf-turnstile-script')) {
            const s = document.createElement('script');
            s.id = 'cf-turnstile-script';
            s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
            s.async = true;
            s.defer = true;
            s.onload = renderWidget;
            document.head.appendChild(s);
        } else {
            const t = setInterval(() => {
                if (window.turnstile) {
                    clearInterval(t);
                    renderWidget();
                }
            }, 200);
            return () => clearInterval(t);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [turnstileSiteKey]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => {
                reset('password');
                // 重置 widget 以便下次登入取得新 token
                if (turnstileSiteKey && window.turnstile && widgetId.current) {
                    window.turnstile.reset(widgetId.current);
                    setData('cf_turnstile_response', '');
                }
            },
        });
    };

    return (
        <AuthLayout title="後台管理登入" description="請輸入您的管理員帳號與密碼">
            <Head title="後台登入" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="email">電子郵件</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">密碼</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="請輸入密碼"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">記住我</Label>
                    </div>

                    {turnstileSiteKey && <div ref={tsRef} className="min-h-[65px]" />}

                    <Button type="submit" className="mt-2 w-full bg-sky-500 hover:bg-sky-600" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        登入
                    </Button>
                </div>
            </form>

            {status && <div className="mt-2 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
