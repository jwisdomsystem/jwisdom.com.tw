// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <AuthLayout title="驗證電子郵件" description="請點擊我們剛寄給您的連結以完成電子郵件驗證。">
            <Head title="電子郵件驗證" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    新的驗證連結已寄送至您註冊時提供的電子郵件。
                </div>
            )}

            <form onSubmit={submit} className="space-y-6 text-center">
                <Button disabled={processing} variant="secondary">
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    重新寄送驗證信
                </Button>

                <TextLink href={route('logout')} method="post" className="mx-auto block text-sm">
                    登出
                </TextLink>
            </form>
        </AuthLayout>
    );
}
