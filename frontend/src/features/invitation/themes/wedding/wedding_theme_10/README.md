# Undangan Pernikahan — Safitri & Saputra

Website undangan pernikahan digital yang mereplikasi identitas visual dari
template PPT asli: watercolor blush wash, greenery eucalyptus, gold-glitter
scatter, kaligrafi Bismillah, dan tipografi elegan (Great Vibes, Cinzel,
Cormorant Garamond, Jost).

## Cara membuka
Cukup buka `index.html` di browser (bisa langsung double-click, tidak wajib
lewat server — semua font sudah di-hosting lokal di `assets/fonts/` sehingga
tampilan tetap sempurna walau offline atau tanpa koneksi ke Google Fonts).

Untuk menampilkan nama tamu secara personal, tambahkan parameter `?to=Nama%20Tamu`
di URL, contoh:

```
index.html?to=Bapak%20Andi%20%26%20Keluarga
```

Catatan: Google Maps embed pada bagian "Alamat Acara" tetap butuh koneksi
internet karena itu memanggil layanan Google secara langsung.

## Animasi yang disertakan
- Transisi buka undangan dengan efek tabur kelopak & daun dari tombol "Buka Undangan"
- Kelopak & daun ambient yang melayang perlahan di layar (dimatikan otomatis di mobile & saat "reduce motion" aktif)
- Countdown dengan efek flip 3D setiap angka berubah
- Parallax lembut pada elemen daun dekoratif saat scroll
- Kartu, foto galeri, dan timeline muncul bertahap (staggered fade + scale) saat discroll
- Kilau emas berkedip halus pada aksen gold-splatter
- Detak lembut ("heartbeat") pada setiap simbol "&"
- Foto pasangan di hero melayang naik-turun perlahan
- Kilau sapuan cahaya (shimmer) pada tombol emas
- Garis bawah emas yang "digambar" di setiap judul section saat masuk layar
- Hover tilt & shadow lift pada galeri dan kartu ucapan

Semua animasi menghormati preferensi `prefers-reduced-motion` pengguna.

## Struktur folder

```
index.html                 -> markup seluruh 11 section
assets/css/fonts.css       -> @font-face lokal (self-hosted, tanpa CDN)
assets/css/style.css       -> semua styling & animasi (desain tokens di :root)
assets/js/data.js          -> SEMUA konten undangan (nama, tanggal, galeri, dst)
assets/js/main.js          -> logic render, countdown, lightbox, RSVP, ucapan, animasi
assets/img/                -> aset visual asli dari template PPT (watercolor,
                               daun eucalyptus, gold splatter, kaligrafi, foto)
assets/fonts/               -> file .woff2 Great Vibes, Cinzel, Cormorant Garamond, Jost
assets/audio/bg-music.mp3  -> musik latar (toggle lewat tombol kanan atas)
```

## Mengganti isi undangan
Edit **`assets/js/data.js`** saja — seluruh teks, tanggal, foto, rekening, dan
daftar ucapan diambil dari objek `WEDDING_DATA` di file itu. Tidak perlu
menyentuh HTML/CSS untuk mengganti konten.

## Integrasi ke backend / database
Struktur `WEDDING_DATA` sengaja dibuat menyerupai response API. Titik
integrasi yang sudah disiapkan (lihat komentar di kode):

- `assets/js/data.js` — ganti seluruh objek dengan hasil `fetch('/api/invitation')`
- `assets/js/main.js` fungsi `initRsvpForm()` — ganti simulasi `localStorage`
  dengan `fetch('/api/rsvp', { method: 'POST', ... })`
- `assets/js/main.js` fungsi `initWishForm()` — ganti simulasi `localStorage`
  dengan `fetch('/api/wishes', { method: 'POST', ... })`, dan `loadAllWishes()`
  bisa diganti `GET /api/wishes` saat halaman dimuat.

## Catatan
- Foto pasangan pada `assets/img/couple-photo-1.jpg` & `couple-photo-2.jpg`
  adalah foto contoh dari template asli — ganti dengan foto pasangan
  sesungguhnya sebelum publish.
- QRIS: isi `gifts.qrisImage` di `data.js` dengan path gambar QRIS jika tersedia.
- Musik latar menggunakan file dari template asli; ganti file di
  `assets/audio/bg-music.mp3` bila ingin memakai lagu lain (perhatikan hak cipta).
