import { motion } from 'motion/react'
import { LuCheck } from 'react-icons/lu'
import { THEMES } from '../lib/canvas/themes'

// Horizontal scroller of design thumbnails
export default function ThemePicker({ value, onChange, themes = THEMES }) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 py-1">
      {themes.map((th) => {
        const active = th.id === value
        return (
          <button key={th.id} onClick={() => onChange(th.id)} aria-pressed={active} className="group w-[4.75rem] shrink-0 snap-start text-center">
            <motion.span
              whileTap={{ scale: 0.94 }}
              className={`relative block aspect-[4/5] rounded-2xl border-2 shadow-soft transition group-hover:-translate-y-1 ${active ? 'border-ink ring-4 ring-ink/10' : 'border-white'}`}
              style={{ background: th.swatch }}
            >
              <span className="absolute bottom-2 left-1/2 h-1.5 w-8 -translate-x-1/2 rounded-full" style={{ backgroundColor: th.dot }} />
              {active && (
                <motion.span layoutId="theme-check" className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-ink text-xs text-cream">
                  <LuCheck />
                </motion.span>
              )}
            </motion.span>
            <span className={`mt-1.5 block truncate text-xs font-medium ${active ? 'text-ink' : 'text-muted'}`}>{th.name}</span>
          </button>
        )
      })}
    </div>
  )
}
