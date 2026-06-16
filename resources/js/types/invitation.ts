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
    // Feature flags from theme settings (optional — undefined means enabled)
    features?: {
        rsvp?: boolean;
        wishes?: boolean;
        gallery?: boolean;
        digitalWallet?: boolean;
        music?: boolean;
        timeline?: boolean;
        dresscode?: boolean;
        countdown?: boolean;
        location?: boolean;
    };
    music?: {
        url: string;
        autoplay: boolean;
        loop: boolean;
    };
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
