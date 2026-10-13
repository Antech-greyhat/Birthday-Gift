import { useEffect, useRef } from 'react'
import { SETTLE } from '../lib/canvas/core'
import { loadFonts } from '../lib/fonts'

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Live animated preview of a poster draw function
export default function PosterCanvas({ draw, width, height, replayKey, className = '', label }) {
  const ref = useRef(null)
  const drawRef = useRef(draw)
  drawRef.current = draw

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let raf = 0
    let alive = true
    let frame = 0
    let visible = true
    let start = performance.now()
    const still = reducedMotion()

    // Skip drawing while scrolled out of view, checking position every half second
    const inView = () => {
      const r = canvas.getBoundingClientRect()
      return r.bottom > 0 && r.top < window.innerHeight && r.width > 0
    }
    const loop = (now) => {
      if (frame++ % 30 === 0) visible = inView()
      if (visible || frame === 1) {
        const t = still ? SETTLE : (now - start) / 1000
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        drawRef.current(ctx, canvas.width, canvas.height, t)
      }
      if (alive && !still) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    loadFonts().then(() => {
      start = performance.now()
      if (still && alive) raf = requestAnimationFrame(loop)
    })
    return () => {
      alive = false
      cancelAnimationFrame(raf)
    }
  }, [replayKey, width, height])

  // Redraw static previews when content changes
  useEffect(() => {
    if (!reducedMotion() || !ref.current) return
    const canvas = ref.current
    draw(canvas.getContext('2d'), canvas.width, canvas.height, SETTLE)
  }, [draw])

  return <canvas ref={ref} width={width} height={height} role="img" aria-label={label} className={className || 'block h-auto w-full'} />
}
