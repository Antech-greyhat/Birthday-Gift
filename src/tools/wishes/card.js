import { FAMILY, unitOf, textBlock, dividerBlock, fitStack, drawStack, drawPanel } from '../../lib/canvas/core'
import { getTheme, FONT_STYLES } from '../../lib/canvas/themes'

// Greeting card with heading, name, message and signature
export function drawWishCard(ctx, w, h, t, d) {
  const th = getTheme(d.theme)
  const u = unitOf(w, h)
  th.paint(ctx, w, h, t, th)

  const head = FONT_STYLES[th.heading]
  const tall = h / w
  const maxW = w * (th.panel ? 0.68 : 0.72)
  const pad = th.panel ? 64 * u : 0
  const top0 = (th.safeTop ?? 0.09) * h
  const area = h * 0.91 - top0
  const name = d.name?.trim()
  const message = d.message?.trim() || 'Happy birthday!'
  const scriptHead = th.heading === 'elegant'

  const layout = fitStack((k) => {
    const s = u * k
    const blocks = [
      textBlock(ctx, {
        text: scriptHead ? 'Happy Birthday' : 'HAPPY BIRTHDAY',
        font: scriptHead ? head : { family: FAMILY.sans, weight: 700 },
        size: (scriptHead ? 96 : 34) * s,
        spacing: scriptHead ? 0 : 0.32,
        color: th.accent,
        maxWidth: maxW,
        glow: th.glow ? th.accent : null,
        shadow: th.shadow,
      }),
    ]
    if (name) {
      blocks.push(
        textBlock(ctx, {
          text: name,
          font: scriptHead ? { family: FAMILY.serif, weight: 600, style: 'italic' } : head,
          size: (th.heading === 'bold' ? 170 : 120) * s,
          maxLines: 1,
          minSize: 50 * s,
          maxWidth: maxW,
          color: th.ink,
          glow: th.glow ? th.palette[1] : null,
          shadow: th.shadow,
        }),
      )
    }
    blocks.push(dividerBlock(th.accent, s, 'heart'))
    blocks.push(
      textBlock(ctx, {
        text: message,
        font: th.text,
        size: 48 * s,
        minSize: 28 * s,
        maxLines: tall > 1.6 ? 14 : tall > 1.15 ? 10 : 8,
        lineHeight: 1.42,
        maxWidth: maxW,
        color: th.ink,
        shadow: th.shadow,
      }),
    )
    if (d.sender?.trim()) {
      blocks.push(
        textBlock(ctx, {
          text: `With love, ${d.sender.trim()}`,
          font: FONT_STYLES.elegant,
          size: 66 * s,
          maxLines: 1,
          maxWidth: maxW,
          color: th.accent,
          shadow: th.shadow,
        }),
      )
    }
    return { blocks, gap: 30 * s }
  }, area - pad * 2)

  const top = top0 + (area - layout.height) / 2
  if (th.panel) drawPanel(ctx, (w - maxW) / 2 - pad, top - pad, maxW + pad * 2, layout.height + pad * 2, 48 * u, th.panel, t)
  drawStack(ctx, layout.blocks, w / 2, top, t, layout.gap)
}
