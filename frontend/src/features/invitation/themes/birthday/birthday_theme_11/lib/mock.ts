/* Data contoh untuk simulasi tema tanpa backend, mis. <BirthdayTheme11 invitation={MOCK_INVITATION} />.
   Tanpa rsvpEndpoint/wishesEndpoint, RSVP & ucapan memakai penyimpanan demo di peramban.
   Semua nama, alamat, dan nomor rekening di sini fiktif. */
import type { BirthdayInvitation } from '@/types/invitation';
import type { Wish } from './types';

export const MOCK_INVITATION: BirthdayInvitation = {
    type: 'birthday',
    code: 'demo-bt11',
    slug: 'demo-bt11',
    title: 'Ulang Tahun Alya ke-5',
    guestName: '',
    countdownDate: '2026-12-05T15:00:00',
    pageTitle: 'Undangan Ulang Tahun Alya · Petualangan Gigi Ceria',
    mainDateFormatted: 'Sabtu, 5 Desember 2026',
    events: [
        {
            name: 'Pesta Ulang Tahun Alya',
            date: '2026-12-05',
            dateFormatted: 'Sabtu, 5 Desember 2026',
            time: '15:00:00',
            timeEnd: '18:00:00',
            locationName: 'Taman Pesta Pelangi Ceria (contoh)',
            location: 'Jl. Pelangi Ceria No. 12, Kebayoran Baru, Jakarta Selatan 12160',
            locationUrl: '',
            mapsEmbed: '',
            mapsLat: '',
            mapsLng: '',
            isCountdown: true,
        },
    ],
    gallery: [],
    bankAccounts: [{ bankName: 'Bank Contoh', accountNumber: '1234567890', accountName: 'Lestari Wulandari' }],
    digitalWallets: [{ provider: 'gopay', label: 'GoPay', accountNumber: '081234567890', accountName: 'Teguh Prasetyo', logoUrl: '' }],
    allowComments: true,
    rsvpEndpoint: '',
    wishesEndpoint: '',
    isSample: true,
    greeting: { title: 'Kepada Yth.', guestLabel: 'Teman Alya', buttonText: 'Mulai petualangan', message: null },
    celebrantName: 'Alya Nadhira Putri',
    celebrantNickname: 'Alya',
    celebrantAge: '5',
    celebrantBio: '',
    celebrantPhoto: '',
    parentName: 'Bapak Teguh Prasetyo & Ibu Lestari Wulandari',
    lifeJourney: [],
};

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600e3).toISOString();

/** Ucapan contoh yang mengisi daftar ucapan demo. */
export const MOCK_WISHES: Wish[] = [
    {
        id: 'contoh-1',
        name: 'Tante Rina',
        message: 'Selamat ulang tahun, Alya! Semoga senyummu selalu secerah hari ini.',
        submittedAt: hoursAgo(4),
        example: true,
    },
    {
        id: 'contoh-2',
        name: 'Bima & Keluarga',
        message: 'Hore, sampai ketemu di pesta! Kita adu sikat gigi paling bersih, ya!',
        submittedAt: hoursAgo(27),
        example: true,
    },
    {
        id: 'contoh-3',
        name: 'Opa Hendra',
        message: 'Opa belum bisa datang, tapi doa terbaik selalu untuk cucu Opa tersayang.',
        submittedAt: hoursAgo(52),
        example: true,
    },
];
