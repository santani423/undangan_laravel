import { useFrame } from '@react-three/fiber';
import { useEffect } from 'react';
import { toyAssets } from '../lib/assets';
import type { QualitySettings } from '../lib/device';
import { Clouds } from './Clouds';
import { Confetti } from './Confetti';
import { preloadSafeTextures } from './core/criticalTextures';
import { validateLayout } from './core/validateLayout';
import { windUniforms } from './core/wind';
import { Flowers } from './Flowers';
import { Playground } from './Playground';
import { Signposts } from './Props';
import { SceneLights } from './SceneLights';
import { Sea, ShoreFoam, SkyDome } from './SkyAndSea';
import { Island, Road, RoadCurbs, SteppingStones } from './Terrain';
import { ToyCars } from './ToyCar';
import { ToyHouses } from './ToyHouse';
import { ToyTrees } from './ToyTree';
import { WindyGrass } from './WindyGrass';
import { BirthdayProfileWorld } from './worlds/BirthdayProfileWorld';
import { EntranceWorld } from './worlds/EntranceWorld';
import { EventPartyWorld } from './worlds/EventPartyWorld';
import { MemoryGalleryWorld } from './worlds/MemoryGalleryWorld';
import { RSVPAndGiftWorld } from './worlds/RSVPAndGiftWorld';

// Critical pack textures start downloading together as soon as the 3D chunk loads.
preloadSafeTextures([
    toyAssets.textures.grassColor,
    toyAssets.textures.grassNormal,
    toyAssets.textures.grassRoughness,
    toyAssets.sprites.confetti,
    toyAssets.sprites.softParticle,
]);

/** Advances the shared wind clock; gusts slowly breathe stronger and calmer. */
function WindDriver({ reducedMotion }: { reducedMotion: boolean }) {
    useFrame((state, dt) => {
        const step = Math.min(dt, 0.05);
        windUniforms.uTime.value += step * (reducedMotion ? 0.3 : 1);
        const breathing = 0.85 + Math.sin(state.clock.elapsedTime * 0.11) * 0.15;
        windUniforms.uWindStrength.value = (reducedMotion ? 0.3 : 1) * breathing;
    });
    return null;
}

interface ToyWorldEnvironmentProps {
    quality: QualitySettings;
    reducedMotion: boolean;
}

/**
 * The single connected island: shared terrain, road, nature and the five
 * invitation destinations along one camera journey.
 */
export function ToyWorldEnvironment({ quality, reducedMotion }: ToyWorldEnvironmentProps) {
    const animate = !reducedMotion;

    useEffect(() => {
        if (import.meta.env.DEV) validateLayout();
    }, []);

    return (
        <>
            <WindDriver reducedMotion={reducedMotion} />
            <SceneLights quality={quality} />
            <SkyDome />
            <Sea />
            <ShoreFoam />
            <Clouds count={quality.cloudCount} animate={animate} />

            <Island />
            <Road />
            <RoadCurbs />
            <SteppingStones />
            <WindyGrass count={quality.grassBlades} />
            <Flowers density={quality.flowerScale} />
            <ToyTrees />
            <ToyHouses />
            <Signposts />
            <Playground animate={animate} />

            <EntranceWorld animate={animate} />
            <BirthdayProfileWorld animate={animate} />
            <EventPartyWorld animate={animate} />
            <MemoryGalleryWorld animate={animate} />
            <RSVPAndGiftWorld animate={animate} />

            <ToyCars animate={animate} />
            <Confetti reducedMotion={reducedMotion} />
        </>
    );
}
