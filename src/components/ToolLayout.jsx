import { Link, NavLink } from 'react-router-dom'
import { motion } from 'motion/react'
import { LuArrowLeft } from 'react-icons/lu'
import Logo from './Logo'
import Footer from './Footer'
import { TOOLS } from '../tools/registry'

// Shared page shell for every tool with header, tool switcher and title
export default function ToolLayout({ tool, children, hideIntro = false }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
      <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2.5 sm:gap-4">
          <Link to="/" aria-label="All tools" className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-paper transition hover:-translate-x-0.5 hover:border-ink/30">
            <LuArrowLeft />
          </Link>
          <div className="hidden sm:block">
            <Logo />
          </div>
          <nav className="ml-auto flex gap-1 rounded-full border border-line bg-paper p-1" aria-label="Tools">
            {TOOLS.map((t) => (
              <NavLink
                key={t.id}
                to={t.path}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'text-cream' : 'text-muted hover:text-ink'}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <motion.span layoutId="tool-nav" className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', damping: 30, stiffness: 350 }} />}
                    <t.icon className="relative" />
                    <span className={`relative ${isActive ? '' : 'hidden min-[420px]:inline'}`}>{t.short}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:pt-10">
        {!hideIntro && (
          <div className="mb-6 sm:mb-10">
            <motion.span initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.1 }} className={`mb-3 inline-grid size-12 place-items-center rounded-2xl text-xl text-white shadow-soft ${tool.color}`}>
              <tool.icon />
            </motion.span>
            <p className="eyebrow">{tool.tagline}</p>
            <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{tool.title}</h1>
            <p className="mt-3 max-w-2xl text-base text-muted sm:text-lg">{tool.description}</p>
          </div>
        )}
        {children}
      </main>
      <Footer />
    </motion.div>
  )
}
