/**
 * data.js
 * ------------------------------------------------------------------
 * Seluruh konten undangan disimpan di satu objek global `WEDDING_DATA`.
 * Struktur ini sengaja dibuat menyerupai bentuk response API/database,
 * sehingga ke depannya file ini tinggal diganti dengan hasil `fetch()`
 * ke backend (mis. GET /api/invitation/:slug) tanpa mengubah main.js.
 * ------------------------------------------------------------------
 */

const WEDDING_DATA = {
  meta: {
    title: "Putra & Ayu — Undangan Pernikahan",
    slug: "putra-ayu",
    locale: "id-ID",
    themeColor: "#F4EFEA",
    musicSrc: "" // isi dengan URL file musik (mp3) bila tersedia
  },

  groom: {
    fullName: "Putra Wardhana",
    nickName: "Putra",
    photo: "assets/photos/groom.jpg",
    father: "Bapak H. Sutrisno",
    mother: "Ibu Hj. Ratnawati",
    childOrder: "Putra pertama dari dua bersaudara",
    bio: "Putra tumbuh di Yogyakarta dan kini bekerja sebagai software engineer. Tenang, hangat, dan selalu punya waktu untuk mendengarkan.",
    instagram: "@putra.wardhana"
  },

  bride: {
    fullName: "Ayu Kirana Dewi",
    nickName: "Ayu",
    photo: "assets/photos/bride.jpg",
    father: "Bapak H. Suparman",
    mother: "Ibu Hj. Aminah",
    childOrder: "Putri kedua dari tiga bersaudara",
    bio: "Ayu seorang guru taman kanak-kanak yang ceria dan penyayang. Cintanya pada anak-anak dan bunga membuat siapa pun merasa nyaman di dekatnya.",
    instagram: "@ayu.kirana"
  },

  coverPhoto: "assets/photos/hero-couple.jpg",

  quote: {
    arabicNote: "Bismillahirrahmanirrahim",
    greeting: "Assalamu'alaikum Warahmatullahi Wabarakatuh",
    verse:
      "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu " +
      "pasangan hidup dari jenismu sendiri, supaya kamu cenderung dan merasa " +
      "tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang. " +
      "Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda " +
      "bagi kaum yang berpikir.",
    verseSource: "QS. Ar-Rum: 21"
  },

  invitationText:
    "Dengan memohon rahmat dan ridho Allah Subhanahu Wa Ta'ala, kami bermaksud " +
    "mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan putra-putri kami.",

  events: [
    {
      id: "akad",
      label: "Akad Nikah",
      date: "2026-09-12",
      timeStart: "08:00",
      timeEnd: "10:00",
      timezone: "WIB",
      venueName: "Kediaman Mempelai Wanita",
      note: "Dihadiri oleh keluarga inti dan kerabat terdekat"
    },
    {
      id: "resepsi",
      label: "Resepsi",
      date: "2026-09-12",
      timeStart: "11:00",
      timeEnd: "14:00",
      timezone: "WIB",
      venueName: "The Hotel Djakarta Ballroom",
      note: "Terbuka untuk seluruh tamu undangan"
    }
  ],

  address: {
    venueName: "The Hotel Djakarta Ballroom",
    fullAddress:
      "Jl. M.H. Thamrin No. 28, Menteng, Jakarta Pusat, DKI Jakarta 10350, Indonesia",
    mapsEmbedUrl:
      "https://www.google.com/maps?q=Jakarta%20Pusat&output=embed",
    mapsLinkUrl: "https://maps.google.com/?q=The+Hotel+Djakarta+Ballroom+Menteng+Jakarta+Pusat"
  },

  loveStory: [
    {
      date: "Agustus 2019",
      title: "Pertama Bertemu",
      description:
        "Dipertemukan di sebuah acara kantor, obrolan singkat tentang buku favorit berlanjut hingga larut malam.",
      photo: "assets/photos/story-1.jpg"
    },
    {
      date: "Februari 2020",
      title: "Menjalin Kasih",
      description:
        "Setelah beberapa bulan dekat, Putra memberanikan diri mengungkapkan perasaannya di bawah hujan sore itu.",
      photo: "assets/photos/story-2.jpg"
    },
    {
      date: "Desember 2024",
      title: "Melamar",
      description:
        "Lamaran sederhana di pantai saat matahari terbenam, disaksikan keluarga terdekat kedua belah pihak.",
      photo: "assets/photos/story-3.jpg"
    },
    {
      date: "September 2026",
      title: "Menuju Hari Bahagia",
      description:
        "Kini keduanya bersiap melangkah ke jenjang pernikahan, memulai babak baru dengan penuh syukur.",
      photo: "assets/photos/story-4.jpg"
    }
  ],

  gallery: [
    { photo: "assets/photos/gallery-1.jpg", caption: "Prewedding session" },
    { photo: "assets/photos/gallery-2.jpg", caption: "Sesi foto taman" },
    { photo: "assets/photos/gallery-3.jpg", caption: "Golden hour" },
    { photo: "assets/photos/gallery-4.jpg", caption: "Kebersamaan" },
    { photo: "assets/photos/gallery-5.jpg", caption: "Momen tawa" },
    { photo: "assets/photos/gallery-6.jpg", caption: "Menuju hari bahagia" },
    { photo: "assets/photos/gallery-7.jpg", caption: "Cinta yang tumbuh" },
    { photo: "assets/photos/gallery-8.jpg", caption: "Kasih yang terjaga" },
    { photo: "assets/photos/gallery-9.jpg", caption: "Bahagia berdua" }
  ],

  dressCode: {
    description:
      "Kami mengundang Bapak/Ibu/Saudara/i untuk mengenakan busana rapi dan sopan dengan palet warna berikut, agar keharmonisan warna tetap terjaga di sepanjang acara.",
    colors: [
      { name: "Cream Ivory", hex: "#F4EFEA" },
      { name: "Warm Tan", hex: "#E8D3B0" },
      { name: "Antique Gold", hex: "#C9A227" },
      { name: "Deep Maroon", hex: "#7A0C2E" },
      { name: "Umber Brown", hex: "#5A4632" }
    ],
    notes: [
      "Hindari warna putih penuh, khusus untuk kedua mempelai.",
      "Disarankan busana formal / semi-formal.",
      "Nyaman digunakan untuk duduk lesehan maupun berdiri lama."
    ]
  },

  digitalGift: {
    banks: [
      { bank: "BCA", accountName: "Putra Wardhana", accountNumber: "1234567890" },
      { bank: "Mandiri", accountName: "Ayu Kirana Dewi", accountNumber: "0987654321" }
    ],
    ewallets: [
      { provider: "GoPay", accountName: "Putra Wardhana", number: "081234567890" },
      { provider: "OVO", accountName: "Ayu Kirana Dewi", number: "081298765432" },
      { provider: "DANA", accountName: "Putra Wardhana", number: "081234567890" },
      { provider: "ShopeePay", accountName: "Ayu Kirana Dewi", number: "081298765432" }
    ],
    qrisImage: ""
  },

  // Data ucapan/wishes contoh — di produksi, list ini diambil dari database
  // dan bertambah setiap ada submission baru lewat POST /api/wishes.
  wishes: [
    {
      id: "w1",
      name: "Dewi Anggraini",
      attendance: "hadir",
      message: "Selamat menempuh hidup baru, semoga sakinah mawaddah warahmah!",
      createdAt: "2026-06-01T10:00:00+07:00"
    },
    {
      id: "w2",
      name: "Rian Saputra",
      attendance: "hadir",
      message: "Bahagia banget lihat kalian akhirnya menikah. Sukses selalu!",
      createdAt: "2026-06-03T14:30:00+07:00"
    },
    {
      id: "w3",
      name: "Sinta Maharani",
      attendance: "tidak_hadir",
      message: "Maaf tidak bisa hadir, tapi doa terbaik selalu menyertai kalian berdua.",
      createdAt: "2026-06-05T09:15:00+07:00"
    },
    {
      id: "w4",
      name: "Budi Prakoso",
      attendance: "hadir",
      message: "Barakallahu laka wa baraka alaika, semoga menjadi keluarga yang penuh berkah.",
      createdAt: "2026-06-06T20:45:00+07:00"
    }
  ]
};
