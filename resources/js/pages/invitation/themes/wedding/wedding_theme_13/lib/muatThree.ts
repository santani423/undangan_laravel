/* Three.js r128 + modul examples/js dimuat dari CDN yang sama dengan tema asli.
   Versi ini sengaja dipertahankan: adegan memakai API encoding/warna r128, dan
   memuatnya saat dibutuhkan saja menjaga bundel utama tetap ringan. */

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        THREE?: any;
    }
}

const THREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const EXAMPLES_CDN = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/';
// Urutan penting: EffectComposer mendefinisikan THREE.Pass yang dipakai pass lainnya.
const EXAMPLES = [
    'utils/BufferGeometryUtils.js',
    'shaders/CopyShader.js',
    'shaders/LuminosityHighPassShader.js',
    'postprocessing/EffectComposer.js',
    'postprocessing/RenderPass.js',
    'postprocessing/ShaderPass.js',
    'postprocessing/UnrealBloomPass.js',
];

let janji: Promise<void> | null = null;

function muatSkrip(src: string): Promise<void> {
    const ada = document.querySelector<HTMLScriptElement>(`script[data-wt13-src="${src}"]`);
    if (ada?.dataset.wt13Siap === '1') return Promise.resolve();
    ada?.remove();

    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.async = false; // dieksekusi sesuai urutan penyisipan meski diunduh paralel
        s.crossOrigin = 'anonymous';
        s.dataset.wt13Src = src;
        s.onload = () => {
            s.dataset.wt13Siap = '1';
            resolve();
        };
        s.onerror = () => reject(new Error(`Gagal memuat ${src}`));
        document.head.appendChild(s);
    });
}

function lengkap(): boolean {
    const T = window.THREE;
    return !!(T && T.BufferGeometryUtils && T.EffectComposer && T.RenderPass && T.ShaderPass && T.UnrealBloomPass);
}

export function muatThree(): Promise<void> {
    if (lengkap()) return Promise.resolve();
    if (!janji) {
        janji = muatSkrip(THREE_CDN)
            .then(() => Promise.all(EXAMPLES.map((p) => muatSkrip(EXAMPLES_CDN + p))))
            .then(() => {
                if (!lengkap()) throw new Error('Modul Three.js tidak lengkap');
            })
            .catch((err) => {
                janji = null; // boleh dicoba lagi pada kunjungan berikutnya
                throw err;
            });
    }
    return janji;
}

export function webglOk(): boolean {
    try {
        const c = document.createElement('canvas');
        const gl = window.WebGLRenderingContext ? c.getContext('webgl2') || c.getContext('webgl') : null;
        // lepaskan konteks uji agar tidak menghabiskan jatah konteks WebGL browser
        gl?.getExtension('WEBGL_lose_context')?.loseContext();
        return !!gl;
    } catch {
        return false;
    }
}
