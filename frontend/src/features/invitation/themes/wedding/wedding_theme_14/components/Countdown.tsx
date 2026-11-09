import { CalendarPlus, Download } from 'lucide-react';
import { downloadIcs, googleCalendarUrl } from '../lib/calendar';
import { useWedding } from '../lib/context';
import { useCountdown } from '../lib/hooks';
import { SectionHeading } from './Ornament';

const pad = (n: number) => String(n).padStart(2, '0');

export function Countdown() {
    const w = useWedding();
    const c = useCountdown(w.mainDate);
    const couple = `${w.couple.bride.nickname} & ${w.couple.groom.nickname}`;
    const first = w.events.find((e) => e.start);
    const units = [
        { label: 'Hari', value: String(c.days) },
        { label: 'Jam', value: pad(c.hours) },
        { label: 'Menit', value: pad(c.minutes) },
        { label: 'Detik', value: pad(c.seconds) },
    ];
    return (
        <div>
            <SectionHeading icon="calendar" eyebrow="Taman Sari · Menuju Hari Bahagia" title="Hitung Mundur" />
            {w.mainDateLabel && <p className="wt14-countdown-date">{w.mainDateLabel}</p>}
            {c.done ? (
                <p className="wt14-countdown-done">Hari bahagia telah tiba — matur nuwun atas doa restu Anda.</p>
            ) : (
                <div className="wt14-countdown" role="timer" aria-live="off" aria-label={`${c.days} hari ${c.hours} jam ${c.minutes} menit lagi`}>
                    {units.map((u) => (
                        <div key={u.label} className="wt14-countdown-unit">
                            <div className="wt14-countdown-value">{u.value}</div>
                            <div className="wt14-countdown-label">{u.label}</div>
                        </div>
                    ))}
                </div>
            )}
            {w.sections.calendar && first && (
                <div className="wt14-actions">
                    <a className="wt14-btn" href={googleCalendarUrl(first, couple)} target="_blank" rel="noopener noreferrer">
                        <CalendarPlus size={16} aria-hidden="true" /> Google Calendar
                    </a>
                    <button type="button" className="wt14-btn-ghost" onClick={() => downloadIcs(w.events, couple)}>
                        <Download size={16} aria-hidden="true" /> Unduh .ics
                    </button>
                </div>
            )}
        </div>
    );
}
