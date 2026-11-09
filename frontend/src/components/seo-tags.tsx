import { useLayoutEffect } from 'react';

/**
 * SEO / Open Graph metadata of an indexable public page, as built by the
 * backend (App\Services\SeoService → `seo` key of the landing / wedding /
 * themes API responses). Under Inertia these tags were server-rendered by the
 * <x-seo> Blade component; the SPA writes them into <head> for crawlers that
 * run JavaScript (Google). Link-preview bots get the same tags server-side
 * from the backend crawler renderer (/seo/…).
 */
export interface SeoMeta {
    title: string;
    description: string;
    robots: string;
    canonical: string | null;
    icon: string | null;
    /** [attribute ('name' | 'property'), key, content] */
    meta: [string, string, string][];
    jsonLd: Record<string, unknown> | null;
}

function upsertMeta(attribute: string, key: string, content: string): () => void {
    const selector = `meta[${attribute === 'name' ? 'name' : 'property'}="${CSS.escape(key)}"]`;
    let element = document.head.querySelector<HTMLMetaElement>(selector);
    const created = !element;
    const previous = element?.getAttribute('content') ?? null;

    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute === 'name' ? 'name' : 'property', key);
        document.head.appendChild(element);
    }
    element.setAttribute('content', content);

    return () => {
        if (created) element?.remove();
        else if (previous !== null) element?.setAttribute('content', previous);
    };
}

export default function SeoTags({ seo }: { seo?: SeoMeta | null }) {
    useLayoutEffect(() => {
        if (!seo) return;

        const cleanups: (() => void)[] = [];

        if (seo.description) cleanups.push(upsertMeta('name', 'description', seo.description));
        cleanups.push(upsertMeta('name', 'robots', seo.robots));
        seo.meta.forEach(([attribute, key, content]) => cleanups.push(upsertMeta(attribute, key, content)));

        if (seo.canonical) {
            const link = document.createElement('link');
            link.rel = 'canonical';
            link.href = seo.canonical;
            document.head.appendChild(link);
            cleanups.push(() => link.remove());
        }

        if (seo.jsonLd) {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.text = JSON.stringify(seo.jsonLd);
            document.head.appendChild(script);
            cleanups.push(() => script.remove());
        }

        return () => cleanups.reverse().forEach((cleanup) => cleanup());
    }, [seo]);

    return null;
}
