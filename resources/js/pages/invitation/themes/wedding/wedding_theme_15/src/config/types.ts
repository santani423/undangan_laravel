export interface Person {
  /** Short name used in headings, e.g. "Alya". */
  nickname: string
  fullName: string
  /** Line shown under the name, e.g. "Putri pertama dari Bapak … & Ibu …". */
  parents: string
  /** Instagram handle without "@". Leave empty to hide. */
  instagram?: string
}

export interface EventDetail {
  id: string
  name: string
  /** ISO 8601 with explicit offset, e.g. 2027-06-12T09:00:00+07:00 */
  startISO: string
  endISO: string
  venueName: string
  venueAddress: string
  /** Optional explicit Google Maps link. If empty, a search link is built from venue name + address. */
  mapsUrl?: string
  dressCode?: string
  notes?: string[]
}

export interface StoryChapter {
  id: string
  /** Small label, e.g. "How We Met". */
  label: string
  dateLabel: string
  title: string
  text: string
  /** Image shown on the floating 3D frame and in the timeline card. */
  image?: string
}

export interface GalleryImage {
  src: string
  thumb: string
  width: number
  height: number
  alt: string
  caption?: string
  /** true for the bundled demo illustrations; shows a "contoh" label. */
  isDemo?: boolean
}

export interface Contact {
  name: string
  role: string
  /** International format without "+", e.g. 6281234567890 */
  whatsapp: string
}

export interface WeddingConfig {
  /** true while the config still contains placeholder content. Shows a small notice. */
  isSample: boolean
  locale: string
  /** IANA timezone used for every displayed date/time. */
  timeZone: string
  timeZoneLabel: string
  couple: {
    displayNames: string
    monogram: [string, string]
    tagline: string
    intro: string
    bride: Person
    groom: Person
    quote?: { text: string; source: string }
  }
  guest: {
    /** URL query parameter carrying the guest name, e.g. ?to=Budi+Santoso */
    queryParam: string
    fallbackName: string
  }
  /** Countdown target (usually the first event start). */
  weddingDateISO: string
  events: EventDetail[]
  story: StoryChapter[]
  gallery: GalleryImage[]
  rsvp: {
    /** POST endpoint accepting JSON. Takes priority over WhatsApp when set. */
    endpoint?: string
    /** WhatsApp fallback. A number containing "x" is treated as not configured. */
    whatsappNumber?: string
    maxGuests: number
    deadlineLabel: string
  }
  guestbook: {
    /** GET/POST endpoint. Without it the guestbook runs in browser-only demo mode. */
    endpoint?: string
    /** "pre" = new wishes wait for approval before they're listed. */
    moderation: 'none' | 'pre'
    maxLength: number
  }
  music: {
    /** Path/URL to a licensed audio file. Empty = built-in generative music box. */
    src?: string
    title: string
    credit: string
    /** Start music when the guest taps "Buka Undangan" (a user gesture, so browsers allow it). */
    playOnOpen: boolean
  }
  contacts: Contact[]
  closing: {
    message: string
    signature: string
  }
}
