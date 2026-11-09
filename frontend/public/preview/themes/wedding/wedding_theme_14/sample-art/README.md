# Ilustrasi contoh undangan — Pawiwahan Agung

Sumber ilustrasi untuk contoh undangan `wedding_theme_14`. Hasilnya ada di
`database/seeders/assets/sample-invitations/wedding_theme_14/*.jpg` (900×1200).
Semua gambar memakai gaya flat tanpa wajah detail, dengan palet tema (sogan, emas, gading).

- `gen.mjs` menghasilkan `bride.svg` (paes ageng Yogyakarta, cunduk mentul, ronce melati) dan
  `groom.svg` (blangkon, beskap). File ini juga mengekspor helper untuk `scenes.mjs`.
- `scenes.mjs` menghasilkan `couple.svg` (pelaminan + kembar mayang), `joglo.svg` (senja),
  `alun-alun.svg` (masangin), `peningset.svg` (cincin & sirih), dan `batik.svg` (canting).

Cara membuat ulang:

```bash
node gen.mjs && node scenes.mjs                       # → svg/
node render.mjs svg png                               # → png/ (butuh playwright-core + Chrome)
for f in png/*.png; do ffmpeg -y -i "$f" -q:v 3 "../../../../../../database/seeders/assets/sample-invitations/wedding_theme_14/$(basename "${f%.png}").jpg"; done
```
