import{r as d,j as r}from"./app-a14SgvEg.js";import{j as G}from"./journey-Bq0WyXQn.js";import{W as E,P as W}from"./world-rXDJE_mP.js";import{p as S,m as z,b as L,c as U}from"./geometry-D-cYetr5.js";import{a as T}from"./lightingState-BYGInKNZ.js";import{useMats as w}from"./materials-DtiotWcp.js";import{StaticBatch as k}from"./StaticBatch-DjrG5KAS.js";import{B as v}from"./primitives-Bc42IcFF.js";import{a as Q,u as C}from"./events-9ce18a08.esm-q5nHFBix.js";import{r as V,p as q,C as I,B as H,a as O,bX as N,F as X,M as $,V as b,Q as J,E as K}from"./three.core-BU4w5hFA.js";import"./app-BoNnqKgU.js";import"./RoundedBoxGeometry-DTV-s8ox.js";import"./three.module-Cn2LlBd0.js";import"./BufferGeometryUtils-BIQsK3K0.js";import"./wind-SgcNfJFd.js";const Y=`
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}
`,Z=`
uniform vec3 uTop;
uniform vec3 uHorizon;
uniform vec3 uBottom;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uStars;
varying vec3 vDir;
float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 45758.5453); }
void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 col = h > 0.0 ? mix(uHorizon, uTop, pow(clamp(h, 0.0, 1.0), 0.38)) : mix(uHorizon, uBottom, pow(clamp(-h, 0.0, 1.0), 0.4));
  float s = max(dot(d, normalize(uSunDir)), 0.0);
  col += uSunColor * (pow(s, 420.0) * 1.6 + pow(s, 28.0) * 0.22 + pow(s, 4.0) * 0.08);
  if (uStars > 0.001 && h > 0.05) {
    vec2 uv = vec2(atan(d.z, d.x) * 90.0, asin(clamp(d.y, -1.0, 1.0)) * 90.0);
    vec2 id = floor(uv);
    float r = hash(id);
    vec2 f = fract(uv) - 0.5;
    float star = step(0.985, r) * smoothstep(0.32, 0.0, length(f)) * smoothstep(0.05, 0.4, h);
    col += vec3(1.0, 0.95, 0.85) * star * uStars * (0.6 + 0.4 * hash(id + 3.1));
  }
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;function jt(){const o=d.useRef(null),n=d.useMemo(()=>new V({vertexShader:Y,fragmentShader:Z,uniforms:T,side:q,depthWrite:!1,fog:!1}),[]),s=Q(a=>a.camera);return C(()=>{var a;(a=o.current)==null||a.position.copy(s.position)}),r.jsx("mesh",{ref:o,material:n,renderOrder:-10,frustumCulled:!1,children:r.jsx("sphereGeometry",{args:[480,32,16]})})}function R(o,n,s,a,t){const e=z(n),c=160,m=[],l=[];for(let u=0;u<=c;u++){const i=u/c*Math.PI*2;let p=s+a*(.5+.5*Math.sin(i*3+e()*.2)*Math.sin(i*7.3+1.3))+e()*a*.15;for(const g of t){let f=Math.abs(i-g.angle);f=Math.min(f,Math.PI*2-f),p+=g.height*Math.max(0,1-f/g.width)**1.6}l.push(p)}for(let u=0;u<c;u++){const i=u/c*Math.PI*2,p=(u+1)/c*Math.PI*2,g=Math.sin(i)*o,f=Math.cos(i)*o,x=Math.sin(p)*o,M=Math.cos(p)*o;m.push(g,-2,f,x,-2,M,x,l[u+1],M),m.push(g,-2,f,x,l[u+1],M,g,l[u],f)}const h=new H;return h.setAttribute("position",new X(m,3)),h}function St(){const o=w(),n=d.useMemo(()=>R(300,4,6,18,[{angle:Math.PI*.78,height:95,width:.22},{angle:Math.PI*.6,height:30,width:.25}]),[]),s=d.useMemo(()=>R(360,9,14,26,[{angle:Math.PI*1.15,height:70,width:.3},{angle:Math.PI*.95,height:55,width:.2}]),[]),a=d.useMemo(()=>new I,[]);return C(()=>{const t=T.uTop.value,e=T.uHorizon.value;o.mountain.color.copy(a.copy(e).lerp(t,.35).multiplyScalar(.78)),o.mountainFar.color.copy(a.copy(e).lerp(t,.18).multiplyScalar(.9))}),r.jsxs("group",{position:[0,0,-30],children:[r.jsx("mesh",{geometry:s,material:o.mountainFar,renderOrder:-9}),r.jsx("mesh",{geometry:n,material:o.mountain,renderOrder:-8})]})}function tt(){const o=z(404),n=[],s=[],a=[],t=.035;for(const e of W){const c=e.points;for(let m=0;m<c.length-1;m++){const[l,h]=c[m],[u,i]=c[m+1],p=Math.hypot(u-l,i-h),g=Math.atan2(u-l,i-h),f=(u-l)/p,x=(i-h)/p;s.push({x:(l+u)/2,z:(h+i)/2,len:p+(m<c.length-2?e.width*.5:0),ang:g,w:e.width+.3});const M=m>0?e.width*.55:0,A=m<c.length-2?p-e.width*.55:p;m>0&&a.push({x:l,z:h,r:e.width*.5});const B=Math.max(2,Math.round(e.width/.55)),F=e.width/B;for(let y=0;y<B;y++){const _=-e.width/2+F*(y+.5);let j=M+(y%2?.22:0);for(;j<A-.12;){const P=Math.min(.32+o()*.22,A-j),D=j+P/2;n.push({x:l+f*D+x*_,z:h+x*D-f*_,w:F-t,d:P-t,ry:g+(o()-.5)*.04,h:.07+(o()-.5)*.012,tint:.82+o()*.3}),j+=P}}}}for(let e=-4.2;e<=4.2;e+=.6)for(let c=1.85;c<=6.2;c+=.6)Math.abs(e)<1.6||n.push({x:e,z:c,w:.56,d:.56,ry:(o()-.5)*.03,h:.07,tint:.85+o()*.25});return{pavers:n,beds:s,landings:a}}function et(){const o=w(),n=d.useRef(null),s=d.useMemo(()=>tt(),[]),a=d.useMemo(()=>L(1,1,1),[]);return d.useLayoutEffect(()=>{const t=n.current;if(!t)return;const e=new $,c=new J,m=new K,l=new b,h=new b,u=new I;s.pavers.forEach((i,p)=>{c.setFromEuler(m.set(0,i.ry,0)),e.compose(l.set(i.x,i.h/2-i.h*.62+.035,i.z),c,h.set(i.w,i.h,i.d)),t.setMatrixAt(p,e),t.setColorAt(p,u.setScalar(i.tint))}),t.instanceMatrix.needsUpdate=!0,t.instanceColor&&(t.instanceColor.needsUpdate=!0),t.computeBoundingSphere()},[s]),r.jsxs("group",{children:[r.jsx("instancedMesh",{ref:n,args:[a,o.paver,s.pavers.length],receiveShadow:!0}),r.jsxs(k,{castShadow:!1,children:[s.beds.map((t,e)=>r.jsx("mesh",{geometry:S(t.w,t.len),material:o.pathBed,position:[t.x,.004,t.z],rotation:[0,t.ang,0]},e)),r.jsx("mesh",{geometry:S(9.6,6.4),material:o.pathBed,position:[0,.0045,3.55]}),s.landings.map((t,e)=>r.jsx("mesh",{geometry:U(t.r,t.r*1.04,.1,18),material:o.paver,position:[t.x,.02,t.z]},`l${e}`))]})]})}function ot({x:o,z:n,w:s,d:a,r:t}){const e=w();return r.jsxs("group",{position:[o,0,n],rotation:[0,t,0],children:[r.jsx("mesh",{geometry:S(s,a),material:e.soil,position:[0,.07,0]}),r.jsx(v,{s:[s+.24,.14,.12],p:[0,.05,a/2+.06],m:e.brick}),r.jsx(v,{s:[s+.24,.14,.12],p:[0,.05,-a/2-.06],m:e.brick}),r.jsx(v,{s:[a,.14,.12],p:[s/2+.06,.05,0],r:[0,Math.PI/2,0],m:e.brick}),r.jsx(v,{s:[a,.14,.12],p:[-s/2-.06,.05,0],r:[0,Math.PI/2,0],m:e.brick}),r.jsx(v,{s:[s,.05,a],p:[0,.02,0],m:e.stoneDark})]})}const rt=[[22,-33,3.2,1.6,.6],[27.5,-28.5,2.6,1.4,-.3],[24,-43.5,3.4,1.5,.9],[38,-47,3,1.6,.2]];function nt(){const o=w(),n=E.garden.pond,s=E.garden.pondRadius,a=d.useMemo(()=>{const t=z(77),e=34;return Array.from({length:e},(c,m)=>{const l=m/e*Math.PI*2+t()*.05,h=s+.1+t()*.12;return{x:Math.cos(l)*h,z:Math.sin(l)*h,ry:-l+(t()-.5)*.3,w:.62+t()*.25,h:.22+t()*.12,d:.42+t()*.15}})},[s]);return r.jsxs("group",{position:[n[0],0,n[2]],children:[r.jsx(k,{children:a.map((t,e)=>r.jsx(v,{s:[t.w,t.h,t.d],p:[t.x,t.h/2-.05,t.z],r:[0,t.ry,0],m:o.stoneDark},e))}),r.jsx("mesh",{material:o.water,position:[0,.05,0],rotation:[-Math.PI/2,0,0],children:r.jsx("circleGeometry",{args:[s+.05,48]})}),[[1.2,.8,.45],[-1.4,.4,.35],[.4,-1.6,.4],[-.6,1.7,.3],[2.1,-.9,.28]].map(([t,e,c],m)=>r.jsx("mesh",{material:o.lilyPad,position:[t,.062,e],rotation:[-Math.PI/2,0,m],children:r.jsx("circleGeometry",{args:[c,16,.3,Math.PI*1.85]})},m))]})}function zt(){const o=w();return r.jsxs("group",{children:[r.jsx("mesh",{geometry:S(900,900),material:o.ground,position:[0,0,-30],receiveShadow:!0}),r.jsx(et,{}),r.jsx(k,{children:rt.map(([n,s,a,t,e],c)=>r.jsx(ot,{x:n,z:s,w:a,d:t,r:e},c))}),r.jsx(nt,{})]})}const st=`
uniform float uTime;
uniform float uSize;
attribute float aSeed;
varying float vTwinkle;
void main() {
  vec3 p = position;
  p.x += sin(uTime * 0.21 + aSeed * 6.0) * 0.9;
  p.y += sin(uTime * 0.33 + aSeed * 11.0) * 0.35;
  p.z += cos(uTime * 0.17 + aSeed * 4.0) * 0.9;
  vTwinkle = 0.55 + 0.45 * sin(uTime * (1.2 + aSeed) + aSeed * 20.0);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * (60.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`,at=`
uniform vec3 uColor;
uniform float uOpacity;
varying float vTwinkle;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(uColor, a * uOpacity * vTwinkle);
}
`;function Pt({count:o,bounds:n,color:s,size:a,opacity:t}){const e=d.useMemo(()=>{const m=z(o*13+Math.round(n[0])),l=new Float32Array(o*3),h=new Float32Array(o);for(let i=0;i<o;i++)l[i*3]=n[0]+m()*(n[1]-n[0]),l[i*3+1]=n[2]+m()*(n[3]-n[2]),l[i*3+2]=n[4]+m()*(n[5]-n[4]),h[i]=m();const u=new H;return u.setAttribute("position",new O(l,3)),u.setAttribute("aSeed",new O(h,1)),u},[o,n]),c=d.useMemo(()=>new V({vertexShader:st,fragmentShader:at,uniforms:{uTime:{value:0},uSize:{value:a},uColor:{value:new I(s)},uOpacity:{value:0}},transparent:!0,depthWrite:!1,blending:N}),[s,a]);return C((m,l)=>{c.uniforms.uTime.value+=G.reducedMotion?l*.2:l,c.uniforms.uOpacity.value=t(G.progress)}),o<=0?null:r.jsx("points",{geometry:e,material:c,frustumCulled:!1})}export{zt as Ground,Pt as Motes,St as Mountains,rt as PLANTERS,jt as Sky};
