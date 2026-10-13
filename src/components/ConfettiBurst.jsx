import { useEffect, useRef } from 'react'

const COLORS = ['#ff5d73', '#ffb938', '#19c2a0', '#4f7cff', '#a77bff', '#ff7a1a']

// Full screen confetti cannon fired whenever fireKey changes
export default function ConfettiBurst({ fireKey }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!fireKey || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const canvas = ref.current
    const w = window.innerWidth
    const h = window.innerHeight
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = w * dpr
    canvas.height = h * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    const parts = Array.from({ length: 170 }, (_, i) => {
      const left = i % 2 === 0
      return {
        x: left ? -10 : w + 10,
        y: h * 0.85,
        vx: (left ? 1 : -1) * (3 + Math.random() * (w / 90)),
        vy: -(9 + Math.random() * 13),
        size: 6 + Math.random() * 8,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.4,
        color: COLORS[i % COLORS.length],
        round: Math.random() > 0.6,
      }
    })

    let raf
    const start = performance.now()
    const tick = (now) => {
      const elapsed = (now - start) / 1000
      ctx.clearRect(0, 0, w, h)
      ctx.globalAlpha = Math.min(1, Math.max(0, 4 - elapsed))
      parts.forEach((p) => {
        p.vy += 0.32
        p.vx *= 0.985
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.scale(1, Math.cos(p.rot * 2))
        ctx.fillStyle = p.color
        if (p.round) {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2)
          ctx.fill()
        } else ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        ctx.restore()
      })
      if (elapsed < 4) raf = requestAnimationFrame(tick)
      else ctx.clearRect(0, 0, w, h)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [fireKey])

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 h-full w-full" />
}
