import { useEffect, useState } from 'react';

interface ToastProps {
    message: string | null;
    onDone: () => void;
    className?: string;
}

export default function Toast({ message, onDone, className = '' }: ToastProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!message) return;
        setVisible(true);
        const id = setTimeout(() => {
            setVisible(false);
            setTimeout(onDone, 400);
        }, 2500);
        return () => clearTimeout(id);
    }, [message]);

    if (!message) return null;

    return (
        <div
            className={className}
            style={{
                position: 'fixed',
                bottom: '30px',
                left: '50%',
                transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(100px)',
                transition: 'transform 0.4s ease',
                zIndex: 99999,
            }}
        >
            {message}
        </div>
    );
}

// Hook for toast management
export function useToast() {
    const [toast, setToast] = useState<string | null>(null);
    const showToast = (msg: string) => setToast(msg);
    const clearToast = () => setToast(null);
    return { toast, showToast, clearToast };
}
