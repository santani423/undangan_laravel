import { BRAND_ICON_SRC, BRAND_LOGO_SRC } from '@/lib/brand';

interface LandingLogoProps {
    variant?: 'light' | 'dark';
    className?: string;
}

export default function LandingLogo({ variant = 'light', className = '' }: LandingLogoProps) {
    // The full logo's wordmark is dark navy, so on dark backgrounds pair the
    // icon with a white wordmark instead.
    if (variant === 'light') {
        return <img src={BRAND_LOGO_SRC} alt="Undesia — Undangan Digital Indonesia" className={`h-11 w-auto ${className}`} />;
    }

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <img src={BRAND_ICON_SRC} alt="" aria-hidden="true" className="size-10 shrink-0 object-contain" />
            <span className="font-serif text-xl leading-none font-bold text-white">Undesia</span>
        </div>
    );
}
