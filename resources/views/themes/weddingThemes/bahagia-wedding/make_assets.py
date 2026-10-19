"""Generate texture assets for the 3D wedding invitation (all procedural, no external sources)."""
import numpy as np, cv2, os
from PIL import Image

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


def fnoise(h, w, beta=2.0, seed=0):
    """Tileable fractal noise in [0,1] via FFT filtering."""
    r = np.random.default_rng(seed)
    wn = r.standard_normal((h, w))
    fy = np.fft.fftfreq(h)[:, None]; fx = np.fft.fftfreq(w)[None, :]
    f = np.sqrt(fx ** 2 + fy ** 2); f[0, 0] = 1
    out = np.real(np.fft.ifft2(np.fft.fft2(wn) / f ** (beta / 2)))
    out -= out.min(); out /= out.max()
    return out


def normal_from_height(hm, strength=4.0):
    gx = (np.roll(hm, -1, 1) - np.roll(hm, 1, 1)) * strength
    gy = (np.roll(hm, -1, 0) - np.roll(hm, 1, 0)) * strength
    n = np.dstack([-gx, gy, np.ones_like(hm)])
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    return ((n * .5 + .5) * 255).astype(np.uint8)


def save(name, arr, q=88):
    path = os.path.join(OUT, name)
    img = Image.fromarray(arr)
    if name.endswith('.jpg'):
        img.convert('RGB').save(path, quality=q, optimize=True, progressive=True)
    else:
        img.save(path, optimize=True)
    print(f'{name:28s} {os.path.getsize(path) // 1024:5d} KB')


def lerp(a, b, t):
    return a + (b - a) * t[..., None]


# ---------- Rumput (albedo + normal), tileable ----------
N = 1024
base = fnoise(N, N, 2.2, 1)
detail = fnoise(N, N, 1.0, 2)
height = np.zeros((N, N), np.float32)
col = lerp(np.array([22, 44, 30], float), np.array([58, 86, 50], float), base * .7 + detail * .3)
blades = np.zeros((N * 3, N * 3), np.float32)
tint = np.zeros((N * 3, N * 3), np.float32)
for _ in range(26000):
    x, y = rng.uniform(N, 2 * N), rng.uniform(N, 2 * N)
    ln, ang = rng.uniform(10, 28), rng.normal(-np.pi / 2, .5)
    x2, y2 = x + np.cos(ang) * ln, y + np.sin(ang) * ln
    v = rng.uniform(.4, 1)
    cv2.line(blades, (int(x), int(y)), (int(x2), int(y2)), v, 2, cv2.LINE_AA)
    cv2.line(tint, (int(x), int(y)), (int(x2), int(y2)), rng.uniform(-1, 1), 2, cv2.LINE_AA)
# lipat 3x3 ke ukuran asli agar tileable
fold = lambda a: sum(a[i * N:(i + 1) * N, j * N:(j + 1) * N] for i in range(3) for j in range(3))
blades, tint = np.clip(fold(blades), 0, 1.4), np.clip(fold(tint), -1, 1)
col = col * (.6 + .5 * blades[..., None]) + np.dstack([tint * 6, tint * 10, tint * 2])
height = blades * .8 + base * .4
save('grass.jpg', np.clip(col, 0, 255).astype(np.uint8))
save('grass_n.jpg', normal_from_height(cv2.GaussianBlur(height, (3, 3), 0), 3))

# ---------- Kain linen (albedo + normal), tileable ----------
N = 512
y, x = np.mgrid[0:N, 0:N] / N
weft = (np.sin(x * np.pi * 2 * 96) * .5 + .5) * (np.sin(y * np.pi * 2 * 48) * .5 + .5)
warp = (np.sin(y * np.pi * 2 * 96 + np.pi) * .5 + .5) * (np.sin(x * np.pi * 2 * 48 + np.pi / 2) * .5 + .5)
slub = fnoise(N, N, 1.6, 3)
h = np.maximum(weft, warp) * .8 + slub * .2
v = 232 + (h - .5) * 18 + (fnoise(N, N, 2.5, 4) - .5) * 14
save('fabric.jpg', np.clip(np.dstack([v + 6, v + 2, v - 6]), 0, 255).astype(np.uint8))
save('fabric_n.jpg', normal_from_height(h, 2.2))

# ---------- Kayu (albedo + normal) ----------
H, W = 1024, 512
yy, xx = np.mgrid[0:H, 0:W].astype(float)
warpn = fnoise(H, W, 3.0, 5) * 40
rings = np.sin((xx + warpn) / W * np.pi * 2 * 9 + fnoise(H, W, 3.6, 6) * 5) * .5 + .5
fine = fnoise(H, W, .6, 7)
fine = cv2.resize(cv2.resize(fine, (W, H // 16)), (W, H))         # serat memanjang
t = np.clip(rings ** 1.8 * .6 + fine * .4, 0, 1)
col = lerp(np.array([116, 76, 44], float), np.array([62, 38, 22], float), t)
save('wood.jpg', col.astype(np.uint8))
save('wood_n.jpg', normal_from_height(t * .6, 1.5))

# ---------- Kertas undangan (serat halus) ----------
N = 1024
p = np.full((N, N, 3), [246, 240, 228], float)
p += (fnoise(N, N, 2.6, 8)[..., None] - .5) * 10
p += (fnoise(N, N, .5, 9)[..., None] - .5) * 6
fib = np.zeros((N, N), np.float32)
for _ in range(1800):
    pts = [(rng.uniform(0, N), rng.uniform(0, N))]
    a = rng.uniform(0, np.pi * 2)
    for _ in range(int(rng.integers(3, 8))):
        a += rng.normal(0, .5); pts.append((pts[-1][0] + np.cos(a) * 6, pts[-1][1] + np.sin(a) * 6))
    cv2.polylines(fib, [np.int32(pts)], False, rng.uniform(.3, 1), 1, cv2.LINE_AA)
p -= fib[..., None] * 9
save('paper.jpg', np.clip(p, 0, 255).astype(np.uint8), 90)
save('paper_n.jpg', normal_from_height(fnoise(N, N, 2.6, 8) * .3 + fib * .15, 2))

# ---------- Kelopak mawar (RGBA, putih kebiruan agar bisa diwarnai per instance) ----------
S = 256
yy, xx = np.mgrid[0:S, 0:S] / S
u, v = xx - .5, yy                                    # v: 0 = ujung atas, 1 = pangkal
width = .46 * np.sin(np.clip(v, 0, 1) * np.pi * .92 + .08) ** .6
notch = .05 * np.exp(-((u) / .08) ** 2)               # lekuk kecil di ujung kelopak
inside = (np.abs(u) < width) & (v > .04 + notch) & (v < .98)
alpha = cv2.GaussianBlur(inside.astype(np.float32), (5, 5), 0)
veins = np.zeros((S, S), np.float32)
for k in np.linspace(-.35, .35, 9):
    pts = [(S / 2 + (k * (1 - vv) * S * .9), vv * S) for vv in np.linspace(.98, .08, 30)]
    cv2.polylines(veins, [np.int32(pts)], False, 1.0, 1, cv2.LINE_AA)
veins = cv2.GaussianBlur(veins, (3, 3), 0)
shade = .78 + .22 * (1 - v) - veins * .07 - (np.abs(u) / .5) ** 2 * .08
edge = np.clip(1 - (np.abs(u) / np.maximum(width, 1e-3)), 0, 1)
shade += (1 - edge) ** 3 * .06                        # tepi sedikit lebih terang (tipis)
rgb = np.dstack([shade, shade * .985, shade * .97]) * 255
rgba = np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8)
save('petal.png', rgba)

# ---------- Daun (RGBA) ----------
H, W = 512, 256
yy, xx = np.mgrid[0:H, 0:W] / np.array([H, W])[:, None, None]
u = xx - .5
half = .34 * np.sin(np.pi * yy ** 1.25) ** 1.1
inside = (np.abs(u) < half) & (yy > .02) & (yy < .97)
alpha = cv2.GaussianBlur(inside.astype(np.float32), (5, 5), 0)
vein = np.zeros((H, W), np.float32)
cv2.line(vein, (W // 2, 8), (W // 2, H - 8), 1, 3, cv2.LINE_AA)
for yv in np.linspace(.12, .85, 9):
    for s in (-1, 1):
        cv2.line(vein, (W // 2, int(yv * H)), (int(W / 2 + s * W * .38), int((yv - .12) * H)), .7, 2, cv2.LINE_AA)
n = fnoise(H, W, 2.2, 10)
g = np.dstack([46 + n * 22, 84 + n * 30, 54 + n * 14]) * (1 - .12 * np.abs(u)[..., None] * 2)
g += vein[..., None] * np.array([40, 46, 22])
save('leaf.png', np.dstack([np.clip(g, 0, 255), alpha * 255]).astype(np.uint8))
save('leaf_n.jpg', normal_from_height(vein * .5 + n * .1, 2))

# ---------- Daun eukaliptus bulat (RGBA, hijau keabuan) ----------
S = 256
yy, xx = np.mgrid[0:S, 0:S] / S
r = np.hypot((xx - .5) / .46, (yy - .52) / .44)
alpha = cv2.GaussianBlur((r < 1).astype(np.float32), (5, 5), 0)
n = fnoise(S, S, 2.2, 11)
c = np.dstack([118 + n * 24, 146 + n * 20, 134 + n * 18]) * (1 - .25 * r[..., None] ** 3)
c[np.abs(xx - .5) < .006] += 26
save('eucalyptus.png', np.dstack([np.clip(c, 0, 255), alpha * 255]).astype(np.uint8))

# ---------- Langit malam equirectangular (background + pantulan lingkungan) ----------
H, W = 1024, 2048
yy, xx = np.mgrid[0:H, 0:W].astype(float)
lat = (.5 - yy / H) * np.pi                           # +pi/2 zenith
lon = (xx / W) * 2 * np.pi - np.pi
e = np.clip(lat / (np.pi / 2), -1, 1)
zen, hor, gnd = np.array([6, 10, 22]), np.array([28, 46, 52]), np.array([10, 18, 14])
sky = np.where(e[..., None] >= 0, lerp(hor.astype(float), zen.astype(float), np.clip(e, 0, 1) ** .45), lerp(hor.astype(float), gnd.astype(float), np.clip(-e * 6, 0, 1)))
# cahaya kota hangat samar di cakrawala belakang penonton
glow = np.exp(-(e / .09) ** 2) * np.exp(-((lon + np.pi / 2) / 1.1) ** 2) * .6
sky += glow[..., None] * np.array([60, 38, 18])
# awan tipis
cl = fnoise(H, W, 2.6, 12)
cl = np.clip((cl - .55) * 3, 0, 1) * np.clip(e * 3, 0, 1) * (1 - np.clip(e - .6, 0, 1))
sky = sky * (1 - cl[..., None] * .35) + cl[..., None] * np.array([26, 34, 44]) * .5
# bintang
for _ in range(5200):
    yy0 = int(abs(rng.normal(0, .55)) * H / 2) if rng.random() < .8 else int(rng.uniform(0, H / 2 - 8))
    yy0 = min(yy0, H // 2 - 4)
    x0 = int(rng.uniform(0, W)); b = rng.uniform(.15, 1) ** 3
    tintc = rng.choice([[255, 255, 255], [200, 215, 255], [255, 236, 210]])
    if b > .5:
        cv2.circle(sky, (x0, yy0), 1, (tintc[0] * b, tintc[1] * b, tintc[2] * b), -1, cv2.LINE_AA)
    else:
        sky[yy0, x0] = np.maximum(sky[yy0, x0], np.array(tintc) * b)
# halo bulan (arah yang sama dengan bulan di adegan)
mlon, mlat = np.arctan2(-90, -34), np.arctan2(48, np.hypot(34, 90))
d = np.arccos(np.clip(np.sin(lat) * np.sin(mlat) + np.cos(lat) * np.cos(mlat) * np.cos(lon - mlon), -1, 1))
sky += (np.exp(-(d / .25) ** 2) * 60 + np.exp(-(d / .05) ** 2) * 120)[..., None] * np.array([.75, .82, 1.0])
# tempel tekstur bulan ke langit (jauh tak terhingga, jadi tidak bergeser saat kamera bergerak)
_moon_slot = (mlon, mlat)
SKY = sky
save('sky_tmp.jpg', np.clip(sky, 0, 255).astype(np.uint8), 90)

# ---------- Bulan (RGBA) ----------
S = 512
yy, xx = np.mgrid[0:S, 0:S] / S * 2 - 1
r = np.hypot(xx, yy)
n1, n2 = fnoise(S, S, 2.8, 13), fnoise(S, S, 1.6, 14)
maria = np.clip((n1 - .5) * 3, 0, 1)
craters = np.zeros((S, S), np.float32)
for _ in range(140):
    cx, cy, rr = rng.uniform(0, S), rng.uniform(0, S), rng.uniform(2, 18) ** 1.1
    cv2.circle(craters, (int(cx), int(cy)), int(rr), .6, 1, cv2.LINE_AA)
    cv2.circle(craters, (int(cx), int(cy)), max(1, int(rr * .7)), -.25, -1, cv2.LINE_AA)
lum = (225 - maria * 70 + n2 * 20 + cv2.GaussianBlur(craters, (5, 5), 0) * 30)
lum *= (1 - .35 * r ** 4)                              # gelap di tepi (limb darkening)
alpha = np.clip((1 - r) * S * .5, 0, 1)
moon_rgba = np.dstack([lum, lum * .99, lum * .95, alpha * 255]).clip(0, 255).astype(np.uint8)
mx = int((_moon_slot[0] + np.pi) / (2 * np.pi) * 2048); my = int((.5 - _moon_slot[1] / np.pi) * 1024)
mh = 34; mw = int(mh / np.cos(_moon_slot[1]))
m = cv2.resize(moon_rgba, (mw, mh), interpolation=cv2.INTER_AREA).astype(float)
a = m[..., 3:] / 255
reg = SKY[my - mh // 2: my - mh // 2 + mh, mx - mw // 2: mx - mw // 2 + mw]
SKY[my - mh // 2: my - mh // 2 + mh, mx - mw // 2: mx - mw // 2 + mw] = reg * (1 - a) + m[..., :3] * 1.05 * a
save('sky.jpg', np.clip(SKY, 0, 255).astype(np.uint8), 92)
os.remove(os.path.join(OUT, 'sky_tmp.jpg'))

# ---------- Api lilin (RGBA) ----------
H, W = 256, 128
yy, xx = np.mgrid[0:H, 0:W] / np.array([H, W])[:, None, None]
u = (xx - .5) * 2
v = 1 - yy                                             # 0 bawah, 1 atas
w = np.sin(np.clip(v * 1.15, 0, 1) * np.pi) ** .7 * (1 - v) ** .5 * .7 + 1e-3
d = np.abs(u) / w
core = np.clip(1 - d, 0, 1) * np.clip(1 - np.abs(v - .32) * 2.2, 0, 1)
outer = np.clip(1 - d * .75, 0, 1) * np.clip(v * 6, 0, 1) * np.clip((1 - v) * 1.6, 0, 1)
blue = np.exp(-((v - .1) / .07) ** 2) * np.clip(1 - d, 0, 1)
r_, g_, b_ = outer * 255, outer * 150 + core * 105, outer * 40 + core * 200
b_ = b_ + blue * 60; g_ = g_ * (1 - blue * .4)
a = np.clip(outer * 1.1 + core, 0, 1)
save('flame.png', np.dstack([r_, g_, b_, a * 255]).clip(0, 255).astype(np.uint8))

# ---------- Lilin (lilin parafin, albedo dengan lelehan) ----------
H, W = 256, 256
n = fnoise(H, W, 2.4, 15)
c = np.dstack([244 + n * 8, 236 + n * 8, 220 + n * 6]) - (np.arange(H)[:, None, None] / H) * 10
save('wax.jpg', np.clip(c, 0, 255).astype(np.uint8))

print('total', sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT)) // 1024, 'KB')
