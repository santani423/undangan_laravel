/* Line icons from the original header and dialogs (drawn in the theme's rounded style). */

export function MusicIcon() {
    return (
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
                d="M9 18.5a2.5 2.5 0 1 1-2.5-2.5H9V5l11-2v12.5a2.5 2.5 0 1 1-2.5-2.5H20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path className="bt11-icon-btn__slash" d="M4 4l16 16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
    );
}

export function SoundIcon() {
    return (
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M4 9.5h3.5L12 5v14l-4.5-4.5H4z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path
                className="bt11-icon-btn__waves"
                d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path className="bt11-icon-btn__slash" d="M4 4l16 16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
    );
}

export function CloseIcon({ size = 20 }: { size?: number }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
    );
}

export function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
    return (
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
            <path
                d={direction === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
