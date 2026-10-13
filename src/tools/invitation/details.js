import { ordinal } from '../../lib/canvas/core'

const pad = (n) => String(n).padStart(2, '0')
export const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const parseDate = (value) => (value ? new Date(`${value}T00:00`) : null)

export function parseDateTime(date, time) {
  if (!date) return null
  return new Date(`${date}T${time || '00:00'}`)
}

export function fmtTime(time) {
  if (!time) return ''
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })
}

export function timeRange(d) {
  return [fmtTime(d.time), fmtTime(d.endTime)].filter(Boolean).join(' – ')
}

export function fmtDate(value, opts = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) {
  const date = parseDate(value)
  return date ? date.toLocaleDateString('en', opts) : ''
}

export function partyTitle(d) {
  const name = d.name.trim()
  const age = Number(d.age) > 0 ? `${ordinal(d.age)} ` : ''
  return name ? `${name}'s ${age}Birthday Party` : `${age}Birthday Party`.trim()
}

export function placeLine(d) {
  return [d.venue.trim(), d.address.trim()].filter(Boolean).join(', ')
}

export function mapsUrl(d) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeLine(d))}`
}

export function rsvpLine(d) {
  const parts = []
  if (d.host.trim()) parts.push(`RSVP to ${d.host.trim()}`)
  else if (d.rsvp.trim() || d.rsvpBy) parts.push('RSVP')
  if (d.rsvp.trim()) parts.push(d.rsvp.trim())
  let line = parts.join(' · ')
  if (d.rsvpBy) line += ` by ${fmtDate(d.rsvpBy, { month: 'short', day: 'numeric' })}`
  return line
}

// Plain text version for WhatsApp, SMS and email
export function inviteText(d) {
  const lines = [`🎉 ${d.headline.trim() || "You're invited"}! Join us for ${partyTitle(d)}`, '']
  if (d.date) lines.push(`📅 ${fmtDate(d.date)}`)
  if (d.time) lines.push(`🕓 ${timeRange(d)}`)
  if (placeLine(d)) lines.push(`📍 ${placeLine(d)}`)
  if (d.dress.trim()) lines.push(`👗 ${d.dress.trim()}`)
  if (d.note.trim()) lines.push(`✨ ${d.note.trim()}`)
  if (rsvpLine(d)) lines.push('', rsvpLine(d))
  return lines.join('\n')
}

// Phone number digits for a wa.me link, if the contact looks like one
export function phoneDigits(contact) {
  const digits = contact.replace(/[^\d]/g, '')
  return digits.length >= 7 && !contact.includes('@') ? digits : ''
}
