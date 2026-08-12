import { Head, router, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

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
}

export default function Login({ status, canResetPassword, devAccounts = [] }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
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
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
            <Head title="Log in" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    {devAccounts.length > 0 && (
                        <div className="grid gap-2 rounded-md border border-dashed border-amber-500/50 bg-amber-500/5 p-3">
                            <Label>Quick login (debug mode)</Label>
                            <div className="grid gap-1.5">
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
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
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
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                    Forgot password?
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
                                placeholder="Password"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground"
                                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                            >
                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox id="remember" name="remember" tabIndex={3} />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing || devLoggingIn !== null}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Log in
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Don't have an account?{' '}
                    <TextLink href={route('register')} tabIndex={5}>
                        Sign up
                    </TextLink>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
