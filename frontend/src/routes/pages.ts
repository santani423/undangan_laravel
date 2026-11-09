import type { ComponentType } from 'react';

/**
 * Page components, one lazily loaded chunk each (same as the Inertia page
 * resolver's import.meta.glob). Loaders resolve the module before the route
 * renders, so the previous page stays on screen until the next one is ready.
 */
export type PageComponent = ComponentType<Record<string, unknown>>;

const modules = import.meta.glob<{ default: PageComponent }>('../pages/**/*.tsx');
const resolved = new Map<string, PageComponent>();

export function hasPage(name: string): boolean {
    return `../pages/${name}.tsx` in modules;
}

export async function loadPageComponent(name: string): Promise<PageComponent> {
    const cached = resolved.get(name);
    if (cached) return cached;

    const load = modules[`../pages/${name}.tsx`];
    if (!load) throw new Error(`Page "${name}" not found in src/pages.`);

    const component = (await load()).default;
    resolved.set(name, component);
    return component;
}
