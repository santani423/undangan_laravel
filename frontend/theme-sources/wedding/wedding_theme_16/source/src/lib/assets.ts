/** Resolves a public-folder path against Vite's base URL (supports sub-path deploys). */
export function assetUrl(path: string | undefined): string | undefined {
  if (!path) return undefined;
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

/** The supplied UI icons from the asset pack. */
export type AssetIconName = 'calendar' | 'location' | 'music' | 'gift' | 'heart' | 'gallery';

export function iconUrl(name: AssetIconName): string {
  return `${import.meta.env.BASE_URL}assets/icons/${name}.svg`;
}
