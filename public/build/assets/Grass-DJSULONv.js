import{r as v,j as P}from"./app-DjCwi9X6.js";import{U as W}from"./three.module-DlVhPLQn.js";import{C as E}from"./camera-UwyaJA7C.js";import{P as I,W as y,N as V}from"./world-rXDJE_mP.js";import{m as R,a as C,d as S}from"./geometry-mjVzwoVM.js";import{g as U,w as j}from"./wind-BdPs6JN7.js";import{m as k,D as G,V as B,bT as N,v as O,f as b,bZ as q,eW as K,dK as Q,j as Z,K as M}from"./three.core-CpBsj1UV.js";import"./app-Cny16GSG.js";import"./RoundedBoxGeometry-8nUeJhHb.js";import"./BufferGeometryUtils-qP6uOrgS.js";const J=`
uniform float uTime;
uniform float uWindStrength;
uniform vec2 uWindDir;
uniform vec2 uFade;
attribute vec4 aVar; // x: phase, y: amplitude, z: tint, w: dryness
varying float vH;
varying vec3 vTint;
varying float vLight;
#include <common>
#include <fog_pars_vertex>
uniform vec3 uSunDir;

void main() {
  vec3 p = position;
  float heightFactor = clamp(uv.y, 0.0, 1.0);
  vec4 base = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  float dist = distance(base.xz, cameraPosition.xz);
  float fade = 1.0 - smoothstep(uFade.x, uFade.y, dist);
  vec4 wp = modelMatrix * instanceMatrix * vec4(p.x * fade, p.y * fade, p.z * fade, 1.0);
  vec2 dir = normalize(uWindDir + vec2(0.0001));
  float along = dot(base.xz, dir);
  float phase = along * 0.42 + aVar.x;
  float gust = 0.6 + 0.4 * sin(uTime * 0.42 - along * 0.09);
  float sway = (sin(uTime * 1.35 + phase) * 0.72 + sin(uTime * 2.6 + phase * 1.9) * 0.28) * uWindStrength * gust * aVar.y;
  float bladeH = length(instanceMatrix[1].xyz) * fade;
  float bend = heightFactor * heightFactor;
  float lean = 0.12 * uWindStrength * gust;
  float offs = (sway * 0.3 + lean) * bend * bladeH;
  wp.xz += dir * offs;
  wp.xz += vec2(-dir.y, dir.x) * cos(uTime * 1.1 + phase * 0.7) * uWindStrength * 0.05 * bend * bladeH;
  wp.y -= offs * offs / max(bladeH, 0.05) * 0.5; // keep blade length ~constant while bending
  vH = heightFactor;
  vTint = vec3(aVar.z, aVar.w, 0.0);
  // blades are thin: light them mostly by how much sun reaches the canopy, with back-light glow
  vec3 viewDir = normalize(cameraPosition - wp.xyz);
  float back = pow(max(dot(-viewDir, uSunDir), 0.0), 3.0);
  vLight = 0.55 + 0.45 * max(uSunDir.y, 0.0) + back * 0.6 * heightFactor;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`,X=`
uniform vec3 uSunColor;
uniform float uSunIntensity;
uniform vec3 uAmbient;
varying float vH;
varying vec3 vTint;
varying float vLight;
#include <common>
#include <fog_pars_fragment>

void main() {
  vec3 root = vec3(0.035, 0.055, 0.02);
  vec3 mid = vec3(0.12, 0.2, 0.05);
  vec3 tipLush = vec3(0.24, 0.34, 0.09);
  vec3 tipDry = vec3(0.38, 0.36, 0.14);
  vec3 tip = mix(tipLush, tipDry, vTint.y);
  vec3 col = vH < 0.5 ? mix(root, mid, vH * 2.0) : mix(mid, tip, (vH - 0.5) * 2.0);
  col *= 0.82 + vTint.x * 0.36;
  float ao = 0.45 + 0.55 * smoothstep(0.0, 0.6, vH);
  vec3 light = uAmbient * ao + uSunColor * uSunIntensity * 0.3 * vLight * ao;
  gl_FragColor = vec4(col * light, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}
`;function Y(){const o=[],a=[],n=[];for(let i=0;i<=4;i++){const t=i/4,c=.045*(1-Math.pow(t,1.4)*.94),u=t*t*.1;o.push(-c/2,t,u,c/2,t,u),a.push(0,t,1,t)}for(let i=0;i<4;i++){const t=i*2;n.push(t,t+1,t+2,t+1,t+3,t+2)}const r=new Z;return r.setAttribute("position",new M(o,3)),r.setAttribute("uv",new M(a,2)),r.setIndex(n),r}const $=E.flatMap(e=>e.positions.map(o=>[o[0],o[2]]));function tt(e,o){const a=S(e,o,$);let n=a<16?1:a<34?1-(a-16)/18*.75:.18;return e>10&&e<46&&o>-54&&o<-16&&(n=Math.max(n,.85)),n}function lt({count:e,fade:o}){const a=v.useRef(null),n=v.useMemo(()=>Y(),[]),r=v.useMemo(()=>new k({vertexShader:J,fragmentShader:X,uniforms:{...N.clone(W.fog),...j,...U,uFade:{value:new B(o[0],o[1])}},side:G,fog:!0}),[o]);return v.useLayoutEffect(()=>{const i=a.current;if(!i)return;const t=R(2027),c=new Float32Array(e*4),u=new O,p=new K,g=new q,x=new b,A=new b,w=y.garden.pond;let s=0,H=0;for(;s<e&&H++<e*30;){const f=-48+t()*100,l=-92+t()*134;if(t()>tt(f,l)||C(f,l,V,.25)||I.some(m=>S(f,l,m.points)<m.width/2+.15)||Math.hypot(f-w[0],l-w[2])<y.garden.pondRadius+.45)continue;const T=4+Math.floor(t()*7),F=.22+t()*.3,_=t()<.18?.5+t()*.5:t()*.25;for(let m=0;m<T&&s<e;m++){const h=t()*Math.PI*2,d=Math.sqrt(t())*.22,z=f+Math.cos(h)*d,D=l+Math.sin(h)*d,L=F*(.6+(1-d/.22)*.5+t()*.25);g.set((t()-.5)*.35+Math.cos(h)*d*.8,t()*Math.PI*2,(t()-.5)*.35+Math.sin(h)*d*.8),p.setFromEuler(g),x.set(.75+t()*.6,L,1),u.compose(A.set(z,-.01,D),p,x),i.setMatrixAt(s,u),c[s*4]=t()*Math.PI*2,c[s*4+1]=.7+t()*.6,c[s*4+2]=t(),c[s*4+3]=_,s++}}i.count=s,n.setAttribute("aVar",new Q(c,4)),i.instanceMatrix.needsUpdate=!0},[e,n]),v.useLayoutEffect(()=>()=>{n.dispose(),r.dispose()},[n,r]),P.jsx("instancedMesh",{ref:a,args:[n,r,e],frustumCulled:!1})}export{lt as Grass};
