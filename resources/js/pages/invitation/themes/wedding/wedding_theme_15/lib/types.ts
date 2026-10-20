/* Bentuk data yang dibaca komponen & adegan 3D tema 15 — diisi dari WeddingInvitation oleh lib/data.ts. */

export interface Person {
    /** Short name used in headings, e.g. "Alya". */
    nickname: string;
    fullName: string;
    /** Line shown under the name, e.g. "Putri pertama dari Bapak … & Ibu …". */
    parents: string;
    /** Instagram handle without "@". Empty = hidden. */
    instagram: string;
    photo: string;
}

export interface EventDetail {
    id: string;
    name: string;
    /** ISO 8601 with offset; empty when the invitation has no valid date. */
    startISO: string;
    endISO: string;
    dateLabel: string;
    timeLabel: string;
    venueName: string;
    venueAddress: string;
    mapsUrl: string;
}

export interface StoryChapter {
    id: string;
    /** Small label, e.g. "Bab 1". */
    label: string;
    dateLabel: string;
    title: string;
    text: string;
    /** Image on the floating 3D frame and in the timeline card. */
    image: string;
}

export interface GalleryImage {
    src: string;
    thumb: string;
    alt: string;
    caption: string;
    /** True for the bundled demo illustrations; shows an "Ilustrasi contoh" label. */
    isDemo: boolean;
}

export interface GiftAccount {
    id: string;
    bankName: string;
    accountHolder: string;
    accountNumber: string;
}

export interface QrisItem {
    id: string;
    label: string;
    src: string;
}

export interface DressCode {
    name: string;
    hex: string;
}

export interface VideoSource {
    src: string;
    kind: 'file' | 'embed';
}

export interface RsvpConfig {
    endpoint: string;
    wishesEndpoint: string;
    allowComments: boolean;
    deadlineLabel: string;
    maxGuests: number;
    /** localStorage key of the browser-only demo store. */
    storageKey: string;
}

export interface Sections {
    /** Envelope cover; when off, the invitation opens by itself. */
    cover: boolean;
    /** Personal guest greeting on the cover/hero. */
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
    /** Sample invitation (theme preview): shows the "data contoh" notices. */
    isSample: boolean;
    couple: {
        displayNames: string;
        monogram: [string, string];
        tagline: string;
        intro: string;
        bride: Person;
        groom: Person;
        quote: { text: string; source: string } | null;
    };
    guest: {
        /** Personal guest name; empty = generic greeting. */
        name: string;
        title: string;
        label: string;
        buttonText: string;
        slug: string;
    };
    /** Countdown target (usually the first event start). */
    weddingDateISO: string;
    weddingDateLabel: string;
    events: EventDetail[];
    dressCodes: DressCode[];
    story: StoryChapter[];
    gallery: GalleryImage[];
    video: VideoSource;
    gift: { intro: string; accounts: GiftAccount[]; qris: QrisItem[]; thanks: string };
    rsvp: RsvpConfig;
    music: {
        /** Uploaded track; empty = the theme's generative music box. */
        src: string;
        autoplay: boolean;
        loop: boolean;
        title: string;
        credit: string;
    };
    closing: { message: string; signature: string };
    sections: Sections;
}

export type Attendance = 'yes' | 'no';

export interface RsvpSubmission {
    name: string;
    attendance: Attendance;
    guests: number;
    message: string;
}

export interface Wish {
    id: string;
    name: string;
    message: string;
    createdAt: string;
}
