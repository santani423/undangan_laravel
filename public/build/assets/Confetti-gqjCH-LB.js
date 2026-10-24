import{r as p,j as w}from"./app-Yha1Uw5b.js";import{t as z}from"./assets-DnnVhvHU.js";import{b as F}from"./world-DpVuxjUF.js";import{o as T}from"./celebrations-CHLby8yr.js";import{u as C,a as P}from"./criticalTextures-Cqv74gGw.js";import{a as x,u as E}from"./events-9ce18a08.esm-DTvl8wzC.js";import{B as U,a as u,dq as g,fj as R,V as _,z as j,r as B,g as L}from"./three.core-BU4w5hFA.js";import"./app-DEwS9Yj4.js";import"./three.module-Cn2LlBd0.js";const r=700,O=`
attribute float aSize;
attribute float aAlpha;
attribute vec3 aSeed;     // x,y: sprite cell, z: spin seed
uniform float uScale;
uniform float uTime;
varying float vAlpha;
varying vec2 vCell;
varying float vSpin;
varying float vFlip;
void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = aSize * uScale / -mvPosition.z;
  vAlpha = aAlpha;
  vCell = aSeed.xy;
  vSpin = uTime * (2.0 + aSeed.z * 3.0) + aSeed.z * 6.2831;
  vFlip = uTime * (3.0 + aSeed.z * 4.0);
}`,D=`
uniform sampler2D uMap;
varying float vAlpha;
varying vec2 vCell;
varying float vSpin;
varying float vFlip;
void main() {
  if (vAlpha <= 0.01) discard;
  vec2 c = gl_PointCoord - 0.5;
  float s = sin(vSpin), co = cos(vSpin);
  c = mat2(co, -s, s, co) * c;
  c.x /= max(abs(cos(vFlip)), 0.2);           // tumbling paper
  if (abs(c.x) > 0.5 || abs(c.y) > 0.5) discard;
  vec4 tex = texture2D(uMap, (vCell + c + 0.5) * 0.25);
  if (tex.a < 0.25) discard;
  gl_FragColor = vec4(tex.rgb, tex.a * vAlpha);
  #include <colorspace_fragment>
}`;function J({reducedMotion:f}){const v=C(z.sprites.confetti)??P(),A=x(t=>t.size),y=x(t=>t.viewport.dpr),b=p.useRef(null),e=p.useMemo(()=>({pos:new Float32Array(r*3),vel:new Float32Array(r*3),life:new Float32Array(r),maxLife:new Float32Array(r).fill(1),alpha:new Float32Array(r),sizes:new Float32Array(r),seeds:new Float32Array(r*3),next:0,active:0}),[]),n=p.useMemo(()=>{const t=new U;return t.setAttribute("position",new u(e.pos,3).setUsage(g)),t.setAttribute("aAlpha",new u(e.alpha,1).setUsage(g)),t.setAttribute("aSize",new u(e.sizes,1)),t.setAttribute("aSeed",new u(e.seeds,3)),t.boundingSphere=new R(new _(0,0,-35),200),t},[e]),d=p.useMemo(()=>(v.colorSpace=j,new B({vertexShader:O,fragmentShader:D,transparent:!0,depthWrite:!1,uniforms:{uMap:{value:v},uScale:{value:400},uTime:{value:0}}})),[v]);return p.useEffect(()=>T(({spot:t,strength:c})=>{const[h,i,m]=F[t],l=Math.round((f?26:120)*c),o=(f?.55:1)*(.8+c*.35);for(let a=0;a<l;a++){const s=e.next;e.next=(e.next+1)%r;const M=Math.random()*Math.PI*2,S=(1.4+Math.random()*2.6)*o;e.pos.set([h+(Math.random()-.5)*.6,i+Math.random()*.4,m+(Math.random()-.5)*.6],s*3),e.vel.set([Math.cos(M)*S,(4.2+Math.random()*4.2)*o,Math.sin(M)*S],s*3),e.maxLife[s]=2.6+Math.random()*1.6,e.life[s]=e.maxLife[s],e.sizes[s]=.5+Math.random()*.4,e.seeds.set([Math.floor(Math.random()*4),Math.floor(Math.random()*4),Math.random()],s*3)}e.active=r,n.attributes.aSize.needsUpdate=!0,n.attributes.aSeed.needsUpdate=!0}),[n,e,f]),E((t,c)=>{d.uniforms.uTime.value=t.clock.elapsedTime;const h=t.camera.fov??42;if(d.uniforms.uScale.value=A.height*y*.5/Math.tan(L.degToRad(h/2)),e.active===0)return;const i=Math.min(c,.05);let m=0;const l=Math.exp(-1.6*i);for(let o=0;o<r;o++){if(e.life[o]<=0){e.alpha[o]=0;continue}m++,e.life[o]-=i;const a=o*3;e.vel[a]*=l,e.vel[a+2]*=l,e.vel[a+1]=e.vel[a+1]*l-6.2*i,e.vel[a+1]<-1.6&&(e.vel[a+1]=-1.6),e.pos[a]+=(e.vel[a]+Math.sin(e.life[o]*5+o)*.4)*i,e.pos[a+1]=Math.max(.05,e.pos[a+1]+e.vel[a+1]*i),e.pos[a+2]+=e.vel[a+2]*i,e.alpha[o]=Math.min(1,e.life[o]/.6)}e.active=m,n.attributes.position.needsUpdate=!0,n.attributes.aAlpha.needsUpdate=!0}),w.jsx("points",{ref:b,geometry:n,material:d,frustumCulled:!1,renderOrder:5})}export{J as Confetti};
