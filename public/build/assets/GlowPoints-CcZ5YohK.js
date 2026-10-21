import{r as p,j as w}from"./app-DjCwi9X6.js";import{s as F}from"./sceneFx-BkHx9WcG.js";import{a as T,u as S}from"./events-9ce18a08.esm-DeliF_-e.js";import{j as y,p as m,m as A,c as b,e as x,eq as M}from"./three.core-CpBsj1UV.js";import"./app-Cny16GSG.js";import"./three.module-DlVhPLQn.js";const z=`
  uniform float uTime;
  uniform float uScale;
  uniform float uDrift;
  uniform float uTwinkle;
  uniform float uFlicker;
  uniform float uOpacity;
  uniform float uFadeNear;
  uniform float uFadeFar;
  attribute vec3 color;
  attribute float aSize;
  attribute float aPhase;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float ph = aPhase * 6.2831853;
    vec3 p = position;
    p += uDrift * vec3(
      sin(uTime * 0.31 + ph) * 0.9 + sin(uTime * 0.17 + ph * 2.3) * 0.5,
      sin(uTime * 0.47 + ph * 1.7) * 0.45,
      cos(uTime * 0.27 + ph * 1.3) * 0.9
    );
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float tw = mix(1.0, 0.25 + 0.75 * pow(0.5 + 0.5 * sin(uTime * (0.9 + aPhase * 1.6) + ph), 2.0), uTwinkle);
    float fl = 1.0 + uFlicker * (sin(uTime * 7.3 + ph) * 0.55 + sin(uTime * 12.7 + ph * 3.0) * 0.45);
    float dist = -mv.z;
    vAlpha = tw * fl * uOpacity * (1.0 - smoothstep(uFadeNear, uFadeFar, dist)) * smoothstep(0.6, 2.2, dist);
    vColor = color;
    gl_PointSize = min(aSize * uScale / max(dist, 0.1), 256.0);
  }
`,P=`
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c) * 2.0;
    float core = exp(-d * d * 18.0);
    float halo = exp(-d * d * 3.2) * 0.5;
    float a = (core + halo) * (1.0 - smoothstep(0.8, 1.0, d)) * vAlpha;
    if (a < 0.003) discard;
    gl_FragColor = vec4(vColor * (1.0 + core * 0.6), a);
  }
`;function _({data:t,drift:o=0,twinkle:s=0,flicker:n=0,opacity:u=1,fadeNear:l=40,fadeFar:a=70,renderOrder:i=2}){const{size:r,viewport:v}=T(),f=p.useMemo(()=>{const e=new y;return e.setAttribute("position",new m(t.positions,3)),e.setAttribute("color",new m(t.colors,3)),e.setAttribute("aSize",new m(t.sizes,1)),e.setAttribute("aPhase",new m(t.phases,1)),e.computeBoundingSphere(),e.boundingSphere&&(e.boundingSphere.radius+=o*2),e},[t,o]),c=p.useMemo(()=>new A({uniforms:{uTime:{value:0},uScale:{value:500},uDrift:{value:o},uTwinkle:{value:s},uFlicker:{value:n},uOpacity:{value:u},uFadeNear:{value:l},uFadeFar:{value:a}},vertexShader:z,fragmentShader:P,transparent:!0,depthWrite:!1,blending:b,toneMapped:!1}),[o,s,n,u,l,a]);return p.useEffect(()=>()=>f.dispose(),[f]),p.useEffect(()=>()=>c.dispose(),[c]),S(({camera:e,clock:h})=>{const d=e,g=M.degToRad(d.fov);c.uniforms.uScale.value=r.height*v.dpr/(2*Math.tan(g/2)),c.uniforms.uTime.value=F.reducedMotion?0:h.elapsedTime}),w.jsx("points",{geometry:f,material:c,renderOrder:i})}function G(t){const o=t.length,s=new Float32Array(o*3),n=new Float32Array(o*3),u=new Float32Array(o),l=new Float32Array(o),a=new x;return t.forEach((i,r)=>{s.set(i.p,r*3),a.set(i.color).multiplyScalar(i.intensity??1),n.set([a.r,a.g,a.b],r*3),u[r]=i.size,l[r]=i.phase??Math.random()}),{positions:s,colors:n,sizes:u,phases:l}}export{_ as GlowPoints,G as buildGlowData};
