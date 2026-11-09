import type { WeddingConfig } from './types'

/**
 * ALL invitation content lives here. Replace every example value before publishing.
 * Names, dates, venues and bank details below are clearly-marked EXAMPLES, not real data.
 */
export const wedding: WeddingConfig = {
  isExampleData: true,

  invitationTitle: 'Pawiwahan Agung',
  invitationSubtitle: 'Undangan Pernikahan',

  couple: {
    bride: {
      fullName: 'Sekar Ayu Larasati',
      nickname: 'Sekar',
      childOrder: 'Putri pertama dari',
      parents: 'Bapak [Nama Ayah] & Ibu [Nama Ibu]',
      photo: null,
    },
    groom: {
      fullName: 'Bagus Prakoso Wicaksono',
      nickname: 'Bagus',
      childOrder: 'Putra kedua dari',
      parents: 'Bapak [Nama Ayah] & Ibu [Nama Ibu]',
      photo: null,
    },
    openingGreeting: 'Sugeng Rawuh',
    openingMessage:
      'Dengan memohon rahmat dan restu, kami bermaksud menyelenggarakan pernikahan putra-putri kami. Merupakan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
    verse: {
      text: 'Witing tresna jalaran saka kulina.',
      translation: 'Cinta tumbuh karena terbiasa bersama.',
      source: 'Paribasan Jawa',
    },
  },

  mainDate: '2027-06-12T08:00:00+07:00',
  mainDateLabel: 'Sabtu, 12 Juni 2027',

  events: [
    {
      id: 'akad',
      kind: 'akad',
      title: 'Akad Nikah',
      subtitle: 'Ijab kabul',
      start: '2027-06-12T08:00:00+07:00',
      end: '2027-06-12T10:00:00+07:00',
      timezoneLabel: 'WIB',
      venueName: '[Nama Venue Akad]',
      address: '[Alamat lengkap venue — ubah di src/config/wedding.ts]',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Pendopo',
      note: 'Mohon hadir 30 menit sebelum acara dimulai.',
    },
    {
      id: 'resepsi',
      kind: 'resepsi',
      title: 'Resepsi',
      subtitle: 'Panggih & pahargyan',
      start: '2027-06-12T11:00:00+07:00',
      end: '2027-06-12T14:00:00+07:00',
      timezoneLabel: 'WIB',
      venueName: '[Nama Venue Resepsi]',
      address: '[Alamat lengkap venue — ubah di src/config/wedding.ts]',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Pendopo',
      note: 'Busana: batik atau kebaya bernuansa cokelat & emas.',
    },
  ],

  gallery: [
    { id: 'g1', src: 'assets/wedding-jawa/photos/placeholder-1.svg', alt: 'Foto prewedding 1 (placeholder)', caption: 'Placeholder — ganti dengan foto prewedding', orientation: 'portrait' },
    { id: 'g2', src: 'assets/wedding-jawa/photos/placeholder-2.svg', alt: 'Foto prewedding 2 (placeholder)', caption: 'Placeholder — ganti dengan foto prewedding', orientation: 'portrait' },
    { id: 'g3', src: 'assets/wedding-jawa/photos/placeholder-3.svg', alt: 'Foto prewedding 3 (placeholder)', caption: 'Placeholder — ganti dengan foto prewedding', orientation: 'landscape' },
    { id: 'g4', src: 'assets/wedding-jawa/photos/placeholder-4.svg', alt: 'Foto prewedding 4 (placeholder)', caption: 'Placeholder — ganti dengan foto prewedding', orientation: 'portrait' },
    { id: 'g5', src: 'assets/wedding-jawa/photos/placeholder-5.svg', alt: 'Foto prewedding 5 (placeholder)', caption: 'Placeholder — ganti dengan foto prewedding', orientation: 'portrait' },
    { id: 'g6', src: 'assets/wedding-jawa/photos/placeholder-6.svg', alt: 'Foto prewedding 6 (placeholder)', caption: 'Placeholder — ganti dengan foto prewedding', orientation: 'landscape' },
  ],

  galleryVideo: {
    src: null,
    title: 'Video prewedding',
  },

  story: [
    {
      id: 's1',
      dateLabel: '[Tahun]',
      title: 'Pertemuan Pertama',
      body: 'Ceritakan di sini bagaimana kalian pertama kali bertemu. Ubah teks ini di src/config/wedding.ts.',
    },
    {
      id: 's2',
      dateLabel: '[Tahun]',
      title: 'Menjalin Kasih',
      body: 'Kisah awal hubungan kalian — momen kecil yang membuat semuanya bermula.',
    },
    {
      id: 's3',
      dateLabel: '[Tanggal]',
      title: 'Lamaran',
      body: 'Kedua keluarga bertemu dan restu pun diberikan. Tuliskan kenangan lamaran di sini.',
    },
    {
      id: 's4',
      dateLabel: '12 Juni 2027',
      title: 'Hari Pawiwahan',
      body: 'Hari ketika dua keluarga dipersatukan. Kami menantikan kehadiran dan doa restu Anda.',
    },
  ],

  gift: {
    intro:
      'Doa restu Anda adalah karunia terindah bagi kami. Namun apabila Anda ingin memberikan tanda kasih, kami menyediakan amplop digital berikut.',
    accounts: [
      {
        id: 'acc1',
        bankName: '[Nama Bank]',
        accountHolder: '[Nama Pemilik Rekening]',
        accountNumber: '0000000000',
        isPlaceholder: true,
      },
    ],
    qrisImage: null,
    thanks: 'Matur nuwun sanget atas segala perhatian dan tanda kasih Anda.',
  },

  audio: {
    src: null,
    title: 'Suasana gamelan',
    credit: 'Lantunan slendro yang disintesis langsung di peramban (bukan rekaman). Ganti dengan musik berlisensi di src/config/wedding.ts.',
  },

  closing: {
    title: 'Matur Nuwun',
    message:
      'Merupakan suatu kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
    prayer: 'Mugi rahayu ingkang sami pinanggih — semoga keselamatan menyertai kita semua.',
    signOff: 'Kami yang berbahagia',
  },

  hashtag: '#SekarBagusPawiwahan',
}
