import"./three.module-DlVhPLQn.js";import{s as x}from"./sharedUniforms-Bd_q6yoY.js";import{t as S}from"./aset-ClIC7y4x.js";import{s as o}from"./sceneStatus-BSuj4Xi8.js";import{ej as P,fA as h,S as c,R as m,av as C,I as T,e as u,M as _}from"./three.core-CpBsj1UV.js";const f=new P;f.onStart=()=>{o.get().phase!=="ready"&&o.set({phase:"loading"})};f.onProgress=(e,t,a)=>{o.get().phase!=="ready"&&o.set({phase:"loading",progress:a>0?t/a:0})};const v=new Map,d=new Set;function b(e){return e.colorSpace=c,e.wrapS=m,e.wrapT=m,e.magFilter=C,e.minFilter=T,e.anisotropy=4,e}function L(e){let t=v.get(e);return t||(t=new h(f).loadAsync(S(e)).then(a=>(d.add(a),b(a))).catch(a=>(console.warn(`[wt16] Texture "${e}" gagal dimuat; memakai warna polos.`,a),null)),v.set(e,t)),t}function k(e){return new h().loadAsync(e).then(t=>(t.colorSpace=c,t.anisotropy=4,d.add(t),t)).catch(()=>null)}function I(){d.forEach(e=>e.dispose())}const p={grass:[.3,.55,.27],grass_light:[.47,.68,.34],dirt:[.43,.29,.18],wood:[.43,.27,.16],wood_light:[.62,.42,.25],leaf:[.2,.43,.24],leaf_light:[.31,.56,.29],stone:[.62,.62,.57],stone_light:[.78,.76,.68],cream:[.93,.86,.72],ivory:[.98,.94,.85],gold:[.83,.61,.27],rose:[.78,.37,.42],blush:[.93,.65,.65],white:[.96,.95,.91],dark:[.16,.18,.16],water:[.25,.58,.68],glass:[.55,.78,.8],purple:[.47,.33,.57],blue:[.35,.52,.7]},A={wood:{texture:"wood",tint:[1,1,1]},wood_light:{texture:"wood",tint:[1.35,1.32,1.3]},stone:{texture:"stone",tint:[.92,.92,.92]},stone_light:{texture:"stone",tint:[1.14,1.13,1.1]},cream:{texture:"ivory_fabric",tint:[.97,.92,.84]},ivory:{texture:"ivory_fabric",tint:[1,1,1]},dirt:{texture:"dirt",tint:[1,1,1]},grass:{texture:"grass",tint:[1,1,1]},grass_light:{texture:"grass",tint:[1.25,1.22,1.2]}},s=new Map;function l([e,t,a]){return new u().setRGB(e,t,a,c)}function M(e,t){const a=A[t];a&&L(a.texture).then(i=>{i&&(e.map=i,e.color.copy(l(a.tint)),e.needsUpdate=!0)})}function g(e,t){const a=new _({name:e,color:l(t),roughness:.88,metalness:0,flatShading:!0});switch(e){case"gold":a.metalness=.55,a.roughness=.38,a.emissive=l([.83,.61,.27]),a.emissiveIntensity=.06;break;case"glass":a.emissive=new u("#ffc46b"),a.emissiveIntensity=.25,a.roughness=.25;break;case"white":case"ivory":a.roughness=.8;break}return M(a,e),a}function N(e,t){let a=s.get(e);return a||(a=g(e,t??p[e]??[.8,.8,.8]),s.set(e,a)),a}function R(e,t,a){const i=`${e}|sway|${t.pivotY}|${t.amplitude}`;let r=s.get(i);if(r)return r;r=g(e,a??p[e]??[.8,.8,.8]),r.name=i;const{pivotY:y,amplitude:w}=t;return r.onBeforeCompile=n=>{n.uniforms.uTime=x.uTime,n.vertexShader=n.vertexShader.replace("#include <common>",`#include <common>
uniform float uTime;`).replace("#include <begin_vertex>",`#include <begin_vertex>
        #ifdef USE_INSTANCING
          vec2 swayOrigin = vec2(instanceMatrix[3][0], instanceMatrix[3][2]);
        #else
          vec2 swayOrigin = vec2(0.0);
        #endif
        float swayPhase = swayOrigin.x * 0.37 + swayOrigin.y * 0.23;
        float swayA = sin(uTime * 1.1 + swayPhase) * ${w.toFixed(4)};
        float swayB = sin(uTime * 0.8 + swayPhase * 1.7) * ${(w*.6).toFixed(4)};
        vec3 swayP = transformed - vec3(0.0, ${y.toFixed(4)}, 0.0);
        float swayCA = cos(swayA); float swaySA = sin(swayA);
        float swayCB = cos(swayB); float swaySB = sin(swayB);
        swayP = vec3(swayP.x * swayCA - swayP.y * swaySA, swayP.x * swaySA + swayP.y * swayCA, swayP.z);
        swayP = vec3(swayP.x, swayP.y * swayCB - swayP.z * swaySB, swayP.y * swaySB + swayP.z * swayCB);
        transformed = swayP + vec3(0.0, ${y.toFixed(4)}, 0.0);`)},r.customProgramCacheKey=()=>i,s.set(i,r),r}function O(){const e="dirt|lip";let t=s.get(e);if(t)return t;t=g("dirt",p.dirt),t.name=e;const a=new u("#4f8c45");return t.onBeforeCompile=i=>{i.uniforms.uLipColor={value:a},i.vertexShader=i.vertexShader.replace("#include <common>",`#include <common>
varying vec2 vLipUv;`).replace("#include <begin_vertex>",`#include <begin_vertex>
vLipUv = uv;`),i.fragmentShader=i.fragmentShader.replace("#include <common>",`#include <common>
uniform vec3 uLipColor;
varying vec2 vLipUv;`).replace("#include <map_fragment>",`#include <map_fragment>
        float lipCell = floor(vLipUv.x * 8.0);
        float lipEdge = 0.8 - 0.08 * step(0.5, fract(sin(lipCell * 12.9898) * 43758.5453));
        if (vLipUv.y > lipEdge) {
          float lipNoise = fract(sin(dot(floor(vLipUv * 16.0), vec2(12.9898, 78.233))) * 43758.5453);
          diffuseColor.rgb = uLipColor * (0.9 + 0.2 * lipNoise);
        }`)},t.customProgramCacheKey=()=>e,s.set(e,t),t}function z(e,t){s.forEach((a,i)=>{(i===e||i.startsWith(`${e}|`))&&t(a)})}function G(){s.forEach(e=>e.dispose())}export{p as F,L as a,O as b,I as c,G as d,f as e,z as f,N as g,R as h,k as l};
