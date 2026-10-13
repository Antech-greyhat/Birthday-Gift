import { mulberry32, unitOf, alpha, star4, heart, roundRect } from './core'

// Falling confetti with a paper flip effect
export function confetti(ctx, w, h, t, { colors, count = 70, seed = 7, speed = 1, size = 1 }) {
  const u = unitOf(w, h)
  const r = mulberry32(seed)
  const span = h + 140 * u
  for (let i = 0; i < count; i++) {
    const x0 = r() * w
    const phase = r()
    const sz = (12 + r() * 18) * u * size
    const vy = (60 + r() * 110) * u * speed
    const sway = (10 + r() * 34) * u
    const rot0 = r() * Math.PI * 2
    const vr = (r() - 0.5) * 4
    const shape = r()
    const y = ((phase * span + t * vy) % span) - 70 * u
    const x = x0 + Math.sin(t * 1.3 + i) * sway
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rot0 + t * vr)
    ctx.scale(1, Math.cos(t * 3 + i * 0.7))
    ctx.fillStyle = colors[i % colors.length]
    if (shape < 0.5) ctx.fillRect(-sz / 2, -sz * 0.22, sz, sz * 0.44)
    else if (shape < 0.8) {
      ctx.beginPath()
      ctx.arc(0, 0, sz * 0.32, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.moveTo(0, -sz * 0.4)
      ctx.lineTo(sz * 0.38, sz * 0.3)
      ctx.lineTo(-sz * 0.38, sz * 0.3)
      ctx.fill()
    }
    ctx.restore()
  }
}

// Balloons drifting upward with strings
export function balloons(ctx, w, h, t, { colors, count = 8, seed = 3, speed = 1, size = 1 }) {
  const u = unitOf(w, h)
  const r = mulberry32(seed)
  for (let i = 0; i < count; i++) {
    const bw = (90 + r() * 70) * u * size
    const bh = bw * 1.22
    const lane = w / count
    const x0 = (i + 0.5) * lane + (r() - 0.5) * lane * 0.8
    const span = h + bh * 3.4
    const vy = (34 + r() * 36) * u * speed
    const phase = r()
    const y = h + bh * 1.2 - ((phase * span + t * vy) % span)
    const x = x0 + Math.sin(t * 0.8 + i * 1.7) * 16 * u
    const col = colors[i % colors.length]
    const tilt = Math.sin(t * 0.9 + i) * 0.08
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(tilt)
    ctx.strokeStyle = 'rgba(40,30,60,0.28)'
    ctx.lineWidth = 2 * u
    ctx.beginPath()
    ctx.moveTo(0, bh / 2 + 8 * u)
    ctx.bezierCurveTo(14 * u, bh * 0.9, -14 * u, bh * 1.3, 6 * u, bh * 1.75)
    ctx.stroke()
    const g = ctx.createRadialGradient(-bw * 0.18, -bh * 0.22, bw * 0.05, 0, 0, bw * 0.75)
    g.addColorStop(0, alpha('#ffffff', 0.85))
    g.addColorStop(0.18, col)
    g.addColorStop(1, col)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(0, 0, bw / 2, bh / 2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = col
    ctx.beginPath()
    ctx.moveTo(0, bh / 2 - 2 * u)
    ctx.lineTo(8 * u, bh / 2 + 10 * u)
    ctx.lineTo(-8 * u, bh / 2 + 10 * u)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.beginPath()
    ctx.ellipse(-bw * 0.2, -bh * 0.2, bw * 0.08, bh * 0.14, -0.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

// Twinkling four point stars
export function sparkles(ctx, w, h, t, { color, count = 26, seed = 11, size = 1 }) {
  const u = unitOf(w, h)
  const r = mulberry32(seed)
  ctx.save()
  ctx.fillStyle = color
  for (let i = 0; i < count; i++) {
    const x = r() * w
    const y = r() * h
    const sz = (7 + r() * 16) * u * size
    const ph = r() * Math.PI * 2
    const sp = 1.2 + r() * 2.2
    const a = 0.2 + 0.8 * Math.pow((Math.sin(t * sp + ph) + 1) / 2, 2)
    ctx.globalAlpha = a
    star4(ctx, x, y, sz * (0.6 + 0.4 * a))
  }
  ctx.restore()
}

// Soft out of focus light circles
export function bokeh(ctx, w, h, t, { colors, count = 14, seed = 5, opacity = 0.35 }) {
  const u = unitOf(w, h)
  const r = mulberry32(seed)
  for (let i = 0; i < count; i++) {
    const x0 = r() * w
    const y0 = r() * h
    const rad = (50 + r() * 150) * u
    const ph = r() * Math.PI * 2
    const sp = 0.15 + r() * 0.25
    const x = x0 + Math.sin(t * sp + ph) * 50 * u
    const y = y0 + Math.cos(t * sp * 0.8 + ph) * 40 * u
    const col = colors[i % colors.length]
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad)
    g.addColorStop(0, alpha(col, opacity))
    g.addColorStop(1, alpha(col, 0))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, rad, 0, Math.PI * 2)
    ctx.fill()
  }
}

// Fluffy clouds drifting sideways
export function clouds(ctx, w, h, t, { count = 5, seed = 9, color = '#ffffff', opacity = 0.75 }) {
  const u = unitOf(w, h)
  const r = mulberry32(seed)
  ctx.save()
  ctx.fillStyle = alpha(color, opacity)
  for (let i = 0; i < count; i++) {
    const cw = (180 + r() * 160) * u
    const span = w + cw * 2
    const x = ((r() * span + t * (10 + r() * 16) * u) % span) - cw
    const y = r() * h
    ctx.beginPath()
    ctx.ellipse(x, y, cw * 0.5, cw * 0.18, 0, 0, Math.PI * 2)
    ctx.ellipse(x - cw * 0.18, y - cw * 0.1, cw * 0.2, cw * 0.17, 0, 0, Math.PI * 2)
    ctx.ellipse(x + cw * 0.12, y - cw * 0.16, cw * 0.24, cw * 0.2, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

// Triangle flag garland hanging across the top
export function bunting(ctx, w, h, t, { colors, top = 0, flags = 11, sag = 90 }) {
  const u = unitOf(w, h)
  const y0 = top
  const p0 = [-20 * u, y0]
  const p1 = [w / 2, y0 + sag * 2 * u]
  const p2 = [w + 20 * u, y0]
  const at = (s) => [
    (1 - s) ** 2 * p0[0] + 2 * (1 - s) * s * p1[0] + s * s * p2[0],
    (1 - s) ** 2 * p0[1] + 2 * (1 - s) * s * p1[1] + s * s * p2[1],
  ]
  ctx.save()
  ctx.strokeStyle = 'rgba(45,27,78,0.45)'
  ctx.lineWidth = 3 * u
  ctx.beginPath()
  ctx.moveTo(...p0)
  ctx.quadraticCurveTo(...p1, ...p2)
  ctx.stroke()
  for (let i = 0; i < flags; i++) {
    const s = (i + 0.5) / flags
    const [x, y] = at(s)
    const fw = Math.min(84 * u, (w / flags) * 0.82)
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(Math.sin(t * 2 + i) * 0.07 + (s - 0.5) * 0.3)
    ctx.fillStyle = colors[i % colors.length]
    ctx.beginPath()
    ctx.moveTo(-fw / 2, 0)
    ctx.lineTo(fw / 2, 0)
    ctx.lineTo(0, fw * 1.15)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
  ctx.restore()
}

function flower(ctx, x, y, rad, petals, color, center, rot) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  ctx.fillStyle = color
  for (let k = 0; k < petals; k++) {
    ctx.rotate((Math.PI * 2) / petals)
    ctx.beginPath()
    ctx.ellipse(0, -rad * 0.55, rad * 0.32, rad * 0.55, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = center
  ctx.beginPath()
  ctx.arc(0, 0, rad * 0.26, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function leaf(ctx, x, y, len, angle, color) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.quadraticCurveTo(len * 0.5, -len * 0.32, len, 0)
  ctx.quadraticCurveTo(len * 0.5, len * 0.32, 0, 0)
  ctx.fill()
  ctx.restore()
}

// Flower clusters in two opposite corners
export function flowers(ctx, w, h, t, { colors, leafColor = '#7fa36b', centerColor = '#ffd27a', seed = 21 }) {
  const u = unitOf(w, h)
  const corners = [
    [0, 0, 0],
    [w, h, Math.PI],
  ]
  corners.forEach(([cx, cy, base], ci) => {
    const r = mulberry32(seed + ci)
    const sway = Math.sin(t * 0.7 + ci) * 0.05
    for (let i = 0; i < 7; i++) {
      const ang = base + 0.15 + (i / 6) * (Math.PI / 2 - 0.3)
      const dist = (90 + r() * 170) * u
      leaf(ctx, cx, cy, (150 + r() * 90) * u, ang + sway + (r() - 0.5) * 0.4, leafColor)
      const fx = cx + Math.cos(ang) * dist
      const fy = cy + Math.sin(ang) * dist
      flower(ctx, fx, fy, (46 + r() * 40) * u, 5 + Math.floor(r() * 3), colors[i % colors.length], centerColor, t * 0.15 * (i % 2 ? 1 : -1) + r() * 3)
    }
  })
}

// Glowing neon frames and floating outline shapes
export function neon(ctx, w, h, t, { colors }) {
  const u = unitOf(w, h)
  const pulse = 0.7 + 0.3 * Math.sin(t * 3)
  ctx.save()
  ctx.lineWidth = 6 * u
  ;[colors[0], colors[1]].forEach((col, i) => {
    const inset = (44 + i * 22) * u
    ctx.strokeStyle = col
    ctx.shadowColor = col
    ctx.shadowBlur = 30 * u
    ctx.globalAlpha = i === 0 ? pulse : 1 - pulse * 0.4
    roundRect(ctx, inset, inset, w - inset * 2, h - inset * 2, 40 * u)
    ctx.stroke()
  })
  const r = mulberry32(31)
  for (let i = 0; i < 9; i++) {
    const col = colors[i % colors.length]
    const x = r() * w + Math.sin(t * 0.6 + i) * 30 * u
    const y = r() * h + Math.cos(t * 0.5 + i) * 30 * u
    const s = (22 + r() * 26) * u
    ctx.strokeStyle = col
    ctx.shadowColor = col
    ctx.globalAlpha = 0.55 + 0.45 * Math.sin(t * 2 + i)
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(t * 0.4 * (i % 2 ? 1 : -1))
    ctx.beginPath()
    if (i % 3 === 0) ctx.arc(0, 0, s, 0, Math.PI * 2)
    else if (i % 3 === 1) {
      ctx.moveTo(0, -s)
      ctx.lineTo(s * 0.9, s * 0.6)
      ctx.lineTo(-s * 0.9, s * 0.6)
      ctx.closePath()
    } else {
      ctx.moveTo(-s, 0)
      for (let k = 1; k <= 4; k++) ctx.lineTo(-s + k * (s / 2), k % 2 ? -s * 0.4 : 0)
    }
    ctx.stroke()
    ctx.restore()
  }
  ctx.restore()
}

// Glowing sun disc with rings that expand outward
export function sunrise(ctx, w, h, t) {
  const cx = w / 2
  const cy = h * 1.02
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.75)
  g.addColorStop(0, 'rgba(255,240,200,0.55)')
  g.addColorStop(1, 'rgba(255,240,200,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  ctx.save()
  ctx.lineWidth = 2 * unitOf(w, h)
  for (let k = 0; k < 5; k++) {
    const f = (t * 0.12 + k / 5) % 1
    ctx.strokeStyle = `rgba(255,255,255,${(1 - f) * 0.3})`
    ctx.beginPath()
    ctx.arc(cx, cy, f * Math.max(w, h) * 1.1, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.restore()
}

// Thin double frame with corner diamonds
export function frame(ctx, w, h, color, inset = 46, rounded = 0) {
  const u = unitOf(w, h)
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 2.5 * u
  ;[inset, inset + 14].forEach((i) => {
    const p = i * u
    roundRect(ctx, p, p, w - p * 2, h - p * 2, rounded * u)
    ctx.stroke()
  })
  ctx.fillStyle = color
  const p = (inset + 7) * u
  ;[
    [p, p],
    [w - p, p],
    [p, h - p],
    [w - p, h - p],
  ].forEach(([x, y]) => star4(ctx, x, y, 14 * u))
  ctx.restore()
}

// Diagonal party stripes
export function stripes(ctx, w, h, t, color) {
  const u = unitOf(w, h)
  const gap = 70 * u
  const shift = (t * 14 * u) % (gap * 2)
  ctx.save()
  ctx.fillStyle = color
  for (let x = -h - gap * 2; x < w + gap * 2; x += gap * 2) {
    ctx.beginPath()
    ctx.moveTo(x + shift, 0)
    ctx.lineTo(x + shift + gap, 0)
    ctx.lineTo(x + shift + gap + h, h)
    ctx.lineTo(x + shift + h, h)
    ctx.fill()
  }
  ctx.restore()
}

// Hearts floating up from the bottom
export function floatingHearts(ctx, w, h, t, { colors, count = 14, seed = 13 }) {
  const u = unitOf(w, h)
  const r = mulberry32(seed)
  for (let i = 0; i < count; i++) {
    const x0 = r() * w
    const sz = (14 + r() * 22) * u
    const span = h + 100 * u
    const vy = (30 + r() * 40) * u
    const y = h + 50 * u - ((r() * span + t * vy) % span)
    const x = x0 + Math.sin(t + i) * 20 * u
    ctx.save()
    ctx.globalAlpha = 0.55
    ctx.fillStyle = colors[i % colors.length]
    heart(ctx, x, y, sz)
    ctx.restore()
  }
}
