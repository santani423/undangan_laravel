/* Data contoh untuk simulasi tema tanpa backend, mis. <BirthdayTheme10 invitation={MOCK_INVITATION} />.
   Tanpa rsvpEndpoint/wishesEndpoint, RSVP & ucapan memakai penyimpanan demo di peramban.
   Semua nama, alamat, dan nomor rekening di sini fiktif. */
import type { BirthdayInvitation } from '@/types/invitation';
import type { Wish } from './types';

export const MOCK_INVITATION: BirthdayInvitation = {
    type: 'birthday',
    code: 'demo-bt10',
    slug: 'demo-bt10',
    title: 'Ulang Tahun Kirana ke-6',
    guestName: '',
    countdownDate: '2026-11-14T15:00:00',
    pageTitle: 'Undangan Ulang Tahun Kirana · Dunia Mainan',
    mainDateFormatted: 'Sabtu, 14 November 2026',
    events: [
        {
            name: 'Pesta Ulang Tahun Kirana',
            date: '2026-11-14',
            dateFormatted: 'Sabtu, 14 November 2026',
            time: '15:00:00',
            timeEnd: '18:00:00',
            locationName: 'Taman Bermain Pelangi (contoh)',
            location: 'Jl. Kenanga Raya No. 21, Kemang, Mampang Prapatan, Jakarta Selatan 12730',
            locationUrl: '',
            mapsEmbed: '',
            mapsLat: '',
            mapsLng: '',
            isCountdown: true,
        },
    ],
    gallery: [],
    bankAccounts: [{ bankName: 'Bank Contoh', accountNumber: '1234567890', accountName: 'Dewi Lestari' }],
    digitalWallets: [{ provider: 'dana', label: 'DANA', accountNumber: '081234567890', accountName: 'Arif Pratama', logoUrl: '' }],
    allowComments: true,
    rsvpEndpoint: '',
    wishesEndpoint: '',
    isSample: true,
    greeting: { title: 'Kepada Yth.', guestLabel: 'Teman Kirana', buttonText: 'Buka Undangan', message: null },
    celebrantName: 'Kirana Ayu Lestari',
    celebrantNickname: 'Kirana',
    celebrantAge: '6',
    celebrantBio: '',
    celebrantPhoto: '',
    parentName: 'Bapak Arif Pratama & Ibu Dewi Lestari',
    lifeJourney: [
        { date: '2020', title: 'Hari Pertama di Dunia', desc: 'Kirana lahir dan membawa kebahagiaan untuk seluruh keluarga.' },
        { date: '2021', title: 'Langkah Pertama', desc: 'Satu langkah kecil, lalu berlari mengejar balon kesayangan.' },
        { date: '2024', title: 'Hari Pertama Sekolah', desc: 'Berangkat dengan tas baru, berani dan penuh semangat.' },
    ],
};

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600e3).toISOString();

/** Ucapan contoh yang mengisi dinding ucapan demo. */
export const MOCK_WISHES: Wish[] = [
    {
        id: 'contoh-1',
        name: 'Tante Rina',
        attendance: 'hadir',
        wish: 'Selamat ulang tahun, sayang! Semoga makin pintar, sehat, dan selalu ceria.',
        submittedAt: hoursAgo(5),
        example: true,
    },
    {
        id: 'contoh-2',
        name: 'Bima & Keluarga',
        attendance: 'hadir',
        wish: 'Hore, sampai ketemu di pesta! Kita main balok bareng ya!',
        submittedAt: hoursAgo(26),
        example: true,
    },
    {
        id: 'contoh-3',
        name: 'Opa Hendra',
        attendance: 'tidak',
        wish: 'Maaf Opa belum bisa datang. Doa terbaik untuk cucu Opa tersayang.',
        submittedAt: hoursAgo(50),
        example: true,
    },
];
