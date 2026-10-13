import { FAMILY, linearBg, unitOf } from './core'
import { confetti, balloons, sparkles, bokeh, clouds, bunting, flowers, neon, sunrise, frame, stripes, floatingHearts } from './decor'

// Heading font styles users can pick from
export const FONT_STYLES = {
  classic: { id: 'classic', label: 'Classic', family: FAMILY.serif, weight: 600, style: 'italic' },
  elegant: { id: 'elegant', label: 'Elegant', family: FAMILY.script, weight: 400 },
  playful: { id: 'playful', label: 'Playful', family: FAMILY.round, weight: 400 },
  bold: { id: 'bold', label: 'Bold', family: FAMILY.bold, weight: 400 },
}

const serifText = { family: FAMILY.serif, weight: 400 }
const sansText = { family: FAMILY.sans, weight: 400 }

export const THEMES = [
  {
    id: 'confetti',
    name: 'Confetti Pop',
    swatch: 'linear-gradient(135deg,#fff1e0,#ffd6e3)',
    dot: '#ff4d6d',
    ink: '#2b1640',
    sub: '#6e5480',
    accent: '#ff4d6d',
    palette: ['#ff4d6d', '#ffb938', '#19c2a0', '#4f7cff', '#a77bff'],
    panel: 'rgba(255,255,255,0.82)',
    heading: 'classic',
    text: serifText,
    tile: '#2b1640',
    tileInk: '#ffffff',
    paint(ctx, w, h, t, c) {
      linearBg(ctx, w, h, ['#fff3e4', '#ffe0ea'])
      confetti(ctx, w, h, t, { colors: c.palette, count: 80 })
    },
  },
  {
    id: 'golden',
    name: 'Golden Night',
    swatch: 'radial-gradient(circle at 50% 40%,#2a1e5c,#0b0d26)',
    dot: '#f2c46d',
    ink: '#fff6e0',
    sub: '#d9cba3',
    accent: '#f2c46d',
    palette: ['#f2c46d', '#ffe3a3', '#e8a33d', '#ffffff'],
    panel: null,
    heading: 'elegant',
    text: serifText,
    shadow: 'rgba(0,0,0,0.45)',
    tile: 'rgba(242,196,109,0.14)',
    tileInk: '#f2c46d',
    dark: true,
    paint(ctx, w, h, t, c) {
      const g = ctx.createRadialGradient(w / 2, h * 0.4, 0, w / 2, h * 0.4, Math.max(w, h) * 0.8)
      g.addColorStop(0, '#2a1e5c')
      g.addColorStop(1, '#0b0d26')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
      bokeh(ctx, w, h, t, { colors: c.palette, opacity: 0.22 })
      sparkles(ctx, w, h, t, { color: c.accent, count: 34 })
      frame(ctx, w, h, c.accent, 40)
    },
  },
  {
    id: 'pastel',
    name: 'Pastel Dream',
    swatch: 'linear-gradient(135deg,#eadfff,#ffe4d9)',
    dot: '#8b5cf6',
    ink: '#3a2a5a',
    sub: '#7a6a99',
    accent: '#8b5cf6',
    palette: ['#c4b5fd', '#fbcfe8', '#a7f3d0', '#fde68a', '#bae6fd'],
    panel: 'rgba(255,255,255,0.6)',
    heading: 'classic',
    text: serifText,
    tile: '#8b5cf6',
    tileInk: '#ffffff',
    paint(ctx, w, h, t, c) {
      linearBg(ctx, w, h, ['#eadfff', '#fbe7f3', '#ffe4d9'])
      bokeh(ctx, w, h, t, { colors: c.palette, opacity: 0.6, count: 12 })
      clouds(ctx, w, h, t, { count: 6 })
      sparkles(ctx, w, h, t, { color: '#ffffff', count: 22 })
    },
  },
  {
    id: 'balloons',
    name: 'Balloon Sky',
    swatch: 'linear-gradient(180deg,#bee7ff,#fff0fa)',
    dot: '#4f7cff',
    ink: '#1d2856',
    sub: '#4a5585',
    accent: '#ff5d73',
    palette: ['#ff5d73', '#ffb938', '#4f7cff', '#19c2a0', '#a77bff'],
    panel: 'rgba(255,255,255,0.85)',
    heading: 'playful',
    text: sansText,
    tile: '#1d2856',
    tileInk: '#ffffff',
    paint(ctx, w, h, t, c) {
      linearBg(ctx, w, h, ['#bee7ff', '#fff0fa'], true)
      clouds(ctx, w, h, t, { count: 4, opacity: 0.9 })
      balloons(ctx, w, h, t, { colors: c.palette, count: 8 })
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    swatch: 'linear-gradient(180deg,#ffb36b,#ff5e8a,#7b4dff)',
    dot: '#ff5e8a',
    ink: '#ffffff',
    sub: 'rgba(255,255,255,0.88)',
    accent: '#ffe58a',
    palette: ['#ffe58a', '#ffffff', '#ffc2d6'],
    panel: null,
    heading: 'classic',
    text: serifText,
    shadow: 'rgba(90,20,70,0.35)',
    tile: 'rgba(255,255,255,0.18)',
    tileInk: '#ffffff',
    dark: true,
    paint(ctx, w, h, t, c) {
      linearBg(ctx, w, h, ['#ffb36b', '#ff5e8a', '#7b4dff'], true)
      sunrise(ctx, w, h, t)
      sparkles(ctx, w, h, t, { color: '#ffffff', count: 28 })
      confetti(ctx, w, h, t, { colors: c.palette, count: 22, speed: 0.6, size: 0.8 })
    },
  },
  {
    id: 'floral',
    name: 'Garden Bloom',
    swatch: 'linear-gradient(135deg,#fff8f0,#fde4dc)',
    dot: '#e0607e',
    ink: '#2e3a2c',
    sub: '#6b7466',
    accent: '#e0607e',
    palette: ['#f4a6b7', '#e0607e', '#ffd27a', '#b8a1e3', '#f7c8a0'],
    panel: null,
    heading: 'elegant',
    text: serifText,
    tile: '#2e3a2c',
    tileInk: '#ffffff',
    paint(ctx, w, h, t, c) {
      linearBg(ctx, w, h, ['#fff8f0', '#fdeee8'])
      flowers(ctx, w, h, t, { colors: c.palette })
      sparkles(ctx, w, h, t, { color: c.accent, count: 12, size: 0.7 })
    },
  },
  {
    id: 'neon',
    name: 'Neon Party',
    swatch: 'linear-gradient(135deg,#0b0a1a,#2a0b45)',
    dot: '#ff3dcb',
    ink: '#ffffff',
    sub: '#c9c2f0',
    accent: '#ff3dcb',
    palette: ['#ff3dcb', '#22e4ff', '#b6ff3d', '#ffd23d'],
    panel: null,
    heading: 'bold',
    text: sansText,
    glow: true,
    tile: 'rgba(255,61,203,0.14)',
    tileInk: '#ffffff',
    dark: true,
    paint(ctx, w, h, t, c) {
      linearBg(ctx, w, h, ['#0b0a1a', '#1a0b2e'], true)
      neon(ctx, w, h, t, { colors: c.palette })
    },
  },
  {
    id: 'minimal',
    name: 'Simple Ink',
    swatch: 'linear-gradient(135deg,#faf6f0,#efe7dc)',
    dot: '#e2583e',
    ink: '#1e1b1a',
    sub: '#6d655f',
    accent: '#e2583e',
    palette: ['#e2583e', '#1e1b1a', '#f2b33d', '#3e7cb1'],
    panel: null,
    heading: 'classic',
    text: serifText,
    tile: '#1e1b1a',
    tileInk: '#ffffff',
    paint(ctx, w, h, t, c) {
      ctx.fillStyle = '#faf6f0'
      ctx.fillRect(0, 0, w, h)
      confetti(ctx, w, h, t, { colors: c.palette, count: 26, speed: 0.45, size: 0.8 })
      frame(ctx, w, h, c.ink, 40, 0)
    },
  },
  {
    id: 'kids',
    name: 'Party Time',
    swatch: 'repeating-linear-gradient(45deg,#fff4cf 0 12px,#ffe9a8 12px 24px)',
    dot: '#ff7a1a',
    ink: '#2d1b4e',
    sub: '#5c4a7a',
    accent: '#ff7a1a',
    palette: ['#ff4d6d', '#ffb938', '#19c2a0', '#4f7cff', '#ff7a1a', '#a77bff'],
    panel: 'rgba(255,255,255,0.88)',
    heading: 'playful',
    text: sansText,
    tile: '#2d1b4e',
    tileInk: '#ffffff',
    safeTop: 0.17,
    paint(ctx, w, h, t, c) {
      ctx.fillStyle = '#fff4cf'
      ctx.fillRect(0, 0, w, h)
      stripes(ctx, w, h, t, '#ffe9a8')
      confetti(ctx, w, h, t, { colors: c.palette, count: 40, size: 0.9 })
      bunting(ctx, w, h, t, { colors: c.palette, top: 24 * unitOf(w, h), flags: 12 })
    },
  },
  {
    id: 'love',
    name: 'Sweetheart',
    swatch: 'linear-gradient(135deg,#ffe3ea,#ffc4d3)',
    dot: '#e63462',
    ink: '#4a1027',
    sub: '#8c4a62',
    accent: '#e63462',
    palette: ['#e63462', '#ff8fab', '#ffc2d1', '#ffffff'],
    panel: 'rgba(255,255,255,0.7)',
    heading: 'elegant',
    text: serifText,
    tile: '#e63462',
    tileInk: '#ffffff',
    paint(ctx, w, h, t, c) {
      linearBg(ctx, w, h, ['#fff0f3', '#ffd0dc'])
      bokeh(ctx, w, h, t, { colors: ['#ffffff', '#ff8fab'], opacity: 0.5, count: 10 })
      floatingHearts(ctx, w, h, t, { colors: c.palette, count: 18 })
    },
  },
]

export const ACCENTS = ['#ff4d6d', '#ff7a1a', '#ffb938', '#19c2a0', '#4f7cff', '#8b5cf6', '#e63462', '#1e1b1a']

export function getTheme(id) {
  return THEMES.find((th) => th.id === id) || THEMES[0]
}

// Applies an optional accent override to a theme
export function resolveTheme(id, accent) {
  const th = getTheme(id)
  if (!accent || accent === th.accent) return th
  return { ...th, accent, palette: [accent, ...th.palette.filter((c) => c !== th.accent)] }
}
