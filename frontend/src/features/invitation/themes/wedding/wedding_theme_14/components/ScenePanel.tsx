import type { ReactNode } from 'react';
import type { PanelSide, SceneId } from '../lib/types';

/**
 * A feature panel anchored to the camera composition. The outer layer ignores pointer events so
 * wheel/touch scrolling always reaches the page; GSAP fades the inner <section> in and out.
 * Desktop: beside the focal point (left/right). Phones: a bottom sheet under the scene, above the tab bar.
 */
export function ScenePanel({ id, side, label, children }: { id: SceneId; side: PanelSide; label: string; children: ReactNode }) {
    return (
        <div className={`wt14-scene-panel wt14-side-${side}`}>
            <section data-panel={id} aria-label={label} className="wt14-panel wt14-panel-scroll" style={{ visibility: 'hidden', opacity: 0 }}>
                {children}
            </section>
        </div>
    );
}
