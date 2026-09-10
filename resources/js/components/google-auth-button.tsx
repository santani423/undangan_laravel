import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import GoogleIcon from '@/components/icons/google-icon';
import { Button } from '@/components/ui/button';

interface GoogleAuthButtonProps {
    intent: 'login' | 'register';
    disabled?: boolean;
}

export default function GoogleAuthButton({ intent, disabled }: GoogleAuthButtonProps) {
    const [connecting, setConnecting] = useState(false);

    const handleClick = () => {
        // Guard against double-clicks kicking off multiple OAuth handshakes.
        if (connecting) return;
        setConnecting(true);
        window.location.href = route('auth.google', { intent });
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
