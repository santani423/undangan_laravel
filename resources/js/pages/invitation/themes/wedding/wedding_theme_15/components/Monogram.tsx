import { useWedding } from '../lib/context';

/** Custom monogram: initials inside a laurel-like ring. Decorative; names are always in text nearby. */
export function Monogram({ size = 44, className }: { size?: number; className?: string }) {
    const [a, b] = useWedding().couple.monogram;
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeOpacity=".55" strokeWidth="1.2" />
            <circle cx="32" cy="32" r="25.5" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="1" strokeDasharray="1.5 3" />
            <g fill="currentColor" opacity=".8">
                <path d="M14 40c2-1 4-1 5.5.5-2 .7-3.8.6-5.5-.5Z" />
                <path d="M50 40c-2-1-4-1-5.5.5 2 .7 3.8.6 5.5-.5Z" />
                <circle cx="32" cy="8.5" r="1.4" />
            </g>
            <text
                x="22.5"
                y="38"
                textAnchor="middle"
                fontFamily="'Cormorant Garamond', Georgia, serif"
                fontStyle="italic"
                fontWeight="600"
                fontSize="20"
                fill="currentColor"
            >
                {a}
            </text>
            <text x="32" y="39" textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="11" fill="currentColor" opacity=".7">
                &amp;
            </text>
            <text
                x="41.5"
                y="38"
                textAnchor="middle"
                fontFamily="'Cormorant Garamond', Georgia, serif"
                fontStyle="italic"
                fontWeight="600"
                fontSize="20"
                fill="currentColor"
            >
                {b}
            </text>
        </svg>
    );
}
