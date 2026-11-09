/* Tipe data tema — bentuk src/config/invitation.js desain asli, diisi dari BirthdayInvitation (lib/data.ts). */

/** The eight scroll sections, in the order of the 3D stations (scene/stations.ts). */
export type SectionKey = 'hero' | 'invitation' | 'details' | 'activities' | 'gallery' | 'cake' | 'rsvp' | 'finale';

/** Picks both the card illustration and the 3D toy on the playground. */
export type ActivityIcon = 'games' | 'dental' | 'photo' | 'cake' | 'gift' | 'balloons';

export type Attendance = 'yes' | 'no';

export interface PartyEvent {
    title: string;
    /** YYYY-MM-DD, venue-local; empty when the invitation has no valid date. */
    date: string;
    /** HH:MM, venue-local. */
    startTime: string;
    endTime: string;
    /** Fixed UTC offset of the venue, e.g. '+07:00'. */
    utcOffset: string;
    timeZoneLabel: string;
    locale: string;
    dressCode: string;
}

export interface OtherEvent {
    title: string;
    dayLabel: string;
    timeLabel: string;
    venue: string;
}

export interface Venue {
    name: string;
    address: string;
    mapsUrl: string;
}

export interface Activity {
    id: string;
    icon: ActivityIcon;
    title: string;
    summary: string;
    details: string;
}

export interface Photo {
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

export interface EventRange {
    start: Date;
    end: Date;
}

export interface FeatureFlags {
    greeting: boolean;
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

export interface SmileConfig {
    meta: { slug: string; guestSlug: string; isSample: boolean };
    guest: { name: string; personalised: boolean; label: string };
    child: {
        /** Short name used everywhere on the page and in the 3D world. */
        name: string;
        fullName: string;
        /** Whole years; `null` when the invitation has no usable age. */
        age: number | null;
        /** Candles on the 3D cake (1–12). */
        candles: number;
    };
    host: { names: string };
    event: PartyEvent;
    otherEvents: OtherEvent[];
    venue: Venue;
    /** Countdown target; `null` without a valid date. */
    range: EventRange | null;
    copy: {
        siteTitle: string;
        heroInvite: string;
        invitationHeading: string;
        invitationMessage: string;
        signature: string;
        detailsNote: string;
        galleryIntro: string;
        cakeIntro: string;
        rsvpIntro: string;
        finaleHeading: string;
        finaleMessage: string;
    };
    activities: Activity[];
    gallery: Photo[];
    rsvp: { endpoint: string; maxGuests: number; messageMaxLength: number };
    wishesEndpoint: string;
    gift: { accounts: GiftAccount[] };
    music: {
        /** Uploaded track; `null` plays the music box synthesised in the browser. */
        src: string | null;
        autoplay: boolean;
        loop: boolean;
        volume: number;
    };
    features: FeatureFlags;
    /** Shows small "contoh" notes next to placeholder data (theme previews). */
    showDemoNotices: boolean;
}

export interface RsvpPayload {
    name: string;
    attendance: Attendance;
    guests: number;
    message: string;
    submittedAt: string;
}

export interface Wish {
    id: string;
    name: string;
    message: string;
    /** Ready-made label from the server, e.g. "2 hari yang lalu". */
    dateLabel?: string;
    /** ISO date of entries written in this browser (demo mode). */
    submittedAt?: string;
    example?: boolean;
}
