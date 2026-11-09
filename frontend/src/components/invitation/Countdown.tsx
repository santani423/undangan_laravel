import { useEffect, useState } from 'react';

interface CountdownProps {
    targetDate: string; // "YYYY-MM-DDTHH:mm:ss"
    className?: string;
    boxClassName?: string;
    numClassName?: string;
    labelClassName?: string;
    labels?: { days: string; hours: string; minutes: string; seconds: string };
    doneMessage?: React.ReactNode;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
}

function computeTimeLeft(targetDate: string): TimeLeft {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        expired: false,
    };
}

export default function Countdown({
    targetDate,
    className = '',
    boxClassName = '',
    numClassName = '',
    labelClassName = '',
    labels = { days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik' },
    doneMessage,
}: CountdownProps) {
    const [time, setTime] = useState<TimeLeft>(() => computeTimeLeft(targetDate));

    useEffect(() => {
        if (time.expired) return;
        const id = setInterval(() => setTime(computeTimeLeft(targetDate)), 1000);
        return () => clearInterval(id);
    }, [targetDate, time.expired]);

    const pad = (n: number) => String(n).padStart(2, '0');

    if (time.expired && doneMessage) return <>{doneMessage}</>;

    return (
        <div className={className}>
            {(['days', 'hours', 'minutes', 'seconds'] as const).map((unit) => (
                <div key={unit} className={boxClassName}>
                    <span className={numClassName}>{pad(time[unit])}</span>
                    <span className={labelClassName}>{labels[unit]}</span>
                </div>
            ))}
        </div>
    );
}
