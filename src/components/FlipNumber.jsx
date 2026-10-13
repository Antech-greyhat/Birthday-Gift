import { AnimatePresence, motion } from 'motion/react'

// Number whose digits roll when they change
export default function FlipNumber({ value, pad = 2, className = '' }) {
  const str = String(Math.max(0, value)).padStart(pad, '0')
  return (
    <span className={`inline-flex leading-none tabular-nums ${className}`} aria-label={str}>
      {str.split('').map((ch, i) => (
        <span key={str.length - i} aria-hidden="true" className="relative inline-block h-[1.05em] w-[0.62em] overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={ch}
              initial={{ y: '-100%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {ch}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  )
}
