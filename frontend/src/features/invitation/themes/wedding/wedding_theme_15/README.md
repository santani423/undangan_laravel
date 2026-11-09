# Enchanted Twilight Forest — undangan pernikahan 3D hutan senja

- Entri: `WeddingTheme15.tsx` (terdaftar di `pages/invitation/show.tsx` sebagai `wedding_theme_15`). Gaya: `wedding-theme-15.css` (semua kelas `wt15-`, token warna di `.wt15`).
- Data undangan dipetakan di `lib/data.ts`; teks khas tema ada di `TEKS`. Fitur undangan yang dimatikan menyembunyikan section-nya, dan jalur kamera 3D langsung melompati tempat itu (`lib/scenes.ts`).
- Simulasi tanpa backend: `<WeddingTheme15 invitation={MOCK_INVITATION} />` dari `lib/mock.ts`. Tanpa `rsvpEndpoint`/`wishesEndpoint`, RSVP & pohon harapan memakai penyimpanan demo di peramban. Undangan contoh tanpa foto memakai ilustrasi demo berlabel "Ilustrasi contoh".
- Struktur: `components/` (cover, nav, lightbox, toast, ikon), `sections/` (isi tiap scene), `lib/` (store, data, RSVP, musik, sinkronisasi scroll ↔ kamera), `scene/` (dunia three.js + React Three Fiber, dimuat malas).
- Tambahan dibanding desain asli: section **Tanda kasih** (amplop digital, waypoint kamera baru di kolam lilin dekat pohon harapan), dress code, video pasangan, dan foto mempelai bila ada.
- Tanpa dependensi baru: Framer Motion → transisi CSS, zustand → store kecil `useSyncExternalStore`, drei/postprocessing → loader R3F + bloom dari `three/examples` (hanya tier `high`).
- Tanpa WebGL, saat konteks hilang, atau lewat tombol daun (mode ringan) tampil hutan 2D dari SVG paket aset dengan fitur lengkap.
- Parameter URL: `?to=Nama+Tamu`, `?quality=high|medium|low`, `?debug` (renderer di `window.__wt15Renderer`).
- Proyek Vite asli (sumber desain + build) dipindah ke `resources/views/themes/weddingThemes/wedding_theme_15/` agar tidak ikut dikompilasi glob halaman Inertia; pratinjau: `/preview/themes/wedding/wedding_theme_15/index.html` (route pratinjau hanya melayani `assets/`, jadi ilustrasi galeri di `images/` tidak tampil di sana).
