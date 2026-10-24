import{k as d}from"./three.core-BU4w5hFA.js";const r={uTime:{value:0},uWindDir:{value:new d(.86,-.51).normalize()},uWindStrength:{value:1}},l=`
uniform float uTime;
uniform vec2 uWindDir;
uniform float uWindStrength;

// Travelling gust waves: 0.1 (lull) … 1.0 (gust). Mirrored in windField() (TS).
float windField(vec2 p, float t) {
  float along = dot(p, uWindDir);
  float across = dot(p, vec2(-uWindDir.y, uWindDir.x));
  float w = sin(along * 0.21 - t * 1.35) * 0.5
          + sin(along * 0.47 - t * 2.3 + across * 0.23) * 0.3
          + sin(across * 0.13 + t * 0.6) * 0.2;
  return 0.55 + 0.45 * w;
}
`;function f(n,t,o){const i=r.uWindDir.value,e=n*i.x+t*i.y,u=-n*i.y+t*i.x;return .55+.45*(Math.sin(e*.21-o*1.35)*.5+Math.sin(e*.47-o*2.3+u*.23)*.3+Math.sin(u*.13+o*.6)*.2)}const s=`
vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
  mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
  mvPosition = instanceMatrix * mvPosition;
#endif
vec4 windWorld = modelMatrix * mvPosition;
if ( aWind > 0.0 ) {
  float gust = windField( windWorld.xz, uTime );
  float flutter = sin( uTime * 3.1 + windWorld.x * 1.7 + windWorld.z * 1.3 ) * 0.5
                + sin( uTime * 5.7 + windWorld.x * 2.9 - windWorld.z * 2.1 ) * 0.25;
  vec2 perp = vec2( -uWindDir.y, uWindDir.x );
  vec2 disp = ( uWindDir * ( gust + flutter * uFlutter ) + perp * flutter * uFlutter * 0.6 )
            * uWindStrength * uWindAmp * aWind;
  windWorld.xz += disp;
  windWorld.y -= dot( disp, disp ) * 0.6;
}
mvPosition = viewMatrix * windWorld;
gl_Position = projectionMatrix * mvPosition;
`;function c(n,{amplitude:t=.2,flutter:o=.25}={}){return n.onBeforeCompile=i=>{i.uniforms.uTime=r.uTime,i.uniforms.uWindDir=r.uWindDir,i.uniforms.uWindStrength=r.uWindStrength,i.uniforms.uWindAmp={value:t},i.uniforms.uFlutter={value:o},i.vertexShader=i.vertexShader.replace("#include <common>",`#include <common>
attribute float aWind;
uniform float uWindAmp;
uniform float uFlutter;
${l}`).replace("#include <project_vertex>",s)},n.customProgramCacheKey=()=>`wind:${t}:${o}`,n}export{l as W,c as a,r as b,f as w};
