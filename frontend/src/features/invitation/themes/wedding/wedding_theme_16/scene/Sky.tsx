import { useEffect, useMemo } from 'react';
import { BackSide, ShaderMaterial, SphereGeometry } from 'three';
import { skyUniforms } from './sharedUniforms';

const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = p.xyww; // keep the dome on the far plane
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uBottom;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  varying vec3 vDir;
  void main() {
    float h = vDir.y;
    vec3 color = h > 0.0 ? mix(uHorizon, uTop, pow(clamp(h, 0.0, 1.0), 0.55)) : mix(uHorizon, uBottom, clamp(-h * 4.0, 0.0, 1.0));
    float sun = max(dot(normalize(vDir), normalize(uSunDir)), 0.0);
    color += uSunColor * (pow(sun, 900.0) * 1.4 + pow(sun, 12.0) * 0.22);
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** Gradient sky dome with a soft sun glow. */
export function Sky() {
    const resources = useMemo(
        () => ({
            geometry: new SphereGeometry(400, 32, 16),
            material: new ShaderMaterial({
                uniforms: skyUniforms,
                vertexShader,
                fragmentShader,
                side: BackSide,
                depthWrite: false,
                fog: false,
            }),
        }),
        [],
    );

    useEffect(
        () => () => {
            resources.geometry.dispose();
            resources.material.dispose();
        },
        [resources],
    );

    return <mesh geometry={resources.geometry} material={resources.material} renderOrder={-1} frustumCulled={false} />;
}
