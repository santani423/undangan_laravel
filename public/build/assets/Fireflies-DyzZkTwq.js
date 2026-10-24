import{r as s,j as x}from"./app-Yha1Uw5b.js";import"./three.module-Cn2LlBd0.js";import{s as v}from"./sharedUniforms-C5WYJsMg.js";import{S as o,m as S}from"./worldLayout-BrXWuiG2.js";import{B as k,a as g,r as h,bX as T}from"./three.core-BU4w5hFA.js";import"./app-DEwS9Yj4.js";const y=`
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSeed;
  varying float vTwinkle;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.35 + aSeed * 12.0) * 0.45;
    p.y += sin(uTime * 0.5 + aSeed * 7.0) * 0.3;
    p.z += cos(uTime * 0.3 + aSeed * 15.0) * 0.45;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (14.0 + aSeed * 10.0) * uPixelRatio / max(-mv.z, 0.5) * 6.0;
    vTwinkle = 0.55 + 0.45 * sin(uTime * 1.7 + aSeed * 31.0);
  }
`,b=`
  uniform float uDusk;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float glow = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.16, 0.0, d);
    vec3 color = mix(vec3(1.0, 0.93, 0.7), vec3(1.0, 0.8, 0.42), uDusk);
    float intensity = (0.18 + uDusk * 0.82) * vTwinkle;
    gl_FragColor = vec4(color * (glow * 0.6 + core), (glow * 0.6 + core) * intensity);
  }
`;function _({count:i,pixelRatio:f}){const a=s.useMemo(()=>{const l=S(512),w=o.reduce((t,u)=>t+u.weight,0),c=new Float32Array(i*3),d=new Float32Array(i);for(let t=0;t<i;t++){const u=l()*w;let r=o[0];for(let e=0,p=0;e<o.length;e++)if(p+=o[e].weight,u<=p){r=o[e];break}for(let e=0;e<3;e++)c[t*3+e]=r.min[e]+l()*(r.max[e]-r.min[e]);d[t]=l()}const m=new k;return m.setAttribute("position",new g(c,3)),m.setAttribute("aSeed",new g(d,1)),m},[i]),n=s.useMemo(()=>new h({uniforms:{uTime:v.uTime,uDusk:v.uDusk,uPixelRatio:{value:f}},vertexShader:y,fragmentShader:b,transparent:!0,depthWrite:!1,blending:T}),[f]);return s.useEffect(()=>()=>a.dispose(),[a]),s.useEffect(()=>()=>n.dispose(),[n]),x.jsx("points",{geometry:a,material:n,frustumCulled:!1})}export{_ as Fireflies};
