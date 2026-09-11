import GoogleAuthButton from '@/components/google-auth-button';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { type OnboardingIntent } from '@/types/onboarding';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

interface AuthModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'login' | 'register';
    onModeChange: (mode: 'login' | 'register') => void;
    intent: OnboardingIntent;
}

export default function AuthModal({ open, onOpenChange, mode, onModeChange, intent }: AuthModalProps) {
    const registerForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const loginForm = useForm({
        email: '',
        password: '',
    });

    const withIntent = <T extends Record<string, unknown>>(data: T) => ({
        ...data,
        onboarding_theme_id: intent.themeId ?? null,
        onboarding_package_id: intent.packageId ?? null,
        onboarding_package_tier: intent.packageTier ?? null,
    });

    const submitRegister: FormEventHandler = (e) => {
        e.preventDefault();
        registerForm.transform(withIntent);
        registerForm.post(route('register'), {
            onFinish: () => registerForm.reset('password', 'password_confirmation'),
        });
    };

    const submitLogin: FormEventHandler = (e) => {
        e.preventDefault();
        loginForm.transform(withIntent);
        loginForm.post(route('login'), {
            onFinish: () => loginForm.reset('password'),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                {mode === 'register' ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Buat Akun</DialogTitle>
                            <DialogDescription>Daftar untuk melanjutkan membuat undangan digitalmu.</DialogDescription>
                        </DialogHeader>

                        <GoogleAuthButton
                            intent="register"
                            disabled={registerForm.processing}
                            themeId={intent.themeId}
                            packageId={intent.packageId}
                            packageTier={intent.packageTier}
                        />

                        <div className="relative flex items-center py-1">
                            <Separator className="flex-1" />
                            <span className="text-muted-foreground px-3 text-xs uppercase">atau</span>
                            <Separator className="flex-1" />
                        </div>

                        <form className="flex flex-col gap-4" onSubmit={submitRegister}>
                            <div className="grid gap-2">
                                <Label htmlFor="modal-register-name">Nama</Label>
                                <Input
                                    id="modal-register-name"
                                    type="text"
                                    required
                                    autoComplete="name"
                                    value={registerForm.data.name}
                                    onChange={(e) => registerForm.setData('name', e.target.value)}
                                    disabled={registerForm.processing}
                                    placeholder="Nama lengkap"
                                />
                                <InputError message={registerForm.errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="modal-register-email">Email</Label>
                                <Input
                                    id="modal-register-email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={registerForm.data.email}
                                    onChange={(e) => registerForm.setData('email', e.target.value)}
                                    disabled={registerForm.processing}
                                    placeholder="email@example.com"
                                />
                                <InputError message={registerForm.errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="modal-register-password">Password</Label>
                                <Input
                                    id="modal-register-password"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={registerForm.data.password}
                                    onChange={(e) => registerForm.setData('password', e.target.value)}
                                    disabled={registerForm.processing}
                                    placeholder="Password"
                                />
                                <InputError message={registerForm.errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="modal-register-password-confirmation">Konfirmasi Password</Label>
                                <Input
                                    id="modal-register-password-confirmation"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={registerForm.data.password_confirmation}
                                    onChange={(e) => registerForm.setData('password_confirmation', e.target.value)}
                                    disabled={registerForm.processing}
                                    placeholder="Ulangi password"
                                />
                                <InputError message={registerForm.errors.password_confirmation} />
                            </div>

                            <Button type="submit" className="w-full" disabled={registerForm.processing}>
                                {registerForm.processing && <LoaderCircle className="size-4 animate-spin" />}
                                Daftar
                            </Button>
                        </form>

                        <p className="text-muted-foreground text-center text-sm">
                            Sudah punya akun?{' '}
                            <button type="button" className="text-primary font-medium hover:underline" onClick={() => onModeChange('login')}>
                                Login
                            </button>
                        </p>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Login</DialogTitle>
                            <DialogDescription>Masuk untuk melanjutkan membuat undangan digitalmu.</DialogDescription>
                        </DialogHeader>

                        <GoogleAuthButton
                            intent="login"
                            disabled={loginForm.processing}
                            themeId={intent.themeId}
                            packageId={intent.packageId}
                            packageTier={intent.packageTier}
                        />

                        <div className="relative flex items-center py-1">
                            <Separator className="flex-1" />
                            <span className="text-muted-foreground px-3 text-xs uppercase">atau</span>
                            <Separator className="flex-1" />
                        </div>

                        <form className="flex flex-col gap-4" onSubmit={submitLogin}>
                            <div className="grid gap-2">
                                <Label htmlFor="modal-login-email">Email</Label>
                                <Input
                                    id="modal-login-email"
                                    type="email"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    value={loginForm.data.email}
                                    onChange={(e) => loginForm.setData('email', e.target.value)}
                                    disabled={loginForm.processing}
                                    placeholder="email@example.com"
                                />
                                <InputError message={loginForm.errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="modal-login-password">Password</Label>
                                <Input
                                    id="modal-login-password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={loginForm.data.password}
                                    onChange={(e) => loginForm.setData('password', e.target.value)}
                                    disabled={loginForm.processing}
                                    placeholder="Password"
                                />
                                <InputError message={loginForm.errors.password} />
                            </div>

                            <Button type="submit" className="w-full" disabled={loginForm.processing}>
                                {loginForm.processing && <LoaderCircle className="size-4 animate-spin" />}
                                Login
                            </Button>
                        </form>

                        <p className="text-muted-foreground text-center text-sm">
                            Belum punya akun?{' '}
                            <button type="button" className="text-primary font-medium hover:underline" onClick={() => onModeChange('register')}>
                                Daftar
                            </button>
                        </p>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
