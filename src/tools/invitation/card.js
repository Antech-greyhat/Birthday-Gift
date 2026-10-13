import { FAMILY, unitOf, textBlock, dividerBlock, pillBlock, fitStack, drawStack, drawPanel, contrastText, ordinal } from '../../lib/canvas/core'
import { resolveTheme, FONT_STYLES } from '../../lib/canvas/themes'
import { fmtDate, timeRange, rsvpLine } from './details'

const withGap = (block, gap) => Object.assign(block, { gap })

// Party invitation layout
export function drawInvitation(ctx, w, h, t, d) {
  const th = resolveTheme(d.theme, d.accent)
  const u = unitOf(w, h)
  th.paint(ctx, w, h, t, th)

  const head = FONT_STYLES[d.font] || FONT_STYLES[th.heading]
  const maxW = w * (th.panel ? 0.68 : 0.72)
  const pad = th.panel ? 60 * u : 0
  const top0 = (th.safeTop ?? 0.085) * h
  const area = h * 0.915 - top0
  const name = d.name.trim()
  const age = Number(d.age) > 0 ? Number(d.age) : null
  const sans = (weight) => ({ family: FAMILY.sans, weight })
  const serif = (weight, style) => ({ family: FAMILY.serif, weight, style })
  const glow = th.glow ? th.accent : null

  const layout = fitStack((k) => {
    const s = u * k
    const b = []
    b.push(textBlock(ctx, { text: (d.headline.trim() || "You're invited").toUpperCase(), font: sans(700), size: 32 * s, spacing: 0.3, color: th.accent, maxWidth: maxW, maxLines: 2, glow }))
    if (name) {
      b.push(withGap(textBlock(ctx, { text: 'to celebrate', font: serif(400, 'italic'), size: 38 * s, color: th.sub, maxWidth: maxW, shadow: th.shadow }), 4 * s))
      b.push(
        withGap(
          textBlock(ctx, {
            text: name,
            font: head,
            size: (head.family === FAMILY.bold ? 190 : head.family === FAMILY.script ? 170 : 130) * s,
            minSize: 60 * s,
            maxLines: 1,
            maxWidth: maxW,
            color: th.ink,
            glow: th.glow ? th.palette[1] : null,
            shadow: th.shadow,
          }),
          8 * s,
        ),
      )
    }
    b.push(textBlock(ctx, { text: age ? `${ordinal(age)} Birthday Party` : 'Birthday Party', font: serif(600), size: 52 * s, color: th.ink, maxWidth: maxW, shadow: th.shadow }))
    b.push(dividerBlock(th.accent, s))
    if (d.date) {
      b.push(withGap(textBlock(ctx, { text: fmtDate(d.date, { weekday: 'long' }).toUpperCase(), font: sans(700), size: 28 * s, spacing: 0.28, color: th.accent, maxWidth: maxW, glow }), 6 * s))
      b.push(withGap(textBlock(ctx, { text: fmtDate(d.date, { month: 'long', day: 'numeric', year: 'numeric' }), font: serif(600), size: 64 * s, color: th.ink, maxWidth: maxW, shadow: th.shadow }), 6 * s))
    }
    if (d.time) b.push(textBlock(ctx, { text: timeRange(d), font: sans(500), size: 38 * s, color: th.ink, maxWidth: maxW, shadow: th.shadow }))
    if (d.venue.trim()) b.push(withGap(textBlock(ctx, { text: d.venue.trim(), font: sans(700), size: 38 * s, color: th.ink, maxWidth: maxW, maxLines: 2, shadow: th.shadow }), 6 * s))
    if (d.address.trim()) b.push(textBlock(ctx, { text: d.address.trim(), font: sans(400), size: 31 * s, color: th.sub, maxWidth: maxW, maxLines: 2, shadow: th.shadow }))
    if (d.dress.trim()) b.push(withGap(textBlock(ctx, { text: d.dress.trim(), font: serif(400, 'italic'), size: 34 * s, color: th.sub, maxWidth: maxW, maxLines: 2, shadow: th.shadow }), 10 * s))
    if (d.note.trim()) b.push(textBlock(ctx, { text: d.note.trim(), font: serif(400, 'italic'), size: 34 * s, color: th.sub, maxWidth: maxW, maxLines: 3, shadow: th.shadow }))
    const rsvp = rsvpLine(d)
    if (rsvp) b.push(pillBlock(ctx, { text: rsvp, font: sans(600), size: 28 * s, bg: th.accent, color: contrastText(th.accent.startsWith('#') ? th.accent : '#ffffff'), u: s, maxWidth: maxW }))
    return { blocks: b, gap: 24 * s }
  }, area - pad * 2)

  const top = top0 + (area - layout.height) / 2
  if (th.panel) drawPanel(ctx, (w - maxW) / 2 - pad, top - pad, maxW + pad * 2, layout.height + pad * 2, 48 * u, th.panel, t)
  drawStack(ctx, layout.blocks, w / 2, top, t, layout.gap, 0.35, 0.1)
}
