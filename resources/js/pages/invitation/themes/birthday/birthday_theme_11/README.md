# Petualangan Gigi Ceria — undangan ulang tahun anak 3D

- Entri: `BirthdayTheme11.tsx` (terdaftar di `pages/invitation/show.tsx` sebagai `birthday_theme_11`). Gaya: `birthday-theme-11.css` (semua kelas `bt11-`, token warna & font di `.bt11`).
- Konsep: satu pulau kue real-time (three.js imperatif, tanpa R3F) bersama Dr. Senyum dan enam Sahabat Gigi. Menggulir halaman menerbangkan kamera melewati delapan perhentian: gerbang sikat gigi + judul 3D, amplop undangan (terbuka saat digulir), kalender + jam + pin lokasi, taman bermain (mainan di atas pedestal), galeri polaroid di tali jemuran, kue tiga tingkat dengan lilin, papan RSVP + kotak surat, dan alun-alun penutup (semua tokoh berkumpul, kembang api senja). Gulir mundur membalik semuanya. Halaman tidak pernah di-pin atau dibajak scroll-nya.
- Data undangan dipetakan di `lib/data.ts` (`buildInvitation`); teks khas tema (judul, pesan bawaan, enam aktivitas taman bermain, dress code) ada di `TEKS` dan `activities()`. Aktivitas sengaja tanpa jam agar tidak menjanjikan jadwal yang tidak dibuat tuan rumah.
- Fitur yang dimatikan di pengaturan undangan menyembunyikan section-nya (`lib/sections.ts`) dan kamera terbang melewati stasiunnya (`scene/CameraController.ts`). Galeri kosong juga disembunyikan; undangan contoh tanpa foto memakai kartu "Fotomu di sini" dari paket aset.
- Simulasi tanpa backend: `<BirthdayTheme11 invitation={MOCK_INVITATION} />` dari `lib/mock.ts`. Tanpa `rsvpEndpoint`/`wishesEndpoint`, RSVP & ucapan memakai penyimpanan demo di peramban (`services/rsvpService.ts`) dan formulir menyatakannya dengan jelas.
- Struktur:
    - `sections/` — delapan section (beranda, undangan, waktu & tempat, aktivitas, galeri, kue, RSVP, terima kasih).
    - `components/` — header (trail, menu, musik/efek suara, progres), loader, hitung mundur, dialog aktivitas, lightbox, kado digital, toast.
    - `scene/` — dunia 3D, dimuat malas di chunk sendiri: `SceneManager` (renderer, loop, picking, kualitas adaptif), `CameraController`, `WorldBuilder`, `CharacterFactory`, `PropFactory`, `TitleText`, `artwork` (tekstur kanvas berisi data undangan), `effects/`.
    - `scroll/ScrollExperience.ts` — GSAP ScrollTrigger: penanda kamera per section, scrub amplop/polaroid/kumpul di alun-alun, animasi muncul panel.
    - `audio/MusicController.ts` — lagu undangan bila ada; tanpa lagu, kotak musik "Happy Birthday to You" (domain publik) dan semua efek suara disintesis di peramban.
    - `lib/` — tanggal (WIB, `id-ID`), kalender `.ics` + tautan Google Calendar, validasi RSVP, aset, data contoh.
    - `assets/` — SVG paket aset asli (teks kartu contoh diterjemahkan), font Fredoka Bold untuk judul 3D (OFL 1.1).
- RSVP ke API undangan: `POST {rsvpEndpoint}` `{ name, number_of_guests, rsvp_status: attending|not_attending, message, guest_slug }`; daftar ucapan membaca `GET {wishesEndpoint}?page=`. Bila RSVP dimatikan tetapi ucapan aktif, formulir menjadi formulir ucapan (`POST {wishesEndpoint}`). Desain asli mengirim RSVP lewat WhatsApp; di platform ini diganti API undangan karena tidak ada nomor WhatsApp tuan rumah.
- Kue: "Buat permohonan" meniup lilin satu per satu; mikrofon opsional (hanya setelah tombolnya ditekan, tidak direkam/dikirim). Mengetuk kue/mainan/polaroid/kotak surat di 3D membuka kontrol HTML yang sama.
- Tanpa WebGL (`?nowebgl` atau `?webgl=off`), saat konteks GPU hilang, atau bila chunk 3D gagal dimuat, tampil versi ilustrasi dari SVG paket aset dengan isi undangan tetap lengkap.
- Parameter URL: `?to=Nama+Tamu`, `?now=2026-12-05T16:00:00+07:00` (pratinjau status "sedang berlangsung/selesai"), `?quality=low|high`, `?motion=reduce`. Di `npm run dev`, `window.__smile` tersedia untuk pengecekan di konsol.
- Proyek Vite asli (sumber desain + build `dist/`) dipindah ke `resources/views/themes/birthdayThemes/birthday_theme_11/` agar tidak ikut dikompilasi glob halaman Inertia; `node_modules` yang ikut ter-commit dihapus.
