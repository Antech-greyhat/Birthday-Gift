import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="Birthday Studio home">
      <span className="relative grid size-10 place-items-center rounded-2xl bg-ink shadow-soft transition group-hover:-rotate-6">
        <svg viewBox="0 0 40 40" className="size-7" aria-hidden="true">
          <rect x="8" y="19" width="24" height="13" rx="3.5" fill="#ff5d73" />
          <rect x="8" y="23" width="24" height="3" fill="#ffb938" />
          <rect x="18.5" y="11" width="3" height="8" rx="1.5" fill="#fff7ee" />
          <path d="M20 4c2.2 3 2.8 4.6 0 6.6-2.8-2-2.2-3.6 0-6.6z" fill="#ffb938" className="origin-bottom animate-bob" />
        </svg>
      </span>
      <span className="font-display text-lg font-semibold leading-none tracking-tight">
        Birthday<span className="text-coral italic">Studio</span>
      </span>
    </Link>
  )
}
