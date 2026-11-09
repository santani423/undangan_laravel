# Undangan Pernikahan Digital — Dina & Dani

Website undangan pernikahan yang mereplikasi desain, palet warna, tipografi,
dan nuansa visual dari template PPT asli (motif floral watercolor, aksen emas
antik, krem hangat). Seluruh HTML, CSS, dan JavaScript digabung menjadi satu
file `index.html` agar mudah dibuka, dipindah, atau di-hosting di mana saja.

## Struktur folder

```
site/
├── index.html              ← Seluruh markup + <style> + <script> ada di sini
└── assets/
    ├── img/
    │   ├── deco/            ← Elemen floral & confetti asli dari template PPT
    │   └── photos/          ← Foto placeholder (GANTI dengan foto asli)
    └── audio/
        └── wedding-song.mp3 ← Musik latar asli dari template PPT
```

## Mengganti konten (tanpa sentuh backend)

Semua teks & data undangan berada di satu objek JavaScript bernama
`WEDDING_DATA`, di dalam blok `<script>` pertama menjelang penutup `</body>`
pada `index.html`. Cari komentar:

```js
const WEDDING_DATA = { ... }
```

Ubah nilai di dalamnya (nama mempelai, tanggal, lokasi, cerita cinta, galeri,
rekening, dsb) — seluruh tampilan akan otomatis menyesuaikan karena semua
section dirender dari data ini melalui JavaScript (lihat fungsi `render*()`
pada blok `<script>` kedua).

## Mengganti foto

Ganti file di `assets/img/photos/` dengan foto asli menggunakan **nama file
yang sama** (mis. `bride.jpg`, `groom.jpg`, `hero-couple.jpg`,
`story-1.jpg` … `story-5.jpg`, `gallery-1.jpg` … `gallery-9.jpg`). Jika Anda
ingin memakai nama file/format berbeda, cukup ubah path-nya di `WEDDING_DATA`.

Tambah foto galeri lebih banyak: cukup tambahkan path baru pada array
`gallery: [...]` — grid masonry & lightbox akan otomatis menyesuaikan.

## Integrasi Backend (opsional, untuk skala produksi)

Kode sengaja dipisah lewat "lapisan API" bernama `InvitationAPI` (di dalam
blok `<script>` yang sama, tepat di bawah `WEDDING_DATA`). Saat ini fungsi-
fungsi tersebut memakai `localStorage` sebagai penyimpanan sementara. Untuk
menyambungkan ke server sungguhan, cukup ubah isi fungsi berikut tanpa
mengubah bagian lain:

| Fungsi                    | Tugas                                   | Ganti dengan                         |
|----------------------------|------------------------------------------|----------------------------------------|
| `InvitationAPI.getData()`  | Ambil seluruh konten undangan            | `fetch('/api/invitation?slug=...')`     |
| `InvitationAPI.getWishes()`| Ambil daftar ucapan                      | `fetch('/api/wishes')`                  |
| `InvitationAPI.submitWish()`| Kirim ucapan baru                       | `fetch('/api/wishes', { method:'POST' })` |
| `InvitationAPI.submitRSVP()`| Kirim data RSVP                         | `fetch('/api/rsvp', { method:'POST' })` |

Struktur data (nama field, bentuk objek) sudah dirancang mengikuti pola REST
API yang umum, sehingga integrasi backend tidak memerlukan perubahan pada
struktur HTML/CSS.

## Fitur yang sudah aktif

- Cover gate "Buka Undangan" dengan nama tamu dinamis lewat parameter URL
  `?to=Nama+Tamu` (contoh: `index.html?to=Budi+Santoso`)
- Countdown menuju hari-H (real-time)
- Musik latar dengan tombol putar/jeda mengambang
- Scroll reveal halus di setiap section + progress bar & tombol kembali ke atas
- Timeline Love Story dengan animasi garis berjalan saat discroll
- Galeri masonry + lightbox (dukung navigasi keyboard: ←/→/Esc)
- Dress code dengan palet warna & panduan busana
- Amplop digital: salin nomor rekening/e-wallet sekali klik + QRIS
- Form RSVP & form Ucapan/Doa tersimpan otomatis (localStorage) dengan
  paginasi "Muat Lebih Banyak" pada daftar ucapan
- Sepenuhnya responsif: mobile, tablet, dan desktop

## Catatan teknis

- Peta pada bagian "Alamat Acara" menggunakan Google Maps embed
  (`https://www.google.com/maps?q=...&output=embed`). Ganti query pada atribut
  `src` iframe dan tautan tombol "Buka di Google Maps" sesuai lokasi asli Anda.
- Warna & font diatur lewat CSS custom properties di bagian atas `<style>`
  (`:root { --gold: ...; --blush: ...; }`) — ubah di satu tempat untuk
  mengubah keseluruhan tema warna.
- Data yang tersimpan di localStorage bersifat per-browser/per-perangkat —
  cocok untuk demo/UI review; untuk mengumpulkan RSVP & ucapan dari semua
  tamu di satu tempat, sambungkan `InvitationAPI` ke backend sungguhan.
