/* eslint-disable @typescript-eslint/no-explicit-any -- Three.js r128 dimuat dari CDN tanpa deklarasi tipe */
/* =====================================================================
   ADEGAN 3D — taman Sunda yang tersambung: jalan batu → uleman di tiang jati →
   gapura → lukisan pangantén → sasak (jembatan) carita asih → pendopo julang ngapak.

   Port dari src/adegan.js. Geometri, material, cahaya & gerak kamera dipertahankan.
   Perbedaan teknis: data dari undangan (bukan WEDDING global), URL aset dari Vite,
   tween amplop & jangkar gulir tanpa GSAP, jumlah bingkai kisah mengikuti data,
   dan semua sumber daya WebGL dilepas saat komponen dilepas (navigasi Inertia).
   ===================================================================== */
import { aset } from './aset';

export interface KisahAdegan {
    tahun: string;
    judul: string;
    foto: string;
    /** Dipakai bila foto gagal dimuat (mis. CORS) agar bingkai tidak hitam. */
    fotoCadangan: string;
}

export interface DataAdegan {
    pria: string;
    wanita: string;
    monogram: string;
    semboyan: string;
    tanggalKartu: string;
    lokasiNama: string;
    kisah: KisahAdegan[];
}

export interface OpsiAdegan {
    canvas: HTMLCanvasElement;
    data: DataAdegan;
    kurangiGerak: boolean;
    /** Elemen bagian halaman (berdasarkan id) yang menjadi jangkar bidikan kamera. */
    bagian: (id: string) => HTMLElement | null;
    /** Selesai saat lembar gaya Google Fonts termuat (dibutuhkan teks pada kanvas). */
    fontSiap: Promise<unknown>;
    onProgres: (p: number) => void;
    onSiap: () => void;
    onKisah: (i: number) => void;
}

export interface Adegan {
    buka(instan?: boolean): void;
    taburMelati(): void;
    hitungUlang(): void;
    hancurkan(): void;
}

/* kepadatan adegan (WEDDING.adegan pada tema asli) */
const S = { kualitas: 'auto' as 'auto' | 'tinggi' | 'ringan', kelopak: 140, rumput: 52000, kepekaanPenunjuk: 1 };

interface Item {
    p: any;
    q?: any;
    r?: number[];
    s?: any;
    c?: any;
}

interface Shot {
    at: string;
    f: number;
    pos: any;
    look: any;
    side: number;
    c: number;
    kisah?: number;
}

/** Posisi bingkai kisah di sepanjang sasak; untuk 4 kisah sama persis dengan tema asli (.12 .37 .62 .87). */
const tKisah = (i: number, n: number) => (n <= 1 ? 0.5 : 0.12 + i * (0.75 / (n - 1)));

export function buatAdegan(opsi: OpsiAdegan): Adegan {
    const THREE = window.THREE;
    const reduce = opsi.kurangiGerak;
    const DATA = opsi.data;
    const canvas = opsi.canvas;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    try {
        return bangun();
    } catch (err) {
        renderer.dispose();
        renderer.forceContextLoss();
        throw err;
    }

    function bangun(): Adegan {
        let dihancurkan = false;

        /* ---------- kualitas ---------- */
        const isMobile = matchMedia('(pointer: coarse)').matches || innerWidth < 900;
        const ringan = S.kualitas === 'ringan' || (S.kualitas === 'auto' && isMobile);
        const PR = Math.min(devicePixelRatio, ringan ? 1.25 : 1.5);
        renderer.setPixelRatio(PR);
        renderer.setSize(innerWidth, innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputEncoding = THREE.LinearEncoding;
        renderer.toneMapping = THREE.NoToneMapping;
        const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.02, 420);
        const fitFov = () => {
            camera.fov = camera.aspect < 1 ? Math.min(68, (42 / camera.aspect) * 0.68) : 42;
            camera.updateProjectionMatrix();
        };
        fitFov();

        /* ---------- aset ---------- */
        THREE.Cache.enabled = true;
        const manager = new THREE.LoadingManager();
        manager.onProgress = (_u: string, a: number, b: number) => {
            if (!dihancurkan) opsi.onProgres((a / b) * 0.9);
        };
        const loader = new THREE.TextureLoader(manager);
        function tex(name: string, o: { repeat?: [number, number]; linear?: boolean } = {}) {
            const t = loader.load(aset(name));
            t.encoding = o.linear ? THREE.LinearEncoding : THREE.sRGBEncoding;
            if (o.repeat) {
                t.wrapS = t.wrapT = THREE.RepeatWrapping;
                t.repeat.set(o.repeat[0], o.repeat[1]);
            }
            t.anisotropy = maxAniso;
            return t;
        }
        const T: Record<string, any> = {
            grass: tex('grass.jpg', { repeat: [40, 40] }),
            grassN: tex('grass_n.jpg', { repeat: [40, 40], linear: true }),
            batu: tex('batu.jpg'),
            batuN: tex('batu_n.jpg', { linear: true }),
            jati: tex('jati.jpg'),
            jatiN: tex('jati_n.jpg', { linear: true }),
            bambu: tex('bambu.jpg'),
            ijuk: tex('ijuk.jpg', { repeat: [4, 2] }),
            ijukN: tex('ijuk_n.jpg', { repeat: [4, 2], linear: true }),
            bilik: tex('bilik.jpg', { repeat: [3, 2] }),
            bilikN: tex('bilik_n.jpg', { repeat: [3, 2], linear: true }),
            airN: tex('air_n.jpg', { repeat: [3, 3], linear: true }),
            melati: tex('melati.png'),
            petal: tex('petal.png'),
            leaf: tex('leaf.png'),
            leafN: tex('leaf_n.jpg', { linear: true }),
            daunBambu: tex('daun_bambu.png'),
            daunPisang: tex('daun_pisang.png'),
            batik: tex('batik_rereng.jpg', { repeat: [2, 2] }),
            paper: tex('paper.jpg'),
            paperN: tex('paper_n.jpg', { linear: true }),
            flame: tex('flame.png'),
            sky: tex('sky_golden.jpg'),
            fabric: tex('fabric.jpg', { repeat: [3, 3] }),
            panganten: tex('panganten.png'),
            latar: tex('latar-panganten.jpg'),
        };
        T.sky.mapping = THREE.EquirectangularReflectionMapping;
        const loaderCadangan = new THREE.TextureLoader();
        const fotoKisah = DATA.kisah.map((k) => {
            const t = loader.load(k.foto, undefined, undefined, () => {
                if (dihancurkan || !k.fotoCadangan || k.fotoCadangan === k.foto) return;
                loaderCadangan.load(k.fotoCadangan, (c: any) => {
                    t.image = c.image;
                    t.needsUpdate = true;
                });
            });
            t.encoding = THREE.sRGBEncoding;
            t.anisotropy = maxAniso;
            return t;
        });
        const siap = { aset: false, font: false, jalan: false };
        manager.onLoad = () => {
            if (dihancurkan) return;
            const pm = new THREE.PMREMGenerator(renderer);
            scene.environment = pm.fromEquirectangular(T.sky).texture;
            pm.dispose();
            siap.aset = true;
            jalankan();
        };

        /* ---------- utilitas ---------- */
        const lin = (h: number) => new THREE.Color(h).convertSRGBToLinear();
        const hdr = (r: number, g: number, b: number) => new THREE.Color(r, g, b);
        const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
        const R = (a: number, b: number) => a + Math.random() * (b - a);
        const pick = <X>(a: X[]): X => a[Math.floor(Math.random() * a.length)];
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
        const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
        const smooth = (t: number) => t * t * (3 - 2 * t);
        const merge = (arr: any[]) => {
            const campur = arr.some((g) => !g.index) && arr.some((g) => g.index);
            return THREE.BufferGeometryUtils.mergeBufferGeometries(campur ? arr.map((g) => (g.index ? g.toNonIndexed() : g)) : arr);
        };
        function mulus(g: any, geser?: (v: any) => number) {
            // satukan verteks agar normal halus, lalu deformasi deterministik
            g.deleteAttribute('normal');
            g.deleteAttribute('uv');
            g = THREE.BufferGeometryUtils.mergeVertices(g);
            if (geser) {
                const p = g.attributes.position;
                for (let i = 0; i < p.count; i++) {
                    const v = V(p.getX(i), p.getY(i), p.getZ(i));
                    const k = geser(v);
                    p.setXYZ(i, v.x * k, v.y * k, v.z * k);
                }
            }
            g.computeVertexNormals();
            g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
            return g;
        }
        const _mat = new Map<string, any>();
        function mat(hex: number, o: Record<string, any> = {}) {
            const k = hex + JSON.stringify(o, (_key, v) => (v && v.isTexture ? v.uuid : v));
            if (!_mat.has(k)) {
                const m = new THREE.MeshStandardMaterial({ color: lin(hex), roughness: 0.7, ...o });
                if (o.emissive !== undefined) m.emissive = lin(o.emissive);
                _mat.set(k, m);
            }
            return _mat.get(k);
        }
        const world = new THREE.Group();
        scene.add(world);
        function mesh(g: any, m: any, x: number, y: number, z: number, p: any = world, shadow = true) {
            const o = new THREE.Mesh(g, m);
            o.position.set(x, y, z);
            o.castShadow = shadow;
            o.receiveShadow = true;
            p.add(o);
            return o;
        }
        const dummy = new THREE.Object3D();
        function instanced(
            g: any,
            m: any,
            items: Item[],
            { shadow = false, colors = false, parent = world }: { shadow?: boolean; colors?: boolean; parent?: any } = {},
        ) {
            if (!items.length) return null;
            const im = new THREE.InstancedMesh(g, m, items.length);
            items.forEach((it, i) => {
                dummy.position.copy(it.p);
                if (it.q) dummy.quaternion.copy(it.q);
                else dummy.rotation.set(it.r ? it.r[0] : 0, it.r ? it.r[1] : 0, it.r ? it.r[2] : 0);
                const s = it.s === undefined ? 1 : it.s;
                if (typeof s === 'number') dummy.scale.setScalar(s);
                else dummy.scale.copy(s);
                dummy.updateMatrix();
                im.setMatrixAt(i, dummy.matrix);
                if (colors) im.setColorAt(i, it.c || new THREE.Color(1, 1, 1));
            });
            im.castShadow = shadow;
            im.receiveShadow = true;
            parent.add(im);
            return im;
        }
        function faceQ(d: any, spin = R(0, 6.28)) {
            dummy.position.set(0, 0, 0);
            dummy.rotation.set(0, 0, 0);
            dummy.scale.setScalar(1);
            dummy.lookAt(d.clone().normalize());
            dummy.rotateX(Math.PI / 2);
            dummy.rotateY(spin);
            return dummy.quaternion.clone();
        }
        const glowTex = (() => {
            const c = document.createElement('canvas');
            c.width = c.height = 64;
            const g = c.getContext('2d')!,
                gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
            gr.addColorStop(0, 'rgba(255,255,255,1)');
            gr.addColorStop(0.3, 'rgba(255,255,255,.35)');
            gr.addColorStop(1, 'rgba(255,255,255,0)');
            g.fillStyle = gr;
            g.fillRect(0, 0, 64, 64);
            return new THREE.CanvasTexture(c);
        })();

        /* ---------- angin: goyangan alami pada bambu, daun, bunga, rumput (ruang dunia) ---------- */
        const uTime = { value: 0 },
            uGust = { value: 0 };
        function angin(m: any, tinggi: number, kuat: number) {
            const uT = { value: tinggi },
                uK = { value: kuat };
            m.onBeforeCompile = (sh: any) => {
                Object.assign(sh.uniforms, { uTime, uGust, uTinggi: uT, uKuat: uK });
                sh.vertexShader =
                    'uniform float uTime; uniform float uGust; uniform float uTinggi; uniform float uKuat;\n' +
                    sh.vertexShader.replace(
                        '#include <project_vertex>',
                        `
      vec4 wPos = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        wPos = instanceMatrix * wPos;
      #endif
      wPos = modelMatrix * wPos;
      float hh = clamp(wPos.y / uTinggi, 0., 1.4); hh *= hh;
      float ph = wPos.x * .35 + wPos.z * .27;
      float sw = sin(uTime * 1.25 + ph) * .6 + sin(uTime * 2.6 + ph * 1.7) * .25;
      wPos.x += (sw * uKuat + uGust * uKuat * 2.5 * sin(uTime * 3.2 + ph)) * hh;
      wPos.z += cos(uTime * 1.05 + ph) * uKuat * .5 * hh;
      vec4 mvPosition = viewMatrix * wPos;
      gl_Position = projectionMatrix * mvPosition;`,
                    );
            };
            return m;
        }

        /* ---------- langit (kubah dengan peredup senja) ---------- */
        const SUN_DIR = V(-0.35, 0.13, -1).normalize();
        const skyMat = new THREE.ShaderMaterial({
            uniforms: { map: { value: T.sky }, uRedup: { value: 1 }, uTint: { value: new THREE.Color(1, 1, 1) } },
            vertexShader:
                'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
            fragmentShader: `uniform sampler2D map; uniform float uRedup; uniform vec3 uTint; varying vec3 vW;
    void main(){ vec3 d = normalize(vW - cameraPosition); vec2 uv = vec2(atan(d.z, d.x) * .15915494 + .5, asin(clamp(d.y, -1., 1.)) * .31830988 + .5);
      vec3 c = pow(texture2D(map, uv).rgb, vec3(2.2)); gl_FragColor = vec4(c * uTint * uRedup, 1.); }`,
            side: THREE.BackSide,
            depthWrite: false,
            fog: false,
        });
        const sky = new THREE.Mesh(new THREE.SphereGeometry(380, 48, 24), skyMat);
        sky.renderOrder = -1;
        scene.add(sky);

        /* ---------- cahaya ---------- */
        scene.fog = new THREE.FogExp2(lin(0xe3c9a6), 0.0085);
        const hemi = new THREE.HemisphereLight(lin(0xcad6e4), lin(0x7a6a48), 0.7);
        scene.add(hemi);
        const sun = new THREE.DirectionalLight(lin(0xffd9a8), 2.2);
        const SUN_T = V(4, 0, 24);
        sun.position.copy(SUN_DIR).multiplyScalar(90).add(SUN_T);
        sun.target.position.copy(SUN_T);
        sun.castShadow = true;
        sun.shadow.mapSize.set(ringan ? 1024 : 2048, ringan ? 1024 : 2048);
        sun.shadow.bias = -0.0004;
        sun.shadow.normalBias = 0.04;
        Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 16, bottom: -16, near: 20, far: 200 });
        scene.add(sun, sun.target);
        const fill = new THREE.DirectionalLight(lin(0xffeedc), 0.7);
        fill.position.set(6, 10, 60);
        scene.add(fill);

        /* ---------- material ---------- */
        const M = {
            jati: new THREE.MeshStandardMaterial({ map: T.jati, normalMap: T.jatiN, roughness: 0.62, color: lin(0xc9b9a8) }),
            jatiGelap: new THREE.MeshStandardMaterial({ map: T.jati, normalMap: T.jatiN, roughness: 0.6, color: lin(0x86705f) }),
            ijuk: new THREE.MeshStandardMaterial({ map: T.ijuk, normalMap: T.ijukN, roughness: 0.95 }),
            bilik: new THREE.MeshStandardMaterial({ map: T.bilik, normalMap: T.bilikN, roughness: 0.85 }),
            batu: new THREE.MeshStandardMaterial({ map: T.batu, normalMap: T.batuN, roughness: 0.9 }),
            bambu: new THREE.MeshStandardMaterial({ map: T.bambu, roughness: 0.45 }),
            emas: mat(0xd4b375, { metalness: 1, roughness: 0.3 }),
            gading: mat(0xf1e8da, { roughness: 0.6 }),
            batik: new THREE.MeshStandardMaterial({ map: T.batik, roughness: 0.9 }),
            paper: new THREE.MeshStandardMaterial({ map: T.paper, normalMap: T.paperN, normalScale: new THREE.Vector2(0.4, 0.4), roughness: 0.85 }),
        };

        /* =====================================================================
           1. TANAH, JALAN BATU, RUMPUT
           ===================================================================== */
        const ground = new THREE.Mesh(
            new THREE.CircleGeometry(160, 64),
            new THREE.MeshPhongMaterial({ map: T.grass, normalMap: T.grassN, specular: 0x000000, shininess: 2 }),
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(4, 0, 20);
        ground.receiveShadow = true;
        world.add(ground);

        const P2 = (x: number, z: number) => new THREE.Vector3(x, 0, z);
        const JALAN_A = new THREE.CatmullRomCurve3(
            [P2(0, 56), P2(0.8, 47), P2(-0.4, 40), P2(-0.3, 34), P2(0, 29.5), P2(0, 26), P2(0.9, 23.9), P2(2.3, 21.5), P2(3.2, 19.6)],
            false,
            'centripetal',
        );
        const SASAK = { a: P2(3.2, 19.6), b: P2(7.2, 14.6) };
        const JALAN_B = new THREE.CatmullRomCurve3([P2(7.2, 14.6), P2(7.8, 12.6), P2(8, 10.4), P2(8, 8.6)], false, 'centripetal');
        const KOLAM = { c: P2(5.15, 17.15), r: 3.15 };
        const PED = V(-1.75, 0, 31.2); // tiang uleman
        const GAPURA_Z = 26,
            BINGKAI = V(0, 0, 22.3),
            PENDOPO = V(8, 0, 4.4);
        const jalurTitik: any[] = [...JALAN_A.getSpacedPoints(260), ...JALAN_B.getSpacedPoints(60)];
        const jarakJalan = (x: number, z: number) => {
            let m = 1e9;
            for (const p of jalurTitik) {
                const d = (p.x - x) ** 2 + (p.z - z) ** 2;
                if (d < m) m = d;
            }
            return Math.sqrt(m);
        };

        // batu pijakan
        {
            const items: Item[] = [],
                gb = new THREE.IcosahedronGeometry(1, 1),
                pb = gb.attributes.position;
            for (let i = 0; i < pb.count; i++) pb.setY(i, pb.getY(i) * (pb.getY(i) > 0 ? 1 : 0.2));
            gb.computeVertexNormals();
            const lay = (curve: any, step: number) => {
                const L = curve.getLength(),
                    n = Math.floor(L / step);
                for (let i = 0; i <= n; i++) {
                    const t = i / n,
                        p = curve.getPointAt(t),
                        tg = curve.getTangentAt(t),
                        nx = -tg.z,
                        nz = tg.x;
                    [-1, 1].forEach((s) => {
                        const off = s * R(0.16, 0.3);
                        items.push({
                            p: V(p.x + nx * off + R(-0.05, 0.05), 0.015, p.z + nz * off + R(-0.05, 0.05)),
                            r: [0, R(0, 6.28), 0],
                            s: V(R(0.17, 0.26), R(0.05, 0.08), R(0.15, 0.23)),
                            c: lin(pick([0x9a988e, 0x8c8a80, 0xa8a498, 0x8e9384])),
                        });
                    });
                }
            };
            lay(JALAN_A, 0.42);
            lay(JALAN_B, 0.42);
            instanced(gb, M.batu, items, { colors: true, shadow: true });
        }

        // helai rumput bergoyang
        {
            const segs = 4,
                pos: number[] = [],
                col: number[] = [],
                nor: number[] = [],
                idx: number[] = [];
            for (let i = 0; i <= segs; i++) {
                const t = i / segs,
                    w = 0.011 * (1 - t * 0.9),
                    c = 0.3 + 0.7 * t;
                pos.push(-w, t, 0, w, t, 0);
                col.push(c, c, c, c, c, c);
                nor.push(0, 1, 0.3, 0, 1, 0.3);
            }
            for (let i = 0; i < segs; i++) {
                const a = i * 2;
                idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
            }
            const g = new THREE.BufferGeometry();
            g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
            g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
            g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
            g.setIndex(idx);
            const m = angin(
                new THREE.MeshPhongMaterial({ vertexColors: true, side: THREE.DoubleSide, specular: 0x14100a, shininess: 8 }),
                0.28,
                0.07,
            );
            const N = Math.round(S.rumput * (ringan ? 0.35 : 1)),
                items: Item[] = [],
                greens = [0x557236, 0x62803c, 0x739046, 0x4a6631, 0x83954f].map(lin);
            let tries = 0;
            while (items.length < N && tries++ < N * 4) {
                const along = Math.random() < 0.7,
                    base = along ? pick(jalurTitik) : V(R(-12, 16), 0, R(-6, 58));
                const x = base.x + (along ? R(-4, 4) : 0),
                    z = base.z + (along ? R(-4, 4) : 0);
                if (Math.hypot(x - KOLAM.c.x, z - KOLAM.c.z) < KOLAM.r + 0.1) continue;
                if (Math.abs(x - PENDOPO.x) < 4.3 && Math.abs(z - PENDOPO.z) < 3.4) continue;
                if (along && jarakJalan(x, z) < 0.5) continue;
                items.push({
                    p: V(x, 0, z),
                    r: [R(-0.25, 0.25), R(0, 6.28), R(-0.25, 0.25)],
                    s: V(R(0.9, 1.6), R(0.1, 0.26), 1),
                    c: pick(greens).clone().multiplyScalar(R(0.75, 1.15)),
                });
            }
            instanced(g, m, items, { colors: true });
        }

        /* =====================================================================
           2. BUNGA: MELATI, MAWAR PUTIH, DAUN (satu draw call per jenis)
           ===================================================================== */
        const melatiItems: Item[] = [],
            kuncupItems: Item[] = [],
            roseItems: Item[] = [],
            leafItems: Item[] = [];
        function addMelati(p: any, dir: any, s = 1) {
            melatiItems.push({ p, q: faceQ(dir), s: s * R(0.85, 1.15) });
        }
        function addKuncup(p: any, s = 1, dir = V(0, 1, 0)) {
            kuncupItems.push({ p, q: faceQ(dir, 0), s: s * R(0.85, 1.1) });
        }
        function addRose(p: any, dir: any, s: number) {
            roseItems.push({ p, q: faceQ(dir), s, c: lin(pick([0xfbf7f0, 0xf6efe2, 0xf4eadb, 0xefe3d0])) });
        }
        function addLeaf(p: any, dir: any, s: number) {
            leafItems.push({ p, q: faceQ(dir), s, c: lin(pick([0x4e7a52, 0x5e8a5e, 0x6f8f66, 0x3f6b47])) });
        }
        // rangkaian: melati dominan, sedikit mawar putih, dedaunan
        function rangkai(c: any, face: any, { n = 10, spread = [0.25, 0.25, 0.2], mawar = 0.25, daun = 1.2, ukuran = 1 } = {}) {
            for (let i = 0; i < n; i++) {
                const p = c.clone().add(V(R(-1, 1) * spread[0], R(-1, 1) * spread[1], R(-1, 1) * spread[2]));
                const d = face
                    .clone()
                    .normalize()
                    .add(p.clone().sub(c).multiplyScalar(2))
                    .add(V(R(-0.3, 0.3), R(-0.3, 0.3), R(-0.3, 0.3)));
                if (Math.random() < mawar) addRose(p, d, R(0.35, 0.55) * ukuran);
                else {
                    for (let k = 0; k < 4; k++)
                        addMelati(
                            p.clone().add(V(R(-0.04, 0.04), R(-0.04, 0.04), R(-0.04, 0.04))),
                            d.clone().add(V(R(-0.4, 0.4), R(-0.4, 0.4), R(-0.4, 0.4))),
                            ukuran,
                        );
                    addKuncup(p.clone().add(V(R(-0.03, 0.03), R(-0.03, 0.03), R(-0.03, 0.03))), ukuran, d);
                }
            }
            for (let i = 0; i < n * daun; i++) {
                const off = V(R(-1, 1) * spread[0] * 1.3, R(-1, 1) * spread[1] * 1.3, R(-1, 0.4) * spread[2]);
                addLeaf(
                    c.clone().add(off),
                    off
                        .clone()
                        .normalize()
                        .add(V(R(-0.4, 0.4), R(-0.4, 0.4), R(-0.4, 0.4))),
                    R(0.8, 1.3) * ukuran,
                );
            }
        }
        // roncean melati: untaian kuncup mengikuti lengkung tali
        function ronce(a: any, b: any, kendur: number, jarak = 0.028) {
            const L = a.distanceTo(b),
                n = Math.round(L / jarak);
            for (let i = 0; i <= n; i++) {
                const t = i / n,
                    p = a.clone().lerp(b, t);
                p.y -= Math.sin(Math.PI * t) * kendur;
                addKuncup(p, 0.9, V(R(-0.3, 0.3), 1, R(-0.3, 0.3)));
                if (i % 9 === 4) addMelati(p.clone().add(V(0, -0.012, 0)), V(0, -0.2, 1), 0.9);
            }
        }
        function ronceGantung(a: any, panjang: number, jarak = 0.028) {
            const n = Math.round(panjang / jarak);
            for (let i = 0; i <= n; i++) addKuncup(a.clone().add(V(Math.sin(i * 0.3) * 0.004, -i * jarak, 0)), 0.9);
            addMelati(a.clone().add(V(0, -panjang - 0.02, 0)), V(0, -1, 0.3), 1.1);
        }

        /* ---------- semak melati di tepi jalan ---------- */
        const semak: Item[] = [];
        function semakMelati(x: number, z: number, s = 1) {
            semak.push({ p: V(x, 0.32 * s, z), s: V(R(0.45, 0.6) * s, R(0.35, 0.45) * s, R(0.45, 0.6) * s), r: [0, R(0, 6), 0] });
            for (let i = 0; i < 16 * s; i++) {
                const a = R(0, 6.28),
                    e = R(0.1, 1.2);
                const d = V(Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e));
                addMelati(V(x, 0.32 * s, z).add(d.clone().multiply(V(0.5 * s, 0.4 * s, 0.5 * s))), d, 1.2);
            }
        }
        for (let z = 52; z > 27.5; z -= 2.3) {
            const p = JALAN_A.getPointAt(clamp01((56 - z) / 33));
            [-1, 1].forEach((s) => {
                if (Math.random() < 0.8) semakMelati(p.x + s * R(1.1, 1.5), z + R(-0.4, 0.4), R(0.8, 1.1));
            });
        }
        [
            [6.5, 9.5],
            [9.6, 9.5],
            [6.2, 8.4],
            [9.8, 8.6],
            [-1.2, 22.6],
            [1.3, 22.4],
        ].forEach(([x, z]) => semakMelati(x, z, 1));
        {
            const bush = mulus(
                new THREE.IcosahedronGeometry(1, 3),
                (v) => 1 + Math.sin(v.x * 9) * 0.08 + Math.cos(v.z * 11) * 0.08 + Math.sin(v.y * 13) * 0.06,
            );
            instanced(
                bush,
                angin(
                    new THREE.MeshPhongMaterial({
                        color: lin(0x3f5e36),
                        specular: 0,
                        shininess: 1,
                        normalMap: T.leafN,
                        normalScale: new THREE.Vector2(2, 2),
                    }),
                    1.2,
                    0.015,
                ),
                semak,
                { shadow: true },
            );
        }

        /* =====================================================================
           3. RUMPUN BAMBU & POHON PISANG
           ===================================================================== */
        {
            const culms: Item[] = [],
                daun: Item[] = [];
            const rumpun = [
                [-4.2, 45],
                [4.3, 41],
                [-4.6, 35.5],
                [4.6, 32],
                [-3.6, 24.5],
                [3.6, 27.2],
                [11.5, 19],
                [12.5, 9],
                [3, 0.5],
                [13, 1.5],
                [-2.2, 16.5],
                [9.6, 22.5],
                [-6, 50],
                [6, 52],
                [1.2, 8.5],
            ];
            rumpun.forEach(([cx, cz]) => {
                const n = Math.round(R(7, 12) * (ringan ? 0.6 : 1));
                for (let i = 0; i < n; i++) {
                    const x = cx + R(-0.9, 0.9),
                        z = cz + R(-0.9, 0.9),
                        h = R(6, 9.5),
                        lean = V(R(-0.12, 0.12), 0, R(-0.12, 0.12));
                    culms.push({ p: V(x, 0, z), r: [lean.z, R(0, 6), -lean.x], s: V(R(0.85, 1.15), h, R(0.85, 1.15)) });
                    for (let k = 0; k < (ringan ? 14 : 26); k++) {
                        const y = h * R(0.45, 1.02),
                            sp = (y / h) * 1.4;
                        const p = V(x + lean.x * y + R(-sp, sp), y, z + lean.z * y + R(-sp, sp));
                        daun.push({
                            p,
                            q: faceQ(V(R(-1, 1), R(-0.9, 0.1), R(-1, 1))),
                            s: R(0.9, 1.3),
                            c: lin(pick([0x5e7f3f, 0x6f8c45, 0x4e6e38, 0x83984f])),
                        });
                    }
                }
            });
            // batang: silinder dengan buku-buku (cincin) setiap ~0.45 m
            const parts = [new THREE.CylinderGeometry(0.035, 0.045, 1, 10, 1, true).translate(0, 0.5, 0)];
            for (let y = 0.05; y < 1; y += 0.055) parts.push(new THREE.TorusGeometry(0.039, 0.004, 4, 12).rotateX(Math.PI / 2).translate(0, y, 0));
            parts.forEach((g) => {
                if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
            });
            instanced(merge(parts), angin(new THREE.MeshStandardMaterial({ map: T.bambu, roughness: 0.45 }), 9, 0.18), culms, { shadow: true });
            const dg = new THREE.PlaneGeometry(0.035, 0.2, 1, 3).translate(0, 0.1, 0);
            instanced(
                dg,
                angin(
                    new THREE.MeshPhongMaterial({ map: T.daunBambu, alphaTest: 0.45, side: THREE.DoubleSide, specular: 0x111108, shininess: 10 }),
                    9,
                    0.18,
                ),
                daun,
                { colors: true },
            );
        }
        {
            const batang: Item[] = [],
                daun: Item[] = [];
            [
                [-2.7, 40],
                [2.9, 35.5],
                [-2.4, 27.6],
                [2.5, 25.2],
                [10.6, 12.3],
                [4.6, 9.4],
                [12.4, 5.6],
                [-1.6, 19.4],
                [11.2, 16],
            ].forEach(([x, z]) => {
                const h = R(2.2, 3);
                batang.push({ p: V(x, 0, z), s: V(1, h, 1) });
                for (let k = 0; k < 7; k++) {
                    const a = (k / 7) * 6.28 + R(-0.3, 0.3),
                        up = R(0.25, 0.9);
                    daun.push({
                        p: V(x, h * R(0.92, 1), z),
                        q: faceQ(V(Math.cos(a), up, Math.sin(a)), 0),
                        s: R(0.85, 1.15),
                        c: lin(pick([0x5f8a44, 0x6e9a4e, 0x557c3e])),
                    });
                }
            });
            instanced(new THREE.CylinderGeometry(0.09, 0.14, 1, 10).translate(0, 0.5, 0), mat(0x7d8c55, { roughness: 0.8 }), batang, {
                shadow: true,
            });
            const g = new THREE.PlaneGeometry(0.55, 1.9, 2, 10).translate(0, 0.95, 0),
                p = g.attributes.position;
            for (let i = 0; i < p.count; i++) {
                const y = p.getY(i) / 1.9;
                p.setZ(i, -y * y * 0.8 + Math.abs(p.getX(i)) * 0.25);
            }
            g.computeVertexNormals();
            instanced(
                g,
                angin(
                    new THREE.MeshPhongMaterial({ map: T.daunPisang, alphaTest: 0.45, side: THREE.DoubleSide, specular: 0x181810, shininess: 12 }),
                    3,
                    0.1,
                ),
                daun,
                { colors: true, shadow: true },
            );
        }

        /* ---------- pepohonan rindang & gunung di kejauhan (Jawa Barat) ---------- */
        {
            const parts = [new THREE.CylinderGeometry(0.18, 0.28, 3, 7).translate(0, 1.5, 0)];
            [
                [0, 3.6, 0, 1.8],
                [1.2, 3.2, 0.4, 1.3],
                [-1.1, 3.3, -0.3, 1.4],
                [0.2, 4.6, 0.2, 1.2],
            ].forEach(([x, y, z, r], j) => {
                const g = mulus(new THREE.IcosahedronGeometry(r, 3), (v) => 1 + Math.sin(v.x * 5 + j) * 0.07 + Math.cos(v.z * 6 + v.y * 4) * 0.07);
                g.scale(1, 0.82, 1);
                parts.push(g.translate(x, y, z));
            });
            const items: Item[] = [];
            for (let i = 0; i < 90; i++) {
                const a = R(0, 6.28),
                    rr = R(22, 60),
                    x = 4 + Math.cos(a) * rr,
                    z = 22 + Math.sin(a) * rr;
                if (z > 40 && Math.abs(x) < 16) continue;
                items.push({ p: V(x, 0, z), r: [0, R(0, 6), 0], s: V(R(1, 1.6), R(1, 1.7), R(1, 1.6)) });
            }
            instanced(merge(parts), new THREE.MeshPhongMaterial({ color: lin(0x55703f), specular: 0, shininess: 1 }), items, { shadow: true });
            const gm = new THREE.MeshBasicMaterial({ color: lin(0x8e9c9e) });
            [
                [-140, -150, 90, 30],
                [-30, -170, 130, 26],
                [110, -150, 100, 34],
                [220, -90, 80, 22],
            ].forEach(([x, z, w, h]) => {
                const g = new THREE.ConeGeometry(1, 1, 24, 3),
                    pp = g.attributes.position;
                for (let i = 0; i < pp.count; i++) pp.setY(i, pp.getY(i) + Math.sin(pp.getX(i) * 7) * 0.03);
                const m = new THREE.Mesh(g, gm);
                m.scale.set(w, h, w * 0.4);
                m.position.set(x, h / 2 - 2, z);
                world.add(m);
            });
        }

        /* =====================================================================
           4. ARSITEKTUR SUNDA: atap julang ngapak, capit gunting, umpak, golodog
           ===================================================================== */
        // atap pelana melebar ke samping (julang ngapak) dengan capit gunting di ujung bubungan
        function atapJulangNgapak(
            parent: any,
            {
                panjang,
                lebar,
                tinggiBubung,
                tinggiPatah,
                tinggiSayap,
                sayap,
                tebal = 0.18,
                y0 = 0,
            }: {
                panjang: number;
                lebar: number;
                tinggiBubung: number;
                tinggiPatah: number;
                tinggiSayap: number;
                sayap: number;
                tebal?: number;
                y0?: number;
            },
        ) {
            const g = new THREE.Group();
            g.position.y = y0;
            parent.add(g);
            const half = lebar / 2,
                dyU = tinggiBubung - tinggiPatah,
                Lu = Math.hypot(half, dyU),
                au = Math.atan2(dyU, half);
            const Lw = Math.hypot(sayap, tinggiPatah - tinggiSayap),
                aw = Math.atan2(tinggiPatah - tinggiSayap, sayap);
            [1, -1].forEach((s) => {
                const up = mesh(new THREE.BoxGeometry(panjang, tebal, Lu + 0.1), M.ijuk, 0, (tinggiBubung + tinggiPatah) / 2, (s * half) / 2, g);
                up.rotation.x = s * au;
                const w = mesh(
                    new THREE.BoxGeometry(panjang * 0.96, tebal * 0.9, Lw + 0.1),
                    M.ijuk,
                    0,
                    (tinggiPatah + tinggiSayap) / 2,
                    s * (half + sayap / 2),
                    g,
                );
                w.rotation.x = s * aw;
            });
            const bub = mesh(
                new THREE.CylinderGeometry(0.11, 0.11, panjang + 0.1, 10),
                mat(0x1e1a16, { roughness: 0.9 }),
                0,
                tinggiBubung + 0.06,
                0,
                g,
            );
            bub.rotation.z = Math.PI / 2;
            // dinding segitiga (bilik) di ujung pelana
            const tri = new THREE.Shape();
            tri.moveTo(-half, 0);
            tri.lineTo(half, 0);
            tri.lineTo(0, dyU);
            tri.lineTo(-half, 0);
            [-1, 1].forEach((s) => {
                const m = mesh(
                    new THREE.ShapeGeometry(tri),
                    new THREE.MeshStandardMaterial({ map: T.bilik, normalMap: T.bilikN, roughness: 0.85, side: THREE.DoubleSide }),
                    s * (panjang / 2 - 0.25),
                    tinggiPatah,
                    0,
                    g,
                );
                m.rotation.y = Math.PI / 2;
                // capit gunting: dua papan bersilang membentuk X di atas bubungan
                const Lb = Lu * 0.55,
                    tb = Math.max(0.03, tebal * 0.45);
                [1, -1].forEach((k) => {
                    const up = V(0, Math.sin(au), -k * Math.cos(au)); // menerus dari kemiringan atap melewati bubungan
                    const c = V(s * (panjang / 2 + 0.03), tinggiBubung + tebal * 0.6, 0).addScaledVector(up, -Lb * 0.5 + Lb * 0.32);
                    const b = mesh(new THREE.BoxGeometry(tb, Lb, tb * 1.8), M.jatiGelap, c.x, c.y, c.z, g);
                    b.rotation.x = -k * (Math.PI / 2 - au);
                });
            });
            return g;
        }

        /* ---------- pendopo panggung ---------- */
        const lampion: any[] = [],
            lampuPendopo: any[] = [];
        {
            const pd = new THREE.Group();
            pd.position.copy(PENDOPO);
            world.add(pd);
            const W = 8,
                D = 5.8,
                LANTAI = 0.82;
            const xs = [-3.6, -1.2, 1.2, 3.6],
                zs = [-2.6, 2.6];
            const tiang: number[][] = [];
            xs.forEach((x) => zs.forEach((z) => tiang.push([x, z])));
            tiang.push([-3.6, 0], [3.6, 0]);
            tiang.forEach(([x, z]) => {
                mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.3, 8), M.batu, x, 0.15, z, pd); // umpak
                mesh(new THREE.BoxGeometry(0.17, 3.75, 0.17), M.jati, x, 0.3 + 3.75 / 2, z, pd);
            });
            const lantaiTex = tex('jati.jpg', { repeat: [10, 1] });
            mesh(
                new THREE.BoxGeometry(W + 0.3, 0.12, D + 0.3),
                new THREE.MeshStandardMaterial({ map: lantaiTex, normalMap: T.jatiN, roughness: 0.55, color: lin(0xcdbca8) }),
                0,
                LANTAI - 0.06,
                0,
                pd,
            );
            mesh(new THREE.BoxGeometry(W + 0.3, 0.5, 0.08), M.jatiGelap, 0, LANTAI - 0.35, D / 2 + 0.15, pd);
            // golodog (anak tangga)
            [
                [0.2, 3.55],
                [0.4, 3.3],
                [0.6, 3.05],
            ].forEach(([h, z]) => mesh(new THREE.BoxGeometry(1.8, 0.1, 0.3), M.jati, 0, h, z, pd));
            // balok atas
            [
                [0, 3.95, 2.6, W + 0.3, 0.16, 0.2],
                [0, 3.95, -2.6, W + 0.3, 0.16, 0.2],
                [-3.6, 3.95, 0, 0.2, 0.16, D],
                [3.6, 3.95, 0, 0.2, 0.16, D],
                [0, 3.95, 0, W, 0.12, 0.14],
            ].forEach(([x, y, z, w, h, d]) => mesh(new THREE.BoxGeometry(w, h, d), M.jati, x, y, z, pd));
            atapJulangNgapak(pd, { panjang: 9.6, lebar: 5.2, tinggiBubung: 6.35, tinggiPatah: 4.4, tinggiSayap: 3.8, sayap: 1.4 });
            // pelaminan: panel ukiran, kursi, karpet batik
            const ukirC = document.createElement('canvas');
            ukirC.width = 1024;
            ukirC.height = 512;
            pd.userData.ukirC = ukirC;
            const ukirTex = new THREE.CanvasTexture(ukirC);
            ukirTex.encoding = THREE.sRGBEncoding;
            pd.userData.ukirTex = ukirTex;
            mesh(
                new THREE.BoxGeometry(4.6, 2.3, 0.1),
                [
                    M.jatiGelap,
                    M.jatiGelap,
                    M.jatiGelap,
                    M.jatiGelap,
                    new THREE.MeshStandardMaterial({ map: ukirTex, roughness: 0.6, metalness: 0.15 }),
                    M.jatiGelap,
                ],
                0,
                LANTAI + 1.15,
                -2.45,
                pd,
            );
            mesh(
                new THREE.BoxGeometry(3.4, 0.01, 3.6),
                new THREE.MeshStandardMaterial({ map: tex('batik_rereng.jpg', { repeat: [3, 3] }), roughness: 0.95 }),
                0,
                LANTAI + 0.006,
                -0.6,
                pd,
                false,
            );
            [-0.55, 0.55].forEach((x) => {
                mesh(new THREE.BoxGeometry(0.6, 0.1, 0.55), M.jati, x, LANTAI + 0.45, -1.8, pd);
                mesh(new THREE.BoxGeometry(0.6, 0.9, 0.08), M.jati, x, LANTAI + 0.9, -2.07, pd);
                mesh(new THREE.BoxGeometry(0.54, 0.08, 0.5), M.gading, x, LANTAI + 0.54, -1.78, pd);
                [
                    [-0.27, -0.25],
                    [0.27, -0.25],
                    [-0.27, 0.22],
                    [0.27, 0.22],
                ].forEach(([dx, dz]) => mesh(new THREE.BoxGeometry(0.05, 0.45, 0.05), M.jati, x + dx, LANTAI + 0.22, -1.8 + dz, pd));
            });
            pd.updateMatrixWorld(true);
            const Wd = (x: number, y: number, z: number) => pd.localToWorld(V(x, y, z));
            [-2.9, 2.9].forEach((x) => {
                rangkai(Wd(x, LANTAI + 1.2, -2.2), V(-x * 0.1, 0.3, 1), { n: 14, spread: [0.45, 0.5, 0.2], mawar: 0.35 });
                mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.7, 16), M.emas, x, LANTAI + 0.35, -2.2, pd);
            });
            rangkai(Wd(-1.1, 0.75, 3.7), V(-0.3, 0.4, 1), { n: 9, spread: [0.3, 0.25, 0.2] });
            rangkai(Wd(1.1, 0.75, 3.7), V(0.3, 0.4, 1), { n: 9, spread: [0.3, 0.25, 0.2] });
            // roncean melati di balok depan & tiang
            for (let i = 0; i < xs.length - 1; i++) {
                ronce(Wd(xs[i], 3.82, 2.72), Wd(xs[i + 1], 3.82, 2.72), 0.35);
                ronce(Wd(xs[i], 3.82, 2.72), Wd(xs[i + 1], 3.82, 2.72), 0.2);
            }
            xs.forEach((x) => {
                [-0.05, 0.05].forEach((dx) => ronceGantung(Wd(x + dx, 3.82, 2.74), R(0.9, 1.3)));
                rangkai(Wd(x, 3.78, 2.75), V(0, -0.2, 1), { n: 3, spread: [0.12, 0.08, 0.06], ukuran: 0.9 });
            });
            // lampion anyaman bambu & cahaya hangat
            const lampMat = new THREE.MeshStandardMaterial({
                map: tex('bilik.jpg', { repeat: [2, 1] }),
                emissive: lin(0xffb56a),
                emissiveIntensity: 0.4,
                roughness: 0.9,
            });
            lampion.push(lampMat);
            [
                [-2.4, -1.1],
                [0, -1.1],
                [2.4, -1.1],
                [-2.4, 1.2],
                [0, 1.2],
                [2.4, 1.2],
            ].forEach(([x, z]) => {
                const l = mesh(new THREE.SphereGeometry(0.17, 16, 12), lampMat, x, 3.25, z, pd, false);
                l.scale.y = 1.2;
                mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.55, 4), mat(0x2a231c), x, 3.62, z, pd, false);
            });
            [
                [-1.6, 3, 0],
                [1.6, 3, 0],
            ].forEach(([x, y, z]) => {
                const l = new THREE.PointLight(lin(0xffb46a), 0, 9, 2);
                l.position.copy(Wd(x, y, z));
                scene.add(l);
                lampuPendopo.push(l);
            });
        }

        /* ---------- saung ---------- */
        function saung(x: number, z: number, rot: number) {
            const s = new THREE.Group();
            s.position.set(x, 0, z);
            s.rotation.y = rot;
            world.add(s);
            [
                [-0.9, -0.9],
                [0.9, -0.9],
                [-0.9, 0.9],
                [0.9, 0.9],
            ].forEach(([px, pz]) => {
                mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.18, 6), M.batu, px, 0.09, pz, s);
                mesh(new THREE.BoxGeometry(0.1, 2.1, 0.1), M.jati, px, 1.15, pz, s);
            });
            mesh(
                new THREE.BoxGeometry(2.1, 0.08, 2.1),
                new THREE.MeshStandardMaterial({ map: tex('bambu.jpg', { repeat: [8, 1] }), roughness: 0.6 }),
                0,
                0.55,
                0,
                s,
            );
            mesh(new THREE.BoxGeometry(2.0, 1.4, 0.05), M.bilik, 0, 1.3, -0.92, s);
            atapJulangNgapak(s, { panjang: 2.8, lebar: 2.2, tinggiBubung: 3.25, tinggiPatah: 2.35, tinggiSayap: 2.05, sayap: 0.5, tebal: 0.14 });
            return s;
        }
        saung(-5.6, 37.5, Math.PI / 2 - 0.3);
        saung(0.6, 13.8, 0.5);

        /* ---------- kolam & sasak (jembatan kayu) ---------- */
        {
            const air = new THREE.Mesh(
                new THREE.CircleGeometry(KOLAM.r, 48),
                new THREE.MeshStandardMaterial({
                    color: lin(0x23382f),
                    roughness: 0.08,
                    metalness: 0.2,
                    normalMap: T.airN,
                    normalScale: new THREE.Vector2(0.3, 0.3),
                    envMapIntensity: 0.55,
                }),
            );
            air.rotation.x = -Math.PI / 2;
            air.position.set(KOLAM.c.x, 0.04, KOLAM.c.z);
            air.receiveShadow = true;
            world.add(air);
            world.userData.air = air;
            mesh(
                new THREE.CircleGeometry(KOLAM.r + 0.02, 48).rotateX(-Math.PI / 2),
                mat(0x2c3a2e, { roughness: 1 }),
                KOLAM.c.x,
                0.02,
                KOLAM.c.z,
                world,
                false,
            );
            const tepi: Item[] = [],
                gb = new THREE.IcosahedronGeometry(1, 1);
            for (let i = 0; i < 70; i++) {
                const a = (i / 70) * 6.28 + R(-0.03, 0.03),
                    r = KOLAM.r + R(-0.05, 0.15);
                tepi.push({
                    p: V(KOLAM.c.x + Math.cos(a) * r, 0.05, KOLAM.c.z + Math.sin(a) * r),
                    r: [R(0, 3), R(0, 3), 0],
                    s: V(R(0.18, 0.3), R(0.1, 0.16), R(0.16, 0.26)),
                    c: lin(pick([0x8c8a80, 0x9a988e, 0x7f8478])),
                });
            }
            instanced(gb, M.batu, tepi, { colors: true, shadow: true });
            const teratai: Item[] = [];
            for (let i = 0; i < 16; i++) {
                const a = R(0, 6.28),
                    r = R(0.6, KOLAM.r - 0.5);
                teratai.push({ p: V(KOLAM.c.x + Math.cos(a) * r, 0.05, KOLAM.c.z + Math.sin(a) * r), r: [-Math.PI / 2, 0, R(0, 6)], s: R(0.8, 1.3) });
            }
            instanced(new THREE.CircleGeometry(0.2, 16, 0.3, 5.9), mat(0x557a3e, { roughness: 0.5, side: THREE.DoubleSide }), teratai);
            // sasak melengkung
            const a = SASAK.a,
                b = SASAK.b,
                dir = b.clone().sub(a),
                L = dir.length();
            dir.normalize();
            const nrm = V(-dir.z, 0, dir.x),
                ang = Math.atan2(dir.x, dir.z);
            const tinggiSasak = (t: number) => 0.16 + Math.sin(Math.PI * t) * 0.42;
            world.userData.sasak = { a, b, dir, nrm, L, tinggiSasak };
            const papan: { p: any; slope: number }[] = [],
                tiangS: Item[] = [],
                rel: Item[] = [];
            for (let i = 0; i <= Math.floor(L / 0.15); i++) {
                const t = (i * 0.15) / L,
                    p = a.clone().addScaledVector(dir, i * 0.15);
                const t2 = Math.min(1, t + 0.02),
                    slope = Math.atan2(tinggiSasak(t2) - tinggiSasak(t), 0.02 * L);
                papan.push({ p: V(p.x, tinggiSasak(t), p.z), slope });
            }
            const pg = new THREE.BoxGeometry(1.25, 0.05, 0.13);
            instanced(
                pg,
                M.jati,
                papan.map((pp) => ({ p: pp.p, q: new THREE.Quaternion().setFromEuler(new THREE.Euler(-pp.slope, ang, 0, 'YXZ')) })),
                { shadow: true },
            );
            for (let i = 0; i <= 8; i++) {
                const t = i / 8,
                    p = a.clone().addScaledVector(dir, t * L),
                    y = tinggiSasak(t);
                [-1, 1].forEach((s) => tiangS.push({ p: V(p.x + nrm.x * s * 0.62, y + 0.45, p.z + nrm.z * s * 0.62) }));
            }
            instanced(new THREE.BoxGeometry(0.08, 0.9, 0.08), M.jati, tiangS, { shadow: true });
            for (let i = 0; i < 8; i++) {
                const t0 = i / 8,
                    t1 = (i + 1) / 8,
                    pa = a.clone().addScaledVector(dir, t0 * L),
                    pb = a.clone().addScaledVector(dir, t1 * L),
                    ya = tinggiSasak(t0) + 0.88,
                    yb = tinggiSasak(t1) + 0.88;
                [-1, 1].forEach((s) => {
                    const m = V((pa.x + pb.x) / 2 + nrm.x * s * 0.62, (ya + yb) / 2, (pa.z + pb.z) / 2 + nrm.z * s * 0.62);
                    rel.push({ p: m, q: new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.atan2(yb - ya, L / 8), ang, 0, 'YXZ')) });
                });
            }
            instanced(new THREE.BoxGeometry(0.07, 0.06, L / 8 + 0.05), M.jati, rel, { shadow: true });
            // tiang penyangga ke air
            [0.2, 0.5, 0.8].forEach((t) => {
                const p = a.clone().addScaledVector(dir, t * L);
                [-1, 1].forEach((s) =>
                    mesh(
                        new THREE.CylinderGeometry(0.06, 0.06, tinggiSasak(t), 8),
                        M.jatiGelap,
                        p.x + nrm.x * s * 0.55,
                        tinggiSasak(t) / 2,
                        p.z + nrm.z * s * 0.55,
                    ),
                );
            });
            // roncean melati di pegangan sasak
            for (let i = 0; i < 8; i += 2) {
                const t0 = i / 8,
                    t1 = (i + 1) / 8;
                [-1, 1].forEach((s) => {
                    const pa = a
                            .clone()
                            .addScaledVector(dir, t0 * L)
                            .addScaledVector(nrm, s * 0.64),
                        pb = a
                            .clone()
                            .addScaledVector(dir, t1 * L)
                            .addScaledVector(nrm, s * 0.64);
                    pa.y = tinggiSasak(t0) + 0.9;
                    pb.y = tinggiSasak(t1) + 0.9;
                    ronce(pa, pb, 0.15);
                });
            }
        }

        /* ---------- bingkai kisah di sepanjang sasak ---------- */
        const bingkaiKisah: any[] = [];
        {
            const { a, dir, nrm, L } = world.userData.sasak;
            const n = DATA.kisah.length;
            DATA.kisah.forEach((k, i) => {
                const t = tKisah(i, n),
                    s = i % 2 ? -1 : 1;
                const base = a
                    .clone()
                    .addScaledVector(dir, t * L)
                    .addScaledVector(nrm, s * 1.25);
                const g = new THREE.Group();
                g.position.set(base.x, 0, base.z);
                const toPath = a
                    .clone()
                    .addScaledVector(dir, (t - 0.22) * L)
                    .sub(base);
                g.rotation.y = Math.atan2(toPath.x, toPath.z);
                world.add(g);
                g.updateMatrixWorld(true);
                mesh(new THREE.BoxGeometry(0.09, 1.25, 0.09), M.jati, 0, 0.62, -0.04, g);
                const fr = new THREE.Group();
                fr.position.y = 1.55;
                g.add(fr);
                mesh(new THREE.BoxGeometry(0.74, 0.94, 0.05), M.jatiGelap, 0, 0, 0, fr);
                [
                    [0, 0.5, 0.8, 0.06],
                    [0, -0.5, 0.8, 0.06],
                    [-0.4, 0, 0.06, 1.06],
                    [0.4, 0, 0.06, 1.06],
                ].forEach(([x, y, w, h]) => mesh(new THREE.BoxGeometry(w, h, 0.07), M.jati, x, y, 0.02, fr));
                // atap kecil julang ngapak di atas bingkai
                const roof = atapJulangNgapak(fr, {
                    panjang: 0.95,
                    lebar: 0.2,
                    tinggiBubung: 0.78,
                    tinggiPatah: 0.6,
                    tinggiSayap: 0.54,
                    sayap: 0.1,
                    tebal: 0.04,
                });
                roof.rotation.y = 0;
                const fotoMat = new THREE.MeshStandardMaterial({ map: fotoKisah[i], roughness: 0.7, color: new THREE.Color(0.12, 0.12, 0.12) });
                const foto = mesh(new THREE.PlaneGeometry(0.62, 0.78), fotoMat, 0, 0, 0.032, fr, false);
                // papan keterangan
                const c = document.createElement('canvas');
                c.width = 512;
                c.height = 160;
                const capTex = new THREE.CanvasTexture(c);
                capTex.encoding = THREE.sRGBEncoding;
                mesh(new THREE.PlaneGeometry(0.62, 0.19), new THREE.MeshStandardMaterial({ map: capTex, roughness: 0.8 }), 0, -0.62, 0.03, fr, false);
                rangkai(g.localToWorld(V(0, 1.02, 0.08)), V(0, 0.3, 1).applyQuaternion(g.quaternion), {
                    n: 3,
                    spread: [0.3, 0.05, 0.05],
                    ukuran: 0.8,
                });
                bingkaiKisah.push({ g, fr, fotoMat, foto, c, capTex, kisah: k, t, reveal: 0 });
            });
        }
        function drawKeterangan() {
            bingkaiKisah.forEach((b) => {
                const g = b.c.getContext('2d');
                g.drawImage(T.paper.image, 0, 0, 512, 160);
                g.strokeStyle = '#B08D57';
                g.lineWidth = 3;
                g.strokeRect(8, 8, 496, 144);
                g.textAlign = 'center';
                g.fillStyle = '#6B3F46';
                g.font = '500 26px Jost, sans-serif';
                g.fillText(b.kisah.tahun, 256, 50);
                g.fillStyle = '#2F2721';
                g.font = 'italic 500 50px "Cormorant Garamond", Georgia, serif';
                g.fillText(b.kisah.judul, 256, 112, 470);
                b.capTex.needsUpdate = true;
            });
        }

        /* ---------- gapura bunga beratap julang ngapak ---------- */
        {
            const gp = new THREE.Group();
            gp.position.set(0, 0, GAPURA_Z);
            world.add(gp);
            [-1.15, 1.15].forEach((x) => {
                mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.22, 8), M.batu, x, 0.11, 0, gp);
                mesh(new THREE.BoxGeometry(0.17, 2.7, 0.17), M.jati, x, 1.45, 0, gp);
            });
            mesh(new THREE.BoxGeometry(2.7, 0.16, 0.24), M.jati, 0, 2.8, 0, gp);
            atapJulangNgapak(gp, { panjang: 3.1, lebar: 0.9, tinggiBubung: 3.55, tinggiPatah: 3.05, tinggiSayap: 2.88, sayap: 0.35, tebal: 0.1 });
            gp.updateMatrixWorld(true);
            const Wg = (x: number, y: number, z: number) => gp.localToWorld(V(x, y, z));
            [-1.15, 1.15].forEach((x) => {
                [0.5, 1.1, 1.7, 2.3].forEach((y, i) =>
                    rangkai(Wg(x + (i % 2 ? 0.06 : -0.06), y, 0.12), V(x * 0.3, 0.2, 1), { n: 5, spread: [0.14, 0.2, 0.1], mawar: 0.3 }),
                );
            });
            rangkai(Wg(0, 2.72, 0.16), V(0, -0.2, 1), { n: 12, spread: [1, 0.1, 0.08], mawar: 0.2 });
            for (let k = 0; k < 3; k++) ronce(Wg(-1.08, 2.66 - k * 0.03, 0.14), Wg(1.08, 2.66 - k * 0.03, 0.14), 0.32 + k * 0.14);
            [-1.05, -0.6, 0.6, 1.05].forEach((x) => ronceGantung(Wg(x, 2.66, 0.16), R(0.7, 1.1)));
        }

        /* ---------- bingkai lukisan pangantén (komposisi 2.5D berlapis) ---------- */
        let lapisPanganten: any = null;
        {
            const bp = new THREE.Group();
            bp.position.copy(BINGKAI);
            world.add(bp);
            mesh(new THREE.BoxGeometry(2.1, 0.18, 0.9), M.batu, 0, 0.09, 0, bp);
            [-0.92, 0.92].forEach((x) => mesh(new THREE.BoxGeometry(0.14, 2.9, 0.14), M.jati, x, 1.6, -0.05, bp));
            mesh(new THREE.BoxGeometry(2.0, 0.14, 0.18), M.jati, 0, 3.0, -0.05, bp);
            mesh(new THREE.BoxGeometry(2.0, 0.1, 0.18), M.jati, 0, 0.32, -0.05, bp);
            atapJulangNgapak(bp, { panjang: 2.4, lebar: 0.6, tinggiBubung: 3.55, tinggiPatah: 3.18, tinggiSayap: 3.05, sayap: 0.25, tebal: 0.08 });
            const latar = mesh(
                new THREE.PlaneGeometry(1.7, 2.6),
                new THREE.MeshStandardMaterial({ map: T.latar, roughness: 0.85 }),
                0,
                1.66,
                -0.1,
                bp,
                false,
            );
            const hP = 2.3,
                wP = (hP * 900) / 1650;
            const pang = mesh(
                new THREE.PlaneGeometry(wP, hP),
                new THREE.MeshStandardMaterial({
                    map: T.panganten,
                    alphaTest: 0.5,
                    roughness: 0.8,
                    emissive: lin(0x3a2e22),
                    emissiveMap: T.panganten,
                    emissiveIntensity: 0.35,
                    side: THREE.DoubleSide,
                }),
                0,
                0.4 + hP / 2,
                0.06,
                bp,
            );
            pang.castShadow = false;
            bp.updateMatrixWorld(true);
            const Wb = (x: number, y: number, z: number) => bp.localToWorld(V(x, y, z));
            rangkai(Wb(-0.75, 0.45, 0.3), V(0.2, 0.5, 1), { n: 12, spread: [0.25, 0.2, 0.15], mawar: 0.35 });
            rangkai(Wb(0.75, 0.45, 0.3), V(-0.2, 0.5, 1), { n: 12, spread: [0.25, 0.2, 0.15], mawar: 0.35 });
            rangkai(Wb(0, 2.98, 0.14), V(0, -0.2, 1), { n: 10, spread: [0.85, 0.06, 0.06] });
            [-0.86, 0.86].forEach((x) => ronceGantung(Wb(x, 2.92, 0.1), 1.4));
            const sorot = new THREE.SpotLight(lin(0xffe2b8), 1.1, 9, 0.45, 0.7, 1.4);
            sorot.position.copy(Wb(0.6, 3.6, 3.2));
            sorot.target.position.copy(Wb(0, 1.5, 0));
            scene.add(sorot, sorot.target);
            lapisPanganten = { latar, pang, bp };
        }

        /* ---------- tiang uleman (pedestal jati) & amplop ---------- */
        const amplop: any = {};
        {
            const pg = new THREE.Group();
            pg.position.copy(PED);
            pg.rotation.y = 0.55;
            world.add(pg);
            mesh(new THREE.BoxGeometry(0.62, 0.1, 0.62), M.batu, 0, 0.05, 0, pg);
            mesh(new THREE.BoxGeometry(0.46, 0.08, 0.46), M.jati, 0, 0.14, 0, pg);
            mesh(new THREE.BoxGeometry(0.34, 0.82, 0.34), M.jati, 0, 0.58, 0, pg);
            [0.22, 0.9].forEach((y) => mesh(new THREE.BoxGeometry(0.4, 0.04, 0.4), M.jatiGelap, 0, y, 0, pg));
            mesh(new THREE.BoxGeometry(0.52, 0.06, 0.52), M.jati, 0, 1.02, 0, pg);
            mesh(new THREE.BoxGeometry(0.5, 0.006, 0.5), M.batik, 0, 1.053, 0, pg, false);
            pg.updateMatrixWorld(true);
            [
                [-1, 1],
                [1, 1],
                [-1, -1],
                [1, -1],
            ].forEach(([sx, sz]) => {
                const p = pg.localToWorld(V(sx * 0.7, 0, sz * 0.7));
                semakMelati(p.x, p.z, 0.6);
            });
            rangkai(pg.localToWorld(V(-0.2, 1.08, -0.2)), V(0, 1, 0), { n: 4, spread: [0.06, 0.02, 0.06], ukuran: 0.7, daun: 2 });
            const env = new THREE.Group();
            env.position.set(0, 1.058, 0.02);
            pg.add(env);
            amplop.pg = pg;
            amplop.env = env;
            const EW = 0.21,
                ED = 0.29;
            amplop.ED = ED;
            // kertas amplop dengan ornamen emas
            const envC = document.createElement('canvas');
            envC.width = 512;
            envC.height = 704;
            amplop.envC = envC;
            const envTex = new THREE.CanvasTexture(envC);
            envTex.encoding = THREE.sRGBEncoding;
            envTex.anisotropy = maxAniso;
            amplop.envTex = envTex;
            const envMat = new THREE.MeshStandardMaterial({
                map: envTex,
                normalMap: T.paperN,
                normalScale: new THREE.Vector2(0.3, 0.3),
                roughness: 0.8,
                side: THREE.DoubleSide,
            });
            mesh(new THREE.BoxGeometry(EW, 0.004, ED), M.paper, 0, 0, 0, env);
            const pocket = new THREE.Shape();
            pocket.moveTo(-EW / 2, -ED / 2);
            pocket.lineTo(EW / 2, -ED / 2);
            pocket.lineTo(EW / 2, ED / 2 - 0.01);
            pocket.lineTo(0, 0.03);
            pocket.lineTo(-EW / 2, ED / 2 - 0.01);
            pocket.lineTo(-EW / 2, -ED / 2);
            const pkG = new THREE.ShapeGeometry(pocket);
            {
                const uv = pkG.attributes.uv,
                    pp = pkG.attributes.position;
                for (let i = 0; i < pp.count; i++) uv.setXY(i, pp.getX(i) / EW + 0.5, pp.getY(i) / ED + 0.5);
            }
            const pk = mesh(pkG, envMat, 0, 0.0042, 0, env, false);
            pk.rotation.x = -Math.PI / 2;
            amplop.hinge = new THREE.Group();
            amplop.hinge.position.set(0, 0.0047, -ED / 2);
            env.add(amplop.hinge);
            const flap = new THREE.Shape();
            flap.moveTo(-EW / 2, 0);
            flap.lineTo(EW / 2, 0);
            flap.quadraticCurveTo(0.02, 0.15, 0, 0.17);
            flap.quadraticCurveTo(-0.02, 0.15, -EW / 2, 0);
            const fg = new THREE.ShapeGeometry(flap, 12);
            {
                const uv = fg.attributes.uv,
                    pp = fg.attributes.position;
                for (let i = 0; i < pp.count; i++) uv.setXY(i, pp.getX(i) / EW + 0.5, 1 - pp.getY(i) / ED);
            }
            fg.rotateX(Math.PI / 2);
            mesh(fg, envMat, 0, 0.0008, 0, amplop.hinge);
            mesh(fg.clone(), new THREE.MeshStandardMaterial({ map: T.batik, roughness: 0.8, side: THREE.DoubleSide }), 0, 0, 0, amplop.hinge, false);
            // segel lilin marun berlogo emas
            const sealC = document.createElement('canvas');
            sealC.width = sealC.height = 256;
            amplop.sealC = sealC;
            const sealTex = new THREE.CanvasTexture(sealC);
            sealTex.encoding = THREE.sRGBEncoding;
            amplop.sealTex = sealTex;
            const bumpC = document.createElement('canvas');
            bumpC.width = bumpC.height = 256;
            amplop.bumpC = bumpC;
            const bumpTex = new THREE.CanvasTexture(bumpC);
            amplop.bumpTex = bumpTex;
            const sealGeo = new THREE.CylinderGeometry(0.026, 0.027, 0.006, 40);
            const sp = sealGeo.attributes.position;
            for (let i = 0; i < sp.count; i++) {
                const x = sp.getX(i),
                    z = sp.getZ(i),
                    a = Math.atan2(z, x),
                    k = 1 + Math.sin(a * 7) * 0.06 + Math.sin(a * 13 + 1) * 0.04;
                if (Math.hypot(x, z) > 0.02) {
                    sp.setX(i, x * k);
                    sp.setZ(i, z * k);
                }
            }
            sealGeo.computeVertexNormals();
            amplop.seal = mesh(
                sealGeo,
                new THREE.MeshStandardMaterial({ map: sealTex, bumpMap: bumpTex, bumpScale: 0.006, roughness: 0.35, metalness: 0.15 }),
                0,
                0.009,
                0,
                env,
            );
            amplop.sealRest = V(0, 0.0095, -ED / 2 + 0.165);
            amplop.sealLand = V(0.165, 0.003, 0.1);
            // kartu lipat dua: panel dalam + sampul berengsel di sisi kiri
            const CW = 0.19,
                CH = 0.27;
            amplop.CW = CW;
            const kartu = new THREE.Group();
            env.add(kartu);
            amplop.kartu = kartu;
            const mk = () => {
                const c = document.createElement('canvas');
                c.width = 760;
                c.height = 1080;
                const t = new THREE.CanvasTexture(c);
                t.encoding = THREE.sRGBEncoding;
                t.anisotropy = maxAniso;
                return { c, t };
            };
            amplop.cv = { sampul: mk(), kiri: mk(), kanan: mk() };
            const pMat = (t: any) =>
                new THREE.MeshStandardMaterial({ map: t, normalMap: T.paperN, normalScale: new THREE.Vector2(0.3, 0.3), roughness: 0.82 });
            mesh(new THREE.BoxGeometry(CW, CH, 0.0015), [M.paper, M.paper, M.paper, M.paper, pMat(amplop.cv.kanan.t), M.paper], 0, 0, 0, kartu);
            amplop.coverHinge = new THREE.Group();
            amplop.coverHinge.position.set(-CW / 2, 0, 0.0016);
            kartu.add(amplop.coverHinge);
            mesh(
                new THREE.BoxGeometry(CW, CH, 0.0015),
                [M.paper, M.paper, M.paper, M.paper, pMat(amplop.cv.sampul.t), pMat(amplop.cv.kiri.t)],
                CW / 2,
                0,
                0,
                amplop.coverHinge,
            );
        }

        /* ---------- obor bambu di sepanjang jalan ---------- */
        const flames: any[] = [];
        const flameMat = new THREE.SpriteMaterial({
            map: T.flame,
            color: hdr(3, 2.2, 1.4),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        const glowMat = new THREE.SpriteMaterial({
            map: glowTex,
            color: hdr(0.9, 0.55, 0.25),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0.5,
        });
        function api(p: any, size: number, parent: any = world) {
            const f = new THREE.Sprite(flameMat);
            f.center.set(0.5, 0.08);
            f.scale.set(size, size * 2.2, 1);
            f.position.copy(p);
            parent.add(f);
            const gl = new THREE.Sprite(glowMat);
            gl.scale.setScalar(size * 9);
            gl.position.copy(p).add(V(0, size * 0.8, 0));
            parent.add(gl);
            flames.push({ s: f, w: size, h: size * 2.2, seed: R(0, 9), gl });
        }
        {
            const obor: Item[] = [];
            const tempat: any[] = [];
            for (let i = 1; i < 9; i++) {
                const t = (i / 9) * 0.78,
                    p = JALAN_A.getPointAt(t),
                    tg = JALAN_A.getTangentAt(t);
                const s = i % 2 ? 1 : -1;
                tempat.push(V(p.x - tg.z * s * 1.05, 0, p.z + tg.x * s * 1.05));
            }
            tempat.push(V(2.6, 0, 20.4), V(3.9, 0, 19.2), V(6.6, 0, 14.2), V(7.9, 0, 15.1), V(6.9, 0, 8.8), V(9.1, 0, 8.8));
            tempat.forEach((p) => {
                obor.push({ p: V(p.x, 0, p.z), s: V(1, 1.55, 1) });
                api(V(p.x, 1.62, p.z), 0.05);
            });
            instanced(new THREE.CylinderGeometry(0.03, 0.035, 1, 8).translate(0, 0.5, 0), M.bambu, obor, { shadow: true });
            instanced(
                new THREE.CylinderGeometry(0.05, 0.03, 0.09, 10),
                mat(0x3a2e22),
                obor.map((o) => ({ p: V(o.p.x, 1.58, o.p.z) })),
            );
        }

        /* ---------- bangun bunga ---------- */
        {
            const melatiGeo = new THREE.PlaneGeometry(0.034, 0.034, 2, 2);
            {
                const p = melatiGeo.attributes.position;
                for (let i = 0; i < p.count; i++) p.setZ(i, -(p.getX(i) ** 2 + p.getY(i) ** 2) * 6);
                melatiGeo.computeVertexNormals();
            }
            melatiGeo.rotateX(-Math.PI / 2);
            instanced(
                melatiGeo,
                angin(
                    new THREE.MeshStandardMaterial({
                        map: T.melati,
                        alphaTest: 0.4,
                        side: THREE.DoubleSide,
                        roughness: 0.5,
                        emissive: lin(0x2a2824),
                    }),
                    1.5,
                    0.012,
                ),
                melatiItems,
            );
            instanced(
                new THREE.SphereGeometry(0.0065, 6, 5).scale(1, 1.7, 1),
                angin(new THREE.MeshStandardMaterial({ color: lin(0xfbf8f0), roughness: 0.5, emissive: lin(0x2a2824) }), 4, 0.006),
                kuncupItems,
            );
            // mawar putih (geometri kelopak spiral)
            const parts: any[] = [],
                n = 22;
            for (let i = 0; i < n; i++) {
                const t = i / (n - 1),
                    w = 0.08 + t * 0.15,
                    h = 0.1 + t * 0.1,
                    g = new THREE.PlaneGeometry(w, h, 5, 5);
                g.translate(0, h / 2, 0);
                const p = g.attributes.position,
                    cup = 1 - t * 0.4,
                    curl = t ** 3 * 0.45;
                for (let k = 0; k < p.count; k++) {
                    const nx = p.getX(k) / (w / 2),
                        ny = p.getY(k) / h;
                    p.setZ(k, -cup * nx * nx * w * 0.5 + curl * ny ** 3 * h - ny * 0.01);
                }
                g.computeVertexNormals();
                const ao: number[] = [];
                for (let k = 0; k < p.count; k++) {
                    const a = (0.35 + 0.65 * Math.pow(p.getY(k) / h, 0.55)) * (0.6 + 0.4 * t);
                    ao.push(a, a, a);
                }
                g.setAttribute('color', new THREE.Float32BufferAttribute(ao, 3));
                g.rotateX(0.04 + t ** 1.8 * 0.95);
                g.translate(0, -t * 0.03, 0.008 + t * 0.05);
                g.rotateY(i * 2.39996);
                parts.push(g);
            }
            instanced(
                merge(parts),
                angin(
                    new THREE.MeshStandardMaterial({
                        map: T.petal,
                        alphaTest: 0.45,
                        side: THREE.DoubleSide,
                        roughness: 0.5,
                        envMapIntensity: 0.6,
                        vertexColors: true,
                    }),
                    4,
                    0.008,
                ),
                roseItems,
                { colors: true },
            );
            const lg = new THREE.PlaneGeometry(0.055, 0.12, 2, 6);
            lg.translate(0, 0.06, 0);
            {
                const p = lg.attributes.position;
                for (let k = 0; k < p.count; k++) {
                    const nx = p.getX(k) / 0.0275,
                        ny = p.getY(k) / 0.12;
                    p.setZ(k, 0.25 * ny * ny * 0.12 - Math.abs(nx) * 0.12 * 0.055);
                }
                lg.computeVertexNormals();
            }
            instanced(
                lg,
                angin(
                    new THREE.MeshPhongMaterial({
                        map: T.leaf,
                        normalMap: T.leafN,
                        alphaTest: 0.45,
                        side: THREE.DoubleSide,
                        specular: 0x111108,
                        shininess: 10,
                    }),
                    4,
                    0.01,
                ),
                leafItems,
                { colors: true },
            );
        }

        /* =====================================================================
           5. KELOPAK MELATI (gerak melengkung alami) & DEBU CAHAYA
           ===================================================================== */
        const PMAX = Math.round(S.kelopak * (ringan ? 0.5 : 1));
        const pGeo = new THREE.PlaneGeometry(0.022, 0.03, 2, 2);
        {
            const p = pGeo.attributes.position;
            for (let i = 0; i < p.count; i++) p.setZ(i, -(p.getX(i) ** 2) * 18);
            pGeo.computeVertexNormals();
        }
        const pMesh = new THREE.InstancedMesh(
            pGeo,
            new THREE.MeshStandardMaterial({
                map: T.petal,
                alphaTest: 0.4,
                side: THREE.DoubleSide,
                roughness: 0.5,
                color: lin(0xfffdf7),
                emissive: lin(0x1e1c18),
            }),
            PMAX,
        );
        pMesh.frustumCulled = false;
        world.add(pMesh);
        const kel: any[] = [];
        for (let i = 0; i < PMAX; i++)
            kel.push({
                p: V(0, -50, 0),
                v: V(0, 0, 0),
                r: V(R(0, 6), R(0, 6), R(0, 6)),
                w: V(R(-2, 2), R(-2, 2), R(-2, 2)),
                ph: R(0, 6.28),
                life: 0,
                ambient: i < PMAX * 0.55,
            });
        let kelNext = Math.ceil(PMAX * 0.55);
        function lahirAmbient(k: any) {
            k.p.copy(camera.position).add(V(R(-6, 6), R(2.5, 5), R(-7, 2)).applyQuaternion(camera.quaternion));
            k.v.set(R(-0.1, 0.1), -R(0.18, 0.32), R(-0.1, 0.1));
            k.life = R(10, 18);
        }
        function semburan(pusat: any, n: number, cepat = 0.9, arah: any = null) {
            if (reduce) return;
            for (let i = 0; i < n; i++) {
                const k = kel[kelNext];
                kelNext = kelNext + 1 >= PMAX ? Math.ceil(PMAX * 0.55) : kelNext + 1;
                k.p.copy(pusat).add(V(R(-0.08, 0.08), R(-0.05, 0.08), R(-0.08, 0.08)));
                const d = arah ? arah.clone().add(V(R(-0.35, 0.35), R(-0.2, 0.35), R(-0.35, 0.35))) : V(R(-1, 1), R(0.2, 1.1), R(-1, 1)).normalize();
                k.v.copy(d.multiplyScalar(cepat * R(0.5, 1)));
                k.life = R(3.5, 6);
            }
        }
        // kelopak melintas di depan kamera sebagai penanda pergantian adegan
        function lintasKamera() {
            if (reduce) return;
            const kanan = V(1, 0, 0).applyQuaternion(camera.quaternion),
                maju = V(0, 0, -1).applyQuaternion(camera.quaternion);
            const pusat = camera.position
                .clone()
                .addScaledVector(maju, 1.3)
                .addScaledVector(kanan, -1.4)
                .add(V(0, 0.5, 0));
            semburan(pusat, 26, 1.1, kanan.clone().add(V(0, -0.15, 0)));
        }
        const DN = ringan ? 200 : 480,
            dPos = new Float32Array(DN * 3),
            dSeed: number[][] = [];
        for (let i = 0; i < DN; i++) dSeed.push([R(-4, 4), R(0.3, 3.5), R(-4, 4), R(0, 6.28)]);
        const dGeo = new THREE.BufferGeometry();
        dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
        const dMat = new THREE.PointsMaterial({
            map: glowTex,
            color: hdr(1.6, 1.25, 0.7),
            size: 0.02,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
        const debu = new THREE.Points(dGeo, dMat);
        debu.frustumCulled = false;
        scene.add(debu);

        /* =====================================================================
           6. TEKSTUR KANVAS: amplop, segel, kartu, panel ukiran
           ===================================================================== */
        const gold = (g: CanvasRenderingContext2D, w: number, h: number) => {
            const gr = g.createLinearGradient(0, 0, w, h);
            gr.addColorStop(0, '#957131');
            gr.addColorStop(0.35, '#E2C27C');
            gr.addColorStop(0.6, '#B08D57');
            gr.addColorStop(0.85, '#E7CB8A');
            gr.addColorStop(1, '#8E6B2C');
            return gr;
        };
        const spaced = (g: CanvasRenderingContext2D, t: string, x: number, y: number, sp: number) => {
            const gs = g as CanvasRenderingContext2D & { letterSpacing?: string };
            if ('letterSpacing' in gs) {
                gs.letterSpacing = sp + 'px';
                g.fillText(t, x, y);
                gs.letterSpacing = '0px';
            } else g.fillText(t, x, y);
        };
        // ornamen sulur (patra) bergaya ukiran Sunda: pucuk melengkung simetris
        function sulur(g: CanvasRenderingContext2D, x: number, y: number, s: number, rot = 0) {
            g.save();
            g.translate(x, y);
            g.rotate(rot);
            g.scale(s, s);
            g.lineWidth = (2.2 / s) * s;
            g.lineCap = 'round';
            [-1, 1].forEach((m) => {
                g.save();
                g.scale(m, 1);
                g.beginPath();
                g.moveTo(0, 0);
                g.bezierCurveTo(20, -4, 40, -22, 34, -40);
                g.bezierCurveTo(30, -52, 16, -50, 18, -38);
                g.bezierCurveTo(20, -30, 30, -32, 28, -40);
                g.stroke();
                g.beginPath();
                g.moveTo(8, -2);
                g.bezierCurveTo(30, 6, 54, -2, 62, -16);
                g.bezierCurveTo(66, -26, 56, -30, 52, -22);
                g.stroke();
                g.beginPath();
                g.moveTo(40, -24);
                g.quadraticCurveTo(52, -36, 46, -50);
                g.quadraticCurveTo(38, -40, 40, -24);
                g.fill();
                g.beginPath();
                g.moveTo(22, 4);
                g.quadraticCurveTo(34, 14, 48, 10);
                g.quadraticCurveTo(36, 2, 22, 4);
                g.fill();
                g.restore();
            });
            g.beginPath();
            g.moveTo(0, 6);
            g.quadraticCurveTo(-8, -10, 0, -26);
            g.quadraticCurveTo(8, -10, 0, 6);
            g.fill();
            g.beginPath();
            g.arc(0, -32, 4, 0, Math.PI * 2);
            g.fill();
            g.restore();
        }
        function bingkaiOrnamen(g: CanvasRenderingContext2D, W: number, H: number, pad: number) {
            const gd = gold(g, W, H);
            g.strokeStyle = gd;
            g.fillStyle = gd;
            g.lineWidth = 3;
            g.strokeRect(pad, pad, W - pad * 2, H - pad * 2);
            g.lineWidth = 1.2;
            g.strokeRect(pad + 12, pad + 12, W - pad * 2 - 24, H - pad * 2 - 24);
            sulur(g, W / 2, pad + 6, 0.9, Math.PI);
            sulur(g, W / 2, H - pad - 6, 0.9, 0);
            [
                [pad + 14, pad + 14, Math.PI * 0.75],
                [W - pad - 14, pad + 14, -Math.PI * 0.75],
                [pad + 14, H - pad - 14, Math.PI * 0.25],
                [W - pad - 14, H - pad - 14, -Math.PI * 0.25],
            ].forEach(([x, y, r]) => sulur(g, x, y, 0.55, r));
        }
        const P = DATA.pria,
            Wn = DATA.wanita,
            MONO = DATA.monogram;
        function gambarKertas() {
            // amplop
            const c = amplop.envC;
            let g: CanvasRenderingContext2D = c.getContext('2d');
            g.drawImage(T.paper.image, 0, 0, c.width, c.height);
            bingkaiOrnamen(g, c.width, c.height, 26);
            amplop.envTex.needsUpdate = true;
            // segel: warna & tonjolan monogram
            g = amplop.sealC.getContext('2d');
            const gr = g.createRadialGradient(118, 110, 10, 128, 128, 130);
            gr.addColorStop(0, '#8A4A55');
            gr.addColorStop(0.7, '#6B3F46');
            gr.addColorStop(1, '#4A2830');
            g.fillStyle = gr;
            g.fillRect(0, 0, 256, 256);
            g.fillStyle = gold(g, 256, 256);
            g.strokeStyle = gold(g, 256, 256);
            g.lineWidth = 5;
            g.beginPath();
            g.arc(128, 128, 90, 0, Math.PI * 2);
            g.stroke();
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.font = 'italic 500 96px "Cormorant Garamond", Georgia, serif';
            g.fillText(MONO, 128, 132);
            amplop.sealTex.needsUpdate = true;
            g = amplop.bumpC.getContext('2d');
            g.fillStyle = '#808080';
            g.fillRect(0, 0, 256, 256);
            g.strokeStyle = '#fff';
            g.lineWidth = 6;
            g.beginPath();
            g.arc(128, 128, 90, 0, Math.PI * 2);
            g.stroke();
            g.fillStyle = '#fff';
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.font = 'italic 500 96px "Cormorant Garamond", Georgia, serif';
            g.fillText(MONO, 128, 132);
            amplop.bumpTex.needsUpdate = true;
            // sampul kartu
            const kanvas = (cv: any, isi: (g: CanvasRenderingContext2D, W: number, H: number) => void) => {
                const g: CanvasRenderingContext2D = cv.c.getContext('2d'),
                    W = cv.c.width,
                    H = cv.c.height;
                g.drawImage(T.paper.image, 0, 0, W, H);
                bingkaiOrnamen(g, W, H, 34);
                g.textAlign = 'center';
                g.textBaseline = 'middle';
                isi(g, W, H);
                cv.t.needsUpdate = true;
            };
            kanvas(amplop.cv.sampul, (g, W, H) => {
                g.fillStyle = gold(g, W, H);
                g.font = '500 30px Jost, sans-serif';
                spaced(g, 'ULEMAN', W / 2, 250, 14);
                g.strokeStyle = gold(g, W, H);
                g.lineWidth = 2;
                g.beginPath();
                g.arc(W / 2, H / 2, 140, 0, Math.PI * 2);
                g.stroke();
                g.beginPath();
                g.arc(W / 2, H / 2, 128, 0, Math.PI * 2);
                g.stroke();
                g.fillStyle = '#6B3F46';
                g.font = 'italic 500 150px "Cormorant Garamond", Georgia, serif';
                g.fillText(MONO, W / 2, H / 2 + 6);
                g.fillStyle = '#2F2721';
                g.font = 'italic 44px "Cormorant Garamond", Georgia, serif';
                g.fillText(`${P} & ${Wn}`, W / 2, H - 250, W - 120);
            });
            kanvas(amplop.cv.kiri, (g, W, H) => {
                g.fillStyle = '#6B3F46';
                g.font = 'italic 500 64px "Cormorant Garamond", Georgia, serif';
                const s = DATA.semboyan.replace(/\.$/, '').split(', ');
                s.forEach((l, i) => g.fillText(l + (i < s.length - 1 ? ',' : '.'), W / 2, H / 2 - 50 + i * 90, W - 100));
                g.fillStyle = gold(g, W, H);
                sulur(g, W / 2, H / 2 + 190, 1.1, 0);
            });
            kanvas(amplop.cv.kanan, (g, W, H) => {
                g.fillStyle = '#7D6230';
                g.font = '500 26px Jost, sans-serif';
                spaced(g, 'PERNIKAHAN', W / 2, 200, 10);
                g.fillStyle = '#2F2721';
                g.font = '500 120px "Cormorant Garamond", Georgia, serif';
                g.fillText(P, W / 2, 360, W - 120);
                g.fillStyle = gold(g, W, H);
                g.font = 'italic 90px "Cormorant Garamond", Georgia, serif';
                g.fillText('&', W / 2, 470);
                g.fillStyle = '#2F2721';
                g.font = '500 120px "Cormorant Garamond", Georgia, serif';
                g.fillText(Wn, W / 2, 580, W - 120);
                g.strokeStyle = gold(g, W, H);
                g.lineWidth = 2;
                g.beginPath();
                g.moveTo(W / 2 - 110, 680);
                g.lineTo(W / 2 + 110, 680);
                g.stroke();
                g.fillStyle = '#6B3F46';
                g.font = '500 40px Jost, sans-serif';
                spaced(g, DATA.tanggalKartu, W / 2, 740, 6);
                g.fillStyle = '#63584B';
                g.font = 'italic 40px "Cormorant Garamond", Georgia, serif';
                g.fillText(DATA.lokasiNama, W / 2, 810, W - 120);
            });
            // panel ukiran pelaminan: kayu dengan sulur keemasan berulang
            const pd = world.children.find((o: any) => o.userData && o.userData.ukirC);
            if (pd) {
                const c2 = pd.userData.ukirC,
                    g2: CanvasRenderingContext2D = c2.getContext('2d');
                g2.drawImage(T.jati.image, 0, 0, 1024, 512);
                g2.fillStyle = 'rgba(40,24,12,.35)';
                g2.fillRect(0, 0, 1024, 512);
                g2.fillStyle = gold(g2, 1024, 512);
                g2.strokeStyle = gold(g2, 1024, 512);
                for (let x = 64; x < 1024; x += 128) {
                    sulur(g2, x, 470, 0.9, 0);
                    sulur(g2, x, 42, 0.9, Math.PI);
                }
                g2.lineWidth = 3;
                g2.strokeRect(20, 20, 984, 472);
                sulur(g2, 512, 300, 2.4, 0);
                pd.userData.ukirTex.needsUpdate = true;
            }
            drawKeterangan();
        }

        /* =====================================================================
           7. PASCA-PROSES
           ===================================================================== */
        const rt = new THREE.WebGLRenderTarget(innerWidth * PR, innerHeight * PR, { type: THREE.HalfFloatType, format: THREE.RGBAFormat });
        const composer = new THREE.EffectComposer(renderer, rt);
        composer.setPixelRatio(PR);
        composer.setSize(innerWidth, innerHeight);
        composer.addPass(new THREE.RenderPass(scene, camera));
        const bloom = new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.55, 0.6, 1.2);
        composer.addPass(bloom);
        const finalPass = new THREE.ShaderPass({
            uniforms: { tDiffuse: { value: null }, exposure: { value: 0.8 }, time: { value: 0 }, hangat: { value: 0 } },
            vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
            fragmentShader: `uniform sampler2D tDiffuse; uniform float exposure; uniform float time; uniform float hangat; varying vec2 vUv;
    vec3 aces(vec3 x){ return clamp((x * (2.51 * x + .03)) / (x * (2.43 * x + .59) + .14), 0., 1.); }
    vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1. / 2.4)) - .055, step(vec3(.0031308), c)); }
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + time) * 43758.5453); }
    void main(){ vec3 c = aces(texture2D(tDiffuse, vUv).rgb * exposure);
      c *= mix(vec3(1.), vec3(1.06, .98, .9), hangat);
      vec2 d = vUv - .5; c *= 1. - dot(d, d) * .5;
      gl_FragColor = vec4(toSRGB(c) + (hash(vUv * 731.) - .5) * .018, 1.); }`,
        });
        composer.addPass(finalPass);

        /* =====================================================================
           8. PERJALANAN KAMERA & CAHAYA — setiap bidikan terikat pada bagian halaman
           ===================================================================== */
        const sasak = world.userData.sasak;
        const titikSasak = (t: number, h = 1.6) =>
            sasak.a
                .clone()
                .addScaledVector(sasak.dir, t * sasak.L)
                .setY(sasak.tinggiSasak(clamp01(t)) + h);
        const pedW = (x: number, y: number, z: number) => amplop.pg.localToWorld(V(x, y, z));
        const nK = bingkaiKisah.length;
        const shotKisah: Shot[] = nK
            ? bingkaiKisah.map((b, i) => ({
                  at: 'carita',
                  f: 0.1 + i * (0.8 / Math.max(1, nK - 1)),
                  pos: () => titikSasak(b.t - 0.27, 1.55),
                  look: () => b.fr.localToWorld(V(0, -0.05, 0)),
                  side: 1,
                  c: 0.35 + i * (0.18 / Math.max(1, nK - 1)),
                  kisah: i,
              }))
            : // tanpa kisah: satu bidikan menyusuri sasak agar perjalanan kamera tetap utuh
              [{ at: 'carita', f: 0.5, pos: () => titikSasak(-0.15, 1.55), look: () => titikSasak(0.7, 1.0), side: 1, c: 0.44 }];
        const SHOTS: Shot[] = [
            { at: 'sumping', f: 0.05, pos: V(0.4, 1.75, 55), look: V(0, 1.45, 43), side: -1, c: 0 },
            { at: 'sumping', f: 0.95, pos: V(0.25, 1.7, 45.5), look: V(-0.9, 1.25, 34), side: -1, c: 0.05 },
            { at: 'uleman', f: 0.1, pos: V(-0.15, 1.6, 34.8), look: () => pedW(0, 1.06, 0), side: 1, c: 0.1 },
            { at: 'uleman', f: 0.42, pos: () => pedW(0.04, 1.5, 0.55), look: () => pedW(0, 1.1, 0.02), side: 1, c: 0.12 },
            { at: 'uleman', f: 0.88, pos: () => pedW(-0.2, 1.5, 0.72), look: () => pedW(0, 1.3, 0.04), side: 1, c: 0.15 },
            { at: 'panganten', f: 0.1, pos: V(0, 1.65, 30), look: V(0, 1.6, 22.3), side: -1, c: 0.25 },
            { at: 'panganten', f: 0.65, pos: V(0.05, 1.55, 25.3), look: V(0, 1.55, 22.3), side: -1, c: 0.3 },
            ...shotKisah,
            { at: 'mapag', f: 0.1, pos: V(7.4, 1.8, 13.2), look: V(8, 2.4, 5), side: -1, c: 0.62 },
            { at: 'mapag', f: 0.7, pos: V(8.25, 2.05, 9.4), look: V(8, 2.0, 3), side: -1, c: 0.74 },
            { at: 'panineungan', f: 0.15, pos: V(12.2, 2.4, 12.5), look: V(7.6, 2.7, 4.4), side: 1, c: 0.86 },
            { at: 'panineungan', f: 0.92, pos: V(2.6, 7.4, 23), look: V(6.5, 1.6, 6), side: 1, c: 1 },
        ].filter((s) => opsi.bagian(s.at)); // bagian yang dinonaktifkan dilewati kamera
        const evalV = (v: any) => (typeof v === 'function' ? v() : v.clone());
        let shotY: number[] = [];
        function hitungAnchor() {
            shotY = SHOTS.map((s) => {
                const el = opsi.bagian(s.at);
                if (!el) return 0;
                const top = el.getBoundingClientRect().top + scrollY;
                return Math.max(0, top + el.offsetHeight * s.f - innerHeight / 2);
            });
            shotY[0] = 0;
            for (let i = 1; i < shotY.length; i++) shotY[i] = Math.max(shotY[i], shotY[i - 1] + 1);
        }
        const uDariScroll = (y: number) => {
            if (y <= shotY[0]) return 0;
            for (let i = 0; i < shotY.length - 1; i++) if (y < shotY[i + 1]) return i + smooth((y - shotY[i]) / (shotY[i + 1] - shotY[i]));
            return SHOTS.length - 1;
        };
        let posCurve: any, lookCurve: any;
        function kurva() {
            posCurve = new THREE.CatmullRomCurve3(
                SHOTS.map((s) => evalV(s.pos)),
                false,
                'centripetal',
            );
            lookCurve = new THREE.CatmullRomCurve3(
                SHOTS.map((s) => evalV(s.look)),
                false,
                'centripetal',
            );
        }

        // cahaya per adegan: pagi yang lembut → keemasan → senja dengan pelita menyala
        const C = {
            sunPagi: lin(0xffe2b8),
            sunSenja: lin(0xff9152),
            fogPagi: lin(0xe6cdaa),
            fogSenja: lin(0x8e7466),
            langitSenja: new THREE.Color(0.62, 0.5, 0.48),
        };
        function aturCahaya(c: number) {
            sun.intensity = lerp(2.2, 0.55, c);
            sun.color.copy(C.sunPagi).lerp(C.sunSenja, c);
            hemi.intensity = lerp(0.7, 0.28, c);
            fill.intensity = lerp(0.7, 0.25, c);
            scene.fog.color.copy(C.fogPagi).lerp(C.fogSenja, c);
            skyMat.uniforms.uRedup.value = lerp(1, 0.42, c);
            skyMat.uniforms.uTint.value.setRGB(1, 1, 1).lerp(C.langitSenja, c);
            const nyala = 0.3 + smooth(clamp01((c - 0.45) / 0.5)) * 1.6;
            flameMat.color.setRGB(3 * nyala * 0.8 + 0.6, 2.2 * nyala * 0.8 + 0.4, 1.4 * nyala * 0.8 + 0.25);
            glowMat.opacity = 0.25 + nyala * 0.35;
            lampion[0].emissiveIntensity = lerp(0.25, 2.8, smooth(clamp01((c - 0.5) / 0.4)));
            lampuPendopo.forEach((l) => (l.intensity = lerp(0, 1.6, smooth(clamp01((c - 0.5) / 0.4)))));
            dMat.opacity = lerp(0.9, 0.45, c);
            finalPass.uniforms.exposure.value = lerp(0.86, 0.95, c);
            finalPass.uniforms.hangat.value = c;
        }

        /* ---------- animasi amplop: segel, tutup, kartu terangkat, sampul terbuka ---------- */
        const st = { buka: 0 };
        let sudahSembur = false;
        function aturAmplop(p: number) {
            const seal = clamp01(p / 0.18),
                flap = clamp01((p - 0.12) / 0.28),
                slide = clamp01((p - 0.36) / 0.2),
                rise = clamp01((p - 0.52) / 0.2),
                cover = clamp01((p - 0.72) / 0.28);
            const s0 = amplop.sealRest,
                s1 = amplop.sealLand,
                e = smooth(seal);
            amplop.seal.position.set(lerp(s0.x, s1.x, e), lerp(s0.y, s1.y, e) + Math.sin(e * Math.PI) * 0.07, lerp(s0.z, s1.z, e));
            amplop.seal.rotation.set(e * 3.1, e * 1.2, Math.sin(e * Math.PI) * 0.5);
            if (e >= 1) amplop.seal.rotation.set(0, 1.2, 0);
            amplop.hinge.rotation.x = -smooth(flap) * 2.8;
            const ED = amplop.ED,
                zs = smooth(slide),
                zr = smooth(rise),
                zc = smooth(cover);
            const flat = V(0, 0.0028, 0.005),
                keluar = V(0, 0.008, -ED * 0.85),
                naik = V(0, 0.2, 0.04);
            const pos = flat.clone().lerp(keluar, zs).lerp(naik, zr);
            pos.y += Math.sin(zr * Math.PI) * 0.04;
            pos.x += (zc * amplop.CW) / 2; // tetap di tengah saat sampul dibuka
            amplop.kartu.position.copy(pos);
            amplop.kartu.rotation.set(-Math.PI / 2 + zr * (Math.PI / 2 - 0.14), 0, 0);
            amplop.coverHinge.rotation.y = -zc * 2.9;
            if (p > 0.74 && !sudahSembur) {
                sudahSembur = true;
                amplop.kartu.updateMatrixWorld(true);
                semburan(amplop.kartu.localToWorld(V(0, 0.1, 0.05)), 34, 0.7);
            }
        }
        // pengganti gsap.to(st, { buka: 1, duration: 3.8, ease: 'power1.inOut' })
        let sudahBuka = false,
            tweenRaf = 0;
        function buka(instan = false) {
            if (sudahBuka || dihancurkan) return;
            sudahBuka = true;
            if (reduce || instan) {
                st.buka = 1;
                if (instan) curBuka = 1;
                return;
            }
            const t0 = performance.now(),
                dur = 3800;
            const langkah = (now: number) => {
                const t = clamp01((now - t0) / dur);
                st.buka = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                if (t < 1 && !dihancurkan) tweenRaf = requestAnimationFrame(langkah);
            };
            tweenRaf = requestAnimationFrame(langkah);
        }

        /* ---------- penunjuk: kemiringan amplop & hembusan angin ---------- */
        const mouse = { x: 0, y: 0, sx: 0, sy: 0, lx: 0, ly: 0, v: 0 };
        const padaPenunjuk = (e: PointerEvent) => {
            const x = (e.clientX / innerWidth - 0.5) * 2,
                y = (e.clientY / innerHeight - 0.5) * 2;
            mouse.v = Math.min(1, mouse.v + Math.hypot(x - mouse.lx, y - mouse.ly) * 1.5 * S.kepekaanPenunjuk);
            mouse.lx = x;
            mouse.ly = y;
            mouse.x = x;
            mouse.y = y;
        };
        addEventListener('pointermove', padaPenunjuk, { passive: true });

        /* ---------- loop ---------- */
        const clock = new THREE.Clock();
        const Pc = V(0, 0, 0),
            Lc = V(0, 0, 0),
            e3 = new THREE.Euler();
        let curU = 0,
            curBuka = 0,
            prev = 0,
            adeganTerakhir: string | null = null,
            liniTerakhir = -1,
            raf = 0;
        function tick() {
            if (dihancurkan) return;
            const el = clock.getElapsedTime(),
                dt = Math.min(el - prev, 0.05);
            prev = el;
            const targetU = uDariScroll(scrollY);
            if (reduce) {
                curU = Math.round(targetU);
                curBuka = st.buka;
            } else {
                curU += (targetU - curU) * (1 - Math.exp(-dt * (ringan ? 3.6 : 2.8)));
                curBuka += (st.buka - curBuka) * (1 - Math.exp(-dt * 8));
            }
            aturAmplop(curBuka);
            // kemiringan lembut amplop mengikuti penunjuk
            amplop.env.rotation.x = lerp(amplop.env.rotation.x, reduce ? 0 : mouse.sy * 0.06, 0.08);
            amplop.env.rotation.z = lerp(amplop.env.rotation.z, reduce ? 0 : -mouse.sx * 0.06, 0.08);
            amplop.kartu.updateMatrixWorld(true);
            const u = SHOTS.length > 1 ? Math.min(curU / (SHOTS.length - 1), 1) : 0;
            posCurve.getPoint(u, Pc);
            lookCurve.getPoint(u, Lc);
            const i0 = Math.min(SHOTS.length - 1, Math.floor(curU)),
                i1 = Math.min(SHOTS.length - 1, i0 + 1),
                f = curU - i0;
            if (!reduce) {
                const amp = (ringan ? 0.12 : 0.25) * (Pc.distanceTo(Lc) > 2 ? 1 : 0.15);
                mouse.sx += (mouse.x - mouse.sx) * 0.04;
                mouse.sy += (mouse.y - mouse.sy) * 0.04;
                Pc.x += mouse.sx * amp;
                Pc.y -= mouse.sy * amp * 0.4;
                Pc.y += Math.sin(el * 0.5) * 0.012;
            }
            camera.position.copy(Pc);
            camera.lookAt(Lc);
            // kubah langit mengikuti kamera: warnanya hanya bergantung arah pandang, dan dengan begitu
            // tidak pernah terpotong far plane (pada tema asli muncul bidang hitam di langit adegan pertama)
            sky.position.copy(Pc);
            const side = lerp(SHOTS[i0].side, SHOTS[i1].side, f),
                wide = innerWidth >= 900;
            const offX = wide ? innerWidth * 0.18 * side : 0,
                offY = !wide ? innerHeight * 0.24 * Math.min(1, curU) : 0;
            if (Math.abs(offX) > 0.5 || offY > 0.5) camera.setViewOffset(innerWidth, innerHeight, offX, offY, innerWidth, innerHeight);
            else camera.clearViewOffset();
            aturCahaya(lerp(SHOTS[i0].c, SHOTS[i1].c, f));

            // pergantian adegan: kelopak melintas
            const sekarang = SHOTS[Math.round(curU)];
            if (sekarang.at !== adeganTerakhir) {
                if (adeganTerakhir !== null) lintasKamera();
                adeganTerakhir = sekarang.at;
            }
            // carita asih: tandai kisah aktif & munculkan foto saat didekati
            const sk = sekarang.kisah;
            if (sk !== undefined && sk !== liniTerakhir) {
                liniTerakhir = sk;
                opsi.onKisah(sk);
            }
            bingkaiKisah.forEach((b) => {
                const d = camera.position.distanceTo(b.fr.getWorldPosition(V(0, 0, 0)));
                const tgt = clamp01((6.5 - d) / 2.5);
                b.reveal = reduce ? tgt : b.reveal + (tgt - b.reveal) * 0.06;
                const k = 0.14 + b.reveal * 0.86;
                b.fotoMat.color.setRGB(k, k, k);
                b.foto.position.z = 0.032 + b.reveal * 0.014;
            });
            // komposisi 2.5D pangantén: lapisan bergeser halus terhadap kamera
            if (lapisPanganten) {
                const dx = (camera.position.x - BINGKAI.x) * 0.02;
                lapisPanganten.latar.position.x = -dx;
                lapisPanganten.pang.position.x = dx * 0.4;
            }

            uTime.value = el;
            mouse.v *= 0.94;
            uGust.value = reduce ? 0 : uGust.value + (mouse.v - uGust.value) * 0.05;
            finalPass.uniforms.time.value = el % 10;
            if (world.userData.air) {
                const nm = world.userData.air.material.normalMap;
                nm.offset.set(el * 0.006, el * 0.004);
            }
            if (!reduce) {
                flames.forEach((fl) => {
                    const k = 1 + Math.sin(el * 11 + fl.seed) * 0.06 + Math.sin(el * 23 + fl.seed * 3) * 0.04 + (Math.random() - 0.5) * 0.05;
                    fl.s.scale.set(fl.w * (2 - k), fl.h * k, 1);
                    fl.gl.scale.setScalar(fl.w * 9 * (1 + (k - 1) * 0.5));
                });
                const cx = camera.position.x,
                    cy = camera.position.y,
                    cz = camera.position.z;
                for (let i = 0; i < DN; i++) {
                    const [x, y, z, s] = dSeed[i];
                    dPos[i * 3] = cx + x + Math.sin(el * 0.1 + s) * 0.5;
                    dPos[i * 3 + 1] = Math.max(0.2, cy - 1.5 + y + Math.sin(el * 0.17 + s * 2) * 0.3);
                    dPos[i * 3 + 2] = cz - 3 + z + Math.cos(el * 0.09 + s) * 0.5;
                }
                dGeo.attributes.position.needsUpdate = true;
                // kelopak: lintasan melengkung (ayunan daun jatuh)
                for (let i = 0; i < PMAX; i++) {
                    const k = kel[i];
                    if (k.life <= 0) {
                        if (k.ambient) lahirAmbient(k);
                        else {
                            k.p.y = -50;
                            dummy.position.copy(k.p);
                            dummy.updateMatrix();
                            pMesh.setMatrixAt(i, dummy.matrix);
                            continue;
                        }
                    }
                    k.life -= dt;
                    const sway = Math.sin(el * 1.6 + k.ph);
                    k.v.x += (sway * 0.35 - k.v.x * 0.6) * dt;
                    k.v.z += (Math.cos(el * 1.2 + k.ph) * 0.25 - k.v.z * 0.6) * dt;
                    k.v.y += (-0.22 - k.v.y) * dt * 0.9;
                    k.p.addScaledVector(k.v, dt);
                    if (k.p.y < 0.01) {
                        k.p.y = 0.01;
                        k.v.set(0, 0, 0);
                        k.life = Math.min(k.life, 1.5);
                    }
                    k.r.x += k.w.x * dt * (1 + Math.abs(sway));
                    k.r.y += k.w.y * dt;
                    k.r.z += k.w.z * dt;
                    dummy.position.copy(k.p);
                    dummy.rotation.copy(e3.set(k.r.x, k.r.y, k.r.z));
                    dummy.scale.setScalar(1);
                    dummy.updateMatrix();
                    pMesh.setMatrixAt(i, dummy.matrix);
                }
                pMesh.instanceMatrix.needsUpdate = true;
            }
            composer.render();
            raf = requestAnimationFrame(tick);
        }
        const padaResize = () => {
            camera.aspect = innerWidth / innerHeight;
            fitFov();
            renderer.setSize(innerWidth, innerHeight);
            composer.setSize(innerWidth, innerHeight);
            hitungAnchor();
        };
        addEventListener('resize', padaResize);

        function jalankan() {
            if (dihancurkan || !siap.aset || !siap.font || siap.jalan) return;
            siap.jalan = true;
            scene.updateMatrixWorld(true);
            gambarKertas();
            hitungAnchor();
            aturAmplop(curBuka);
            kurva(); // bidikan bersifat statis, cukup dihitung sekali
            renderer.compile(scene, camera);
            tick();
            opsi.onSiap();
        }
        const fontSiap = () => {
            if (dihancurkan) return;
            siap.font = true;
            jalankan();
        };
        opsi.fontSiap
            .catch(() => {})
            .then(() =>
                document.fonts
                    ? Promise.all(
                          ['500 120px "Cormorant Garamond"', 'italic 64px "Cormorant Garamond"', '500 24px Jost'].map((f) => document.fonts.load(f)),
                      )
                    : null,
            )
            .catch(() => {})
            .then(fontSiap);
        const timerFont = window.setTimeout(fontSiap, 5000);

        function hancurkan() {
            if (dihancurkan) return;
            dihancurkan = true;
            cancelAnimationFrame(raf);
            cancelAnimationFrame(tweenRaf);
            clearTimeout(timerFont);
            removeEventListener('pointermove', padaPenunjuk);
            removeEventListener('resize', padaResize);
            const tekstur = new Set<any>();
            scene.traverse((obj: any) => {
                obj.geometry?.dispose();
                const daftar = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : [];
                daftar.forEach((m: any) => {
                    Object.values(m).forEach((v: any) => v?.isTexture && tekstur.add(v));
                    if (m.uniforms) Object.values(m.uniforms).forEach((u: any) => u?.value?.isTexture && tekstur.add(u.value));
                    m.dispose();
                });
            });
            [...Object.values(T), ...fotoKisah, glowTex, scene.environment].forEach((t) => t && tekstur.add(t));
            tekstur.forEach((t) => t.dispose());
            composer.renderTarget1?.dispose();
            composer.renderTarget2?.dispose();
            bloom.dispose?.();
            renderer.dispose();
            renderer.forceContextLoss();
        }

        return {
            buka,
            taburMelati: () => semburan(camera.position.clone().add(V(0, -0.2, -1.2).applyQuaternion(camera.quaternion)), 30, 0.8),
            hitungUlang: () => {
                if (!dihancurkan) hitungAnchor();
            },
            hancurkan,
        };
    }
}
