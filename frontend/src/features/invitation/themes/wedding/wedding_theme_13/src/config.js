/* =====================================================================
   KONFIGURASI UNDANGAN — satu-satunya tempat untuk mengganti data acara.
   Semua isi di bawah adalah CONTOH. Kode adegan 3D tidak perlu disentuh.
   ===================================================================== */
const WEDDING = {
  mempelai: {
    pria: {
      panggilan: 'Rangga', lengkap: 'Rangga Adiwijaya, S.T.',
      keterangan: 'Putra kedua dari', ortu: 'Bapak H. Dadang Suryana & Ibu Hj. Euis Komariah',
      instagram: ''
    },
    wanita: {
      panggilan: 'Sekar', lengkap: 'Sekar Ayu Lestari, S.Pd.',
      keterangan: 'Putri pertama dari', ortu: 'Bapak Asep Kurniawan & Ibu Neng Rosita',
      instagram: ''
    }
  },
  tanggal: '2026-12-19',                                   // dipakai hitung mundur & kalender
  zonaWaktu: '+07:00',
  tanggalTampil: 'Sabtu, 19 Desember 2026',
  tanggalKartu: '19 · 12 · 2026',
  pembuka: 'Dengan memohon rahmat dan rida Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami.',
  semboyan: 'Satukna Dua Hati, Ngawangun Carita Salamina.',

  acara: [
    { nama: 'Akad Nikah', mulai: '08:00', selesai: '09:30', tempat: 'Pendopo Taman Saung Kenanga', catatan: 'Khusus keluarga dan kerabat dekat.' },
    { nama: 'Upacara Adat & Resepsi', mulai: '11:00', selesai: '14:00', tempat: 'Taman Saung Kenanga', catatan: 'Mapag panganten, sawer, dan jamuan.' }
  ],
  lokasi: {
    nama: 'Taman Saung Kenanga',
    alamat: 'Jl. Raya Lembang No. 120, Lembang, Kabupaten Bandung Barat, Jawa Barat',
    peta: 'https://www.google.com/maps/search/?api=1&query=Lembang%20Bandung%20Barat'
  },
  dressCode: { aktif: true, teks: 'Nuansa gading, sage, atau batik. Hindari warna putih polos.' },

  kisah: [                                                  // foto bisa diganti dengan path foto asli
    { tahun: '2018', judul: 'Patepang', teks: 'Bertemu pertama kali di kegiatan kampus di Bandung.', foto: 'assets/kisah-1.jpg' },
    { tahun: '2021', judul: 'Silih Asih', teks: 'Mulai saling mengenal lebih dekat, berbagi cerita dan cita-cita.', foto: 'assets/kisah-2.jpg' },
    { tahun: '2025', judul: 'Neundeun Omong', teks: 'Keluarga besar bertemu dan lamaran pun diterima.', foto: 'assets/kisah-3.jpg' },
    { tahun: '2026', judul: 'Rendengan', teks: 'Kami memulai perjalanan baru sebagai suami dan istri.', foto: 'assets/kisah-4.jpg' }
  ],
  galeri: ['assets/galeri-1.jpg', 'assets/galeri-2.jpg', 'assets/galeri-3.jpg', 'assets/galeri-4.jpg', 'assets/galeri-5.jpg', 'assets/galeri-6.jpg'],
  fotoContoh: true,                                         // tampilkan label "foto contoh" selama foto belum diganti

  rsvp: {
    aktif: true,
    whatsapp: '6285173189374',                              // penerima konfirmasi (format 62...)
    endpoint: '',                                           // opsional: URL backend untuk menyimpan RSVP (POST JSON)
    maksTamu: 4
  },
  hadiah: {
    aktif: true,
    rekening: [
      { bank: 'Bank Contoh', nomor: '0000 1111 2222', nama: 'Sekar Ayu Lestari' },
      { bank: 'Bank Contoh', nomor: '0000 3333 4444', nama: 'Rangga Adiwijaya' }
    ],
    qris: '',                                               // isi path gambar QRIS (PNG/JPG) di folder assets; kosong = disembunyikan
    alamatKado: 'Jl. Contoh No. 1, Bandung'
  },
  bukuTamu: { endpoint: '' },                               // kosong = ucapan hanya tersimpan di perangkat ini
  penutup: 'Hatur Nuhun parantos janten bagian tina kabagjaan ieu.',

  tema: { gading: '#F4ECE0', sampanye: '#D3C3A6', emas: '#B08D57', sage: '#6B765C', maroon: '#6B3F46', kayu: '#463A2E' },
  musik: { aktif: true, putarSaatDibuka: true },
  adegan: {
    kualitas: 'auto',                                       // 'auto' | 'tinggi' | 'ringan'
    kelopak: 140, rumput: 52000,                            // jumlah partikel & helai rumput (desktop); HP otomatis dikurangi
    kepekaanPenunjuk: 1
  },
  kredit: { nama: 'Bahagia Project', whatsapp: '6285173189374' }
};
