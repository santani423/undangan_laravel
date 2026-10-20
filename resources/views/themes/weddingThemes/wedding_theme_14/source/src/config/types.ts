export type Vec3 = [number, number, number]

/* ───────────── Wedding content ───────────── */

export interface Person {
  fullName: string
  nickname: string
  /** e.g. "Putri pertama dari" */
  childOrder: string
  parents: string
  /** Optional portrait path (relative to public/). Null → elegant monogram placeholder. */
  photo: string | null
  instagram?: string
}

export interface CoupleConfig {
  bride: Person
  groom: Person
  openingGreeting: string
  openingMessage: string
  verse: { text: string; translation: string; source: string }
}

export type EventKind = 'akad' | 'resepsi' | 'other'

export interface EventItem {
  id: string
  kind: EventKind
  title: string
  subtitle?: string
  /** ISO-8601 with offset, e.g. 2027-06-12T08:00:00+07:00 */
  start: string
  end: string
  timezoneLabel: string
  venueName: string
  address: string
  /** Full URL opened by the "Buka Peta" button. */
  mapsUrl: string
  note?: string
}

export interface GalleryItem {
  id: string
  src: string
  alt: string
  caption?: string
  orientation: 'portrait' | 'landscape'
}

export interface GalleryVideo {
  /** Direct video file (mp4/webm) relative to public/, or null when not configured. */
  src: string | null
  poster?: string
  title: string
}

export interface StoryMilestone {
  id: string
  dateLabel: string
  title: string
  body: string
}

export interface GiftAccount {
  id: string
  bankName: string
  accountHolder: string
  accountNumber: string
  /** True while the values are example placeholders — shown with a visible notice. */
  isPlaceholder: boolean
}

export interface GiftConfig {
  intro: string
  accounts: GiftAccount[]
  /** Path to a real QRIS image issued by the bank/PJSP, or null → labeled placeholder. */
  qrisImage: string | null
  thanks: string
}

export interface AudioConfig {
  /** Licensed background track (mp3/ogg) relative to public/. Null → generative Web Audio chime. */
  src: string | null
  title: string
  credit: string
}

export interface ClosingConfig {
  title: string
  message: string
  prayer: string
  signOff: string
}

export interface WeddingConfig {
  /** When true a small notice reminds the owner that names, dates and accounts are examples. */
  isExampleData: boolean
  invitationTitle: string
  invitationSubtitle: string
  couple: CoupleConfig
  /** Main date used by the cover and countdown. */
  mainDate: string
  mainDateLabel: string
  events: EventItem[]
  gallery: GalleryItem[]
  galleryVideo: GalleryVideo
  story: StoryMilestone[]
  gift: GiftConfig
  audio: AudioConfig
  closing: ClosingConfig
  hashtag?: string
}

/* ───────────── Journey / scene system ───────────── */

export type SceneId =
  | 'gate'
  | 'pendopo'
  | 'garden'
  | 'ceremony'
  | 'gallery'
  | 'story'
  | 'rsvp'
  | 'gift'
  | 'closing'

export type PanelSide = 'left' | 'right' | 'center'

export interface SceneConfig {
  id: SceneId
  /** Indonesian label */
  label: string
  /** Javanese place name used as an eyebrow */
  javanese: string
  /** Normalized scroll range [start, end] the scene "owns" */
  range: [number, number]
  /** Progress where the panel fades in / starts fading out. */
  panel: { in: number; out: number; side: PanelSide }
  /** Progress a navigation jump lands on (inside the camera hold). */
  navAt: number
}

/** One continuous camera move. Holds settle the camera; travels connect scenes. */
export interface CameraShot {
  kind: 'hold' | 'travel'
  at: [number, number]
  positions: Vec3[]
  targets: Vec3[]
}

export interface LightingKey {
  at: number
  skyTop: string
  skyHorizon: string
  skyBottom: string
  sunColor: string
  sunIntensity: number
  /** Degrees above horizon */
  sunElevation: number
  /** Degrees, 0 = +Z, 90 = +X */
  sunAzimuth: number
  hemiSky: string
  hemiGround: string
  hemiIntensity: number
  fogNear: number
  fogFar: number
  /** 0–1 lantern emissive strength */
  lanternGlow: number
  /** 0–1 star visibility */
  stars: number
  exposure: number
}

/* ───────────── RSVP ───────────── */

export type Attendance = 'hadir' | 'tidak' | 'ragu'

export interface RsvpSubmission {
  name: string
  attendance: Attendance
  guests: number
  message: string
}

export interface RsvpRecord extends RsvpSubmission {
  id: string
  createdAt: string
  /** 'local' records only exist in this browser. */
  storage: 'local' | 'remote'
}

/* ───────────── Assets ───────────── */

export type AssetStatus = 'included' | 'generated' | 'missing-optional' | 'missing-production'

export interface AssetEntry {
  id: string
  path: string | null
  kind: 'texture' | 'svg' | 'shader' | 'css' | 'model' | 'audio' | 'image' | 'hdr'
  status: AssetStatus
  usage: string
}

export type QualityTier = 'high' | 'medium' | 'low'
