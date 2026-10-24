import type { ThreeElements } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { whenFontsReady } from '../lib/theme';

/**
 * Text labels for the 3D world (signs, letter blocks, mailbox). Glyphs are
 * drawn with Canvas2D in the theme's Fredoka font and shown on a lit plane —
 * no extra WebGL context or worker.
 */

const PX = 128; // texture pixels per em
const plane = new THREE.PlaneGeometry(1, 1);

interface Label {
    material: THREE.MeshStandardMaterial;
    /** Size in em units. */
    width: number;
    height: number;
}

let fontReady: Promise<void> | null = null;
const ensureFont = () =>
    (fontReady ??= whenFontsReady()
        .then(() => document.fonts.load(`600 ${PX}px Fredoka`))
        .then(() => undefined)
        .catch(() => undefined));

const labels = new Map<string, Label>();

function buildLabel(text: string, color: string, outlineColor: string, outlinePx: number): Label {
    const font = `600 ${PX}px Fredoka, "Segoe UI", system-ui, sans-serif`;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    ctx.font = font;
    const pad = Math.ceil(outlinePx + PX * 0.12);
    canvas.width = Math.ceil(ctx.measureText(text).width + pad * 2);
    canvas.height = Math.ceil(PX * 1.25 + pad * 2);
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const x = canvas.width / 2;
    const y = canvas.height / 2 + PX * 0.06;
    if (outlinePx > 0) {
        ctx.lineJoin = 'round';
        ctx.lineWidth = outlinePx * 2;
        ctx.strokeStyle = outlineColor;
        ctx.strokeText(text, x, y);
    }
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.08,
        roughness: 0.75,
        polygonOffset: true,
        polygonOffsetFactor: -2,
    });
    return { material, width: canvas.width / PX, height: canvas.height / PX };
}

type GroupProps = Omit<ThreeElements['group'], 'children'>;

interface ToyTextProps extends GroupProps {
    children: string | number;
    /** Em height in world units. */
    fontSize?: number;
    color?: string;
    /** Outline thickness in world units. */
    outlineWidth?: number;
    outlineColor?: string;
    /** Shrinks the label to fit this width (world units). */
    maxWidth?: number;
}

export function ToyText({
    children,
    fontSize = 0.3,
    color = '#3b3355',
    outlineWidth = 0,
    outlineColor = '#3b3355',
    maxWidth,
    ...group
}: ToyTextProps) {
    const text = String(children);
    const outlinePx = Math.round((outlineWidth / fontSize) * PX);
    const key = `${text}|${color}|${outlineColor}|${outlinePx}`;
    const [label, setLabel] = useState<Label | null>(() => labels.get(key) ?? null);

    useEffect(() => {
        let alive = true;
        void ensureFont().then(() => {
            if (!alive) return;
            let l = labels.get(key);
            if (!l) {
                l = buildLabel(text, color, outlineColor, outlinePx);
                labels.set(key, l);
            }
            setLabel(l);
        });
        return () => {
            alive = false;
        };
    }, [key, text, color, outlineColor, outlinePx]);

    if (!label) return null;
    const scale = maxWidth && label.width * fontSize > maxWidth ? maxWidth / label.width : fontSize;
    return (
        <group {...group}>
            <mesh geometry={plane} material={label.material} scale={[label.width * scale, label.height * scale, 1]} />
        </group>
    );
}
