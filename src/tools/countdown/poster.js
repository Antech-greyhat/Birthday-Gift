import { FAMILY, unitOf, textBlock, dividerBlock, fitStack, drawStack, drawPanel, roundRect, fontString, clamp, easeOutBack, easeOutCubic } from '../../lib/canvas/core'
import { getTheme, FONT_STYLES } from '../../lib/canvas/themes'
import { getCountdown, formatLongDate } from './time'
import { zodiacOf, BIRTHSTONES } from './astro'

// Row of four time tiles that update live
function tilesBlock(cd, th, u, maxW) {
  const gap = 18 * u
  const tw = Math.min((maxW - gap * 3) / 4, 210 * u)
  const th2 = tw * 1.08
  const rowW = tw * 4 + gap * 3
  const numFont = th.heading === 'bold' ? { family: FAMILY.bold, weight: 400 } : { family: FAMILY.serif, weight: 600 }
  const items = [
    [cd.days, 'DAYS'],
    [cd.hours, 'HOURS'],
    [cd.minutes, 'MINS'],
    [cd.seconds, 'SECS'],
  ]
  return {
    h: th2,
    draw(c, cx, y, p) {
      const frac = (Date.now() % 1000) / 1000
      items.forEach(([value, label], i) => {
        const pi = easeOutBack(clamp(p * 1.6 - i * 0.15))
        if (pi <= 0) return
        const x = cx - rowW / 2 + i * (tw + gap)
        const pulse = i === 3 ? 1 + 0.06 * (1 - easeOutCubic(clamp(frac * 4))) : 1
        c.save()
        c.globalAlpha *= clamp(pi)
        c.translate(x + tw / 2, y + th2 / 2)
        c.scale(pi * pulse, pi * pulse)
        c.fillStyle = th.tile
        if (th.glow) {
          c.shadowColor = th.accent
          c.shadowBlur = 24 * u
        }
        roundRect(c, -tw / 2, -th2 / 2, tw, th2, 26 * u)
        c.fill()
        c.shadowBlur = 0
        if (th.glow) {
          c.strokeStyle = th.accent
          c.lineWidth = 3 * u
          c.stroke()
        }
        c.fillStyle = th.tileInk
        c.textAlign = 'center'
        c.textBaseline = 'middle'
        const str = String(value).padStart(2, '0')
        c.font = fontString(numFont, tw * (str.length > 2 ? 0.36 : 0.46))
        c.fillText(str, 0, -th2 * 0.08)
        c.font = fontString({ family: FAMILY.sans, weight: 600 }, tw * 0.11)
        c.globalAlpha *= 0.75
        c.fillText(label, 0, th2 * 0.3)
        c.restore()
      })
    },
  }
}

// Little cake with flickering candles for the big day
function cakeBlock(th, u, t) {
  const h = 250 * u
  return {
    h,
    draw(c, cx, y, p) {
      const k = easeOutBack(p)
      c.save()
      c.globalAlpha *= clamp(p)
      c.translate(cx, y + h)
      c.scale(k, k)
      c.fillStyle = th.palette[0]
      roundRect(c, -160 * u, -110 * u, 320 * u, 110 * u, 20 * u)
      c.fill()
      c.fillStyle = th.palette[1] || '#ffffff'
      roundRect(c, -120 * u, -190 * u, 240 * u, 86 * u, 18 * u)
      c.fill()
      c.fillStyle = 'rgba(255,255,255,0.85)'
      roundRect(c, -160 * u, -110 * u, 320 * u, 22 * u, 11 * u)
      c.fill()
      ;[-60, 0, 60].forEach((dx, i) => {
        c.fillStyle = th.palette[(i + 2) % th.palette.length]
        c.fillRect((dx - 7) * u, -240 * u, 14 * u, 52 * u)
        const flick = 1 + Math.sin(t * 14 + i * 2) * 0.12
        c.fillStyle = '#ffc93c'
        c.beginPath()
        c.ellipse(dx * u, -258 * u, 10 * u * flick, 18 * u * flick, 0, 0, Math.PI * 2)
        c.fill()
      })
      c.restore()
    },
  }
}

export function drawCountdownPoster(ctx, w, h, t, d) {
  const th = getTheme(d.theme)
  const u = unitOf(w, h)
  th.paint(ctx, w, h, t, th)

  const cd = getCountdown(d.month, d.day, d.year, new Date())
  const sign = zodiacOf(d.month, d.day)
  const stone = BIRTHSTONES[d.month]
  const head = FONT_STYLES[th.heading]
  const maxW = w * (th.panel ? 0.7 : 0.76)
  const pad = th.panel ? 64 * u : 0
  const top0 = (th.safeTop ?? 0.08) * h
  const area = h * 0.92 - top0
  const name = d.name?.trim()
  const title = cd.isToday ? `Happy Birthday${name ? `, ${name}` : ''}!` : name ? `${name}'s Birthday` : 'The Big Day'
  const age = cd.isToday ? cd.ageToday : cd.turning
  const extras = [age ? (cd.isToday ? `${age} today` : `Turning ${age}`) : null, `${sign.symbol}︎ ${sign.name}`, stone.name].filter(Boolean).join('   ·   ')

  const layout = fitStack((k) => {
    const s = u * k
    const blocks = [
      textBlock(ctx, { text: cd.isToday ? "TODAY'S THE DAY" : 'COUNTING DOWN TO', font: { family: FAMILY.sans, weight: 600 }, size: 30 * s, spacing: 0.3, color: th.accent, maxWidth: maxW }),
      textBlock(ctx, { text: title, font: head, size: (th.heading === 'bold' ? 150 : 118) * s, maxLines: 2, lineHeight: 1.1, maxWidth: maxW, color: th.ink, glow: th.glow ? th.accent : null, shadow: th.shadow }),
      cd.isToday ? cakeBlock(th, s, t) : tilesBlock(cd, th, s, maxW),
      textBlock(ctx, { text: formatLongDate(cd.isToday ? new Date() : cd.next), font: { family: FAMILY.sans, weight: 500 }, size: 34 * s, color: th.sub, maxWidth: maxW }),
      textBlock(ctx, { text: extras, font: { family: FAMILY.sans, weight: 600 }, size: 30 * s, color: th.ink, maxWidth: maxW, maxLines: 2 }),
      dividerBlock(th.accent, s),
      textBlock(ctx, {
        text: cd.isToday ? 'Let the celebrations begin!' : cd.sleeps === 1 ? 'Just one more sleep!' : `${cd.sleeps} sleeps to go`,
        font: { family: FAMILY.serif, weight: 400, style: 'italic' },
        size: 44 * s,
        color: th.accent,
        maxWidth: maxW,
        shadow: th.shadow,
      }),
    ]
    return { blocks, gap: 28 * s }
  }, area - pad * 2)

  const top = top0 + (area - layout.height) / 2
  if (th.panel) drawPanel(ctx, (w - maxW) / 2 - pad, top - pad, maxW + pad * 2, layout.height + pad * 2, 48 * u, th.panel, t)
  drawStack(ctx, layout.blocks, w / 2, top, t, layout.gap)
}
