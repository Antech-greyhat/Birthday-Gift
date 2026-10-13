// Time in seconds after which every intro animation has finished
export const SETTLE = 3.4

export const FORMATS = {
  square: { id: 'square', label: 'Post', ratio: '1:1', w: 1080, h: 1080 },
  portrait: { id: 'portrait', label: 'Portrait', ratio: '4:5', w: 1080, h: 1350 },
  story: { id: 'story', label: 'Story', ratio: '9:16', w: 1080, h: 1920 },
}

export const FAMILY = {
  serif: '"Fraunces", Georgia, serif',
  sans: '"Outfit", system-ui, sans-serif',
  script: '"Great Vibes", "Brush Script MT", cursive',
  round: '"Pacifico", "Comic Sans MS", cursive',
  bold: '"Bebas Neue", Impact, sans-serif',
}

// Deterministic random generator so particles stay stable between frames
export function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v))
export const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3)
export const easeOutBack = (x) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2)
export const progress = (t, delay, duration = 0.8) => clamp((t - delay) / duration)

// Scale factor relative to a 1080px design grid
export const unitOf = (w, h) => Math.min(w, h) / 1080

export function hexToRgb(hex) {
  const v = hex.replace('#', '')
  const n = parseInt(v.length === 3 ? v.split('').map((c) => c + c).join('') : v, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function alpha(hex, a) {
  if (!hex.startsWith('#')) return hex
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r},${g},${b},${a})`
}

export function mix(hexA, hexB, t) {
  const a = hexToRgb(hexA)
  const b = hexToRgb(hexB)
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}

// Picks dark or light text for a background color
export function contrastText(hex) {
  const [r, g, b] = hexToRgb(hex)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#1e1b1a' : '#ffffff'
}

export function fontString(f, size) {
  return `${f.style || 'normal'} ${f.weight || 400} ${Math.round(size * 10) / 10}px ${f.family}`
}

function setSpacing(ctx, px) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${px}px`
}

export function roundRect(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rad, y)
  ctx.arcTo(x + w, y, x + w, y + h, rad)
  ctx.arcTo(x + w, y + h, x, y + h, rad)
  ctx.arcTo(x, y + h, x, y, rad)
  ctx.arcTo(x, y, x + w, y, rad)
  ctx.closePath()
}

export function linearBg(ctx, w, h, stops, vertical = false) {
  const g = vertical ? ctx.createLinearGradient(0, 0, 0, h) : ctx.createLinearGradient(0, 0, w, h)
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

// Splits text into lines that fit the given width, keeping manual line breaks
export function wrapLines(ctx, text, maxWidth) {
  const out = []
  String(text)
    .split('\n')
    .forEach((para) => {
      const words = para.split(/\s+/).filter(Boolean)
      if (!words.length) return out.push('')
      let line = ''
      words.forEach((word) => {
        const test = line ? `${line} ${word}` : word
        if (ctx.measureText(test).width <= maxWidth || !line) line = test
        else {
          out.push(line)
          line = word
        }
      })
      out.push(line)
    })
  return out
}

// Creates a centered text block that shrinks until it fits the line limit
export function textBlock(ctx, opts) {
  const {
    text,
    font,
    size,
    color,
    maxWidth,
    maxLines = 99,
    minSize = size * 0.55,
    lineHeight = 1.25,
    spacing = 0,
    shadow = null,
    glow = null,
    rise = 24,
  } = opts
  let s = size
  let lines = []
  for (let i = 0; i < 14; i++) {
    ctx.font = fontString(font, s)
    setSpacing(ctx, spacing * s)
    lines = wrapLines(ctx, text, maxWidth)
    const widest = Math.max(...lines.map((l) => ctx.measureText(l).width))
    if ((lines.length <= maxLines && widest <= maxWidth) || s <= minSize) break
    s = Math.max(minSize, s * 0.92)
  }
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines)
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '') + '…'
  }
  setSpacing(ctx, 0)
  const lh = s * lineHeight
  return {
    h: lines.length * lh,
    draw(c, cx, y, p) {
      c.save()
      c.globalAlpha *= p
      c.font = fontString(font, s)
      setSpacing(c, spacing * s)
      c.textAlign = 'center'
      c.textBaseline = 'middle'
      c.fillStyle = color
      const dy = (1 - p) * rise * (s / size)
      const offset = (spacing * s) / 2
      const paint = () => lines.forEach((ln, i) => c.fillText(ln, cx + offset, y + dy + i * lh + lh / 2))
      if (glow) {
        c.shadowColor = glow
        c.shadowBlur = s * 0.45
        paint()
      } else if (shadow) {
        c.shadowColor = shadow
        c.shadowBlur = s * 0.25
        c.shadowOffsetY = s * 0.04
      }
      paint()
      setSpacing(c, 0)
      c.restore()
    },
  }
}

export function spacer(h) {
  return { h, draw() {} }
}

// Ornamental divider that grows from the center
export function dividerBlock(color, u, style = 'dots') {
  const h = 34 * u
  return {
    h,
    draw(c, cx, y, p) {
      const mid = y + h / 2
      const half = 120 * u * p
      c.save()
      c.globalAlpha *= p
      c.strokeStyle = color
      c.fillStyle = color
      c.lineWidth = 2.5 * u
      c.lineCap = 'round'
      c.beginPath()
      c.moveTo(cx - half, mid)
      c.lineTo(cx - 22 * u, mid)
      c.moveTo(cx + 22 * u, mid)
      c.lineTo(cx + half, mid)
      c.stroke()
      if (style === 'heart') heart(c, cx, mid - 2 * u, 13 * u)
      else star4(c, cx, mid, 13 * u)
      c.restore()
    },
  }
}

// Rounded pill with centered label
export function pillBlock(ctx, { text, font, size, bg, color, u, maxWidth }) {
  ctx.font = fontString(font, size)
  let s = size
  while (ctx.measureText(text).width > maxWidth - 60 * u && s > size * 0.6) {
    s *= 0.94
    ctx.font = fontString(font, s)
  }
  const tw = ctx.measureText(text).width
  const ph = s * 2.1
  return {
    h: ph,
    draw(c, cx, y, p) {
      const pw = tw + 64 * u
      c.save()
      c.globalAlpha *= p
      c.translate(cx, y + ph / 2)
      const k = 0.85 + 0.15 * easeOutBack(p)
      c.scale(k, k)
      c.fillStyle = bg
      roundRect(c, -pw / 2, -ph / 2, pw, ph, ph / 2)
      c.fill()
      c.font = fontString(font, s)
      c.fillStyle = color
      c.textAlign = 'center'
      c.textBaseline = 'middle'
      c.fillText(text, 0, s * 0.04)
      c.restore()
    },
  }
}

export function star4(c, x, y, r) {
  c.beginPath()
  c.moveTo(x, y - r)
  c.quadraticCurveTo(x, y, x + r, y)
  c.quadraticCurveTo(x, y, x, y + r)
  c.quadraticCurveTo(x, y, x - r, y)
  c.quadraticCurveTo(x, y, x, y - r)
  c.fill()
}

export function heart(c, x, y, r) {
  c.beginPath()
  c.moveTo(x, y + r * 0.9)
  c.bezierCurveTo(x - r * 1.6, y - r * 0.1, x - r * 0.7, y - r * 1.3, x, y - r * 0.45)
  c.bezierCurveTo(x + r * 0.7, y - r * 1.3, x + r * 1.6, y - r * 0.1, x, y + r * 0.9)
  c.fill()
}

export function stackHeight(blocks, gap) {
  return blocks.reduce((sum, b, i) => sum + b.h + (i < blocks.length - 1 ? b.gap ?? gap : 0), 0)
}

// Rebuilds the layout at smaller scales until it fits the available height
export function fitStack(build, available) {
  let k = 1
  let res = build(k)
  for (let i = 0; i < 12 && stackHeight(res.blocks, res.gap) > available; i++) {
    k *= 0.92
    res = build(k)
  }
  return { ...res, height: stackHeight(res.blocks, res.gap) }
}

// Draws blocks one under another with a staggered entrance
export function drawStack(ctx, blocks, cx, top, t, gap, delay = 0.35, stagger = 0.13) {
  let y = top
  blocks.forEach((b, i) => {
    const p = easeOutCubic(progress(t, delay + i * stagger, 0.8))
    if (p > 0) b.draw(ctx, cx, y, p)
    y += b.h + (b.gap ?? gap)
  })
}

// Frosted card behind the text that pops in at the start
export function drawPanel(ctx, x, y, w, h, r, fill, t, shadow = 'rgba(40,20,60,0.18)') {
  const p = easeOutBack(progress(t, 0.05, 0.7))
  if (p <= 0) return
  ctx.save()
  ctx.globalAlpha *= clamp(p * 1.4)
  ctx.translate(x + w / 2, y + h / 2)
  const k = 0.92 + 0.08 * p
  ctx.scale(k, k)
  ctx.shadowColor = shadow
  ctx.shadowBlur = 60 * unitOf(w, h)
  ctx.shadowOffsetY = 16 * unitOf(w, h)
  ctx.fillStyle = fill
  roundRect(ctx, -w / 2, -h / 2, w, h, r)
  ctx.fill()
  ctx.restore()
}

export function ordinal(n) {
  const v = Number(n)
  const s = ['th', 'st', 'nd', 'rd']
  const m = v % 100
  return v + (s[(m - 20) % 10] || s[m] || s[0])
}
