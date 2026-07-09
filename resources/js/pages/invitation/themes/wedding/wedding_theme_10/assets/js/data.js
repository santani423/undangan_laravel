/**
 * data.js
 * -----------------------------------------------------------------------
 * Semua konten undangan dikumpulkan di sini sebagai satu objek global
 * `WEDDING_DATA`. Tujuannya supaya ketika situs ini diintegrasikan dengan
 * backend / CMS / database, developer tinggal mengganti isi file ini
 * dengan hasil `fetch('/api/invitation')` tanpa perlu menyentuh markup
 * atau logic di main.js.
 *
 * Struktur ini sengaja dibuat menyerupai bentuk response JSON dari API,
 * sehingga proses migrasi ke backend nyata (Node/Laravel/Firebase/dsb)
 * tinggal "plug and play".
 * -----------------------------------------------------------------------
 */

const WEDDING_DATA = {

  // ---------------------------------------------------------------------
  // META — dipakai untuk <title>, meta og:, dan nama tamu lewat ?to= URL
  // ---------------------------------------------------------------------
  meta: {
    siteTitle: "Safitri & Saputra — Wedding Invitation",
    metaDescription: "Undangan pernikahan Safitri Dwi Putri & Saputra Nicolas",
    ogImage: "assets/img/couple-photo-1.jpg",
    defaultGuestName: "Tamu Undangan",
  },

  // ---------------------------------------------------------------------
  // COUPLE — data mempelai
  // ---------------------------------------------------------------------
  groom: {
    nickname: "Saputra",
    fullName: "Saputra Nicolas",
    fatherName: "Bapak Nicolas",
    motherName: "Ibu Wahyuningsih",
    order: "Putra pertama",
    description:
      "Seorang pria sederhana yang percaya bahwa rumah terbaik adalah di sisi orang yang tepat. Bekerja sebagai software engineer dan gemar mendaki gunung di akhir pekan.",
    photo: "assets/img/couple-photo-1.jpg",
    instagram: "https://instagram.com/saputra.nicolas",
  },

  bride: {
    nickname: "Safitri",
    fullName: "Safitri Dwi Putri",
    fatherName: "Bapak Stephant",
    motherName: "Ibu Nur Hidayah",
    order: "Putri kedua",
    description:
      "Perempuan yang jatuh cinta pada hal-hal kecil; kopi pagi hari, hujan sore hari, dan cerita panjang sebelum tidur. Berprofesi sebagai guru sekolah dasar.",
    photo: "assets/img/couple-photo-2.jpg",
    instagram: "https://instagram.com/safitri.dp",
  },

  coupleIntro: {
    arabicGreeting: "Assalamu'alaikum warahmatullahi wabarakatuh",
    openingText:
      "Dengan memohon Rahmat dan Ridho Allah SWT, kami bermaksud menyelenggarakan Resepsi pernikahan putra-putri kami.",
  },

  quote: {
    text:
      "Dan diantara ayat-ayat-Nya ialah diciptakan untukmu istri-istri dari jenismu sendiri, supaya kamu merasa nyaman kepadanya, dan dijadikan-Nya diantaramu mawadah dan rahmah. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berfikir.",
    source: "QS. Ar-Ruum: 21",
  },

  // ---------------------------------------------------------------------
  // EVENTS — akad & resepsi. Tanggal dalam format ISO agar mudah dipakai
  // untuk countdown & kalender.
  // ---------------------------------------------------------------------
  events: [
    {
      id: "akad",
      label: "Akad Nikah",
      date: "2027-01-08",
      timeStart: "08:00",
      timeEnd: "09:30",
      timezone: "WIB",
      venueName: "Kediaman Mempelai Wanita",
      address: "Jl. Jendral Sudirman No. 08, Jakarta Selatan, Indonesia",
      mapsUrl: "https://maps.google.com/?q=Jl.+Jendral+Sudirman+No.8+Jakarta",
    },
    {
      id: "resepsi",
      label: "Resepsi Pernikahan",
      date: "2027-01-08",
      timeStart: "10:00",
      timeEnd: "13:00",
      timezone: "WIB",
      venueName: "Gedung Serbaguna Graha Sudirman",
      address: "Jl. Jendral Sudirman No. 08, Jakarta Selatan, Indonesia",
      mapsUrl: "https://maps.google.com/?q=Jl.+Jendral+Sudirman+No.8+Jakarta",
    },
  ],

  // Alamat detail + embed untuk section "Alamat Acara"
  venue: {
    name: "Graha Sudirman",
    fullAddress:
      "Jl. Jendral Sudirman No. 08, Kelurahan Karet, Kecamatan Setiabudi, Jakarta Selatan, DKI Jakarta 12920, Indonesia",
    notes: "Parkir tersedia di basement gedung. Pintu masuk tamu melalui lobi utama.",
    mapsEmbedSrc:
      "https://www.google.com/maps?q=Jl.+Jendral+Sudirman+No.8+Jakarta&output=embed",
    mapsDirectionUrl: "https://maps.google.com/?q=Jl.+Jendral+Sudirman+No.8+Jakarta",
  },

  // ---------------------------------------------------------------------
  // LOVE STORY — timeline perjalanan hubungan
  // ---------------------------------------------------------------------
  loveStory: [
    {
      date: "Maret 2019",
      title: "Pertama Bertemu",
      description:
        "Dipertemukan lewat teman kuliah yang sama di sebuah acara amal kecil-kecilan di Jakarta.",
      photo: "assets/img/couple-photo-1.jpg",
    },
    {
      date: "Agustus 2020",
      title: "Menjadi Dekat",
      description:
        "Pandemi membuat kami sering bertukar cerita lewat telepon setiap malam, hingga tanpa sadar saling jatuh hati.",
      photo: "assets/img/couple-photo-2.jpg",
    },
    {
      date: "Februari 2022",
      title: "Resmi Berpacaran",
      description:
        "Saputra memberanikan diri mengajak Safitri untuk menjalani hubungan yang lebih serius.",
      photo: "assets/img/couple-photo-1.jpg",
    },
    {
      date: "Juni 2026",
      title: "Lamaran",
      description:
        "Acara lamaran sederhana dihadiri oleh kedua keluarga besar sebagai tanda restu.",
      photo: "assets/img/couple-photo-2.jpg",
    },
    {
      date: "08 Januari 2027",
      title: "Hari Bahagia",
      description:
        "Hari dimana kami mengikat janji suci pernikahan, insyaAllah.",
      photo: "assets/img/couple-photo-1.jpg",
    },
  ],

  // ---------------------------------------------------------------------
  // GALLERY — foto pasangan (dummy, gunakan aset asli dari template)
  // ---------------------------------------------------------------------
  gallery: [
    { id: 1, src: "assets/img/couple-photo-1.jpg", caption: "Prewedding — Perbukitan Malang" },
    { id: 2, src: "assets/img/couple-photo-2.jpg", caption: "Prewedding — Taman Bunga" },
    { id: 3, src: "assets/img/couple-photo-1.jpg", caption: "Sesi Sunset" },
    { id: 4, src: "assets/img/couple-photo-2.jpg", caption: "Momen Kasual" },
    { id: 5, src: "assets/img/couple-photo-1.jpg", caption: "Sesi Formal" },
    { id: 6, src: "assets/img/couple-photo-2.jpg", caption: "Perjalanan Bersama" },
  ],

  // ---------------------------------------------------------------------
  // DRESS CODE
  // ---------------------------------------------------------------------
  dressCode: {
    description:
      "Kami dengan senang hati mengundang Bapak/Ibu/Saudara/i untuk mengenakan busana rapi dengan nuansa warna berikut, guna menjaga keselarasan tema acara.",
    colors: [
      { name: "Sage Green", hex: "#7C8968" },
      { name: "Dusty Rose", hex: "#B98F89" },
      { name: "Ivory", hex: "#F7F0E6" },
      { name: "Champagne Gold", hex: "#C6A15B" },
    ],
    notes: "Mohon menghindari warna putih penuh, karena akan dikenakan oleh mempelai wanita.",
  },

  // ---------------------------------------------------------------------
  // DIGITAL GIFT / AMPLOP DIGITAL
  // ---------------------------------------------------------------------
  gifts: {
    banks: [
      {
        bank: "Bank Central Asia (BCA)",
        accountNumber: "1234567890",
        accountName: "Safitri Dwi Putri",
        logo: "BCA",
      },
      {
        bank: "Bank Mandiri",
        accountNumber: "0987654321",
        accountName: "Saputra Nicolas",
        logo: "Mandiri",
      },
    ],
    eWallets: [
      { provider: "GoPay", number: "081234567890", accountName: "Safitri Dwi Putri" },
      { provider: "OVO", number: "081234567890", accountName: "Safitri Dwi Putri" },
      { provider: "DANA", number: "081298765432", accountName: "Saputra Nicolas" },
      { provider: "ShopeePay", number: "081298765432", accountName: "Saputra Nicolas" },
    ],
    qrisImage: null, // taruh path gambar QRIS di sini bila tersedia, contoh: "assets/img/qris.png"
    address: {
      recipientName: "Safitri Dwi Putri",
      fullAddress:
        "Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12180, Indonesia",
      note: "Kado fisik dapat dikirimkan ke alamat ini maksimal H-3 sebelum acara.",
    },
  },

  // ---------------------------------------------------------------------
  // RSVP — struktur form. `guestOptions` untuk dropdown jumlah tamu.
  // ---------------------------------------------------------------------
  rsvpConfig: {
    guestCountOptions: [1, 2, 3, 4],
    attendanceOptions: [
      { value: "hadir", label: "Ya, saya akan hadir" },
      { value: "tidak_hadir", label: "Maaf, saya berhalangan hadir" },
      { value: "ragu", label: "Masih belum bisa memastikan" },
    ],
  },

  // ---------------------------------------------------------------------
  // WISHES — daftar ucapan awal (dummy). Ucapan baru dari form akan
  // digabung dengan array ini di localStorage sebagai simulasi database.
  // ---------------------------------------------------------------------
  wishes: [
    {
      id: "w1",
      name: "Dian Ayu",
      message: "Selamat menempuh hidup baru! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah ya 🤍",
      attendance: "hadir",
      createdAt: "2026-06-20T09:00:00+07:00",
    },
    {
      id: "w2",
      name: "Reza Pratama",
      message: "Barakallahu lakuma wa baraka 'alaikuma. Selamat ya Saputra & Safitri, bahagia selalu!",
      attendance: "hadir",
      createdAt: "2026-06-25T14:20:00+07:00",
    },
    {
      id: "w3",
      name: "Kevin & Nadia",
      message: "Semoga lancar sampai hari H, kami usahakan hadir. Sehat-sehat terus kalian berdua!",
      attendance: "ragu",
      createdAt: "2026-07-01T18:45:00+07:00",
    },
  ],

  // ---------------------------------------------------------------------
  // CLOSING
  // ---------------------------------------------------------------------
  closing: {
    thankYouText:
      "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kami.",
    signatureNames: "Saputra & Safitri",
    hashtag: "#SaputraDanSafitri2027",
  },
};

// -------------------------------------------------------------------------
// Contoh titik integrasi backend di masa depan (dibiarkan sebagai referensi,
// tidak dieksekusi). Ganti WEDDING_DATA di atas dengan hasil fetch berikut:
//
// async function loadInvitationData() {
//   const res = await fetch('/api/invitation');
//   return res.json();
// }
//
// async function submitRsvp(payload) {
//   return fetch('/api/rsvp', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(payload),
//   });
// }
//
// async function submitWish(payload) {
//   return fetch('/api/wishes', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(payload),
//   });
// }
// -------------------------------------------------------------------------
