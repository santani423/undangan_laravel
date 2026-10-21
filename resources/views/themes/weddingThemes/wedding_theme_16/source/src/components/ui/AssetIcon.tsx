import { iconUrl, type AssetIconName } from '../../lib/assets';

/** One of the supplied asset-pack SVG icons, used decoratively. */
export function AssetIcon({ name, className = 'size-10' }: { name: AssetIconName; className?: string }) {
  return <img src={iconUrl(name)} alt="" aria-hidden="true" className={className} width={40} height={40} decoding="async" />;
}
