import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import GoogleAuthButton from '@/components/google-auth-button';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AuthLayout from '@/layouts/auth-layout';

const INPUT_CLASS = 'h-11 rounded-xl border-rose-100 bg-white text-gray-800 placeholder:text-gray-400 focus-visible:ring-rose-300';
const LINK_CLASS = 'text-rose-600 decoration-rose-200 hover:text-rose-700';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface DevAccount {
    label: string;
    email: string;
    password: string;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    devAccounts?: DevAccount[];
    onboardingThemeId?: number | null;
    onboardingPackageId?: number | null;
    onboardingPackageTier?: string | null;
}

export default function Login({ status, canResetPassword, devAccounts = [], onboardingThemeId, onboardingPackageId, onboardingPackageTier }: LoginProps) {
    const { flash } = usePage<{ flash?: { error?: string | null } }>().props;
    const { data, setData, post, processing, errors, reset, transform } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [devLoggingIn, setDevLoggingIn] = useState<string | null>(null);

    const loginAsDevAccount = (account: DevAccount) => {
        setData({ ...data, email: account.email, password: account.password });
        setDevLoggingIn(account.email);
        router.post(
            route('login'),
            { email: account.email, password: account.password, remember: false },
            {
                onFinish: () => {
                    setDevLoggingIn(null);
                    reset('password');
                },
            },
        );
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        transform((formData) => ({
            ...formData,
            onboarding_theme_id: onboardingThemeId ?? null,
            onboarding_package_id: onboardingPackageId ?? null,
            onboarding_package_tier: onboardingPackageTier ?? null,
        }));
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Selamat Datang Kembali" description="Masuk untuk mengelola undangan digital Anda">
            <Head title="Masuk" />

            {status && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm font-medium text-emerald-700">{status}</div>
            )}

            {flash?.error && (
                <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2 text-center text-sm text-destructive">
                    {flash.error}
                </div>
            )}

            <div className="mb-5">
                <GoogleAuthButton
                    intent="login"
                    disabled={processing}
                    themeId={onboardingThemeId ?? undefined}
                    packageId={onboardingPackageId ?? undefined}
                    packageTier={onboardingPackageTier ?? undefined}
                />
            </div>

            <div className="relative mb-5 flex items-center">
                <Separator className="flex-1 bg-rose-100" />
                <span className="px-3 text-xs text-gray-400 uppercase">atau dengan email</span>
                <Separator className="flex-1 bg-rose-100" />
            </div>

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-gray-700">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="nama@email.com"
                            className={INPUT_CLASS}
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password" className="text-gray-700">
                                Password
                            </Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className={`ml-auto text-sm ${LINK_CLASS}`} tabIndex={5}>
                                    Lupa password?
                                </TextLink>
                            )}
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Masukkan password"
                                className={`${INPUT_CLASS} pr-10`}
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 transition-colors hover:text-rose-500"
                                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                            >
                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            tabIndex={3}
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked === true)}
                            className="border-rose-300 data-[state=checked]:border-rose-500 data-[state=checked]:bg-rose-500"
                        />
                        <Label htmlFor="remember" className="font-normal text-gray-600">
                            Ingat saya
                        </Label>
                    </div>

                    <button
                        type="submit"
                        tabIndex={4}
                        disabled={processing || devLoggingIn !== null}
                        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-rose-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-300/40 transition-all duration-300 hover:from-rose-600 hover:to-rose-500 hover:shadow-xl disabled:pointer-events-none disabled:opacity-60"
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Masuk
                    </button>
                </div>

                <div className="text-center text-sm text-gray-500">
                    Belum punya akun?{' '}
                    <TextLink href={route('register')} tabIndex={5} className={`font-semibold ${LINK_CLASS}`}>
                        Daftar sekarang
                    </TextLink>
                </div>
            </form>

            {devAccounts.length > 0 && (
                <details className="group mt-6 rounded-xl border border-dashed border-amber-400/60 bg-amber-50/60 p-3">
                    <summary className="cursor-pointer text-sm font-medium text-amber-700 select-none">Quick login (debug mode)</summary>
                    <div className="mt-3 grid gap-1.5">
                        {devAccounts.map((account) => (
                            <Button
                                key={account.email}
                                type="button"
                                variant="outline"
                                className="h-auto w-full justify-between gap-2 py-2 text-left"
                                disabled={processing || devLoggingIn !== null}
                                onClick={() => loginAsDevAccount(account)}
                            >
                                <span className="flex flex-col items-start">
                                    <span className="text-sm font-medium">{account.label}</span>
                                    <span className="text-muted-foreground text-xs">{account.email}</span>
                                </span>
                                {devLoggingIn === account.email && <LoaderCircle className="size-4 shrink-0 animate-spin" />}
                            </Button>
                        ))}
                    </div>
                </details>
            )}
        </AuthLayout>
    );
}
