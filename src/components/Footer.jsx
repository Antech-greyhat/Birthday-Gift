import { Link } from 'react-router-dom'
import { TOOLS } from '../tools/registry'

export default function Footer() {
  return (
    <footer className="border-t border-line/80 bg-paper/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:justify-between">
        <p>Made with cake and confetti. Everything runs in your browser.</p>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {TOOLS.map((t) => (
            <Link key={t.id} to={t.path} className="font-medium hover:text-ink">
              {t.title}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
