import{V as l,C as d,k as m}from"./three.core-BU4w5hFA.js";const c={uTime:{value:0},uWindStrength:{value:1},uWindDir:{value:new m(.82,-.57).normalize()}},x={uSunColor:{value:new d("#fff1d8")},uSunIntensity:{value:1},uAmbient:{value:new d("#9fa88a")},uSunDir:{value:new l(.5,.7,.5).normalize()}};function g(t,f){const{amplitude:o,height:a,flutter:n=0,anchor:r=0,mode:i="height",keepNormals:u=!1}=f,s=i==="attribute"?"aWind":i==="instanceY"?`clamp((wBase.y - ${r.toFixed(3)}) / ${a.toFixed(3)}, 0.0, 1.6)`:`clamp((position.y - ${r.toFixed(3)}) / ${a.toFixed(3)}, 0.0, 1.6)`;return t.onBeforeCompile=e=>{Object.assign(e.uniforms,c),e.vertexShader=e.vertexShader.replace("#include <common>",`#include <common>
uniform float uTime;
uniform float uWindStrength;
uniform vec2 uWindDir;
${i==="attribute"?"attribute float aWind;":""}`).replace("#include <begin_vertex>",`vec3 transformed = vec3(position);
{
  #ifdef USE_INSTANCING
    vec3 wBase = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  #else
    vec3 wBase = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  #endif
  float hF = ${s};
  hF *= hF;
  float ph = dot(wBase.xz, uWindDir) * 0.18 + fract(sin(dot(wBase.xz, vec2(12.9898, 78.233))) * 43758.5453) * 6.2831;
  float gust = 0.65 + 0.35 * sin(uTime * 0.31 + dot(wBase.xz, uWindDir) * 0.04);
  float sway = (sin(uTime * 1.05 + ph) * 0.7 + sin(uTime * 2.1 + ph * 1.7) * 0.3) * gust;
  transformed.x += uWindDir.x * sway * ${o.toFixed(3)} * uWindStrength * hF;
  transformed.z += uWindDir.y * sway * ${o.toFixed(3)} * uWindStrength * hF;
  ${n>0?`float fl = sin(uTime * 4.3 + position.x * 5.1 + position.z * 4.3 + ph * 3.0);
  transformed.y += fl * ${n.toFixed(3)} * uWindStrength * hF;
  transformed.x += fl * ${(n*.5).toFixed(3)} * uWindStrength * hF;`:""}
}`),u&&(e.fragmentShader=e.fragmentShader.replace("#include <normal_fragment_begin>",`#include <normal_fragment_begin>
#ifdef DOUBLE_SIDED
  normal *= faceDirection;
#endif`))},t.customProgramCacheKey=()=>`wind-${i}-${o}-${a}-${n}-${r}-${u}`,t}export{g as a,x as g,c as w};
