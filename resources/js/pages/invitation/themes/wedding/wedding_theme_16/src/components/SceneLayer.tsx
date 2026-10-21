import { Component, Suspense, lazy, useMemo, type ReactNode } from 'react';
import { useInvitationData } from '../hooks/useInvitationData';
import { assetUrl } from '../lib/assets';
import type { QualityTier } from '../lib/quality';
import { sceneStatus, useSceneStatus } from '../scene/sceneStatus';
import { StaticGarden } from './ui/StaticGarden';

// three.js, R3F and the garden live in a separate chunk so the invitation's
// HTML content never waits for the 3D bundle.
const WeddingScene = lazy(() => import('../scene/WeddingScene'));

class SceneErrorBoundary extends Component<{ onError: (reason: string) => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.warn('[undesia] Taman 3D dinonaktifkan:', error);
    sceneStatus.set({ phase: 'failed' });
    this.props.onError(error.message);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

interface SceneLayerProps {
  enabled: boolean;
  tier: QualityTier;
  reducedMotion: boolean;
  onFailure: (reason: string) => void;
}

/**
 * Fixed background layer: the static voxel illustration is always available;
 * the real-time WebGL garden fades in over it once ready.
 */
export function SceneLayer({ enabled, tier, reducedMotion, onFailure }: SceneLayerProps) {
  const { config } = useInvitationData();
  const status = useSceneStatus();
  const ready = enabled && status.phase === 'ready';

  const palette = useMemo(() => config.dressCode.palette.map((swatch) => swatch.hex), [config]);
  const galleryImages = useMemo(
    () =>
      config.gallery
        .filter((item) => item.kind === 'image' && (item.thumbnail ?? item.src))
        .slice(0, 3)
        .map((item) => assetUrl(item.thumbnail ?? item.src) as string),
    [config],
  );

  return (
    <>
      {!ready && <StaticGarden />}
      {enabled && (
        <div
          className={`pointer-events-none fixed inset-0 z-0 transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden="true"
          data-testid="scene-layer"
        >
          <SceneErrorBoundary onError={onFailure}>
            <Suspense fallback={null}>
              <WeddingScene
                initialTier={tier}
                reducedMotion={reducedMotion}
                palette={palette}
                galleryImages={galleryImages}
                onFailure={onFailure}
              />
            </Suspense>
          </SceneErrorBoundary>
        </div>
      )}
      {/* Soft vignette keeps HTML text legible over bright scenery. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(46, 42, 34, 0.18) 100%)' }}
      />
    </>
  );
}
