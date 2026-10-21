/* Data contoh untuk simulasi tema tanpa backend, mis. <WeddingTheme16 invitation={MOCK_INVITATION} />.
   Tanpa rsvpEndpoint/wishesEndpoint, RSVP & buku tamu memakai penyimpanan demo di peramban.
   Semua nama, alamat, dan nomor rekening di sini fiktif. */
import type { WeddingInvitation } from '@/types/invitation';
import type { GuestbookEntry } from '../services/guestbookService';

export const MOCK_INVITATION: WeddingInvitation = {
    type: 'wedding',
    code: 'demo-wt16',
    slug: 'demo-wt16',
    title: 'Pernikahan Laras & Damar',
    guestName: '',
    countdownDate: '2027-03-20T08:00:00',
    pageTitle: 'Laras & Damar — Undangan Pernikahan',
    mainDateFormatted: 'Sabtu, 20 Maret 2027',
    events: [
        {
            name: 'Akad Nikah',
            date: '2027-03-20',
            dateFormatted: 'Sabtu, 20 Maret 2027',
            time: '08:00',
            timeEnd: '10:00',
            locationName: 'Taman Kenanga (contoh)',
            location: 'Jl. Kenanga No. 12, Bogor Tengah, Kota Bogor',
            locationUrl: '',
            mapsEmbed: '',
            // Sample coordinates of a public botanical garden, for the map preview only.
            mapsLat: '-6.5976',
            mapsLng: '106.7996',
            isCountdown: true,
        },
        {
            name: 'Resepsi',
            date: '2027-03-20',
            dateFormatted: 'Sabtu, 20 Maret 2027',
            time: '11:00',
            timeEnd: '14:00',
            locationName: 'Taman Kenanga (contoh)',
            location: 'Jl. Kenanga No. 12, Bogor Tengah, Kota Bogor',
            locationUrl: '',
            mapsEmbed: '',
            mapsLat: '-6.5976',
            mapsLng: '106.7996',
            isCountdown: false,
        },
    ],
    gallery: [],
    coupleVideoUrl: '',
    bankAccounts: [{ bankName: 'Bank Contoh', accountNumber: '1234567890', accountName: 'Laras Ayuningtyas' }],
    digitalWallets: [{ provider: 'gopay', label: 'GoPay', accountNumber: '081234567890', accountName: 'Damar Wicaksono', logoUrl: '' }],
    allowComments: true,
    rsvpEndpoint: '',
    wishesEndpoint: '',
    isSample: true,
    groomFullName: 'Damar Wicaksono',
    groomNickname: 'Damar',
    groomInitials: 'D',
    groomChildOrder: '1',
    groomFather: 'Bapak Hendra Wicaksono',
    groomMother: 'Ibu Ratna Sari',
    groomBio: '',
    groomPhoto: '',
    groomInstagram: '',
    brideFullName: 'Laras Ayuningtyas',
    brideNickname: 'Laras',
    brideInitials: 'L',
    brideChildOrder: '2',
    brideFather: 'Bapak Arif Santoso',
    brideMother: 'Ibu Dewi Anggraini',
    brideBio: '',
    bridePhoto: '',
    brideInstagram: '',
    couplePhoto: '',
    loveStory: [
        {
            date: '2019',
            title: 'Pertemuan Pertama',
            desc: 'Kami pertama kali bertemu di sebuah lokakarya berkebun. Satu pot bunga yang tertukar menjadi awal obrolan panjang.',
        },
        {
            date: '2021',
            title: 'Memulai Perjalanan',
            desc: 'Dari kopi pagi sampai perjalanan pulang yang panjang, kami memutuskan untuk melangkah bersama.',
        },
        {
            date: '2023',
            title: 'Tumbuh Bersama',
            desc: 'Kami belajar merawat satu sama lain dengan sabar, seperti merawat taman kecil di halaman rumah.',
        },
        {
            date: '2026',
            title: 'Lamaran',
            desc: 'Di bawah pohon sakura yang sedang mekar, sebuah pertanyaan sederhana dijawab dengan senyum bahagia.',
        },
        {
            date: '20 Maret 2027',
            title: 'Hari Pernikahan',
            desc: 'Babak baru dimulai di taman ini — dan kami ingin Anda menjadi bagian darinya.',
        },
    ],
    dressCodes: [
        { name: 'Ivory', hex: '#F5EDDD' },
        { name: 'Champagne', hex: '#E8D5B0' },
        { name: 'Sage', hex: '#8FAE7E' },
        { name: 'Dusty Rose', hex: '#C9858C' },
        { name: 'Gold', hex: '#C9A25C' },
    ],
    rsvpDeadline: '2027-03-06',
    openingQuote: '',
};

/** Ucapan contoh yang mengisi buku tamu demo pada kunjungan pertama. */
export const MOCK_WISHES: GuestbookEntry[] = [
    {
        id: 'contoh-1',
        name: 'Nadia & Keluarga',
        message: 'Selamat menempuh hidup baru! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.',
        createdAt: new Date(Date.now() - 2 * 3600e3).toISOString(),
    },
    {
        id: 'contoh-2',
        name: 'Bima',
        message: 'Bahagia selalu kalian berdua. Sampai jumpa di taman!',
        createdAt: new Date(Date.now() - 26 * 3600e3).toISOString(),
    },
];
