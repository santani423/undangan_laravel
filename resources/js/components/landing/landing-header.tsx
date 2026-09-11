import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { type Auth } from '@/types';
import { Link } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import LandingLogo from './landing-logo';

interface NavItem {
    label: string;
    href: string;
    anchor?: boolean;
}

interface LandingHeaderProps {
    auth: Auth;
    onCreateInvitation: () => void;
}

export default function LandingHeader({ auth, onCreateInvitation }: LandingHeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const navItems: NavItem[] = [
        { label: 'Beranda', href: '#beranda', anchor: true },
        { label: 'Fitur', href: '#fitur', anchor: true },
        { label: 'Paket', href: '#paket', anchor: true },
        { label: 'Tema', href: route('themes.index') },
        { label: 'Testimoni', href: '#testimoni', anchor: true },
    ];

    const handleAnchorClick = (e: React.MouseEvent, href: string) => {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        setIsOpen(false);
    };

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
                isScrolled ? 'bg-white/95 shadow-md backdrop-blur-md' : 'bg-transparent'
            }`}
        >
            <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" aria-label="Undesia">
                    <LandingLogo />
                </Link>

                <nav className="hidden items-center gap-8 lg:flex">
                    {navItems.map((item) =>
                        item.anchor ? (
                            <a
                                key={item.label}
                                href={item.href}
                                onClick={(e) => handleAnchorClick(e, item.href)}
                                className="group relative text-sm font-medium text-gray-700 transition-colors hover:text-rose-500"
                            >
                                {item.label}
                                <span className="absolute inset-x-0 -bottom-1 h-0.5 origin-left scale-x-0 transform bg-gradient-to-r from-rose-400 to-rose-500 transition-transform duration-200 group-hover:scale-x-100" />
                            </a>
                        ) : (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="text-sm font-medium text-gray-700 transition-colors hover:text-rose-500"
                            >
                                {item.label}
                            </Link>
                        ),
                    )}
                </nav>

                <div className="hidden items-center gap-3 lg:flex">
                    {auth.user ? (
                        <>
                            <Link
                                href={route('customer.dashboard')}
                                className="text-sm font-medium text-gray-700 transition-colors hover:text-rose-500"
                            >
                                Dashboard
                            </Link>
                            <button
                                type="button"
                                onClick={onCreateInvitation}
                                className="rounded-full bg-gradient-to-r from-rose-500 to-rose-400 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-rose-600 hover:to-rose-500 hover:shadow-lg"
                            >
                                Buat Undangan
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href={route('login')} className="text-sm font-medium text-gray-700 transition-colors hover:text-rose-500">
                                Masuk
                            </Link>
                            <button
                                type="button"
                                onClick={onCreateInvitation}
                                className="rounded-full bg-gradient-to-r from-rose-500 to-rose-400 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-rose-600 hover:to-rose-500 hover:shadow-lg"
                            >
                                Buat Undangan
                            </button>
                        </>
                    )}
                </div>

                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-gray-700 hover:bg-rose-50 hover:text-rose-500 lg:hidden">
                            <Menu className="size-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full max-w-xs border-l border-gray-100 bg-white text-gray-900 sm:max-w-sm">
                        <div className="mt-8 flex flex-col gap-1">
                            {navItems.map((item) =>
                                item.anchor ? (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        onClick={(e) => handleAnchorClick(e, item.href)}
                                        className="rounded-lg px-3 py-3 text-base font-medium text-gray-700 hover:bg-rose-50 hover:text-rose-500"
                                    >
                                        {item.label}
                                    </a>
                                ) : (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className="rounded-lg px-3 py-3 text-base font-medium text-gray-700 hover:bg-rose-50 hover:text-rose-500"
                                    >
                                        {item.label}
                                    </Link>
                                ),
                            )}
                            <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsOpen(false);
                                        onCreateInvitation();
                                    }}
                                    className="block rounded-full bg-gradient-to-r from-rose-500 to-rose-400 px-6 py-3 text-center text-sm font-semibold text-white shadow-md"
                                >
                                    Buat Undangan
                                </button>
                                {auth.user ? (
                                    <Link
                                        href={route('customer.dashboard')}
                                        className="block rounded-full border border-gray-200 px-6 py-3 text-center text-sm font-semibold text-gray-700"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="block rounded-full border border-gray-200 px-6 py-3 text-center text-sm font-semibold text-gray-700"
                                    >
                                        Masuk
                                    </Link>
                                )}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
