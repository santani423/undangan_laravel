import{r as c,j as p}from"./app-a14SgvEg.js";import{U as j}from"./three.module-Cn2LlBd0.js";import{a as B,v as A}from"./math-Cb79_-x-.js";import{c as G,G as C}from"./world-DpVuxjUF.js";import{b as z,e as L,d as V}from"./curves-Cmeh0Aw4.js";import{W as X,b as l}from"./wind-CcMZ8O9E.js";import{r as k,b$ as O,D as Q,C as _,M as $,V as d,Q as q,dP as P,b0 as K}from"./three.core-BU4w5hFA.js";import"./app-BoNnqKgU.js";import"./journey--2ZUA0Zy.js";const Y=`
#include <common>
#include <fog_pars_vertex>
${X}
uniform float uAmp;
attribute vec3 aTint;
attribute float aPhase;
varying float vH;
varying vec3 vTint;
varying float vGust;

void main() {
  float h = uv.y;                                   // 0 at the root, 1 at the tip
  vec4 root = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);

  // Shared gust field sampled at the root → neighbouring blades move together.
  float gust = windField(root.xz, uTime);
  // Small per-blade phase offset (fixed at creation, not random per frame).
  float flutter = sin(uTime * 2.6 + aPhase) * 0.2 + sin(uTime * 4.1 + aPhase * 1.7) * 0.07;
  float bend = h * h;                               // roots stay anchored
  vec2 disp = uWindDir * (gust + flutter) * uWindStrength * uAmp * bend;
  world.xz += disp;
  world.y -= dot(disp, disp) * 1.6;                 // keep blade length roughly constant

  vec4 mvPosition = viewMatrix * world;
  gl_Position = projectionMatrix * mvPosition;
  vH = h;
  vTint = aTint;
  vGust = gust;
  #include <fog_vertex>
}`,Z=`
#include <common>
#include <fog_pars_fragment>
uniform vec3 uBase;
uniform vec3 uTip;
varying float vH;
varying vec3 vTint;
varying float vGust;

void main() {
  vec3 col = mix(uBase, uTip, smoothstep(0.0, 1.0, vH)) * vTint;
  col *= 0.94 + 0.14 * vGust * vH;                  // bent tips catch a little more light
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;function J(){const e=new K(.075,1,1,4);e.translate(0,.5,0);const t=e.attributes.position;for(let n=0;n<t.count;n++){const o=t.getY(n);t.setX(n,t.getX(n)*(1-Math.pow(o,1.4)*.92)),t.setZ(n,o*o*.12)}return e.computeVertexNormals(),e}const f=6;function tt(e){const t=B(1337),n=Array.from({length:f},()=>({m:[],t:[],p:[]})),o=z,s=new $,h=new q,g=new d,D=new d,R=new d(0,1,0);let v=0,x=0;for(;v<e&&x<e*10;){x++;const a=Math.floor(t()*o.length),[W,U]=o[a],M=t()*Math.PI*2,w=Math.pow(t(),.75)*17,r=W+Math.cos(M)*w,i=U+Math.sin(M)*w;if(A(r*.32,i*.32)<.3+t()*.22||!L(r,i,1.1))continue;const y=V(r,i);if(y<G/2+.42)continue;let b=!1;for(const[H,N,S]of C)if((r-H)**2+(i-N)**2<S*S){b=!0;break}if(b)continue;const I=y<G/2+1.4?.65:1,E=(.2+.3*A(r*.9+11,i*.9)+t()*.08)*I;h.setFromAxisAngle(R,t()*Math.PI*2),g.set(.8+t()*.6,E,1),s.compose(D.set(r,0,i),h,g);const F=Math.min(f-1,Math.floor(a/o.length*f)),u=n[F];u.m.push(...s.elements);const m=.86+t()*.24,T=t()<.14?1.08:1;u.t.push(m*T,m,m*(T>1?.88:1)),u.p.push(t()*Math.PI*2),v++}return n.map(a=>({matrices:new Float32Array(a.m),tints:new Float32Array(a.t),phases:new Float32Array(a.p),count:a.p.length}))}function et({chunk:e,material:t}){const n=c.useRef(null),o=c.useMemo(()=>{const s=J();return s.setAttribute("aTint",new P(e.tints,3)),s.setAttribute("aPhase",new P(e.phases,1)),s},[e]);return c.useLayoutEffect(()=>{const s=n.current;return s.instanceMatrix.array.set(e.matrices),s.instanceMatrix.needsUpdate=!0,s.computeBoundingSphere(),()=>o.dispose()},[e,o]),e.count===0?null:p.jsx("instancedMesh",{ref:n,args:[o,t,e.count]})}function dt({count:e}){const t=c.useMemo(()=>tt(e),[e]),n=c.useMemo(()=>{const o=new k({vertexShader:Y,fragmentShader:Z,side:Q,fog:!0,uniforms:O.merge([j.fog,{uBase:{value:new _("#4fae68")},uTip:{value:new _("#c2f29f")},uAmp:{value:.2}}])});return o.uniforms.uTime=l.uTime,o.uniforms.uWindDir=l.uWindDir,o.uniforms.uWindStrength=l.uWindStrength,o},[]);return p.jsx("group",{children:t.map((o,s)=>p.jsx(et,{chunk:o,material:n},s))})}export{dt as WindyGrass};
