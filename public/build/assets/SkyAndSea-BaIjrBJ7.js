import{r as a,j as s}from"./app-a14SgvEg.js";import{U as M}from"./three.module-Cn2LlBd0.js";import{i as _}from"./curves-Cmeh0Aw4.js";import{b as h}from"./wind-CcMZ8O9E.js";import{SUN_DIRECTION as z}from"./SceneLights-CuRK13Xy.js";import{u as x}from"./events-9ce18a08.esm-q5nHFBix.js";import{r as w,C as t,p as W,b$ as T,k as f,e as j,eN as O,fc as P}from"./three.core-BU4w5hFA.js";import"./app-BoNnqKgU.js";import"./journey--2ZUA0Zy.js";import"./math-Cb79_-x-.js";import"./world-DpVuxjUF.js";import"./RoomEnvironment-5IkDvxpn.js";import"./rigState-D7-NJ_uo.js";const C="#e4f4fc",A="#dcf0fa";function K(){const o=a.useRef(null),e=a.useMemo(()=>new w({side:W,depthWrite:!1,fog:!1,toneMapped:!1,uniforms:{uTop:{value:new t("#6fc0ef")},uMid:{value:new t("#a9dcf6")},uHorizon:{value:new t(C)},uSun:{value:new t("#fff2cf")},uSunDir:{value:z.clone()}},vertexShader:`
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,fragmentShader:`
          uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uHorizon; uniform vec3 uSun; uniform vec3 uSunDir;
          varying vec3 vDir;
          void main() {
            vec3 d = normalize(vDir);
            float h = d.y;
            vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.18, h));
            col = mix(col, uTop, smoothstep(0.18, 0.7, h));
            float sun = max(dot(d, normalize(uSunDir)), 0.0);
            col = mix(col, uSun, pow(sun, 6.0) * 0.35);
            col += uSun * pow(sun, 180.0) * 0.5;
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
          }`}),[]);return x(({camera:i})=>o.current.position.copy(i.position)),s.jsx("mesh",{ref:o,material:e,renderOrder:-10,frustumCulled:!1,children:s.jsx("sphereGeometry",{args:[320,32,16]})})}const S=-.78;function Y(){const o=a.useMemo(()=>{const e=new w({fog:!0,uniforms:T.merge([M.fog,{uDeep:{value:new t("#5fc1ea")},uShallow:{value:new t("#9be2f6")}}]),vertexShader:`
        #include <common>
        #include <fog_pars_vertex>
        varying vec3 vWorld;
        void main() {
          vec4 world = modelMatrix * vec4(position, 1.0);
          vWorld = world.xyz;
          vec4 mvPosition = viewMatrix * world;
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,fragmentShader:`
        #include <common>
        #include <fog_pars_fragment>
        uniform vec3 uDeep; uniform vec3 uShallow;
        uniform float uTime; uniform vec2 uWindDir;
        varying vec3 vWorld;
        void main() {
          vec2 p = vWorld.xz;
          vec2 perp = vec2(-uWindDir.y, uWindDir.x);
          float a = sin(dot(p, uWindDir) * 0.55 - uTime * 1.1) * 0.5 + 0.5;
          float b = sin(dot(p, perp) * 0.9 + uTime * 0.6 + sin(p.x * 0.15) * 1.5) * 0.5 + 0.5;
          vec3 col = mix(uDeep, uShallow, 0.32 + 0.28 * a * b);
          float glint = smoothstep(0.985, 1.0, sin(dot(p, uWindDir) * 1.6 - uTime * 1.4 + sin(dot(p, perp) * 0.45) * 2.4));
          glint *= 0.5 + 0.5 * sin(dot(p, perp) * 0.33 + uTime * 0.4);
          col = mix(col, vec3(1.0), glint * 0.16);
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <fog_fragment>
        }`});return e.uniforms.uTime=h.uTime,e.uniforms.uWindDir=h.uWindDir,e},[]);return s.jsx("mesh",{"rotation-x":-Math.PI/2,position:[0,S,-30],material:o,children:s.jsx("circleGeometry",{args:[340,64]})})}function g(o){const e=_;let i=0;for(let n=0;n<e.length;n++){const[r,m]=e[n],[c,l]=e[(n+1)%e.length];i+=r*l-c*m}const u=i>0?-1:1;return e.map(([n,r],m)=>{const[c,l]=e[(m-1+e.length)%e.length],[D,y]=e[(m+1)%e.length],p=D-c,d=y-l,v=Math.hypot(p,d)||1;return new f(n+u*d*o/v,r-u*p*o/v)})}function Z(){const o=a.useRef(null),e=a.useMemo(()=>{const i=g(2.4).map(r=>new f(r.x,-r.y)),u=g(.7).map(r=>new f(r.x,-r.y)),n=new j(i);return n.holes.push(new O(u)),new P(n,1)},[]);return x(({clock:i})=>{o.current.opacity=.42+Math.sin(i.elapsedTime*.9)*.12}),s.jsx("mesh",{geometry:e,"rotation-x":-Math.PI/2,position:[0,S+.02,0],children:s.jsx("meshBasicMaterial",{ref:o,color:"#ffffff",transparent:!0,depthWrite:!1})})}export{A as FOG_COLOR,S as SEA_LEVEL,C as SKY_HORIZON,Y as Sea,Z as ShoreFoam,K as SkyDome};
