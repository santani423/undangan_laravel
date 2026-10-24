import{r as u,j as s}from"./app-a14SgvEg.js";import{m as y}from"./random-CPzXs6PK.js";import{GlowPoints as x}from"./GlowPoints-CsnFWs4p.js";import{e as p}from"./envState-CawKhTNc.js";import{useDisposable as g}from"./Instanced-_1YnBmxC.js";import{M as F}from"./layout-zRz2d0P1.js";import{g as S,a as b}from"./textures-rWRKm9fK.js";import{u as j}from"./events-9ce18a08.esm-q5nHFBix.js";import{V as w,bX as D,C as t,r as z,p as k,S as G}from"./three.core-BU4w5hFA.js";import"./app-BoNnqKgU.js";import"./sceneFx-BkHx9WcG.js";import"./waypoints-GDTohzSn.js";import"./three.module-Cn2LlBd0.js";const M=new w(...F).normalize(),O=`
  varying vec3 vDir;
  void main() {
    vDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,T=`
  uniform vec3 uTop;
  uniform vec3 uMid;
  uniform vec3 uHorizon;
  uniform vec3 uGlow;
  uniform vec3 uFog;
  uniform vec3 uMoonDir;
  uniform float uMoon;
  varying vec3 vDir;
  void main() {
    vec3 d = normalize(vDir);
    float h = d.y;
    vec3 col = mix(uHorizon, uMid, smoothstep(0.02, 0.3, h));
    col = mix(col, uTop, smoothstep(0.3, 0.9, h));
    // Lingering dusk glow just above the horizon.
    col += uGlow * exp(-abs(h - 0.05) * 11.0) * 0.16;
    // Blend into the fog colour below the horizon so distant trees dissolve seamlessly.
    col = mix(col, uFog, smoothstep(0.12, -0.08, h));
    float m = max(dot(d, uMoonDir), 0.0);
    col += vec3(0.95, 0.88, 0.7) * pow(m, 48.0) * 0.28 * uMoon;
    col += vec3(0.7, 0.78, 0.98) * pow(m, 6.0) * 0.08 * uMoon;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;function A(e){const o=y(42),a=new Float32Array(e*3),i=new Float32Array(e*3),l=new Float32Array(e),f=new Float32Array(e),d=[new t("#fff8ee"),new t("#b9d5f2"),new t("#f5d58b"),new t("#f2c5d2")],n=new w;for(let r=0;r<e;r++){const c=.08+Math.pow(o(),.7)*.92,m=o()*Math.PI*2,h=Math.sqrt(1-c*c);n.set(Math.cos(m)*h,c,Math.sin(m)*h).multiplyScalar(250),a.set([n.x,n.y,n.z],r*3);const v=d[o()<.7?0:1+Math.floor(o()*3)].clone().multiplyScalar(.7+o()*.9);i.set([v.r,v.g,v.b],r*3),l[r]=.5+Math.pow(o(),3)*1.8,f[r]=o()}return{positions:a,colors:i,sizes:l,phases:f}}function J({quality:e}){const o=u.useRef(null),a=u.useRef(null),i=u.useRef(null),l=g(()=>new z({uniforms:{uTop:{value:new t("#0c0e29")},uMid:{value:new t("#24294B")},uHorizon:{value:new t("#5d5790")},uGlow:{value:new t("#F2C5D2")},uFog:{value:p.fog.clone()},uMoonDir:{value:M},uMoon:{value:1}},vertexShader:O,fragmentShader:T,side:k,depthWrite:!1,fog:!1}),[]),f=g(()=>new G(300,40,20),[]),d=u.useMemo(()=>A(e==="high"?1400:e==="medium"?900:500),[e]),n=u.useMemo(()=>M.clone().multiplyScalar(230),[]);return j(({camera:r,clock:c})=>{var m;(m=o.current)==null||m.position.copy(r.position),l.uniforms.uFog.value.copy(p.fog),l.uniforms.uMoon.value=p.moon,a.current&&a.current.color.setScalar(1.15+p.moon*.35),i.current&&(i.current.opacity=.22+p.moon*.12+Math.sin(c.elapsedTime*.6)*.02)}),s.jsxs("group",{ref:o,children:[s.jsx("mesh",{geometry:f,material:l,renderOrder:-10,frustumCulled:!1}),s.jsx(x,{data:d,twinkle:.85,fadeNear:1e3,fadeFar:2e3,opacity:.9,renderOrder:-9}),s.jsx("sprite",{position:n,scale:110,renderOrder:-8,children:s.jsx("spriteMaterial",{ref:i,map:S(),color:"#f5d58b",transparent:!0,opacity:.3,depthWrite:!1,fog:!1,blending:D,toneMapped:!1})}),s.jsx("sprite",{position:n,scale:26,renderOrder:-7,children:s.jsx("spriteMaterial",{ref:a,map:b(),transparent:!0,depthWrite:!1,fog:!1,toneMapped:!1})})]})}export{J as Sky};
