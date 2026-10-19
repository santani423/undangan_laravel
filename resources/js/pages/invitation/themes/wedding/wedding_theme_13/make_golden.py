"""Golden-hour sky (equirectangular) for the wedding scene. Sun sits behind the floral arch."""
import numpy as np, cv2, os
from PIL import Image
from make_assets import fnoise, OUT, save, lerp  # reuse helpers (re-running make_assets is cheap)

H, W = 1024, 2048
yy, xx = np.mgrid[0:H, 0:W].astype(float)
lat = (.5 - yy / H) * np.pi
lon = (xx / W) * 2 * np.pi - np.pi
e = np.clip(lat / (np.pi / 2), -1, 1)
# arah matahari: sama dengan cahaya di adegan (-0.35, 0.13, -1)
sd = np.array([-.35, .13, -1.0]); sd /= np.linalg.norm(sd)
slon, slat = np.arctan2(sd[2], sd[0]), np.arcsin(sd[1])
cosd = np.sin(lat) * np.sin(slat) + np.cos(lat) * np.cos(slat) * np.cos(lon - slon)
d = np.arccos(np.clip(cosd, -1, 1))
hor = np.array([255, 206, 150.]); mid = np.array([236, 190, 170.]); zen = np.array([128, 156, 198.])
up = np.clip(e, 0, 1)
sky = np.where(up[..., None] < .25, lerp(hor, mid, up / .25), lerp(mid, zen, np.clip((up - .25) / .75, 0, 1) ** .7))
# sisi matahari lebih hangat, sisi berlawanan lebih biru
warmth = (cosd * .5 + .5) ** 2
sky = sky * (1 - .25 * (1 - warmth[..., None])) + np.array([20, 10, 0]) * warmth[..., None]
below = e < 0
sky[below] = lerp(hor, np.array([92., 80, 58]), np.clip(-e * 5, 0, 1))[below]
# awan memanjang, bagian bawah diterangi jingga
cl = fnoise(H, W, 2.4, 21)
cl = cv2.resize(cv2.resize(cl, (W, H // 4)), (W, H))
mask = np.clip((cl - .5) * 3.2, 0, 1) * np.clip(e * 8, 0, 1) * np.clip(1 - (e - .45) * 3, 0, 1)
lit = np.array([255, 178, 140.]) * (.6 + .4 * warmth[..., None]) + np.array([40, 20, 30.]) * (1 - warmth[..., None])
sky = sky * (1 - mask[..., None] * .55) + lit * mask[..., None] * .55
# cahaya matahari: inti, halo, dan pendar lebar
sky += (np.exp(-(d / .5) ** 2) * 50 + np.exp(-(d / .12) ** 2) * 120)[..., None] * np.array([1, .82, .55])
core = np.exp(-(d / .022) ** 2)[..., None]
sky = sky * (1 - core) + np.array([255, 250, 235.]) * core
save('sky_golden.jpg', np.clip(sky, 0, 255).astype(np.uint8), 92)
