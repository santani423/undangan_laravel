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
  /** Marks bundled placeholder art so it is easy to spot and replace. */
  demo?: boolean;
}

export interface GiftAccount {
  id: string;
  kind: 'bank' | 'ewallet';
  provider: string;
  number: string;
  holder: string;
}

export interface ShippingAddress {
  recipient: string;
  address: string;
  phone?: string;
}

export interface ThemeColors {
  sky: string;
  coral: string;
  butter: string;
  mint: string;
  lavender: string;
  cream: string;
  ink: string;
}

export interface InvitationConfig {
  child: {
    fullName: string;
    nickname: string;
    age: number;
    portrait: string;
    portraitAlt: string;
    parentsLine: string;
    favorites: string[];
  };
  invitation: {
    eyebrow: string;
    title: string;
    coverMessage: string;
    welcomeMessage: string;
    /** URL query parameter used to personalise the cover, e.g. `?to=Budi+Santoso`. */
    guestQueryParam: string;
    defaultGuestName: string;
    hashtag?: string;
    closingMessage: string;
    signature: string;
  };
  event: {
    title: string;
    /** ISO 8601 with an explicit offset so the countdown is timezone-safe. */
    startISO: string;
    endISO: string;
    timeZone: string;
    timeZoneLabel: string;
    venueName: string;
    venueDetail: string;
    address: string;
    mapUrl: string;
    dressCode?: string;
    notes?: string;
  };
  gallery: GalleryImage[];
  rsvp: {
    enabled: boolean;
    /**
     * POST endpoint that accepts the RSVP JSON payload. `null` = demo mode:
     * answers stay in this browser's localStorage and are never sent anywhere.
     */
    endpoint: string | null;
    maxCompanions: number;
    deadlineISO?: string;
    wishMaxLength: number;
    attendanceOptions: { value: Attendance; label: string; hint: string }[];
  };
  digitalGift: {
    enabled: boolean;
    title: string;
    message: string;
    accounts: GiftAccount[];
    shippingAddress?: ShippingAddress;
  };
  music: {
    /** Licensed audio file URL. `null` uses the generated music-box loop (if enabled). */
    src: string | null;
    title: string;
    credit?: string;
    volume: number;
    useGeneratedFallback: boolean;
  };
  theme: ThemeColors;
  /** Shows small "contoh/demo" badges next to placeholder data. Turn off for production. */
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
  attendance: Attendance;
  wish: string;
  submittedAt: string;
  /** Seeded example wishes shown in demo mode. */
  example?: boolean;
}
