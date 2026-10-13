export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const DAY = 86400000

export const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0

export function daysInMonth(month, year = 2024) {
  return new Date(year, month + 1, 0).getDate()
}

// Leap day birthdays are celebrated on Feb 28 in common years
export function birthdayIn(year, month, day) {
  if (month === 1 && day === 29 && !isLeap(year)) return new Date(year, 1, 28)
  return new Date(year, month, day)
}

export function getCountdown(month, day, birthYear, now) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let next = birthdayIn(now.getFullYear(), month, day)
  const isToday = next.getTime() === today.getTime()
  if (next < today) next = birthdayIn(now.getFullYear() + 1, month, day)
  if (isToday) next = birthdayIn(now.getFullYear() + 1, month, day)
  const last = isToday ? today : birthdayIn(next.getFullYear() - 1, month, day)
  const diff = Math.max(0, next - now)
  const turning = birthYear ? next.getFullYear() - birthYear : null
  return {
    isToday,
    next,
    days: Math.floor(diff / DAY),
    hours: Math.floor((diff % DAY) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    totalDays: Math.ceil(diff / DAY),
    sleeps: Math.round((next - today) / DAY),
    yearProgress: Math.min(1, (now - last) / (next - last)),
    turning: turning && turning > 0 ? turning : null,
    ageToday: isToday && birthYear ? now.getFullYear() - birthYear : null,
  }
}

const compact = new Intl.NumberFormat('en', { notation: 'compact', compactDisplay: 'long', maximumFractionDigits: 1 })
const full = new Intl.NumberFormat('en')

// Fun facts that only need month and day
export function dateFacts(month, day, next) {
  const start = new Date(next.getFullYear(), 0, 1)
  const dayOfYear = Math.round((birthdayIn(next.getFullYear(), month, day) - start) / DAY) + 1
  const half = new Date(2001, month + 6, Math.min(day, daysInMonth((month + 6) % 12, 2001)))
  return [
    { emoji: '📅', label: 'Next birthday falls on a', value: next.toLocaleDateString('en', { weekday: 'long' }) },
    { emoji: '🌓', label: 'Half birthday', value: half.toLocaleDateString('en', { month: 'long', day: 'numeric' }) },
    { emoji: '🗓️', label: 'Day of the year', value: `#${dayOfYear}` },
    { emoji: '🌍', label: 'People sharing this birthday', value: `~${compact.format(8.1e9 / 365.25)}` },
  ]
}

// Life stats that need the birth year
export function lifeFacts(birth, now) {
  const ms = now - birth
  const days = Math.floor(ms / DAY)
  const minutes = ms / 60000
  const years = ms / (DAY * 365.25)
  let leapDays = 0
  for (let y = birth.getFullYear(); y <= now.getFullYear(); y++) {
    const d = new Date(y, 1, 29)
    if (isLeap(y) && d >= birth && d <= now) leapDays++
  }
  return [
    { emoji: '☀️', label: 'Days on Earth', value: full.format(days) },
    { emoji: '⏳', label: 'Hours lived', value: full.format(Math.floor(ms / 3600000)) },
    { emoji: '💓', label: 'Heartbeats', value: compact.format(minutes * 80) },
    { emoji: '🌬️', label: 'Breaths taken', value: compact.format(minutes * 16) },
    { emoji: '🌕', label: 'Full moons seen', value: full.format(Math.floor(days / 29.53)) },
    { emoji: '🚀', label: 'Km travelled around the Sun', value: compact.format(years * 940e6) },
    { emoji: '😴', label: 'Years spent sleeping', value: (years / 3).toFixed(1) },
    { emoji: '🐸', label: 'Leap days lived', value: full.format(leapDays) },
  ]
}

export function formatLongDate(date) {
  return date.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}
