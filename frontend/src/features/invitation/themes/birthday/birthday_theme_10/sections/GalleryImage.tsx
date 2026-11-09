import { useState, type ImgHTMLAttributes } from 'react';
import { toyAssets } from '../lib/assets';
import { cx } from '../lib/cx';

interface GalleryImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onError'> {
    src: string;
    alt: string;
}

/** Image that swaps to the pack's toy-blocks illustration when a photo fails to load. */
export function GalleryImg({ src, alt, className, ...rest }: GalleryImageProps) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);

    if (failedSrc === src) {
        return (
            <div className={cx('bt10-img-failed', className)} role="img" aria-label={`${alt} (foto tidak dapat dimuat)`}>
                <img src={toyAssets.gallery.fallback} alt="" />
                <span>Foto tidak dapat dimuat</span>
            </div>
        );
    }
    return <img src={src} alt={alt} className={className} onError={() => setFailedSrc(src)} {...rest} />;
}
