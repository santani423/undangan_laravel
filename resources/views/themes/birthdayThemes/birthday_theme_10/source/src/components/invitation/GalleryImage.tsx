import { useState, type ImgHTMLAttributes } from 'react';
import { toyAssets } from '../../config/assets';

interface GalleryImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onError'> {
  src: string;
  alt: string;
}

/** Image that swaps to the pack's toy-blocks illustration when a photo fails to load. */
export function GalleryImg({ src, alt, className = '', ...rest }: GalleryImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === src;

  if (failed) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 bg-toy-lavender/25 p-4 text-center ${className}`} role="img" aria-label={`${alt} (foto tidak dapat dimuat)`}>
        <img src={toyAssets.gallery.fallback} alt="" className="h-1/2 max-h-32 w-auto" />
        <span className="text-xs font-semibold text-toy-ink-soft">Foto tidak dapat dimuat</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailedSrc(src)} {...rest} />;
}
