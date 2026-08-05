/**
 * WEDDING_DATA
 * ------------------------------------------------------------------
 * Dummy / placeholder content for the wedding invitation website.
 * Every value here is intentionally structured so that it can later
 * be replaced by a real API response (e.g. GET /api/invitation/:slug)
 * without touching any rendering code in main.js.
 * ------------------------------------------------------------------
 */
const WEDDING_DATA = {

  meta: {
    title: "Rama & Shinta — The Wedding Invitation",
    groomShort: "Rama",
    brideShort: "Shinta",
    hashtag: "#RamaAndShinta2025",
    guestNameFallback: "Bapak/Ibu/Saudara/i",
  },

  couple: {
    groom: {
      fullName: "Rama Putra Wijaya",
      nickname: "Rama",
      parents: "Putra dari Bapak Ahmad Wijaya & Ibu Sri Lestari",
      order: "Putra pertama",
      instagram: "@rama.putra",
      photo: "assets/img/profile-groom.jpg",
      bio: "Anak pertama dari dua bersaudara. Bekerja sebagai software engineer, menyukai kopi, musik akustik, dan perjalanan singkat di akhir pekan.",
    },
    bride: {
      fullName: "Shinta Putri Anjani",
      nickname: "Shinta",
      parents: "Putri dari Bapak Bambang Santoso & Ibu Dewi Kusuma",
      order: "Putri kedua",
      instagram: "@shinta.putri",
      photo: "assets/img/profile-bride.jpg",
      bio: "Anak kedua dari tiga bersaudara. Berprofesi sebagai desainer interior, gemar merawat tanaman, membaca, dan menikmati senja.",
    },
  },

  quote: {
    text: "Dan di antara ayat-ayat-Nya ialah diciptakan untukmu istri-istri dari jenismu sendiri, supaya kamu merasa nyaman kepadanya, dan dijadikan-Nya di antaramu mawadah dan rahmah. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berpikir.",
    source: "QS. Ar-Ruum : 21",
  },

  events: [
    {
      id: "akad",
      label: "Akad Nikah",
      day: "Sabtu",
      dateDisplay: "12 Desember 2026",
      dateISO: "2026-12-12T08:00:00+07:00",
      timeDisplay: "08.00 WIB s/d Selesai",
      place: "Kediaman Mempelai Wanita",
      address: "Jl. Kenanga No. 21, Menteng, Jakarta Pusat",
      mapsUrl: "https://maps.google.com/?q=Menteng+Jakarta+Pusat",
    },
    {
      id: "resepsi",
      label: "Resepsi",
      day: "Sabtu",
      dateDisplay: "12 Desember 2026",
      dateISO: "2026-12-12T11:00:00+07:00",
      timeDisplay: "11.00 WIB s/d 14.00 WIB",
      place: "Kediaman Mempelai Wanita",
      address: "Jl. Kenanga No. 21, Menteng, Jakarta Pusat",
      mapsUrl: "https://maps.google.com/?q=Menteng+Jakarta+Pusat",
    },
  ],

  // Countdown targets the earliest event above.
  countdownTarget: "2026-12-12T08:00:00+07:00",

  venue: {
    name: "Kediaman Keluarga Mempelai Wanita",
    fullAddress: "Jl. Kenanga No. 21, RT.03/RW.05, Kel. Menteng, Kec. Menteng, Jakarta Pusat, DKI Jakarta 10310",
    notes: "Area parkir tersedia di halaman rumah dan sepanjang Jl. Kenanga. Mohon maaf apabila kapasitas parkir terbatas.",
    mapsEmbedSrc: "https://www.google.com/maps?q=Menteng,Jakarta+Pusat&output=embed",
    mapsUrl: "https://maps.google.com/?q=Menteng+Jakarta+Pusat",
  },

  loveStory: [
    {
      date: "Agustus 2019",
      title: "Pertama Bertemu",
      description: "Dipertemukan lewat teman kuliah yang sama pada sebuah acara kantor. Obrolan singkat yang berlanjut jadi pesan setiap malam.",
      photo: "assets/img/gallery-1.jpg",
    },
    {
      date: "Februari 2020",
      title: "Menjalin Kasih",
      description: "Setelah beberapa bulan saling mengenal lebih dekat, Rama memberanikan diri untuk mengungkapkan perasaannya di sebuah kedai kopi kecil.",
      photo: "assets/img/gallery-2.jpg",
    },
    {
      date: "Juni 2022",
      title: "Bertemu Keluarga",
      description: "Rama diperkenalkan pada keluarga besar Shinta, begitu juga sebaliknya. Restu dari kedua orang tua menjadi awal langkah yang lebih serius.",
      photo: "assets/img/gallery-3.jpg",
    },
    {
      date: "Maret 2025",
      title: "Lamaran",
      description: "Di depan keluarga terdekat, Rama melamar Shinta. Sebuah janji sederhana untuk melangkah bersama menuju jenjang pernikahan.",
      photo: "assets/img/gallery-4.jpg",
    },
    {
      date: "Desember 2026",
      title: "Hari Pernikahan",
      description: "Dengan penuh syukur, kami akan mengucap ijab qabul dan resmi menjadi sepasang suami istri. Doa restu Anda sangat berarti bagi kami.",
      photo: "assets/img/gallery-5.jpg",
    },
  ],

  gallery: [
    { id: 1, src: "assets/img/gallery-1.jpg", caption: "Prewedding — Taman Kota" },
    { id: 2, src: "assets/img/gallery-2.jpg", caption: "Prewedding — Golden Hour" },
    { id: 3, src: "assets/img/gallery-3.jpg", caption: "Momen Kebersamaan" },
    { id: 4, src: "assets/img/gallery-4.jpg", caption: "Hari Lamaran" },
    { id: 5, src: "assets/img/gallery-5.jpg", caption: "Prewedding — Senja" },
    { id: 6, src: "assets/img/gallery-6.jpg", caption: "Prewedding — Taman Bunga" },
    { id: 7, src: "assets/img/hero-couple.jpg", caption: "Prewedding — Sampul" },
  ],

  dressCode: {
    intro: "Kami mengundang Bapak/Ibu/Saudara/i untuk mengenakan busana rapi dan sopan dengan palet warna berikut, agar dokumentasi acara terlihat senada dan indah.",
    palette: [
      { name: "Dusty Rose", hex: "#B98A96" },
      { name: "Cream Ivory", hex: "#EFE4DE" },
      { name: "Terracotta", hex: "#9C5B22" },
      { name: "Sage Green", hex: "#6B7A5E" },
      { name: "Deep Umber", hex: "#3B332C" },
    ],
    dos: [
      "Busana formal / semi-formal (batik, kebaya, gaun, kemeja rapi)",
      "Warna selaras dengan palet yang disarankan di atas",
      "Sepatu tertutup atau heels yang nyaman untuk area outdoor",
    ],
    donts: [
      "Warna putih polos (disediakan khusus untuk pengantin)",
      "Pakaian olahraga, sandal jepit, atau denim kasual",
    ],
  },

  digitalGifts: {
    intro: "Doa restu Bapak/Ibu/Saudara/i adalah hadiah yang paling berarti bagi kami. Namun jika berkenan memberi tanda kasih, dapat melalui:",
    banks: [
      { bank: "BCA", accountNumber: "1234567890", accountName: "Rama Putra Wijaya" },
      { bank: "Mandiri", accountNumber: "0987654321", accountName: "Shinta Putri Anjani" },
    ],
    ewallets: [
      { name: "DANA", number: "0812-3456-7890", accountName: "Rama Putra W.", qr: "assets/img/qr-dana.png" },
      { name: "OVO", number: "0812-3456-7890", accountName: "Rama Putra W." },
      { name: "GoPay", number: "0813-9876-5432", accountName: "Shinta Putri A." },
      { name: "ShopeePay", number: "0813-9876-5432", accountName: "Shinta Putri A." },
    ],
    address: {
      recipient: "Rama & Shinta",
      fullAddress: "Jl. Kenanga No. 21, Menteng, Jakarta Pusat 10310",
      note: "Untuk pengiriman kado fisik, mohon konfirmasi terlebih dahulu via WhatsApp.",
    },
  },

  // Dummy pre-seeded wishes — a real backend would return this via GET /api/wishes
  wishes: [
    { id: "w1", name: "Dinda Ayu", attendance: "hadir", message: "Selamat menempuh hidup baru Rama & Shinta! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Sehat terus kalian berdua 🤍", date: "2026-11-02T10:20:00+07:00" },
    { id: "w2", name: "Bagus Prasetyo", attendance: "hadir", message: "Akhirnya! Setelah nunggu lama, selamat ya buat kalian berdua. Ditunggu undangan makan-makannya lagi 😄", date: "2026-11-03T14:05:00+07:00" },
    { id: "w3", name: "Keluarga Wijaya", attendance: "tidak_hadir", message: "Mohon maaf belum bisa hadir karena berhalangan. Doa terbaik untuk Rama & Shinta, semoga pernikahannya berjalan lancar dan penuh berkah.", date: "2026-11-04T08:40:00+07:00" },
    { id: "w4", name: "Nadia Rahma", attendance: "hadir", message: "Congratulations!! Cantik banget undangannya, sama cantik kayak calon pengantinnya. Sampai jumpa di hari bahagia kalian!", date: "2026-11-05T19:12:00+07:00" },
    { id: "w5", name: "Fajar & Winda", attendance: "hadir", message: "Barakallahu lakuma, semoga sakinah mawaddah warahmah selalu menyertai rumah tangga Rama & Shinta ya.", date: "2026-11-06T09:00:00+07:00" },
    { id: "w6", name: "Putri Lestari", attendance: "belum_konfirmasi", message: "Masih coba atur waktu, tapi doa terbaik selalu untuk kalian berdua! Happy wedding in advance ❤️", date: "2026-11-07T21:30:00+07:00" },
  ],
};

// Small helper: number of wishes to reveal per "load more" click.
const WISHES_PAGE_SIZE = 3;
