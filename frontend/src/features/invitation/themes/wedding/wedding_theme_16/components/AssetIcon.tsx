import { iconUrl, type AssetIconName } from '../lib/aset';
import { cx } from '../lib/cx';

/** One of the supplied asset-pack SVG icons, used decoratively. */
export function AssetIcon({ name, className }: { name: AssetIconName; className?: string }) {
    return <img src={iconUrl(name)} alt="" aria-hidden="true" className={cx('wt16-asset-icon', className)} width={40} height={40} decoding="async" />;
}
