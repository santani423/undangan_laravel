/**
 * Typed invitation configuration. Every couple-specific detail lives in one
 * `InvitationConfig` object (see `src/data/invitation.ts`) so a new invitation
 * can be produced without touching the scene or UI components.
 */

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
  /** Owner-supplied portrait URL. Leave undefined to show a placeholder. */
  photo?: string;
  photoAlt?: string;
  /** Instagram handle without "@". Only rendered when provided. */
  instagram?: string;
}

export interface WeddingEvent {
  id: string;
  /** e.g. "Akad Nikah", "Pemberkatan", "Resepsi". */
  name: string;
  description?: string;
  /** ISO-8601 date-time with offset, e.g. "2027-03-20T08:00:00+07:00". */
  start: string;
  end?: string;
  /** IANA zone used for display, e.g. "Asia/Jakarta". */
  timeZone: string;
  /** Abbreviation shown to guests, e.g. "WIB". */
  timeZoneLabel: string;
  venueName: string;
  address: string;
  coordinates?: Coordinates;
  /** Explicit Google Maps URL; overrides the coordinates/address search link. */
  mapsUrl?: string;
}

export interface VenueLocation {
  venueName: string;
  address: string;
  coordinates?: Coordinates;
  mapsUrl?: string;
  /** Explicit iframe embed URL (e.g. from Google Maps "Embed a map"). */
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
}

export type GalleryCategory = 'portrait' | 'engagement' | 'prewedding' | 'video';

export interface GalleryItem {
  id: string;
  kind: 'image' | 'video';
  category: GalleryCategory;
  /** Image URL, or MP4/WebM URL for videos. */
  src?: string;
  /** Smaller image used in grids and on the 3D gallery easels. */
  thumbnail?: string;
  poster?: string;
  /** Alternative to `src` for videos hosted on YouTube. */
  youtubeId?: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
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
  notes?: string[];
}

export interface GiftAccount {
  id: string;
  type: 'bank' | 'ewallet';
  provider: string;
  /** Must come from the owner. Empty string renders a placeholder. */
  accountNumber: string;
  accountHolder: string;
}

export interface DigitalGift {
  message: string;
  accounts: GiftAccount[];
  qris?: { image: string; alt: string; label?: string };
  physicalGift?: { recipient: string; address: string };
}

export interface MusicConfig {
  /** Owner-provided, properly licensed audio file. When omitted, an original
   *  ambient piece is synthesised live with the Web Audio API. */
  src?: string;
  title: string;
  artist?: string;
  credit?: string;
  /** 0–1 */
  volume: number;
  /** Start playback when the guest presses “Buka Undangan”. */
  playOnOpen: boolean;
}

export interface InvitationConfig {
  meta: {
    /** When true, a discreet “data contoh” badge is shown. */
    isSample: boolean;
    slug: string;
    locale: string;
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
    coverNote: string;
    heroMessage: string;
    quote?: { text: string; source?: string };
  };
  /** ISO-8601 with offset. Drives the countdown. */
  weddingDate: string;
  weddingTimeZone: string;
  events: WeddingEvent[];
  location: VenueLocation;
  loveStory: LoveStoryMilestone[];
  gallery: GalleryItem[];
  rsvp: {
    enabled: boolean;
    /** ISO-8601 date-time with offset. */
    deadline?: string;
    maxAttendees: number;
    note?: string;
  };
  guestbook: { enabled: boolean; pageSize: number };
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
    /** POST endpoint for RSVP. When empty, the local demo mode is used. */
    rsvpEndpoint?: string;
    /** GET/POST endpoint for guestbook entries. Empty → local demo mode. */
    guestbookEndpoint?: string;
  };
}
