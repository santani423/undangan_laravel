import { galleryImages } from '../data/gallery';
import { projectAsset } from './assets';
import type { InvitationConfig } from '../types/invitation';

/**
 * ✏️  Edit this file to personalise the invitation.
 * Components never hard-code birthday details — everything comes from here.
 * Demo data below is fictional; replace names, dates, venue and accounts.
 */
export const invitationConfig: InvitationConfig = {
  child: {
    fullName: 'Kirana Ayu Lestari',
    nickname: 'Kirana',
    age: 6,
    portrait: projectAsset('gallery/portrait-kirana.svg'),
    portraitAlt: 'Ilustrasi potret Kirana memakai topi pesta',
    parentsLine: 'Putri tercinta dari Bapak Arif Pratama & Ibu Dewi Lestari',
    favorites: ['Dinosaurus', 'Menggambar', 'Es krim stroberi', 'Balok susun'],
  },
  invitation: {
    eyebrow: 'Undangan Ulang Tahun',
    title: 'Petualangan di Dunia Mainan',
    coverMessage: 'Ayo ikut berpetualang dan merayakan hari spesial bersama kami!',
    welcomeMessage:
      'Hore! Kirana genap 6 tahun. Kami mengundang teman-teman dan keluarga untuk bermain, tertawa, dan meniup lilin bersama di Dunia Mainan Kirana.',
    guestQueryParam: 'to',
    defaultGuestName: 'Teman Kirana',
    hashtag: '#KiranaGenap6',
    closingMessage:
      'Kehadiran dan doa baik Anda adalah kado terindah bagi Kirana. Sampai jumpa di pesta, ya!',
    signature: 'Kirana, Ayah & Bunda',
  },
  event: {
    title: 'Pesta Ulang Tahun Kirana',
    startISO: '2026-11-14T15:00:00+07:00',
    endISO: '2026-11-14T18:00:00+07:00',
    timeZone: 'Asia/Jakarta',
    timeZoneLabel: 'WIB',
    venueName: 'Taman Bermain Pelangi',
    venueDetail: 'Aula Ceria, Lantai 1',
    address: 'Jl. Kenanga Raya No. 21, Kemang, Mampang Prapatan, Jakarta Selatan 12730',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent('Jl. Kenanga Raya No. 21, Kemang, Jakarta Selatan'),
    dressCode: 'Kostum mainan favorit — boleh jadi robot, boneka, atau dinosaurus!',
    notes: 'Tersedia area bermain anak dan ruang ganti popok.',
  },
  gallery: galleryImages,
  rsvp: {
    enabled: true,
    // Set to your API URL (e.g. a serverless function) to store RSVPs for real.
    endpoint: null,
    maxCompanions: 4,
    deadlineISO: '2026-11-10T23:59:00+07:00',
    wishMaxLength: 280,
    attendanceOptions: [
      { value: 'hadir', label: 'Hadir', hint: 'Aku datang!' },
      { value: 'ragu', label: 'Masih Ragu', hint: 'Akan dikabari' },
      { value: 'tidak', label: 'Tidak Hadir', hint: 'Kirim doa saja' },
    ],
  },
  digitalGift: {
    enabled: true,
    title: 'Kado Digital',
    message:
      'Doa restu Anda sudah lebih dari cukup. Namun bila ingin mengirim tanda kasih, Anda dapat menggunakan informasi berikut.',
    accounts: [
      { id: 'bca', kind: 'bank', provider: 'BCA', number: '1234567890', holder: 'Dewi Lestari' },
      { id: 'dana', kind: 'ewallet', provider: 'DANA', number: '081234567890', holder: 'Arif Pratama' },
    ],
    shippingAddress: {
      recipient: 'Keluarga Arif Pratama',
      address: 'Jl. Melati Indah No. 8, Cilandak, Jakarta Selatan 12430',
      phone: '0812-3456-7890',
    },
  },
  music: {
    // Drop a licensed track in public/assets/audio/ and point to it, e.g.
    // src: projectAsset('audio/lagu-pesta.mp3'),
    src: null,
    title: 'Kotak Musik Dunia Mainan',
    credit: 'Melodi kotak musik orisinal, dibuat langsung di browser',
    volume: 0.5,
    useGeneratedFallback: true,
  },
  theme: {
    sky: '#7cc7f0',
    coral: '#ff7b84',
    butter: '#ffd166',
    mint: '#7fdcb0',
    lavender: '#b9a6f2',
    cream: '#fff6e5',
    ink: '#3b3355',
  },
  showDemoNotices: true,
};
