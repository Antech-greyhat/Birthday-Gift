import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { LuArrowRight, LuSparkles, LuMousePointerClick, LuPalette, LuShare2 } from 'react-icons/lu'
import Logo from '../components/Logo'
import Footer from '../components/Footer'
import { CountdownArt, WishesArt, InvitationArt } from '../components/ToolArt'
import { TOOLS } from '../tools/registry'
import { SOCIALS } from '../lib/share'

const ART = { countdown: CountdownArt, wishes: WishesArt, invitation: InvitationArt }

const STEPS = [
  { icon: LuMousePointerClick, title: 'Pick a tool', text: 'Countdown, wishes or invitation.' },
  { icon: LuPalette, title: 'Make it yours', text: 'Names, dates, colors and designs.' },
  { icon: LuShare2, title: 'Share anywhere', text: 'Link, photo or video with music.' },
]

const list = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.35 } } }
const item = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 22, stiffness: 160 } } }

const HEADLINE = ['Make', 'their', 'birthday']

function FloatingDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="absolute left-[6%] top-28 size-4 animate-float rounded-full bg-sun" />
      <span className="absolute left-[14%] top-64 size-3 animate-float-slow rotate-12 bg-mint" />
      <span className="absolute right-[8%] top-24 size-5 animate-float-slow rotate-45 rounded-sm bg-coral" />
      <span className="absolute right-[18%] top-72 size-3 animate-float rounded-full bg-sky" />
      <span className="absolute left-[40%] top-12 size-2 animate-float rounded-full bg-lilac" />
      <svg className="absolute right-[4%] top-52 hidden w-24 animate-float-slow text-lilac sm:block" viewBox="0 0 100 30" fill="none">
        <path d="M2 15c8-12 16-12 24 0s16 12 24 0 16-12 24 0 16 12 24 0" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <svg className="absolute left-[3%] top-44 hidden w-16 animate-float text-coral sm:block" viewBox="0 0 60 60" fill="currentColor">
        <path d="M30 0c2 18 12 28 30 30-18 2-28 12-30 30-2-18-12-28-30-30C18 28 28 18 30 0z" />
      </svg>
    </div>
  )
}

function ToolCard({ tool }) {
  const Art = ART[tool.id]
  return (
    <motion.article variants={item} whileHover={{ y: -8 }} transition={{ type: 'spring', damping: 20, stiffness: 260 }} className="group h-full">
      <Link to={tool.path} className="panel flex h-full flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lift">
        <div className={`relative h-48 overflow-hidden bg-linear-to-br ${tool.art}`}>
          <Art />
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-2.5">
            <span className={`grid size-9 place-items-center rounded-xl text-white ${tool.color}`}>
              <tool.icon />
            </span>
            <p className="eyebrow">{tool.tagline}</p>
          </div>
          <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight">{tool.title}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{tool.description}</p>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {tool.features.map((f) => (
              <li key={f} className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-ink ${tool.soft}`}>
                <span className={`size-1.5 rounded-full ${tool.color}`} />
                {f}
              </li>
            ))}
          </ul>
          <span className="mt-auto inline-flex items-center gap-2 pt-6 font-semibold">
            Open tool
            <span className={`grid size-8 place-items-center rounded-full text-white transition group-hover:translate-x-1 ${tool.color}`}>
              <LuArrowRight />
            </span>
          </span>
        </div>
      </Link>
    </motion.article>
  )
}

export default function Home() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
      <div className="relative">
        <FloatingDecor />
        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Logo />
          <span className="hidden rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium text-muted sm:inline">Free · No sign-up · Private</span>
        </header>

        <section className="relative mx-auto max-w-4xl px-4 pb-10 pt-8 text-center sm:pb-14 sm:pt-14">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-1.5 text-sm font-medium shadow-soft">
            <LuSparkles className="text-sun" /> 3 tools for the big day
          </motion.span>
          <h1 className="mt-6 font-display text-[2.75rem] font-semibold leading-[0.98] tracking-tight sm:text-7xl">
            {HEADLINE.map((w, i) => (
              <motion.span key={w} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i, type: 'spring', damping: 18 }} className="mr-[0.25em] inline-block">
                {w}
              </motion.span>
            ))}
            <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: 'spring', damping: 18 }} className="relative inline-block italic text-coral">
              unforgettable
              <svg className="absolute -bottom-3 left-0 w-full text-sun" viewBox="0 0 300 20" fill="none" preserveAspectRatio="none" aria-hidden="true">
                <path className="squiggle-path animate-draw" d="M3 14c40-10 70-10 100-4s60 6 95-2 70-6 99 0" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </motion.span>
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mx-auto mt-7 max-w-xl text-lg text-muted">
            Count down to the big day, write the perfect wish and send a party invite. Then share it as a photo or a video with music, anywhere.
          </motion.p>
        </section>
      </div>

      <motion.section variants={list} initial="hidden" animate="show" className="mx-auto grid max-w-6xl gap-5 px-4 md:grid-cols-3" aria-label="Choose a tool">
        {TOOLS.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </motion.section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="panel grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">From idea to shared in under a minute</h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {STEPS.map((s, i) => (
                <motion.li key={s.title} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink text-cream">
                    <s.icon />
                  </span>
                  <span>
                    <span className="block font-semibold">{s.title}</span>
                    <span className="text-sm text-muted">{s.text}</span>
                  </span>
                </motion.li>
              ))}
            </ol>
          </div>
          <div>
            <p className="eyebrow mb-4">Share to every network</p>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {SOCIALS.map((s, i) => (
                <motion.span
                  key={s.id}
                  initial={{ opacity: 0, scale: 0.6 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, type: 'spring' }}
                  title={s.label}
                  className="grid aspect-square place-items-center rounded-2xl text-2xl text-white shadow-soft"
                  style={{ backgroundColor: s.color }}
                >
                  <s.icon />
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </motion.div>
  )
}
