import type { InvitationConfig } from '../types/invitation';

/**
 * SAMPLE CONFIGURATION — replace every placeholder with data supplied by the
 * invitation owner. Nothing here is real personal, venue, or payment data.
 *
 * - Names, parents, photos and social links: owner-supplied only.
 * - Account numbers / QRIS: leave empty until the owner provides them; the UI
 *   shows a placeholder instead of a copy button.
 * - Backend: set VITE_RSVP_ENDPOINT / VITE_GUESTBOOK_ENDPOINT (see README) to
 *   leave the local demo mode.
 */
export const invitation: InvitationConfig = {
  meta: {
    isSample: true,
    slug: 'contoh-undangan',
    locale: 'id-ID',
  },

  couple: {
    order: 'bride-first',
    bride: {
      nickname: 'Mempelai Wanita',
      fullName: 'Nama Lengkap Mempelai Wanita',
      childOrder: 'Putri dari',
      father: 'Bapak (Nama Ayah)',
      mother: 'Ibu (Nama Ibu)',
    },
    groom: {
      nickname: 'Mempelai Pria',
      fullName: 'Nama Lengkap Mempelai Pria',
      childOrder: 'Putra dari',
      father: 'Bapak (Nama Ayah)',
      mother: 'Ibu (Nama Ibu)',
    },
  },

  greeting: {
    recipientPrefix: 'Kepada Yth. Bapak/Ibu/Saudara/i',
    defaultRecipient: 'Tamu Undangan',
    coverNote: 'Tanpa mengurangi rasa hormat, kami mengundang Anda untuk hadir di hari bahagia kami.',
    heroMessage:
      'Dengan penuh syukur dan sukacita, kami mengundang Anda untuk menyaksikan dan merayakan awal perjalanan kami sebagai pasangan suami istri.',
    quote: {
      text: 'Di antara begitu banyak taman, kami memilih untuk tumbuh bersama.',
    },
  },

  weddingDate: '2027-03-20T08:00:00+07:00',
  weddingTimeZone: 'Asia/Jakarta',

  events: [
    {
      id: 'akad',
      name: 'Akad Nikah',
      description: 'Prosesi sakral yang dihadiri keluarga dan kerabat dekat.',
      start: '2027-03-20T08:00:00+07:00',
      end: '2027-03-20T10:00:00+07:00',
      timeZone: 'Asia/Jakarta',
      timeZoneLabel: 'WIB',
      venueName: 'Nama Venue Acara (contoh)',
      address: 'Jl. Nama Jalan No. 00, Kelurahan, Kecamatan, Kota, Provinsi 00000',
      coordinates: { lat: -6.5976, lng: 106.7996 },
    },
    {
      id: 'resepsi',
      name: 'Resepsi',
      description: 'Ramah tamah dan perayaan bersama seluruh tamu undangan.',
      start: '2027-03-20T11:00:00+07:00',
      end: '2027-03-20T14:00:00+07:00',
      timeZone: 'Asia/Jakarta',
      timeZoneLabel: 'WIB',
      venueName: 'Nama Venue Acara (contoh)',
      address: 'Jl. Nama Jalan No. 00, Kelurahan, Kecamatan, Kota, Provinsi 00000',
      coordinates: { lat: -6.5976, lng: 106.7996 },
    },
  ],

  location: {
    venueName: 'Nama Venue Acara (contoh)',
    address: 'Jl. Nama Jalan No. 00, Kelurahan, Kecamatan, Kota, Provinsi 00000',
    // SAMPLE coordinates (a public botanical garden) so the map preview can be
    // demonstrated. Replace with the real venue coordinates or `mapsUrl`.
    coordinates: { lat: -6.5976, lng: 106.7996 },
    notes: 'Area parkir tersedia di sekitar lokasi. Gunakan alas kaki yang nyaman untuk area taman.',
  },

  loveStory: [
    {
      id: 'meet',
      dateLabel: 'Tahun pertemuan',
      title: 'Pertemuan Pertama',
      description: 'Ceritakan di mana dan bagaimana kalian pertama kali bertemu. Ganti teks contoh ini dengan kisah kalian.',
      icon: 'meet',
    },
    {
      id: 'together',
      dateLabel: 'Tahun bersama',
      title: 'Memulai Perjalanan',
      description: 'Bagikan momen ketika kalian memutuskan untuk melangkah bersama.',
      icon: 'heart',
    },
    {
      id: 'milestone',
      dateLabel: 'Momen istimewa',
      title: 'Tumbuh Bersama',
      description: 'Tambahkan pencapaian, perjalanan, atau kenangan yang paling berarti bagi kalian berdua.',
      icon: 'star',
    },
    {
      id: 'engagement',
      dateLabel: 'Hari lamaran',
      title: 'Lamaran',
      description: 'Ceritakan momen lamaran dan restu yang diberikan keluarga.',
      icon: 'ring',
    },
    {
      id: 'wedding',
      dateLabel: '20 Maret 2027',
      title: 'Hari Pernikahan',
      description: 'Babak baru dimulai di taman ini — dan kami ingin Anda menjadi bagian darinya.',
      icon: 'calendar',
    },
  ],

  gallery: [
    {
      id: 'portrait-1',
      kind: 'image',
      category: 'portrait',
      src: '/gallery/placeholder-portrait-1.svg',
      alt: 'Ilustrasi contoh pengganti foto potret pasangan',
      caption: 'Foto potret pasangan (contoh)',
      width: 900,
      height: 1200,
      isPlaceholder: true,
    },
    {
      id: 'prewedding-1',
      kind: 'image',
      category: 'prewedding',
      src: '/gallery/placeholder-prewedding-1.svg',
      alt: 'Ilustrasi contoh pengganti foto prewedding di taman',
      caption: 'Foto prewedding (contoh)',
      width: 1200,
      height: 900,
      isPlaceholder: true,
    },
    {
      id: 'engagement-1',
      kind: 'image',
      category: 'engagement',
      src: '/gallery/placeholder-engagement-1.svg',
      alt: 'Ilustrasi contoh pengganti foto lamaran',
      caption: 'Foto lamaran (contoh)',
      width: 1200,
      height: 900,
      isPlaceholder: true,
    },
    {
      id: 'portrait-2',
      kind: 'image',
      category: 'portrait',
      src: '/gallery/placeholder-portrait-2.svg',
      alt: 'Ilustrasi contoh pengganti foto potret kedua',
      caption: 'Foto potret (contoh)',
      width: 900,
      height: 1200,
      isPlaceholder: true,
    },
    {
      id: 'prewedding-2',
      kind: 'image',
      category: 'prewedding',
      src: '/gallery/placeholder-prewedding-2.svg',
      alt: 'Ilustrasi contoh pengganti foto prewedding saat senja',
      caption: 'Foto prewedding senja (contoh)',
      width: 1200,
      height: 900,
      isPlaceholder: true,
    },
    {
      id: 'engagement-2',
      kind: 'image',
      category: 'engagement',
      src: '/gallery/placeholder-engagement-2.svg',
      alt: 'Ilustrasi contoh pengganti foto cincin lamaran',
      caption: 'Detail cincin lamaran (contoh)',
      width: 1200,
      height: 900,
      isPlaceholder: true,
    },
    {
      id: 'video-1',
      kind: 'video',
      category: 'video',
      // Add `src: '/media/wedding.mp4'` or `youtubeId: '...'` supplied by the owner.
      poster: '/gallery/placeholder-video.svg',
      alt: 'Tempat video pernikahan — belum ditambahkan',
      caption: 'Video pernikahan (belum ditambahkan)',
      width: 1200,
      height: 675,
      isPlaceholder: true,
    },
  ],

  rsvp: {
    enabled: true,
    deadline: '2027-03-06T23:59:00+07:00',
    maxAttendees: 4,
    note: 'Mohon konfirmasi kehadiran agar kami dapat menyiapkan jamuan dengan baik.',
  },

  guestbook: { enabled: true, pageSize: 6 },

  dressCode: {
    title: 'Garden Formal',
    description:
      'Acara berlangsung di area taman. Kami menyarankan busana formal yang ringan dengan nuansa warna lembut agar serasi dengan suasana taman.',
    recommendations: [
      { label: 'Tamu pria', detail: 'Kemeja batik, kemeja lengan panjang, atau setelan jas berwarna lembut.' },
      { label: 'Tamu wanita', detail: 'Kebaya, gaun midi, atau busana formal berbahan ringan.' },
      { label: 'Alas kaki', detail: 'Sepatu bertumit lebar atau flat agar nyaman di area berumput.' },
    ],
    palette: [
      { name: 'Ivory', hex: '#F5EDDD' },
      { name: 'Champagne', hex: '#E8D5B0' },
      { name: 'Sage', hex: '#8FAE7E' },
      { name: 'Dusty Rose', hex: '#C9858C' },
      { name: 'Gold', hex: '#C9A25C' },
    ],
    notes: ['Mohon hindari busana serba putih.', 'Palet warna bersifat saran, bukan kewajiban.'],
  },

  gift: {
    message:
      'Doa restu Anda merupakan karunia terindah bagi kami. Namun, jika Anda ingin memberikan tanda kasih, Anda dapat mengirimkannya melalui:',
    accounts: [
      { id: 'bank-1', type: 'bank', provider: 'Nama Bank', accountNumber: '', accountHolder: 'Nama Pemilik Rekening' },
      { id: 'ewallet-1', type: 'ewallet', provider: 'Nama E-Wallet', accountNumber: '', accountHolder: 'Nama Pemilik Akun' },
    ],
    // qris: { image: '/media/qris.png', alt: 'Kode QRIS untuk tanda kasih', label: 'QRIS' },
    physicalGift: { recipient: 'Nama Penerima Kado', address: '' },
  },

  music: {
    title: 'Taman Senja',
    artist: 'Komposisi ambient orisinal',
    credit: 'Disintesis langsung di peramban — tanpa file audio pihak ketiga.',
    volume: 0.55,
    playOnOpen: true,
  },

  closing: {
    title: 'Terima Kasih',
    message:
      'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
    prayer: 'Semoga cinta yang tumbuh di taman ini senantiasa dirawat dengan kesabaran, kejujuran, dan kasih sayang.',
    signature: 'Kami yang berbahagia',
  },

  backend: {
    rsvpEndpoint: import.meta.env.VITE_RSVP_ENDPOINT || undefined,
    guestbookEndpoint: import.meta.env.VITE_GUESTBOOK_ENDPOINT || undefined,
  },
};
