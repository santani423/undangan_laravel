// Grass vertex shader snippet for Three.js ShaderMaterial / custom material integration.
// Requires a position attribute and a per-vertex height attribute (or derive height from local Y).
uniform float uTime;
uniform float uWindStrength;
uniform vec2 uWindDirection;

varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 p = position;
  float heightFactor = clamp(p.y, 0.0, 1.0);
  float phase = dot(p.xz, normalize(uWindDirection + vec2(0.0001))) * 1.7;
  float sway = sin(uTime * 1.4 + phase) * uWindStrength;
  // Keep the base anchored; bend the tip progressively.
  p.x += sway * heightFactor * heightFactor;
  p.z += cos(uTime * 1.1 + phase * 0.7) * uWindStrength * 0.25 * heightFactor;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
