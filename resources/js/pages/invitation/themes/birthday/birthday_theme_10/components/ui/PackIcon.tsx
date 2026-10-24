import type { CSSProperties } from 'react';
import { toyAssets, type PackIconName } from '../../lib/assets';
import { cx } from '../../lib/cx';

interface PackIconProps {
    name: PackIconName;
    size?: number;
    className?: string;
}

/**
 * Renders one of the asset pack's UI icons (assets/ui/*.svg). The SVG is
 * applied as a CSS mask so it inherits `currentColor` like an inline icon.
 * Lucide React supplies the icons the pack does not include.
 */
export function PackIcon({ name, size = 20, className }: PackIconProps) {
    const style = { width: size, height: size, '--icon': `url("${toyAssets.ui[name]}")` } as CSSProperties;
    return <span aria-hidden="true" className={cx('bt10-pack-icon', className)} style={style} />;
}
