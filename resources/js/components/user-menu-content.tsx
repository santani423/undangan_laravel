import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { LoaderCircle, LogOut, UserCircle } from 'lucide-react';
import { useState } from 'react';

interface UserMenuContentProps {
    user: User;
    showEditProfile?: boolean;
}

export function UserMenuContent({ user, showEditProfile = true }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const [loggingOut, setLoggingOut] = useState(false);

    // Logout is a POST followed by a redirect to the landing page, so it can take
    // a few seconds on a slow connection. Keep the menu open and show progress so
    // it doesn't look like the click did nothing.
    const handleLogout = (event: Event) => {
        event.preventDefault();

        if (loggingOut) {
            return;
        }

        router.post(
            route('logout'),
            {},
            {
                onStart: () => setLoggingOut(true),
                onFinish: () => {
                    setLoggingOut(false);
                    cleanup();
                },
            },
        );
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            {showEditProfile && (
                <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link className="block w-full" href={route('profile.edit')} as="button" prefetch onClick={cleanup}>
                                <UserCircle className="mr-2" />
                                Edit Profil
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout} disabled={loggingOut} className="w-full cursor-pointer">
                {loggingOut ? <LoaderCircle className="mr-2 animate-spin" /> : <LogOut className="mr-2" />}
                {loggingOut ? 'Sedang keluar...' : 'Keluar'}
            </DropdownMenuItem>
        </>
    );
}
