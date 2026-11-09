import type { SVGProps } from 'react';

/** Hand-drawn line icon set (24px grid, currentColor). */
type P = SVGProps<SVGSVGElement>;
const base = (props: P) => ({
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
    ...props,
});

export const IconHome = (p: P) => (
    <svg {...base(p)}>
        <path d="M4 11.5 12 5l8 6.5" />
        <path d="M6.5 10v8.5h11V10" />
        <path d="M10.5 18.5v-4h3v4" />
    </svg>
);
export const IconHeart = (p: P) => (
    <svg {...base(p)}>
        <path d="M12 19.5s-7-4.3-7-9.4A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.1c0 5.1-7 9.4-7 9.4Z" />
    </svg>
);
export const IconMoon = (p: P) => (
    <svg {...base(p)}>
        <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z" />
        <path d="M16.5 4.5v2M15.5 5.5h2" />
    </svg>
);
export const IconBook = (p: P) => (
    <svg {...base(p)}>
        <path d="M12 7c-2-1.5-4.6-2-7.5-1.6v12.2c2.9-.4 5.5.1 7.5 1.6 2-1.5 4.6-2 7.5-1.6V5.4C16.6 5 14 5.5 12 7Z" />
        <path d="M12 7v12.2" />
    </svg>
);
export const IconArch = (p: P) => (
    <svg {...base(p)}>
        <path d="M5 20V11a7 7 0 0 1 14 0v9" />
        <path d="M8.5 20v-8.5a3.5 3.5 0 0 1 7 0V20" />
        <circle cx="8" cy="7" r=".6" />
        <circle cx="16" cy="7" r=".6" />
        <circle cx="12" cy="4.5" r=".6" />
    </svg>
);
export const IconImage = (p: P) => (
    <svg {...base(p)}>
        <rect x="4.5" y="4" width="15" height="16" rx="2.5" />
        <path d="m5 16 4-4 3.5 3.5L15 13l4 4" />
        <circle cx="15" cy="8.5" r="1.4" />
    </svg>
);
export const IconLetter = (p: P) => (
    <svg {...base(p)}>
        <rect x="3.5" y="6" width="17" height="12.5" rx="2" />
        <path d="m4 7 8 6 8-6" />
    </svg>
);
export const IconSparkleChat = (p: P) => (
    <svg {...base(p)}>
        <path d="M5 17.5V7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v6a2.5 2.5 0 0 1-2.5 2.5H9l-4 3.5Z" />
        <path d="m12 8 .8 1.7 1.7.8-1.7.8L12 13l-.8-1.7-1.7-.8 1.7-.8Z" />
    </svg>
);
export const IconMusic = (p: P) => (
    <svg {...base(p)}>
        <path d="M9 17.5V6.5l10-2v10.5" />
        <circle cx="6.8" cy="17.5" r="2.3" />
        <circle cx="16.8" cy="15" r="2.3" />
    </svg>
);
export const IconMusicOff = (p: P) => (
    <svg {...base(p)}>
        <path d="M9 17.5V6.5l10-2v10.5" />
        <circle cx="6.8" cy="17.5" r="2.3" />
        <circle cx="16.8" cy="15" r="2.3" />
        <path d="m4 4 16 16" />
    </svg>
);
export const IconLeaf = (p: P) => (
    <svg {...base(p)}>
        <path d="M5 19c0-8 5-13 14-13 0 9-5 13-11 13" />
        <path d="M5 19c2.5-4 5.5-6.5 9-8" />
    </svg>
);
export const IconPin = (p: P) => (
    <svg {...base(p)}>
        <path d="M12 20.5s-6-5.6-6-10.5a6 6 0 0 1 12 0c0 4.9-6 10.5-6 10.5Z" />
        <circle cx="12" cy="10" r="2.2" />
    </svg>
);
export const IconCalendar = (p: P) => (
    <svg {...base(p)}>
        <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" />
        <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
        <path d="M12 13.2v3.6M10.2 15h3.6" />
    </svg>
);
export const IconCopy = (p: P) => (
    <svg {...base(p)}>
        <rect x="8.5" y="8.5" width="11" height="11" rx="2.2" />
        <path d="M15.5 8.5V6.7a2.2 2.2 0 0 0-2.2-2.2H6.7a2.2 2.2 0 0 0-2.2 2.2v6.6a2.2 2.2 0 0 0 2.2 2.2h1.8" />
    </svg>
);
export const IconClose = (p: P) => (
    <svg {...base(p)}>
        <path d="m6 6 12 12M18 6 6 18" />
    </svg>
);
export const IconChevronLeft = (p: P) => (
    <svg {...base(p)}>
        <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />
    </svg>
);
export const IconChevronRight = (p: P) => (
    <svg {...base(p)}>
        <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
    </svg>
);
export const IconChevronDown = (p: P) => (
    <svg {...base(p)}>
        <path d="m5.5 9.5 6.5 6.5 6.5-6.5" />
    </svg>
);
export const IconCheck = (p: P) => (
    <svg {...base(p)}>
        <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
);
export const IconAlert = (p: P) => (
    <svg {...base(p)}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5v5.5M12 16.2v.3" />
    </svg>
);
export const IconInstagram = (p: P) => (
    <svg {...base(p)}>
        <rect x="4.5" y="4.5" width="15" height="15" rx="4.5" />
        <circle cx="12" cy="12" r="3.4" />
        <circle cx="16.4" cy="7.6" r=".6" />
    </svg>
);
export const IconEnvelopeOpen = (p: P) => (
    <svg {...base(p)}>
        <path d="M3.5 10.5 12 4.5l8.5 6V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19Z" />
        <path d="m4 11 8 5.5 8-5.5" />
        <path d="M7.5 9.5V7h9v2.5" />
    </svg>
);
export const IconArrowUp = (p: P) => (
    <svg {...base(p)}>
        <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
);
export const IconGift = (p: P) => (
    <svg {...base(p)}>
        <rect x="4" y="9" width="16" height="11" rx="2" />
        <path d="M3.5 9h17v3.5h-17zM12 9v11" />
        <path d="M12 9c-1.6-2.8-5.5-3.6-5.5-1.3C6.5 9 9.5 9 12 9Zm0 0c1.6-2.8 5.5-3.6 5.5-1.3C17.5 9 14.5 9 12 9Z" />
    </svg>
);
export const IconWallet = (p: P) => (
    <svg {...base(p)}>
        <path d="M4.5 7.5A2.5 2.5 0 0 1 7 5h10.5v3" />
        <rect x="4.5" y="8" width="15" height="11" rx="2.5" />
        <path d="M15.5 13.5h4" />
        <circle cx="16" cy="13.5" r=".6" />
    </svg>
);
export const IconPlay = (p: P) => (
    <svg {...base(p)}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="m10 8.8 5 3.2-5 3.2Z" />
    </svg>
);
