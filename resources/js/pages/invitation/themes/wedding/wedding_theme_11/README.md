# Rama & Shinta — Wedding Invitation Website

Website undangan digital yang mereplikasi identitas visual dari template PPT
sumber (warna blush/cream, aksen terracotta, elemen floral vintage, nama
mempelai dengan font script, dan tipografi tracked small-caps).

## Struktur Proyek

```
wedding-site/
├── index.html          # Struktur semua section (single page)
├── css/style.css        # Seluruh styling, animasi, responsive breakpoints
├── js/data.js            # SEMUA konten (dummy) — edit file ini untuk mengganti isi
├── js/main.js            # Logic render + interaksi (tidak perlu diedit untuk ganti konten)
└── assets/
    ├── img/               # Foto & elemen floral (diekstrak & dioptimasi dari PPT)
    └── audio/music.mp3   # Musik latar (dari PPT)
```

## Cara Mengganti Konten (tanpa sentuh kode)

Semua teks, tanggal, foto, rekening, dan data lain terpusat di **`js/data.js`**
dalam objek `WEDDING_DATA`. Ubah nilai di sana saja — tampilan akan otomatis
menyesuaikan karena `main.js` merender semuanya dari objek ini.

Contoh: mengganti tanggal akad → ubah `events[0].dateDisplay` &
`events[0].dateISO` (dipakai juga oleh countdown timer di `countdownTarget`).

## Integrasi Backend (langkah selanjutnya)

Titik integrasi sudah disiapkan dengan komentar `// TODO(backend):` di `main.js`:

- **RSVP** (`initRsvp`) — saat ini submit disimpan ke `localStorage`.
  Ganti dengan `fetch('/api/rsvp', { method: 'POST', body: JSON.stringify(payload) })`.
- **Ucapan/Wishes** (`initWishes`) — saat ini gabungan dummy (`WEDDING_DATA.wishes`)
  + `localStorage`. Ganti `getAllWishes()` agar mengambil dari
  `GET /api/wishes` dan submit form ke `POST /api/wishes`.
- **Guest name** — mendukung parameter URL `?to=Nama%20Tamu` (dipakai banyak
  platform undangan digital untuk personalisasi link per tamu).

## Fitur yang Sudah Diimplementasikan

1. Cover pembuka dengan tombol "Buka Undangan" (memutar musik latar)
2. Hero dengan foto, nama, tanggal, dan countdown real-time
3. Profil kedua mempelai + foto + orang tua + bio singkat
4. Kartu acara Akad & Resepsi dengan tautan Google Maps
5. Alamat lengkap + embed Google Maps + tombol navigasi
6. Timeline Love Story dengan animasi garis & reveal saat scroll
7. Galeri foto masonry + lightbox (navigasi klik/keyboard)
8. Dress code dengan palet warna & daftar disarankan/dihindari
9. Amplop digital: tab Transfer Bank / E-Wallet, tombol salin nomor (dengan
   fallback untuk browser/konteks yang membatasi Clipboard API), QR code
10. Form RSVP (nama, WhatsApp, jumlah tamu, status hadir, pesan)
11. Form ucapan & doa + daftar ucapan dengan paginasi "Muat Lebih Banyak"
12. Penutup + footer + tombol kembali ke atas
13. Toggle musik latar, kelopak bunga ambient, navigasi responsif (hamburger
    di mobile/tablet), animasi scroll-reveal halus di seluruh section

Seluruh layout sudah diuji pada lebar desktop (1440px), tablet (820px), dan
mobile (390px).
