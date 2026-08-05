# Undangan Pernikahan Digital — Putra & Ayu

Website undangan pernikahan yang mereplikasi desain, warna, tipografi, dan nuansa
dari template PPT sumber (bunga mawar cat air, bingkai cincin emas, palet krem/tan/maroon,
tipografi Trajan-style untuk judul dan skrip elegan untuk nama mempelai).

## Struktur Proyek

```
site/
├── index.html          # Struktur seluruh halaman & 11 section
├── css/
│   └── style.css       # Semua styling, design tokens, animasi, responsif
├── js/
│   ├── data.js          # SEMUA konten (teks, tanggal, foto, dsb) — edit di sini
│   └── main.js           # Rendering & interaksi (tidak perlu diedit untuk ganti konten)
└── assets/
    ├── decor/            # Aset bunga/daun asli, diekstrak dari file PPT
    └── photos/            # Foto placeholder (ganti dengan foto asli pasangan)
```

## Cara Mengganti Konten (tanpa coding)

Buka `js/data.js` dan ubah nilai di dalam objek `WEDDING_DATA`:

- `groom` / `bride` — nama, foto, orang tua, bio
- `events` — tanggal & jam akad/resepsi
- `address` — alamat & link Google Maps (`mapsEmbedUrl` dan `mapsLinkUrl`)
- `loveStory` — array kisah cinta (tambah/kurangi item sesuka hati)
- `gallery` — array foto galeri
- `dressCode` — palet warna dress code
- `digitalGift` — rekening bank & e-wallet
- `wishes` — ucapan contoh (akan bertambah otomatis saat tamu mengirim ucapan baru)

Ganti file di `assets/photos/` dengan foto asli (gunakan nama file yang sama, atau
ubah path di `data.js`).

## Parameter Nama Tamu

Untuk personalisasi nama tamu di undangan, gunakan URL:

```
index.html?to=Bapak%20Budi%20Santoso
```

## Musik Latar

Isi `meta.musicSrc` di `data.js` dengan URL file mp3 untuk mengaktifkan tombol musik
di pojok kiri bawah. Kosongkan jika tidak ingin memakai musik.

## Integrasi Backend (langkah selanjutnya)

Struktur data di `data.js` sengaja dibuat menyerupai bentuk response API, sehingga
mudah diganti dengan data dinamis:

1. **RSVP** — cari komentar `// TODO integrasi backend` di `js/main.js` bagian
   `initRsvpForm()`. Ganti `console.log` dengan `fetch('/api/rsvp', {...})`.
2. **Ucapan/Wishes** — cari `// TODO integrasi backend` di `initWishesForm()`.
   Ganti array lokal `wishesData` dengan hasil `fetch` dari database, dan POST
   ucapan baru ke endpoint Anda.
3. **Konten umum** — ganti `<script src="js/data.js">` dengan pemanggilan
   `fetch('/api/invitation/:slug')` yang mengembalikan objek dengan bentuk sama
   persis seperti `WEDDING_DATA`.

## Catatan Teknis

- Semua interaksi (countdown, lightbox galeri, copy nomor rekening, tab
  transfer/e-wallet, form RSVP & ucapan, reveal-on-scroll) ditulis dengan
  vanilla JavaScript tanpa dependency eksternal — tinggal buka `index.html`
  di browser apa pun.
- Google Maps memerlukan koneksi internet aktif saat dibuka oleh tamu (iframe
  akan otomatis memuat peta sesuai `mapsEmbedUrl`).
- Untuk hosting, unggah seluruh folder `site/` ke static hosting mana pun
  (Netlify, Vercel, GitHub Pages, atau shared hosting biasa).
