import{M as t,F as s,e as o,a as f}from"./three.core-CpBsj1UV.js";function c(e={}){const r=new t({color:e.color??"#ffffff",roughness:e.roughness??.86,metalness:0,emissive:e.emissive??"#000000",emissiveIntensity:e.emissiveIntensity??1,vertexColors:e.vertexColors??!1,flatShading:e.flatShading??!1,transparent:e.transparent??!1,opacity:e.opacity??1,side:e.side??s}),n=new o(e.rim??"#9a93d6"),a=e.rimStrength??.32,l=e.rimPower??2.6,m=e.selfGlow??0;return r.onBeforeCompile=i=>{i.uniforms.uRimColor={value:n},i.uniforms.uRimStrength={value:a},i.uniforms.uRimPower={value:l},i.uniforms.uSelfGlow={value:m},i.fragmentShader=i.fragmentShader.replace("#include <common>",`#include <common>
uniform vec3 uRimColor;
uniform float uRimStrength;
uniform float uRimPower;
uniform float uSelfGlow;`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
        float rimF = pow(1.0 - saturate(dot(normal, normalize(vViewPosition))), uRimPower);
        totalEmissiveRadiance += uRimColor * rimF * uRimStrength;
        #if defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_COLOR_ALPHA )
          totalEmissiveRadiance += vColor.rgb * uSelfGlow;
        #endif`)},r.customProgramCacheKey=()=>"clay-rim",r}function d(e,r=1.6,n={}){const a=new o(e).multiplyScalar(r);return new f({color:a,toneMapped:!1,...n})}const S={blush:"#F2C5D2",gold:"#F5D58B",cream:"#FFF8EE",skin:"#f3d2c1",hair:"#3b2a3d"};export{S as P,c,d as g};
