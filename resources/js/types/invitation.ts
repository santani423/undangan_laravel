// ─── Invitation Data Types ────────────────────────────────────────────────────

export interface InvitationEvent {
    name: string;
    date: string; // YYYY-MM-DD
    dateFormatted: string; // e.g. "Sabtu, 14 Februari 2026"
    time: string;
    timeEnd: string;
    locationName: string;
    location: string;
    locationUrl: string;
    mapsEmbed: string;
    mapsLat: string;
    mapsLng: string;
    isCountdown: boolean;
}

export interface GalleryItem {
    url: string;
    category: string;
    label?: string;
}

export interface BankAccount {
    bankName: string;
    accountNumber: string;
    accountName: string;
}

export interface DigitalWallet {
    provider: string;
    label: string;
    accountNumber: string;
    accountName: string;
    logoUrl: string;
}

export interface LoveStoryItem {
    title: string;
    desc: string;
    date: string;
    photo?: string;
}

export interface DressCode {
    name: string;
    hex: string;
}

export interface WishItem {
    name: string;
    message: string;
    date: string;
}

// ─── Base invitation data (common to all event types) ─────────────────────────

interface InvitationBase {
    type: 'wedding' | 'birthday' | 'khitan' | 'aqiqah' | 'selamatan' | 'event';
    code: string;
    slug: string;
    title: string;
    guestName: string;
    countdownDate: string; // "YYYY-MM-DDTHH:mm:ss"
    pageTitle: string;
    mainDateFormatted: string;
    events: InvitationEvent[];
    gallery: GalleryItem[];
    bankAccounts: BankAccount[];
    digitalWallets: DigitalWallet[];
    allowComments: boolean;
    rsvpEndpoint: string;
    wishesEndpoint: string;
    // Feature flags from invitation settings (optional — undefined means enabled)
    // Keys match INVITATION_FEATURES in edit.tsx
    features?: {
        cover?: boolean;
        greeting?: boolean;
        couple_profile?: boolean;
        event_detail?: boolean;
        countdown?: boolean;
        location?: boolean;
        gallery?: boolean;
        video?: boolean;
        love_story?: boolean;
        rsvp?: boolean;
        guestbook?: boolean;
        wishes?: boolean;
        digital_envelope?: boolean;
        gift_wishlist?: boolean;
        add_to_calendar?: boolean;
        music?: boolean;
        confetti?: boolean;
        footer?: boolean;
        [key: string]: boolean | undefined;
    };
    music?: {
        url: string;
        autoplay: boolean;
        loop: boolean;
    };
    guestQrData?: string;
    guestSlug?: string;
}

export interface WeddingInvitation extends InvitationBase {
    type: 'wedding';
    groomFullName: string;
    groomNickname: string;
    groomInitials: string;
    groomChildOrder: string;
    groomFather: string;
    groomMother: string;
    groomBio: string;
    groomPhoto: string;
    brideFullName: string;
    brideNickname: string;
    brideInitials: string;
    brideChildOrder: string;
    brideFather: string;
    brideMother: string;
    brideBio: string;
    bridePhoto: string;
    couplePhoto: string;
    loveStory: LoveStoryItem[];
    dressCodes: DressCode[];
    rsvpDeadline: string;
    openingQuote: string;
}

export interface BirthdayInvitation extends InvitationBase {
    type: 'birthday';
    celebrantName: string;
    celebrantNickname: string;
    celebrantAge: string | number;
    celebrantBio: string;
    celebrantPhoto: string;
    parentName: string;
    lifeJourney: LoveStoryItem[];
}

export type InvitationData = WeddingInvitation | BirthdayInvitation | InvitationBase;
