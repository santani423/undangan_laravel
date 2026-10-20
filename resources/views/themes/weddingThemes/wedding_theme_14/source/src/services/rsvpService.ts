import type { RsvpRecord, RsvpSubmission } from '../config/types'

/**
 * Persistence boundary for RSVP + guestbook. Swap `rsvpService` for a remote implementation
 * (REST, Supabase, Google Apps Script, …) without touching any component.
 */
export interface RsvpService {
  /** Human-readable description shown in the UI so guests know where data goes. */
  readonly mode: 'local-demo' | 'remote'
  submit(entry: RsvpSubmission): Promise<RsvpRecord>
  list(): Promise<RsvpRecord[]>
}

export interface ValidationErrors {
  name?: string
  attendance?: string
  guests?: string
  message?: string
}

export const LIMITS = { nameMin: 2, nameMax: 60, guestsMax: 5, messageMax: 280 }

export function validateRsvp(input: Partial<RsvpSubmission>): ValidationErrors {
  const errors: ValidationErrors = {}
  const name = (input.name ?? '').trim()
  if (name.length < LIMITS.nameMin) errors.name = 'Mohon isi nama Anda (minimal 2 huruf).'
  else if (name.length > LIMITS.nameMax) errors.name = `Nama maksimal ${LIMITS.nameMax} karakter.`
  if (!input.attendance) errors.attendance = 'Mohon pilih konfirmasi kehadiran.'
  if (input.attendance === 'hadir') {
    const g = Number(input.guests)
    if (!Number.isInteger(g) || g < 1 || g > LIMITS.guestsMax) errors.guests = `Jumlah tamu 1–${LIMITS.guestsMax} orang.`
  }
  if ((input.message ?? '').length > LIMITS.messageMax) errors.message = `Ucapan maksimal ${LIMITS.messageMax} karakter.`
  return errors
}

const STORAGE_KEY = 'pawiwahan-agung:rsvp:v1'

/** Browser-only demo store. Data never leaves this device. */
class LocalRsvpService implements RsvpService {
  readonly mode = 'local-demo' as const
  private memory: RsvpRecord[] = []

  private read(): RsvpRecord[] {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return this.memory
      const parsed: unknown = JSON.parse(raw)
      return Array.isArray(parsed) ? (parsed as RsvpRecord[]) : this.memory
    } catch {
      return this.memory
    }
  }

  private write(records: RsvpRecord[]) {
    this.memory = records
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
    } catch {
      /* private mode / storage blocked — keep in memory for this session */
    }
  }

  async submit(entry: RsvpSubmission): Promise<RsvpRecord> {
    const errors = validateRsvp(entry)
    if (Object.keys(errors).length) throw new Error('Data belum lengkap.')
    await new Promise((r) => setTimeout(r, 650)) // keeps the loading state visible, like a real request
    const record: RsvpRecord = {
      ...entry,
      name: entry.name.trim(),
      message: entry.message.trim(),
      guests: entry.attendance === 'hadir' ? entry.guests : 0,
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      storage: 'local',
    }
    this.write([record, ...this.read()].slice(0, 200))
    return record
  }

  async list(): Promise<RsvpRecord[]> {
    return this.read()
  }
}

export const rsvpService: RsvpService = new LocalRsvpService()
