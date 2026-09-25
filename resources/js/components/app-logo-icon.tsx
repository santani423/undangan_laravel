import { BRAND_ICON_SRC } from '@/lib/brand';
import { cn } from '@/lib/utils';
import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({ className, alt = 'Undesia', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return <img src={BRAND_ICON_SRC} alt={alt} className={cn('object-contain', className)} {...props} />;
}
