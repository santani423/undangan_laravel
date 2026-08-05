interface LandingLogoProps {
    variant?: 'light' | 'dark';
    className?: string;
}

export default function LandingLogo({ variant = 'light', className = '' }: LandingLogoProps) {
    const textColor = variant === 'dark' ? 'text-white' : 'text-gray-800';

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <div className="flex aspect-square size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-400 shadow-sm">
                <svg className="size-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.5 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3.5-7-7-7z" fill="white" opacity="0.95" />
                    <circle cx="12" cy="9" r="2.5" fill="white" opacity="0.5" />
                </svg>
            </div>
            <span className={`font-serif text-xl leading-none font-bold ${textColor}`}>Undesia</span>
        </div>
    );
}
