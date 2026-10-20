/**
 * Optional backend for the Enchanted Twilight invitation.
 * Stores RSVPs and guestbook wishes in the Google Sheet this script is bound to.
 *
 * Setup (see README → "Backend: Google Sheets"):
 *   1. Create a Google Sheet → Extensions → Apps Script → paste this file.
 *   2. Deploy → New deployment → type "Web app"
 *        Execute as: Me    Who has access: Anyone
 *   3. Copy the /exec URL into src/config/wedding.ts → rsvp.endpoint and guestbook.endpoint.
 *
 * Contract (matches src/services/*.ts):
 *   GET  ?type=wishes                         → { wishes: [{ id, name, message, createdAt }] }
 *   POST { type: "rsvp", name, attendance, guests, message, submittedAt } → { ok: true }
 *   POST { type: "wish", name, message }      → { ok: true, pending, wish }
 */

// Set to true to require approval: tick the "Approved" column for a wish to appear publicly.
const MODERATION = false

const RSVP_SHEET = 'RSVP'
const WISH_SHEET = 'Wishes'

function sheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sh = ss.getSheetByName(name)
  if (!sh) {
    sh = ss.insertSheet(name)
    sh.appendRow(headers)
    sh.setFrozenRows(1)
  }
  return sh
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}

/** Trim, cap length, strip control characters, and neutralise spreadsheet formula injection. */
function clean_(value, max) {
  let s = String(value == null ? '' : value)
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, max)
  if (/^[=+\-@]/.test(s)) s = "'" + s
  return s
}

function doGet(e) {
  if (!e || !e.parameter || e.parameter.type !== 'wishes') return json_({ ok: false, error: 'unknown type' })
  const sh = sheet_(WISH_SHEET, ['Id', 'Timestamp', 'Name', 'Message', 'Approved'])
  const rows = sh.getDataRange().getValues().slice(1)
  const wishes = rows
    .filter(function (r) { return !MODERATION || r[4] === true })
    .map(function (r) {
      return { id: String(r[0]), createdAt: new Date(r[1]).toISOString(), name: String(r[2]).replace(/^'/, ''), message: String(r[3]).replace(/^'/, '') }
    })
    .reverse()
    .slice(0, 200)
  return json_({ wishes: wishes })
}

function doPost(e) {
  let data
  try {
    data = JSON.parse(e.postData.contents)
  } catch (err) {
    return json_({ ok: false, error: 'invalid json' })
  }
  const lock = LockService.getScriptLock()
  lock.waitLock(10000)
  try {
    if (data.type === 'rsvp') {
      const name = clean_(data.name, 60)
      const attendance = data.attendance === 'yes' ? 'Hadir' : data.attendance === 'no' ? 'Tidak hadir' : ''
      if (name.length < 2 || !attendance) return json_({ ok: false, error: 'invalid rsvp' })
      const guests = data.attendance === 'yes' ? Math.max(1, Math.min(10, Number(data.guests) || 1)) : 0
      sheet_(RSVP_SHEET, ['Timestamp', 'Name', 'Attendance', 'Guests', 'Message']).appendRow([new Date(), name, attendance, guests, clean_(data.message, 300)])
      return json_({ ok: true })
    }
    if (data.type === 'wish') {
      const name = clean_(data.name, 60)
      const message = clean_(data.message, 500)
      if (name.length < 2 || message.length < 3) return json_({ ok: false, error: 'invalid wish' })
      const id = Utilities.getUuid()
      const now = new Date()
      sheet_(WISH_SHEET, ['Id', 'Timestamp', 'Name', 'Message', 'Approved']).appendRow([id, now, name, message, !MODERATION])
      const wish = MODERATION ? null : { id: id, name: name.replace(/^'/, ''), message: message.replace(/^'/, ''), createdAt: now.toISOString() }
      return json_({ ok: true, pending: MODERATION, wish: wish })
    }
    return json_({ ok: false, error: 'unknown type' })
  } finally {
    lock.releaseLock()
  }
}
