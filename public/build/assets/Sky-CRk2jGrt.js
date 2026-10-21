import{r as e,j as r}from"./app-Uj8zEl3A.js";import"./three.module-DlVhPLQn.js";import{a as i}from"./sharedUniforms-Bd_q6yoY.js";import{m as t,fj as a,B as m}from"./three.core-CpBsj1UV.js";import"./app-IqrQmINv.js";const n=`
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = p.xyww; // keep the dome on the far plane
  }
`,s=`
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uBottom;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  varying vec3 vDir;
  void main() {
    float h = vDir.y;
    vec3 color = h > 0.0 ? mix(uHorizon, uTop, pow(clamp(h, 0.0, 1.0), 0.55)) : mix(uHorizon, uBottom, clamp(-h * 4.0, 0.0, 1.0));
    float sun = max(dot(normalize(vDir), normalize(uSunDir)), 0.0);
    color += uSunColor * (pow(sun, 900.0) * 1.4 + pow(sun, 12.0) * 0.22);
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;function v(){const o=e.useMemo(()=>({geometry:new a(400,32,16),material:new t({uniforms:i,vertexShader:n,fragmentShader:s,side:m,depthWrite:!1,fog:!1})}),[]);return e.useEffect(()=>()=>{o.geometry.dispose(),o.material.dispose()},[o]),r.jsx("mesh",{geometry:o.geometry,material:o.material,renderOrder:-1,frustumCulled:!1})}export{v as Sky};
