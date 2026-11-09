import { usePendingRequests } from '@/store/progress';
import { useEffect, useState } from 'react';
import { useNavigation, useRevalidator } from 'react-router';

/**
 * Thin top progress bar shown while a page loads or a request is in flight —
 * same look and timing as the Inertia progress bar it replaces (color
 * #4B5563, shown only after 250 ms so fast visits do not flicker).
 */
export function ProgressBar() {
    const navigation = useNavigation();
    const revalidator = useRevalidator();
    const pending = usePendingRequests();
    const busy = navigation.state !== 'idle' || revalidator.state !== 'idle' || pending > 0;

    const [visible, setVisible] = useState(false);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (!busy) {
            if (!visible) return;
            setWidth(100);
            const hide = setTimeout(() => {
                setVisible(false);
                setWidth(0);
            }, 250);
            return () => clearTimeout(hide);
        }

        const show = setTimeout(() => {
            setVisible(true);
            setWidth(15);
        }, 250);
        const trickle = setInterval(() => setWidth((w) => (w < 90 ? w + (90 - w) * 0.1 : w)), 300);

        return () => {
            clearTimeout(show);
            clearInterval(trickle);
        };
    }, [busy, visible]);

    if (!visible) return null;

    return (
        <div aria-hidden="true" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 2147483647, pointerEvents: 'none' }}>
            <div
                style={{
                    height: '100%',
                    width: `${width}%`,
                    background: '#4B5563',
                    boxShadow: '0 0 10px #4B5563, 0 0 5px #4B5563',
                    transition: 'width 200ms ease',
                }}
            />
        </div>
    );
}
