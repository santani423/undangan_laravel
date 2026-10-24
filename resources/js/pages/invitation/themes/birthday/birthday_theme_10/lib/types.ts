/* Tipe data tema — bentuk InvitationConfig desain asli, diisi dari BirthdayInvitation (lib/data.ts). */

/** Navigation sections of the invitation (one per 3D destination). */
export type SectionId = 'beranda' | 'profil' | 'acara' | 'galeri' | 'rsvp';

/** Where the HTML panel sits on wide screens while a camera stop is active. */
export type PanelSide = 'left' | 'right' | 'center';

export type Attendance = 'hadir' | 'tidak' | 'ragu';

export interface GalleryImage {
    id: string;
    src: string;
    alt: string;
    caption: string;
    /** Bundled placeholder art (sample invitations without photos). */
    demo?: boolean;
}

export interface GiftAccount {
    id: string;
    kind: 'bank' | 'ewallet';
    provider: string;
    number: string;
    holder: string;
    qrisUrl?: string;
}

export interface Milestone {
    period: string;
    title: string;
    text: string;
}

export interface PartyEvent {
    id: string;
    title: string;
    /** ISO 8601 with offset; empty when the invitation has no valid date. */
    startISO: string;
    endISO: string;
    dateLabel: string;
    timeLabel: string;
    venueName: string;
    address: string;
    mapUrl: string;
}

export interface FeatureFlags {
    cover: boolean;
    greeting: boolean;
    profile: boolean;
    event: boolean;
    countdown: boolean;
    location: boolean;
    calendar: boolean;
    gallery: boolean;
    rsvp: boolean;
    wishes: boolean;
    gift: boolean;
    music: boolean;
    confetti: boolean;
    footer: boolean;
}

export interface ToyConfig {
    meta: { slug: string; code: string; guestSlug: string; isSample: boolean };
    guest: { name: string; personalised: boolean; label: string };
    child: {
        fullName: string;
        nickname: string;
        /** Whole years for candles and badges; `null` when the invitation has no usable age. */
        age: number | null;
        portrait: string;
        portraitAlt: string;
        parentsLine: string;
        journey: Milestone[];
    };
    invitation: {
        eyebrow: string;
        title: string;
        coverMessage: string;
        buttonText: string;
        welcomeMessage: string;
        hashtag: string;
        closingMessage: string;
        signature: string;
    };
    /** Main party (the countdown event, else the first one). */
    event: PartyEvent | null;
    otherEvents: PartyEvent[];
    countdownISO: string;
    timeZoneLabel: string;
    dressCode: string;
    gallery: GalleryImage[];
    rsvp: {
        endpoint: string;
        maxCompanions: number;
        wishMaxLength: number;
        attendanceOptions: { value: Attendance; label: string; hint: string }[];
    };
    wishesEndpoint: string;
    gift: { title: string; message: string; accounts: GiftAccount[] };
    music: {
        /** Uploaded track; `null` uses the generated music box. */
        src: string | null;
        autoplay: boolean;
        loop: boolean;
        title: string;
        volume: number;
    };
    features: FeatureFlags;
    /** Shows small "contoh" badges next to placeholder data (theme previews). */
    showDemoNotices: boolean;
}

export interface RsvpPayload {
    name: string;
    attendance: Attendance;
    companions: number;
    wish: string;
    submittedAt: string;
}

export interface Wish {
    id: string;
    name: string;
    wish: string;
    attendance?: Attendance;
    /** ISO date (entries written in this browser). */
    submittedAt?: string;
    /** Ready-made label from the server, e.g. "2 hari yang lalu". */
    dateLabel?: string;
    /** Seeded example wishes shown in demo mode. */
    example?: boolean;
}
