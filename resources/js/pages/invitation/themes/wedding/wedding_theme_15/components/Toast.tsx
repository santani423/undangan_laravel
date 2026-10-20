import { useEffect, useState } from 'react';
import { useApp } from '../lib/store';

/** Polite live region for short confirmations ("Alamat disalin", …). */
export function Toast() {
    const toast = useApp((s) => s.toast);
    const [visible, setVisible] = useState<typeof toast>(null);
    const [leaving, setLeaving] = useState(false);
    useEffect(() => {
        if (!toast) return;
        setVisible(toast);
        setLeaving(false);
        const out = setTimeout(() => setLeaving(true), 2400);
        const gone = setTimeout(() => setVisible(null), 2700);
        return () => {
            clearTimeout(out);
            clearTimeout(gone);
        };
    }, [toast]);
    return (
        <div className="wt15-toast-region" aria-live="polite" aria-atomic="true">
            {visible && (
                <div key={visible.id} className={`wt15-toast ${leaving ? 'is-leaving' : ''}`}>
                    {visible.text}
                </div>
            )}
        </div>
    );
}
