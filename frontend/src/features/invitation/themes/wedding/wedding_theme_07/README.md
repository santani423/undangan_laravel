# Undangan Digital — Ambra & Tika

> **Catatan penting:** Jika sebelumnya file `index.html` tampil tanpa
> style (polos/tidak ada warna), itu karena file tersebut butuh folder
> `css/` dan `js/` di sebelahnya (harus dibuka sebagai satu folder utuh,
> bukan file tunggal yang dipisah). Untuk pemakaian paling mudah dan anti
> gagal, **gunakan `undangan-ambra-tika.html`** — file tunggal yang sudah
> menggabungkan seluruh CSS, JS, dan gambar SVG di dalamnya, tinggal buka
> langsung di browser tanpa folder pendukung apa pun.

Replikasi web dari template PPT undangan pernikahan "Ambra & Tika", dengan
nuansa watercolor biru dusty, pola geometris islami, bingkai bunga, dan
pita label khas template aslinya — dikembangkan menjadi website undangan
digital yang lengkap dan responsif.

## Dua versi yang disediakan

1. **`undangan-ambra-tika.html`** (⭐ rekomendasi) — satu file HTML
   mandiri (CSS + JS + SVG semua sudah digabung di dalamnya). Cukup buka
   di browser atau upload ke hosting mana pun, langsung jalan.
2. **`index.html` + folder `css/` / `js/` / `assets/`** — versi
   "source" yang terpisah per-file, lebih mudah dibaca/di-maintain kalau
   ingin dikembangkan lebih lanjut atau diintegrasikan ke proyek yang
   sudah punya struktur build sendiri. Folder ini **harus tetap disimpan
   bersama-sama** (jangan hanya mengambil `index.html` saja) agar CSS &
   JS-nya ikut terbaca.

## Struktur folder

```
wedding-site/
├── index.html          → seluruh markup & 11 section undangan
├── css/
│   ├── base.css        → design tokens (warna, font, motif dasar)
│   ├── components.css  → styling tiap komponen/section
│   └── responsive.css  → breakpoint tablet & mobile
├── js/
│   ├── data.js          → SATU sumber data (couple, event, love story,
│   │                       gallery, dress code, rekening, dst) — dibentuk
│   │                       agar mudah dipetakan ke tabel database/API
│   └── script.js         → rendering & interaksi (gate buka undangan,
│                            countdown, timeline, lightbox galeri, tab
│                            amplop digital + salin nomor, form RSVP,
│                            form ucapan/wishes dengan localStorage)
└── assets/
    ├── floral-corner.svg      → ornamen bunga sudut (motif dari PPT)
    └── couple-illustration.svg→ ilustrasi pasangan (motif dari PPT)
```

## Cara pakai / kustomisasi

> Jika memakai `undangan-ambra-tika.html` (file tunggal), semua poin di
> bawah tetap berlaku — hanya saja `data.js` tidak berdiri sendiri,
> melainkan berada di dalam tag `<script>` pertama menjelang penutup
> `</body>` pada file tersebut. Cari baris `window.WEDDING_DATA = {`.

1. **Ganti data** — edit `js/data.js`. Semua teks, tanggal, foto, nomor
   rekening, dan cerita cinta diambil dari file ini, tidak perlu menyentuh
   HTML.
2. **Ganti foto** — ganti URL di `couple.groom.photo`, `couple.bride.photo`,
   `loveStory[].photo`, dan array `gallery` dengan URL foto asli (atau path
   ke folder `assets/` jika di-upload lokal).
3. **Nama tamu otomatis** — bagikan link dengan parameter
   `?to=Nama+Tamu` (contoh: `index.html?to=Bapak+Andi`) agar nama tamu
   otomatis muncul di layar pembuka.
4. **Musik latar (opsional)** — taruh file mp3 di `assets/music.mp3`, lalu
   aktifkan baris `<source>` yang di-comment di `index.html`.
5. **Google Maps** — ganti `venue.embedUrl` dan `venue.navigationUrl` di
   `data.js` dengan tautan lokasi asli dari Google Maps.

## Integrasi backend (RSVP & Ucapan)

Saat ini form RSVP dan Ucapan disimpan sementara di `localStorage` browser
(untuk demo tanpa backend). Titik integrasinya sudah ditandai jelas di
`js/script.js` dengan komentar `TODO (backend integration)` — tinggal
aktifkan pemanggilan `fetch()` ke endpoint (`DATA.rsvp.endpoint` /
`DATA.wishes.endpoint`, sudah didefinisikan di `data.js`) begitu API
tersedia.

## Menjalankan secara lokal

Buka `index.html` langsung di browser, atau jalankan server statis
sederhana agar semua fitur (fetch relatif, dsb) berjalan optimal:

```bash
cd wedding-site
python3 -m http.server 8080
# lalu buka http://localhost:8080
```
