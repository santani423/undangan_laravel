var O=Object.defineProperty;var z=(l,e,s)=>e in l?O(l,e,{enumerable:!0,configurable:!0,writable:!0,value:s}):l[e]=s;var A=(l,e,s)=>z(l,typeof e!="symbol"?e+"":e,s);import{r as h,j as c}from"./app-DjCwi9X6.js";import{C as I}from"./react-three-fiber.esm-D_6bv2Rh.js";import"./three.module-DlVhPLQn.js";import{i as Q,O as V,j as G,K as F,m as p,bT as M,V as u,W as x,H as T,n as H,cS as k,Q as j,G as W,T as K,c3 as X,c2 as Y,c1 as q,A as U,c0 as $,b$ as J,b_ as Z,e as S,f as v,c as ee,a as te,dc as se}from"./three.core-CpBsj1UV.js";import{u as D,s as m,g as N}from"./store-7rFg1SkD.js";import{r as ie}from"./interaction-CHlTJW23.js";import{d as re}from"./textures-BN_xp12K.js";import{a as ae,F as B}from"./waypoints-GDTohzSn.js";import{World as oe}from"./World-CAip0sXV.js";import{u as R,a as _}from"./events-9ce18a08.esm-DeliF_-e.js";import"./app-Cny16GSG.js";import"./sceneFx-BkHx9WcG.js";import"./CameraRig-B8SsuQJJ.js";import"./context-B59thLYl.js";import"./easing-Ca4eN1F2.js";import"./scrollScene-TWNgnjsT.js";import"./index-Da40SJzp.js";import"./ScrollTrigger-CezCZ8EY.js";import"./cameraPath-BOmN4Zn1.js";import"./envState-eJ9X_rPl.js";import"./Atmosphere-eYLtQOvz.js";import"./random-CPzXs6PK.js";import"./geometry-C7VccVP5.js";import"./BufferGeometryUtils-qP6uOrgS.js";import"./Instanced-CEtXJ58q.js";import"./layout-zRz2d0P1.js";import"./materials-0Rsc2zyV.js";import"./GlowPoints-CcZ5YohK.js";import"./Forest-BP4vsiHk.js";import"./Ground-BgiZzWQu.js";import"./Lanterns-B_Hs9a81.js";import"./Lighting-CkqUzy7c.js";import"./Sky-fYOIlrxT.js";import"./Vegetation-DOROGBI2.js";import"./Ceremony-CG57OlIq.js";import"./RoundedBoxGeometry-8nUeJhHb.js";import"./Clearings-C00tDyp2.js";import"./Blossoms-K6nuOjNL.js";import"./Figurine-DNgJP9yl.js";import"./Envelope-BJHvBGHC.js";import"./opening-CLB1IuEE.js";import"./MoonPlatform-DfQWbuba.js";import"./date-Da8bSrs5.js";import"./Pavilions-BWHpEM1e.js";import"./data-xYwY9NUl.js";import"./aset-DSHsRuQz.js";import"./PhotoFrame-BMy8Hy8H.js";import"./StoryGlade-DWIFPXP0.js";const C={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class g{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const le=new V(-1,1,1,-1,0,1);class ne extends G{constructor(){super(),this.setAttribute("position",new F([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new F([0,2,0,0,2,0],2))}}const ue=new ne;class E{constructor(e){this._mesh=new Q(ue,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,le)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class he extends g{constructor(e,s="tDiffuse"){super(),this.textureID=s,this.uniforms=null,this.material=null,e instanceof p?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=M.clone(e.uniforms),this.material=new p({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new E(this.material)}render(e,s,r){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=r.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(s),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class y extends g{constructor(e,s){super(),this.scene=e,this.camera=s,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,s,r){const t=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let o,a;this.inverse?(o=0,a=1):(o=1,a=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(t.REPLACE,t.REPLACE,t.REPLACE),i.buffers.stencil.setFunc(t.ALWAYS,o,4294967295),i.buffers.stencil.setClear(a),i.buffers.stencil.setLocked(!0),e.setRenderTarget(r),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(s),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(t.EQUAL,1,4294967295),i.buffers.stencil.setOp(t.KEEP,t.KEEP,t.KEEP),i.buffers.stencil.setLocked(!0)}}class fe extends g{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class ce{constructor(e,s){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),s===void 0){const r=e.getSize(new u);this._width=r.width,this._height=r.height,s=new x(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:T}),s.texture.name="EffectComposer.rt1"}else this._width=s.width,this._height=s.height;this.renderTarget1=s,this.renderTarget2=s.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new he(C),this.copyPass.material.blending=H,this.clock=new k}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,s){this.passes.splice(s,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const s=this.passes.indexOf(e);s!==-1&&this.passes.splice(s,1)}isLastEnabledPass(e){for(let s=e+1;s<this.passes.length;s++)if(this.passes[s].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const s=this.renderer.getRenderTarget();let r=!1;for(let t=0,i=this.passes.length;t<i;t++){const o=this.passes[t];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),o.render(this.renderer,this.writeBuffer,this.readBuffer,e,r),o.needsSwap){if(r){const a=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}y!==void 0&&(o instanceof y?r=!0:o instanceof fe&&(r=!1))}}this.renderer.setRenderTarget(s)}reset(e){if(e===void 0){const s=this.renderer.getSize(new u);this._pixelRatio=this.renderer.getPixelRatio(),this._width=s.width,this._height=s.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,s){this._width=e,this._height=s;const r=this._width*this._pixelRatio,t=this._height*this._pixelRatio;this.renderTarget1.setSize(r,t),this.renderTarget2.setSize(r,t);for(let i=0;i<this.passes.length;i++)this.passes[i].setSize(r,t)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}const b={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class pe extends g{constructor(){super(),this.isOutputPass=!0,this.uniforms=M.clone(b.uniforms),this.material=new j({name:b.name,uniforms:this.uniforms,vertexShader:b.vertexShader,fragmentShader:b.fragmentShader}),this._fsQuad=new E(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,s,r){this.uniforms.tDiffuse.value=r.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},W.getTransfer(this._outputColorSpace)===K&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===X?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Y?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===q?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===U?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===$?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===J?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===Z&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(s),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class me extends g{constructor(e,s,r=null,t=null,i=null){super(),this.scene=e,this.camera=s,this.overrideMaterial=r,this.clearColor=t,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new S}render(e,s,r){const t=e.autoClear;e.autoClear=!1;let i,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:r),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),e.autoClear=t}}const de={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new S(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class d extends g{constructor(e,s=1,r,t){super(),this.strength=s,this.radius=r,this.threshold=t,this.resolution=e!==void 0?new u(e.x,e.y):new u(256,256),this.clearColor=new S(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let i=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new x(i,o,{type:T}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let f=0;f<this.nMips;f++){const w=new x(i,o,{type:T});w.texture.name="UnrealBloomPass.h"+f,w.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(w);const P=new x(i,o,{type:T});P.texture.name="UnrealBloomPass.v"+f,P.texture.generateMipmaps=!1,this.renderTargetsVertical.push(P),i=Math.round(i/2),o=Math.round(o/2)}const a=de;this.highPassUniforms=M.clone(a.uniforms),this.highPassUniforms.luminosityThreshold.value=t,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new p({uniforms:this.highPassUniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.separableBlurMaterials=[];const n=[6,10,14,18,22];i=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let f=0;f<this.nMips;f++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(n[f])),this.separableBlurMaterials[f].uniforms.invSize.value=new u(1/i,1/o),i=Math.round(i/2),o=Math.round(o/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=s,this.compositeMaterial.uniforms.bloomRadius.value=.1;const L=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=L,this.bloomTintColors=[new v(1,1,1),new v(1,1,1),new v(1,1,1),new v(1,1,1),new v(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=M.clone(C.uniforms),this.blendMaterial=new p({uniforms:this.copyUniforms,vertexShader:C.vertexShader,fragmentShader:C.fragmentShader,premultipliedAlpha:!0,blending:ee,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new S,this._oldClearAlpha=1,this._basic=new te,this._fsQuad=new E(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,s){let r=Math.round(e/2),t=Math.round(s/2);this.renderTargetBright.setSize(r,t);for(let i=0;i<this.nMips;i++)this.renderTargetsHorizontal[i].setSize(r,t),this.renderTargetsVertical[i].setSize(r,t),this.separableBlurMaterials[i].uniforms.invSize.value=new u(1/r,1/t),r=Math.round(r/2),t=Math.round(t/2)}render(e,s,r,t,i){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();const o=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),i&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=r.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let a=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=a.texture,this.separableBlurMaterials[n].uniforms.direction.value=d.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[n]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=d.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[n]),e.clear(),this._fsQuad.render(e),a=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,i&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(r),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=o}_getSeparableBlurMaterial(e){const s=[],r=e/3;for(let t=0;t<e;t++)s.push(.39894*Math.exp(-.5*t*t/(r*r))/r);return new p({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new u(.5,.5)},direction:{value:new u(.5,.5)},gaussianCoefficients:{value:s}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {

					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;

					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {

						float x = float( i );
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * w;

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new p({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}}d.BlurDirectionX=new u(1,0);d.BlurDirectionY=new u(0,1);class ge extends h.Component{constructor(){super(...arguments);A(this,"state",{failed:!1})}static getDerivedStateFromError(){return{failed:!0}}componentDidCatch(s){console.error("[scene] WebGL scene failed, switching to the 2D fallback",s),this.props.onError()}render(){return this.state.failed?null:this.props.children}}function ve(){const l=h.useRef(0);return R(()=>{l.current++,l.current===3&&N().sceneStatus==="loading"&&m({sceneStatus:"ready"})}),null}function _e(){return h.useEffect(()=>{const l=se,e={onProgress:l.onProgress,onLoad:l.onLoad};return l.onProgress=(s,r,t)=>m({loadProgress:t?r/t*100:100}),l.onLoad=()=>m({loadProgress:100}),()=>{l.onProgress=e.onProgress,l.onLoad=e.onLoad}},[]),null}function xe({onDecline:l}){const e=h.useRef({frames:0,time:0,warm:0,declines:0});return R((s,r)=>{const t=e.current;if(t.declines>=4||r>.5)return;if(t.warm<3){t.warm+=r;return}if(t.frames++,t.time+=r,t.time<2.5)return;const i=t.frames/t.time;t.frames=0,t.time=0,i<45&&(t.declines++,t.warm=1.5,l())}),null}function Te({msaa:l}){const e=_(a=>a.gl),s=_(a=>a.scene),r=_(a=>a.camera),t=_(a=>a.size),i=_(a=>a.viewport.dpr),o=h.useMemo(()=>{const a=new x(1,1,{type:T,samples:l?4:0}),n=new ce(e,a);return n.addPass(new me(s,r)),n.addPass(new d(new u(256,256),.6,.62,.82)),n.addPass(new pe),n},[e,s,r,l]);return h.useEffect(()=>{o.setPixelRatio(i),o.setSize(t.width,t.height)},[o,t.width,t.height,i]),h.useEffect(()=>()=>{o.passes.forEach(a=>a.dispose()),o.dispose()},[o]),R((a,n)=>o.render(n),1),null}function gt({eventSource:l}){const e=D(a=>a.quality),s=D(a=>a.effects),r=e==="high"?1.75:e==="medium"?1.5:1.1,[t,i]=h.useState(()=>Math.min(window.devicePixelRatio||1,r)),o=window.innerWidth/window.innerHeight<.85;return h.useEffect(()=>()=>{re(),ie()},[]),c.jsx("div",{className:"wt15-scene-canvas","aria-hidden":"true",children:c.jsx(ge,{onError:()=>m({sceneStatus:"failed"}),children:c.jsxs(I,{dpr:t,eventSource:l,eventPrefix:"client",camera:{fov:o?B.mobile:B.desktop,near:.1,far:420,position:ae.pos},gl:{antialias:!0,alpha:!1,stencil:!1,powerPreference:"high-performance",toneMapping:U,toneMappingExposure:1.12},onCreated:({gl:a})=>{new URLSearchParams(location.search).has("debug")&&(window.__wt15Renderer=a),a.domElement.addEventListener("webglcontextlost",n=>{n.preventDefault(),m({sceneStatus:"failed"})})},children:[c.jsx(xe,{onDecline:()=>{N().effects?m({effects:!1}):i(a=>Math.max(1,+(a-.25).toFixed(2)))}}),c.jsx(h.Suspense,{fallback:null,children:c.jsx(oe,{quality:e})}),s&&c.jsx(Te,{msaa:e==="high"}),c.jsx(ve,{}),c.jsx(_e,{})]})})})}export{gt as default};
