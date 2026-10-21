/* Bentuk data yang dibaca komponen & taman 3D tema 16 — diisi dari WeddingInvitation oleh lib/data.ts.
   Diturunkan dari src/types/invitation.ts desain asli. */

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface Person {
    /** Short name used in large display typography. */
    nickname: string;
    fullName: string;
    /** e.g. "Putri pertama dari" / "Putra kedua dari". */
    childOrder: string;
    father: string;
    mother: string;
    /** Portrait URL. Empty shows a placeholder. */
    photo: string;
    /** Instagram handle without "@". Only rendered when provided. */
    instagram: string;
    bio: string;
}

export interface WeddingEvent {
    id: string;
    /** e.g. "Akad Nikah", "Resepsi". */
    name: string;
    description?: string;
    /** ISO-8601 date-time with offset; empty when the invitation has no valid date. */
    start: string;
    end?: string;
    /** IANA zone used for display, e.g. "Asia/Jakarta". */
    timeZone: string;
    /** Abbreviation shown to guests, e.g. "WIB". */
    timeZoneLabel: string;
    /** "Sabtu, 20 Maret 2027" — empty when unknown. */
    dateLabel: string;
    /** "08.00 – 10.00 WIB" — empty when the event has no time. */
    timeLabel: string;
    venueName: string;
    address: string;
    coordinates?: Coordinates;
    /** Explicit Google Maps URL; overrides the coordinates/address search link. */
    mapsUrl?: string;
    /** Explicit iframe embed URL. */
    embedUrl?: string;
}

export interface VenueLocation {
    venueName: string;
    address: string;
    coordinates?: Coordinates;
    mapsUrl?: string;
    embedUrl?: string;
    notes?: string;
}

export type MilestoneIcon = 'meet' | 'heart' | 'star' | 'ring' | 'calendar';

export interface LoveStoryMilestone {
    id: string;
    dateLabel: string;
    title: string;
    description: string;
    icon: MilestoneIcon;
    photo?: string;
}

export type GalleryCategory = 'photo' | 'video';

export interface GalleryItem {
    id: string;
    kind: 'image' | 'video';
    category: GalleryCategory;
    /** Image URL, or MP4/WebM URL for videos. */
    src?: string;
    /** Smaller image used in grids and on the 3D gallery easels. */
    thumbnail?: string;
    poster?: string;
    /** Embeddable player URL (YouTube/Vimeo) as an alternative to `src` for videos. */
    embedUrl?: string;
    alt: string;
    caption?: string;
    /** Marks sample artwork so it is clearly labelled as a placeholder. */
    isPlaceholder?: boolean;
}

export interface DressCodeSwatch {
    name: string;
    hex: string;
}

export interface DressCode {
    title: string;
    description: string;
    recommendations: { label: string; detail: string }[];
    palette: DressCodeSwatch[];
    notes: string[];
}

export interface GiftAccount {
    id: string;
    type: 'bank' | 'ewallet';
    provider: string;
    accountNumber: string;
    accountHolder: string;
}

export interface QrisCode {
    id: string;
    label: string;
    image: string;
}

export interface DigitalGift {
    message: string;
    accounts: GiftAccount[];
    qris: QrisCode[];
}

export interface MusicConfig {
    /** Uploaded track. Empty: an original ambient piece is synthesised live with the Web Audio API. */
    src: string;
    title: string;
    artist?: string;
    credit?: string;
    /** 0–1 */
    volume: number;
    /** Start playback when the guest presses “Buka Undangan”. */
    playOnOpen: boolean;
    loop: boolean;
}

/** Which parts of the invitation are shown (feature toggles + available data). */
export interface Sections {
    /** Opening cover; when off, the invitation opens by itself. */
    cover: boolean;
    /** Personal recipient block on the cover. */
    greeting: boolean;
    couple: boolean;
    countdown: boolean;
    calendar: boolean;
    events: boolean;
    location: boolean;
    story: boolean;
    gallery: boolean;
    rsvp: boolean;
    guestbook: boolean;
    dressCode: boolean;
    gift: boolean;
    music: boolean;
    footer: boolean;
}

export interface InvitationConfig {
    meta: {
        /** Theme-preview invitation: shows the “undangan contoh” notices. */
        isSample: boolean;
        /** Stable key for browser storage (invitation code). */
        slug: string;
    };
    couple: {
        bride: Person;
        groom: Person;
        /** Which name is displayed first. */
        order: 'bride-first' | 'groom-first';
    };
    greeting: {
        recipientPrefix: string;
        defaultRecipient: string;
        /** Personal guest name (link / guest record); empty = generic greeting. */
        recipientName: string;
        buttonText: string;
        coverNote: string;
        heroMessage: string;
        quote?: { text: string; source?: string };
    };
    /** ISO-8601 with offset; drives the countdown. Empty when unknown. */
    weddingDate: string;
    weddingDateLabel: string;
    weddingTimeZone: string;
    events: WeddingEvent[];
    location: VenueLocation | null;
    loveStory: LoveStoryMilestone[];
    gallery: GalleryItem[];
    rsvp: {
        /** ISO-8601 date-time with offset. */
        deadline?: string;
        maxAttendees: number;
        note: string;
    };
    guestbook: { pageSize: number };
    dressCode: DressCode;
    gift: DigitalGift;
    music: MusicConfig;
    closing: {
        title: string;
        message: string;
        prayer: string;
        signature: string;
    };
    backend: {
        /** POST endpoint for RSVP. Empty: the local demo mode is used. */
        rsvpEndpoint: string;
        /** GET/POST endpoint for guestbook entries. Empty: local demo mode. */
        guestbookEndpoint: string;
        /** Guest record that an RSVP updates (personal invitation links). */
        guestSlug: string;
    };
    sections: Sections;
}
