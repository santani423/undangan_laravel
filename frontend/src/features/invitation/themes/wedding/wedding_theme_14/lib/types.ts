export type Vec3 = [number, number, number];

/* ───────────── Wedding content (built from the invitation in lib/data.ts) ───────────── */

export interface Person {
    fullName: string;
    nickname: string;
    /** e.g. "Putri pertama dari" */
    childOrder: string;
    parents: string;
    /** Portrait URL. Empty → kawung monogram placeholder. */
    photo: string;
    instagram: string;
}

export interface CoupleConfig {
    bride: Person;
    groom: Person;
    openingGreeting: string;
    openingMessage: string;
    verse: { text: string; translation: string; source: string };
}

export type EventKind = 'akad' | 'resepsi' | 'other';

export interface EventItem {
    id: string;
    kind: EventKind;
    title: string;
    subtitle: string;
    /** "Sabtu, 12 Juni 2027" */
    dateLabel: string;
    /** "08.00 – 10.00 WIB" */
    timeLabel: string;
    /** ISO-8601 with offset, used for the calendar links. Empty when the event has no date. */
    start: string;
    end: string;
    venueName: string;
    address: string;
    /** URL opened by the "Buka Google Maps" button. Empty → button hidden. */
    mapsUrl: string;
}

export interface GalleryItem {
    id: string;
    src: string;
    alt: string;
    caption: string;
    orientation: 'portrait' | 'landscape';
}

export interface GalleryVideo {
    /** Direct video file (mp4/webm) or an embeddable player URL (YouTube/Vimeo). Empty → none. */
    src: string;
    kind: 'file' | 'embed';
    title: string;
}

export interface StoryMilestone {
    id: string;
    dateLabel: string;
    title: string;
    body: string;
    photo: string;
}

export interface GiftAccount {
    id: string;
    bankName: string;
    accountHolder: string;
    accountNumber: string;
}

export interface GiftQris {
    id: string;
    label: string;
    src: string;
}

export interface GiftConfig {
    intro: string;
    accounts: GiftAccount[];
    qris: GiftQris[];
    thanks: string;
}

export interface AudioConfig {
    /** Background track URL. Empty → generative Web Audio gamelan chime. */
    src: string;
    autoplay: boolean;
    loop: boolean;
    title: string;
    credit: string;
}

export interface ClosingConfig {
    title: string;
    message: string;
    prayer: string;
    signOff: string;
}

export interface GuestConfig {
    /** Personalised guest name (invitation link, visitor, or ?to=). Empty → `label`. */
    name: string;
    title: string;
    label: string;
    buttonText: string;
    qrData: string;
    slug: string;
}

export interface RsvpConfig {
    endpoint: string;
    wishesEndpoint: string;
    allowComments: boolean;
    /** "20 Mei 2027" — shown above the form when set. */
    deadline: string;
    /** localStorage key for the demo store (no endpoint). */
    storageKey: string;
}

/** Which invitation sections are switched on (invitation features + available content). */
export interface SectionFlags {
    cover: boolean;
    guest: boolean;
    couple: boolean;
    countdown: boolean;
    calendar: boolean;
    events: boolean;
    location: boolean;
    gallery: boolean;
    video: boolean;
    story: boolean;
    rsvp: boolean;
    wishes: boolean;
    gift: boolean;
    music: boolean;
    footer: boolean;
}

export interface WeddingConfig {
    /** True for theme sample invitations: a small notice says names, dates and accounts are examples. */
    isExampleData: boolean;
    invitationTitle: string;
    invitationSubtitle: string;
    couple: CoupleConfig;
    /** Main date (ISO with offset) used by the countdown. Empty → countdown hidden. */
    mainDate: string;
    mainDateLabel: string;
    events: EventItem[];
    dressCodes: { name: string; hex: string }[];
    gallery: GalleryItem[];
    galleryVideo: GalleryVideo;
    story: StoryMilestone[];
    gift: GiftConfig;
    audio: AudioConfig;
    closing: ClosingConfig;
    hashtag: string;
    guest: GuestConfig;
    rsvp: RsvpConfig;
    sections: SectionFlags;
}

/* ───────────── Journey / scene system ───────────── */

export type SceneId = 'gate' | 'pendopo' | 'garden' | 'ceremony' | 'gallery' | 'story' | 'rsvp' | 'gift' | 'closing';

export type PanelSide = 'left' | 'right' | 'center';

export interface SceneConfig {
    id: SceneId;
    /** Indonesian label */
    label: string;
    /** Javanese place name used as an eyebrow */
    javanese: string;
    /** Normalized scroll range [start, end] the scene "owns" */
    range: [number, number];
    /** Progress where the panel fades in / starts fading out. */
    panel: { in: number; out: number; side: PanelSide };
    /** Progress a navigation jump lands on (inside the camera hold). */
    navAt: number;
}

/** One continuous camera move. Holds settle the camera; travels connect scenes. */
export interface CameraShot {
    kind: 'hold' | 'travel';
    at: [number, number];
    positions: Vec3[];
    targets: Vec3[];
}

export interface LightingKey {
    at: number;
    skyTop: string;
    skyHorizon: string;
    skyBottom: string;
    sunColor: string;
    sunIntensity: number;
    /** Degrees above horizon */
    sunElevation: number;
    /** Degrees, 0 = +Z, 90 = +X */
    sunAzimuth: number;
    hemiSky: string;
    hemiGround: string;
    hemiIntensity: number;
    fogNear: number;
    fogFar: number;
    /** 0–1 lantern emissive strength */
    lanternGlow: number;
    /** 0–1 star visibility */
    stars: number;
    exposure: number;
}

/* ───────────── RSVP ───────────── */

export type Attendance = 'hadir' | 'tidak' | 'ragu';

export interface RsvpSubmission {
    name: string;
    attendance: Attendance;
    guests: number;
    message: string;
}

/** One guestbook entry. Server wishes carry no attendance and a ready-made date label. */
export interface RsvpRecord {
    id: string;
    name: string;
    message: string;
    attendance?: Attendance;
    guests?: number;
    /** ISO time (local entries) or the server's "2 jam yang lalu". */
    when: string;
    storage: 'local' | 'remote';
}

export type QualityTier = 'high' | 'medium' | 'low';
