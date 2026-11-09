"""Aset tekstur untuk undangan Pangantén Sunda. Semua prosedural (numpy/OpenCV), tanpa sumber eksternal."""
import numpy as np, cv2, os, sys
from PIL import Image
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from make_assets import fnoise, normal_from_height, lerp            # helper bersama (tileable noise, normal map)

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(11)


def save(name, arr, q=86):
    p = os.path.join(OUT, name); img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    (img.convert('RGB').save(p, quality=q, optimize=True, progressive=True) if name.endswith('.jpg') else img.save(p, optimize=True))
    print(f'{name:24s} {os.path.getsize(p) // 1024:5d} KB')


def tile_draw(N, fn, layers=1):
    """Gambar di kanvas 3x lalu lipat agar hasilnya tileable."""
    big = np.zeros((N * 3, N * 3) + ((layers,) if layers > 1 else ()), np.float32)
    fn(big, N)
    out = sum(big[i * N:(i + 1) * N, j * N:(j + 1) * N] for i in range(3) for j in range(3))
    return out


# ---------- Batu jalan setapak (andesit, abu kehijauan) ----------
N = 512
h = fnoise(N, N, 2.4, 1) * .6 + fnoise(N, N, 1.2, 2) * .4
pits = (fnoise(N, N, .8, 3) > .78).astype(np.float32)
h = h - pits * .15
c = lerp(np.array([92, 92, 84.]), np.array([150, 148, 136.]), h)
moss = np.clip((fnoise(N, N, 2.0, 4) - .62) * 4, 0, 1)
c = c * (1 - moss[..., None] * .5) + np.array([88, 104, 62.]) * moss[..., None] * .5
save('batu.jpg', c); save('batu_n.jpg', normal_from_height(h, 2.5))

# ---------- Kayu jati (teak) ----------
H, W = 1024, 256
yy, xx = np.mgrid[0:H, 0:W].astype(float)
warp = fnoise(H, W, 3.4, 5) * 30
grain = np.sin((xx + warp) / W * np.pi * 2 * 6 + fnoise(H, W, 3.2, 6) * 3) * .5 + .5
fine = cv2.resize(cv2.resize(fnoise(H, W, .5, 7), (W, H // 24)), (W, H))
t = np.clip(grain ** 1.6 * .55 + fine * .45, 0, 1)
c = lerp(np.array([158, 122, 88.]), np.array([98, 70, 48.]), t)
save('jati.jpg', c); save('jati_n.jpg', normal_from_height(t * .5, 1.4))

# ---------- Batang bambu (hijau kekuningan, serat memanjang) ----------
H, W = 512, 128
f = cv2.resize(cv2.resize(fnoise(H, W, .4, 8), (W, H // 40)), (W, H))
m = fnoise(H, W, 2.6, 9)
c = lerp(np.array([118, 140, 62.]), np.array([186, 176, 92.]), np.clip(m * .7 + f * .3, 0, 1))
c *= (1 - .18 * (np.abs(np.linspace(-1, 1, W)) ** 2))[None, :, None]
save('bambu.jpg', c)

# ---------- Ijuk (atap serat aren hitam) ----------
N = 512
def ijuk(big, N):
    for _ in range(9000):
        x, y = rng.uniform(N, 2 * N), rng.uniform(N, 2 * N)
        ln, a = rng.uniform(20, 70), rng.normal(np.pi / 2, .12)
        cv2.line(big, (int(x), int(y)), (int(x + np.cos(a) * ln), int(y + np.sin(a) * ln)), float(rng.uniform(.4, 1)), 1, cv2.LINE_AA)
fib = np.clip(tile_draw(N, ijuk), 0, 2)
v = 22 + fib * 22 + fnoise(N, N, 2, 10) * 10
save('ijuk.jpg', np.dstack([v * 1.05, v, v * .92])); save('ijuk_n.jpg', normal_from_height(fib * .5, 2.5))

# ---------- Bilik (anyaman bambu) ----------
N = 512
yy, xx = np.mgrid[0:N, 0:N] / N
u, v = (xx + yy) * 16, (xx - yy) * 16                     # anyaman diagonal
over = ((np.floor(u) + np.floor(v * .5)) % 2).astype(float)
strip = np.where(over > 0, np.abs(np.sin(u * np.pi)), np.abs(np.sin(v * np.pi)))
h = strip ** .5
c = lerp(np.array([150, 118, 70.]), np.array([214, 184, 128.]), h * .8 + fnoise(N, N, 2, 12) * .2)
save('bilik.jpg', c); save('bilik_n.jpg', normal_from_height(h * .4, 2))

# ---------- Normal map air kolam ----------
N = 512
w = fnoise(N, N, 3.2, 13) * .6 + fnoise(N, N, 2.4, 14) * .4
save('air_n.jpg', normal_from_height(w, 6))

# ---------- Melati: bunga (RGBA, tampak atas) ----------
S = 256
img = np.zeros((S, S, 4), np.float32)
yy, xx = np.mgrid[0:S, 0:S] - S / 2
r, a = np.hypot(xx, yy) / (S / 2), np.arctan2(yy, xx)
petal = .55 + .45 * np.abs(np.cos(a * 2.5)) ** .8                # 5 kelopak membulat
inside = r < petal * .95
alpha = cv2.GaussianBlur(inside.astype(np.float32), (5, 5), 0)
shade = .86 + .14 * (1 - r) - .08 * np.clip(1 - r * 6, 0, 1) + .05 * np.cos(a * 5 + r * 8) * r
center = np.clip(1 - r * 7, 0, 1)
rgb = np.dstack([shade, shade, shade * .97]) * 255
rgb = rgb * (1 - center[..., None]) + np.array([214, 210, 150.]) * center[..., None]
save('melati.png', np.dstack([rgb, alpha * 255]))

# ---------- Daun bambu (RGBA, ramping) ----------
H, W = 512, 96
yy, xx = np.mgrid[0:H, 0:W] / np.array([H, W])[:, None, None]
half = .42 * np.sin(np.pi * np.clip(yy, 0, 1) ** .7) ** 1.3
inside = np.abs(xx - .5) < half
alpha = cv2.GaussianBlur(inside.astype(np.float32), (3, 3), 0)
n = fnoise(H, W, 2.2, 15)
g = np.dstack([70 + n * 30, 112 + n * 34, 52 + n * 16])
g[np.abs(xx - .5) < .015] += 24
save('daun_bambu.png', np.dstack([g, alpha * 255]))

# ---------- Daun pisang (RGBA, dengan sobekan khas) ----------
H, W = 1024, 384
yy, xx = np.mgrid[0:H, 0:W] / np.array([H, W])[:, None, None]
u = xx - .5
half = .46 * np.sin(np.pi * np.clip(yy, 0, 1)) ** .45
inside = (np.abs(u) < half) & (np.abs(u) > .012)
tears = np.zeros((H, W), np.float32)
for _ in range(16):                                         # sobekan sejajar urat daun
    y0 = rng.uniform(.1, .9); side = rng.choice([-1, 1]); depth = rng.uniform(.15, .45)
    for s in np.linspace(0, depth, 60):
        x = .5 + side * (.46 - s * .9 + .012); y = y0 - s * .25
        cv2.line(tears, (int(x * W), int(y * H)), (int(x * W), int((y + .004) * H)), 1, 2)
inside &= tears < .5
alpha = cv2.GaussianBlur(inside.astype(np.float32), (3, 3), 0)
n = fnoise(H, W, 2.0, 16)
veins = (np.sin((yy + np.abs(u) * .8) * 260) * .5 + .5) ** 8
g = np.dstack([62 + n * 26, 118 + n * 34, 46 + n * 14]) * (1 - veins[..., None] * .08)
g[np.abs(u) < .018] = [176, 186, 110]
edge = np.clip(1 - (half - np.abs(u)) * 40, 0, 1)
g = g * (1 - edge[..., None] * .45) + np.array([150, 130, 60.]) * edge[..., None] * .45   # tepi agak menguning
save('daun_pisang.png', np.dstack([g, alpha * 255]))

# ---------- Batik rereng (lereng) bernuansa Garutan: dasar gumading ----------
N = 512
yy, xx = np.mgrid[0:N, 0:N] / N
d = (xx + yy) * 6                                           # garis miring 45 derajat
band = d % 1
base = np.array([240, 226, 196.])                            # gumading
brown, sogan, gold = np.array([96, 60, 38.]), np.array([142, 98, 58.]), np.array([196, 160, 96.])
c = np.tile(base, (N, N, 1))
c[(band > .06) & (band < .14)] = brown
c[(band > .86) & (band < .94)] = brown
c[(band > .18) & (band < .2)] = sogan
c[(band > .80) & (band < .82)] = sogan
# motif kecil di antara garis (titik & kuncup)
t = ((xx - yy) * 12) % 1
bud = (np.abs(band - .5) < .12) & (np.abs(t - .5) < .12)
c[bud] = sogan
dot = (np.abs(band - .5) < .04) & (np.abs(t - .0) < .03)
c[dot] = gold
c += (fnoise(N, N, 2.2, 17)[..., None] - .5) * 14
crack = (fnoise(N, N, .9, 18) > .9)
c[crack] *= .9                                             # efek retak lilin batik
save('batik_rereng.jpg', c)
print('selesai')
