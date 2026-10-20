# Pawiwahan Agung — undangan pernikahan adat Jawa 3D

- Entri: `WeddingTheme14.tsx` (terdaftar di `pages/invitation/show.tsx` sebagai `wedding_theme_14`). Gaya: `wedding-theme-14.css` (semua kelas `wt14-`).
- Data undangan dipetakan di `lib/data.ts`; teks khas tema (bahasa Jawa) ada di `TEKS`. Fitur undangan yang dimatikan menyembunyikan panel & menu terkait.
- Simulasi tanpa backend: `<WeddingTheme14 invitation={MOCK_INVITATION} />` dari `lib/mock.ts`. Tanpa `rsvpEndpoint`/`wishesEndpoint`, RSVP & buku tamu memakai penyimpanan demo di peramban.
- Adegan 3D (`three/`, three.js + React Three Fiber) dimuat malas hanya saat mode 3D; tanpa WebGL, saat gagal render, atau `?mode=lite` tampil versi ringan dengan fitur lengkap.
- Parameter URL: `?to=Nama+Tamu`, `?mode=lite`, `?quality=high|medium|low`.
- Proyek Vite asli (sumber desain + build) dipindah ke `resources/views/themes/weddingThemes/wedding_theme_14/` agar tidak ikut dikompilasi glob halaman Inertia; pratinjau: `/preview/themes/wedding/wedding_theme_14/index.html`.
