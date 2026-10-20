import { useFrame } from '@react-three/fiber';
import { useRef, type ReactNode } from 'react';
import type * as THREE from 'three';
import type { QualityTier } from '../lib/device';
import { CameraRig } from './CameraRig';
import { Fireflies, Mist, Petals } from './effects/Atmosphere';
import { Forest } from './environment/Forest';
import { ForestPath, Ground } from './environment/Ground';
import { Lanterns } from './environment/Lanterns';
import { Lighting } from './environment/Lighting';
import { Sky } from './environment/Sky';
import { Vegetation } from './environment/Vegetation';
import { FOCI, type Vec3 } from './layout';
import { Ceremony } from './props/Ceremony';
import { CoupleClearing, ForestGate } from './props/Clearings';
import { Envelope } from './props/Envelope';
import { MoonPlatform } from './props/MoonPlatform';
import { GalleryRing, Gazebo, WishingTree } from './props/Pavilions';
import { StoryGlade } from './props/StoryGlade';

/** Hides a set piece (and skips its draw calls) while the camera is far away. */
function Near({ center, radius = 48, children }: { center: Vec3; radius?: number; children: ReactNode }) {
    const g = useRef<THREE.Group>(null);
    useFrame(({ camera }) => {
        if (!g.current) return;
        const dx = camera.position.x - center[0];
        const dz = camera.position.z - center[2];
        g.current.visible = dx * dx + dz * dz < radius * radius;
    });
    return <group ref={g}>{children}</group>;
}

export function World({ quality }: { quality: QualityTier }) {
    return (
        <>
            <CameraRig />
            <Lighting />
            <Sky quality={quality} />
            <Ground quality={quality} />
            <ForestPath />
            <Forest quality={quality} />
            <Vegetation quality={quality} />
            <Lanterns />
            <Mist quality={quality} />
            <Fireflies quality={quality} />
            <Petals quality={quality} />

            <Near center={FOCI.envelope} radius={30}>
                <Envelope />
            </Near>
            <Near center={FOCI.gate}>
                <ForestGate />
            </Near>
            <Near center={FOCI.couple}>
                <CoupleClearing />
            </Near>
            <Near center={FOCI.countdown}>
                <MoonPlatform />
            </Near>
            <Near center={FOCI.story}>
                <StoryGlade />
            </Near>
            <Near center={FOCI.event} radius={55}>
                <Ceremony />
            </Near>
            <Near center={FOCI.gallery}>
                <GalleryRing />
            </Near>
            <Near center={FOCI.rsvp}>
                <Gazebo />
            </Near>
            <Near center={FOCI.wishes} radius={60}>
                <WishingTree />
            </Near>
        </>
    );
}
