import { useId } from 'react'
import { motion } from 'motion/react'

// Pill style segmented control with a sliding highlight
export default function Segmented({ options, value, onChange, disabled, size = 'md' }) {
  const id = useId()
  const pad = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-3 py-2.5 text-sm'
  return (
    <div role="radiogroup" className="flex w-full gap-1 rounded-full border border-line bg-paper p-1">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-full font-medium transition-colors disabled:opacity-50 ${pad} ${active ? 'text-cream' : 'text-muted hover:text-ink'}`}
          >
            {active && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', damping: 28, stiffness: 380 }} />}
            <span className="relative flex items-center gap-1.5 whitespace-nowrap">
              {o.icon && <o.icon className="shrink-0" />}
              {o.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
