import { downloadBlob, slugify } from './share'

const pad = (n) => String(n).padStart(2, '0')
const dateStamp = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
const timeStamp = (d) => `${dateStamp(d)}T${pad(d.getHours())}${pad(d.getMinutes())}00`
const escape = (s = '') => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')

// Builds and downloads an .ics file that any calendar app can import
export function downloadEvent({ title, start, end, allDay = false, yearly = false, location = '', description = '' }) {
  const now = new Date()
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Birthday Studio//EN',
    'BEGIN:VEVENT',
    `UID:${now.getTime()}-${Math.random().toString(36).slice(2)}@birthday-studio`,
    `DTSTAMP:${timeStamp(now)}`,
  ]
  if (allDay) {
    const next = new Date(start)
    next.setDate(next.getDate() + 1)
    lines.push(`DTSTART;VALUE=DATE:${dateStamp(start)}`, `DTEND;VALUE=DATE:${dateStamp(next)}`)
  } else {
    lines.push(`DTSTART:${timeStamp(start)}`, `DTEND:${timeStamp(end || new Date(start.getTime() + 3 * 3600e3))}`)
  }
  if (yearly) lines.push('RRULE:FREQ=YEARLY')
  lines.push(`SUMMARY:${escape(title)}`)
  if (location) lines.push(`LOCATION:${escape(location)}`)
  if (description) lines.push(`DESCRIPTION:${escape(description)}`)
  lines.push('BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:${escape(title)}`, 'END:VALARM')
  lines.push('END:VEVENT', 'END:VCALENDAR')
  downloadBlob(new Blob([lines.join('\r\n')], { type: 'text/calendar' }), `${slugify(title)}.ics`)
}
