# Taman Voxel 3D — undangan pernikahan

- Entri: `WeddingTheme16.tsx` (terdaftar di `pages/invitation/show.tsx` sebagai `wedding_theme_16`). Gaya: `wedding-theme-16.css` (semua kelas `wt16-`, token warna & font di `.wt16`).
- Konsep: satu taman voxel real-time. Menggulir halaman menggerakkan kamera dari gapura masuk ke gapura akad (`lib/cameraWaypoints.ts`), suasana berubah dari siang ke senja, dan tiap section tampil sebagai kartu HTML di sisi yang tidak menutupi objek 3D-nya.
- Data undangan dipetakan di `lib/data.ts` (`buildInvitation`); teks khas tema ada di `TEKS`. Fitur yang dimatikan di pengaturan undangan menyembunyikan section-nya (`lib/sections.ts`), dan kamera terbang melewati tempat itu.
- Simulasi tanpa backend: `<WeddingTheme16 invitation={MOCK_INVITATION} />` dari `lib/mock.ts`. Tanpa `rsvpEndpoint`/`wishesEndpoint`, RSVP & buku tamu memakai penyimpanan demo di peramban (`services/`). Undangan contoh tanpa foto memakai ilustrasi galeri berlabel "Contoh".
- Struktur: `components/` (cover, navigasi, musik, lightbox, latar 3D/statis), `sections/` (11 section), `context/` + `hooks/` (data undangan, toast, musik, kamera ↔ scroll, animasi muncul), `lib/` (data, tanggal, peta, kalender, validasi), `services/` (RSVP & buku tamu: API undangan atau demo), `scene/` (taman three.js + React Three Fiber, dimuat malas), `assets/` (paket aset asli: model OBJ/MTL, tekstur, ikon).
- Musik: lagu unggahan undangan bila ada (ikut pengaturan autoplay/loop); tanpa lagu, komposisi ambient orisinal disintesis di peramban dan mulai saat "Buka Undangan" ditekan.
- Penyesuaian dari desain asli: tanpa dependensi baru (drei `PerformanceMonitor` → `PerformanceWatch` kecil di `scene/WeddingScene.tsx`; Tailwind → CSS biasa; Fontsource → Google Fonts), `LoadingManager` sendiri agar tidak mengubah global three.js, opsi RSVP "Masih ragu" dikirim sebagai `maybe`, dan beberapa QRIS dompet digital.
- Tanpa WebGL, saat konteks GPU hilang, atau bila chunk 3D gagal dimuat, tampil ilustrasi taman statis dengan isi undangan tetap lengkap.
- Parameter URL: `?to=Nama+Tamu`, `?quality=high|medium|low`, `?nowebgl=1`, `?debug=1` (status di `window.__wt16`).
- Proyek Vite asli (sumber desain, uji Vitest & e2e) dipindah ke `resources/views/themes/weddingThemes/wedding_theme_16/source/` agar tidak ikut dikompilasi glob halaman Inertia.
