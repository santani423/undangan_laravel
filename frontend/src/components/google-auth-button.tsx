import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import GoogleIcon from '@/components/icons/google-icon';
import { Button } from '@/components/ui/button';
import { route } from '@/routes/route';
import { backendUrl } from '@/services/api';

interface GoogleAuthButtonProps {
    intent: 'login' | 'register';
    disabled?: boolean;
    themeId?: number;
    packageId?: number;
    packageTier?: string;
}

export default function GoogleAuthButton({ intent, disabled, themeId, packageId, packageTier }: GoogleAuthButtonProps) {
    const [connecting, setConnecting] = useState(false);

    const handleClick = () => {
        // Guard against double-clicks kicking off multiple OAuth handshakes.
        if (connecting) return;
        setConnecting(true);
        // OAuth is a browser redirect flow on the backend host (session-bound state);
        // Google comes back to the backend, which then redirects to this SPA.
        window.location.href = backendUrl(
            route('auth.google', {
                intent,
                ...(themeId ? { theme_id: themeId } : {}),
                ...(packageId ? { package_id: packageId } : {}),
                ...(packageTier ? { package_tier: packageTier } : {}),
            }),
        );
    };

    return (
        <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={disabled || connecting}
            aria-label={connecting ? 'Connecting to Google' : 'Continue with Google'}
            onClick={handleClick}
        >
            {connecting ? (
                <>
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                    Connecting to Google...
                </>
            ) : (
                <>
                    <GoogleIcon className="size-4" />
                    Continue with Google
                </>
            )}
        </Button>
    );
}
