import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { LuShare2, LuLink, LuCalendarPlus, LuHourglass, LuPartyPopper, LuSparkles, LuLock, LuCake, LuScroll, LuDna, LuFlower, LuFlower2, LuLeaf } from 'react-icons/lu'
import { GiFlowerEmblem, GiVanillaFlower, GiDaisy, GiFlowers, GiRose, GiLotus, GiPoppy, GiSunflower } from 'react-icons/gi'
import { PiFlower } from 'react-icons/pi'
import ToolLayout from '../../components/ToolLayout'
import ShareModal from '../../components/ShareModal'
import ThemePicker from '../../components/ThemePicker'
import FlipNumber from '../../components/FlipNumber'
import ConfettiBurst from '../../components/ConfettiBurst'
import { useToast } from '../../components/Toast'
import { useNow } from '../../hooks/useNow'
import { getTool } from '../registry'
import { MONTHS, daysInMonth, getCountdown, dateFacts, lifeFacts, formatLongDate } from './time'
import { zodiacOf, BIRTHSTONES, BIRTH_FLOWERS, chineseZodiacOf, rhymeFor, generationOf } from './astro'
import { drawCountdownPoster } from './poster'
import { copyText, slugify } from '../../lib/share'
import { buildUrl } from '../../lib/url'
import { downloadEvent } from '../../lib/calendar'

const tool = getTool('countdown')
const FLOWER_ICON = [GiFlowerEmblem, PiFlower, GiVanillaFlower, GiDaisy, GiFlowers, GiRose, GiLotus, GiPoppy, LuFlower, GiSunflower, LuFlower2, LuLeaf]
const FACT_COLOR = ['text-coral', 'text-sun', 'text-mint', 'text-sky', 'text-lilac']
const ELEMENT_BG = {
  Fire: 'from-coral to-sun',
  Earth: 'from-mint to-[#7fa36b]',
  Air: 'from-sky to-lilac',
  Water: 'from-sky to-mint',
}

function readForm(params) {
  const m = params.get('m')
  return {
    name: params.get('n') || '',
    month: m && Number(m) >= 1 && Number(m) <= 12 ? String(Number(m) - 1) : '',
    day: params.get('d') || '',
    year: params.get('y') || '',
  }
}

function InfoCard({ visual, eyebrow, title, children, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.06, type: 'spring', damping: 22 }}
      className="panel flex gap-4 p-5"
    >
      <div className="shrink-0">{visual}</div>
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <h3 className="mt-0.5 font-display text-xl font-semibold">{title}</h3>
        <div className="mt-1.5 text-sm leading-relaxed text-muted">{children}</div>
      </div>
    </motion.div>
  )
}

function EmptyState({ onPick }) {
  const today = new Date()
  const examples = [
    { label: 'Today', icon: LuPartyPopper, m: today.getMonth(), d: today.getDate() },
    { label: 'New Year baby', m: 0, d: 1 },
    { label: 'Leap day', m: 1, d: 29 },
    { label: 'Christmas', m: 11, d: 25 },
  ]
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="panel grid place-items-center gap-4 px-6 py-14 text-center">
      <span className="grid size-20 place-items-center rounded-3xl bg-coral/10 text-4xl text-coral">
        <LuHourglass className="animate-bob" />
      </span>
      <h2 className="font-display text-2xl font-semibold">Pick a birthday to start the clock</h2>
      <p className="max-w-sm text-muted">Choose a month and day. Add the year to see the age, life stats and more.</p>
      <div className="flex flex-wrap justify-center gap-2">
        {examples.map((e) => (
          <button key={e.label} className="chip" onClick={() => onPick(e.m, e.d)}>
            {e.icon && <e.icon />}
            {e.label}
          </button>
        ))}
      </div>
    </motion.div>
  )
}

export default function CountdownTool() {
  const [params, setParams] = useSearchParams()
  const [form, setForm] = useState(() => readForm(params))
  const [theme, setTheme] = useState(params.get('t') || 'golden')
  const [shareOpen, setShareOpen] = useState(false)
  const [burst, setBurst] = useState(0)
  const notify = useToast()
  const now = useNow()

  const month = form.month === '' ? null : Number(form.month)
  const day = form.day ? Number(form.day) : null
  const maxDay = month == null ? 31 : daysInMonth(month)
  const valid = month != null && day != null && day <= maxDay
  const yearNum = /^\d{4}$/.test(form.year) ? Number(form.year) : null
  const birthDate = valid && yearNum ? new Date(yearNum, month, day) : null
  const birthYear = birthDate && yearNum >= 1900 && birthDate <= now ? yearNum : null
  const yearError = form.year.length === 4 && !birthYear
  const name = form.name.trim()

  // Keep the address bar in sync so the url is always shareable
  useEffect(() => {
    const p = {}
    if (form.name) p.n = form.name
    if (form.month !== '') p.m = Number(form.month) + 1
    if (form.day) p.d = form.day
    if (form.year) p.y = form.year
    if (theme !== 'golden') p.t = theme
    setParams(p, { replace: true })
  }, [form, theme, setParams])

  const cd = valid ? getCountdown(month, day, birthYear, now) : null
  const isToday = !!cd?.isToday

  useEffect(() => {
    if (isToday) setBurst((b) => b + 1)
  }, [isToday, month, day])

  const update = (key) => (e) => {
    const value = e.target.value
    setForm((f) => {
      const next = { ...f, [key]: value }
      if (key === 'month' && next.day && Number(next.day) > daysInMonth(Number(value))) next.day = String(daysInMonth(Number(value)))
      return next
    })
  }

  const details = useMemo(() => {
    if (!valid) return null
    return {
      sign: zodiacOf(month, day),
      stone: BIRTHSTONES[month],
      flower: { ...BIRTH_FLOWERS[month], icon: FLOWER_ICON[month] },
      chinese: birthYear ? chineseZodiacOf(birthYear, month, day) : null,
      weekday: birthYear ? new Date(birthYear, month, day).getDay() : null,
      generation: birthYear ? generationOf(birthYear) : null,
    }
  }, [valid, month, day, birthYear])

  const draw = useCallback(
    (ctx, w, h, t) => drawCountdownPoster(ctx, w, h, t, { name: form.name, month, day, year: birthYear, theme }),
    [form.name, month, day, birthYear, theme],
  )

  const possessive = name ? `${name}'s` : 'my'
  const shareUrl = valid ? buildUrl('/countdown', { n: form.name, m: month + 1, d: day, y: birthYear || '', t: theme !== 'golden' ? theme : '' }) : ''
  const shareText = isToday
    ? `🎂 It's ${possessive} birthday today! Come celebrate:`
    : `⏳ ${cd?.totalDays} days until ${possessive} birthday! Watch the live countdown:`

  async function copyLink() {
    if (await copyText(shareUrl)) notify('Countdown link copied')
  }

  function addToCalendar() {
    const start = isToday ? new Date(now.getFullYear(), now.getMonth(), now.getDate()) : cd.next
    downloadEvent({ title: `${name ? `${name}'s` : 'My'} Birthday 🎂`, start, allDay: true, yearly: true, description: shareUrl })
    notify('Calendar event downloaded')
  }

  const facts = valid ? [...(birthYear ? lifeFacts(birthDate, now) : []), ...dateFacts(month, day, cd.next)] : []
  const tiles = cd
    ? [
        [cd.days, 'Days', cd.days > 99 ? 3 : 2],
        [cd.hours, 'Hours', 2],
        [cd.minutes, 'Minutes', 2],
        [cd.seconds, 'Seconds', 2],
      ]
    : []

  return (
    <ToolLayout tool={tool}>
      <ConfettiBurst fireKey={burst} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
        <motion.aside initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="panel p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-xl font-semibold">Whose birthday?</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="cd-name" className="field-label">
                Name <span className="font-normal text-muted">(optional)</span>
              </label>
              <input id="cd-name" className="field" placeholder="e.g. Ava" maxLength={40} value={form.name} onChange={update('name')} autoComplete="off" />
            </div>
            <div className="grid grid-cols-[1.5fr_1fr] gap-3">
              <div>
                <label htmlFor="cd-month" className="field-label">
                  Month
                </label>
                <select id="cd-month" className="field appearance-none" value={form.month} onChange={update('month')}>
                  <option value="">Month</option>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="cd-day" className="field-label">
                  Day
                </label>
                <select id="cd-day" className="field appearance-none" value={form.day} onChange={update('day')}>
                  <option value="">Day</option>
                  {Array.from({ length: maxDay }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="cd-year" className="field-label">
                Birth year <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                id="cd-year"
                className={`field ${yearError ? 'border-coral focus:border-coral focus:ring-coral/15' : ''}`}
                placeholder="e.g. 1998"
                inputMode="numeric"
                maxLength={4}
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value.replace(/\D/g, '') }))}
                aria-describedby="cd-year-hint"
              />
              <p id="cd-year-hint" className={`mt-1.5 text-xs ${yearError ? 'text-coral' : 'text-muted'}`}>
                {yearError ? 'Enter a year between 1900 and today' : 'Unlocks age, birth weekday and life stats'}
              </p>
            </div>
          </div>

          <AnimatePresence>
            {valid && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-5 grid gap-2.5 border-t border-line pt-5">
                  <button className="btn-accent w-full" onClick={() => setShareOpen(true)}>
                    <LuShare2 /> Share poster or video
                  </button>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button className="btn-ghost px-3" onClick={copyLink}>
                      <LuLink /> Copy link
                    </button>
                    <button className="btn-ghost px-3" onClick={addToCalendar}>
                      <LuCalendarPlus /> Calendar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>

        <section className="min-w-0 space-y-6" aria-live="polite">
          {!valid && <EmptyState onPick={(m, d) => setForm((f) => ({ ...f, month: String(m), day: String(d) }))} />}

          {valid && (
            <>
              <motion.div
                key={`${month}-${day}`}
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 24 }}
                className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-[#2b1640] via-[#3d1d58] to-[#5a2a6e] p-6 text-white shadow-lift sm:p-10"
              >
                <span aria-hidden="true" className="absolute -right-16 -top-16 size-56 animate-spin-slow rounded-full border-2 border-dashed border-white/10" />
                <span aria-hidden="true" className="absolute -bottom-24 -left-10 size-64 rounded-full bg-coral/20 blur-3xl" />
                <span aria-hidden="true" className="absolute right-10 top-10 size-2 animate-float rounded-full bg-sun" />
                <span aria-hidden="true" className="absolute bottom-16 right-1/4 size-3 animate-float-slow rotate-45 bg-mint" />

                <div className="relative">
                  {isToday ? (
                    <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sun">Today's the day</p>
                        <h2 className="mt-1 font-display text-3xl font-semibold sm:text-5xl">
                          Happy birthday{name ? `, ${name}` : ''}! <LuCake className="inline-block align-[-0.1em] text-sun" aria-hidden="true" /> {cd.ageToday || ''}
                        </h2>
                      </div>
                      <button className="btn bg-sun text-ink hover:brightness-105" onClick={() => setBurst((b) => b + 1)}>
                        <LuPartyPopper /> Celebrate
                      </button>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sun">Counting down to</p>
                      <h2 className="mt-1 font-display text-3xl font-semibold sm:text-5xl">{name ? `${name}'s birthday` : 'The big day'}</h2>
                    </div>
                  )}

                  {isToday && <p className="mb-3 text-sm text-white/70">Next birthday in</p>}
                  <div className="grid grid-cols-4 gap-2 sm:gap-4">
                    {tiles.map(([v, label, pad]) => (
                      <div key={label} className="rounded-2xl bg-white/10 px-1 py-3 text-center ring-1 ring-white/15 backdrop-blur sm:rounded-3xl sm:py-6">
                        <FlipNumber value={v} pad={pad} className={`font-display font-semibold ${pad > 2 ? 'text-3xl sm:text-5xl' : 'text-4xl sm:text-6xl'}`} />
                        <div className="mt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-white/60 sm:text-xs">{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-full bg-white/10 px-3 py-1.5">{formatLongDate(cd.next)}</span>
                    {cd.turning && <span className="rounded-full bg-sun px-3 py-1.5 font-semibold text-ink">Turning {cd.turning}</span>}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
                      <details.sign.icon aria-hidden="true" /> {details.sign.name}
                    </span>
                    {!isToday && <span className="rounded-full bg-white/10 px-3 py-1.5">{cd.sleeps === 1 ? '1 sleep to go' : `${cd.sleeps} sleeps to go`}</span>}
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 flex justify-between text-xs text-white/70">
                      <span>Since last birthday</span>
                      <span>{Math.round(cd.yearProgress * 100)}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${cd.yearProgress * 100}%` }} transition={{ duration: 1.2, ease: 'easeOut' }} className="h-full rounded-full bg-linear-to-r from-sun via-coral to-lilac" />
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard
                  index={0}
                  eyebrow={`${details.sign.element} sign · ${details.sign.range}`}
                  title={details.sign.name}
                  visual={<span className={`grid size-14 place-items-center rounded-2xl bg-linear-to-br text-3xl text-white shadow-soft ${ELEMENT_BG[details.sign.element]}`}><details.sign.icon /></span>}
                >
                  Ruled by {details.sign.planet}. Known for being {details.sign.traits.join(', ').toLowerCase()}.
                </InfoCard>
                <InfoCard
                  index={1}
                  eyebrow={`${MONTHS[month]} birthstone`}
                  title={details.stone.name}
                  visual={
                    <span className="relative block size-14 overflow-hidden shadow-soft [clip-path:polygon(25%_0,75%_0,100%_35%,50%_100%,0_35%)]" style={{ backgroundColor: details.stone.color }}>
                      <span className="absolute inset-0 animate-shimmer shimmer-bg" />
                      <span className="absolute inset-x-0 top-[35%] h-px bg-white/50" />
                    </span>
                  }
                >
                  Symbolises {details.stone.meaning.toLowerCase()}.
                </InfoCard>
                <InfoCard index={2} eyebrow={`${MONTHS[month]} birth flower`} title={details.flower.name} visual={<span className="grid size-14 place-items-center rounded-2xl bg-coral/10 text-3xl text-coral"><details.flower.icon /></span>}>
                  Also {details.flower.also.toLowerCase()}. Stands for {details.flower.meaning.toLowerCase()}.
                </InfoCard>
                {details.chinese ? (
                  <InfoCard index={3} eyebrow="Chinese zodiac" title={`Year of the ${details.chinese.name}`} visual={<span className="grid size-14 place-items-center rounded-2xl bg-sun/15 text-3xl text-plum"><details.chinese.icon /></span>}>
                    {details.chinese.approximate ? 'Born near Lunar New Year, so it could be the previous sign.' : `Born in ${birthYear}.`}
                  </InfoCard>
                ) : (
                  <InfoCard index={3} eyebrow="Locked" title="Add the birth year" visual={<span className="grid size-14 place-items-center rounded-2xl bg-ink/5 text-2xl text-muted"><LuLock /></span>}>
                    See the Chinese zodiac, birth weekday, generation and life stats.
                  </InfoCard>
                )}
                {details.weekday != null && (
                  <InfoCard index={4} eyebrow="Born on a" title={new Date(birthYear, month, day).toLocaleDateString('en', { weekday: 'long' })} visual={<span className="grid size-14 place-items-center rounded-2xl bg-sky/10 text-3xl text-sky"><LuScroll /></span>}>
                    “{rhymeFor(details.weekday)}.”
                  </InfoCard>
                )}
                {details.generation && (
                  <InfoCard index={5} eyebrow="Generation" title={details.generation} visual={<span className="grid size-14 place-items-center rounded-2xl bg-lilac/10 text-3xl text-lilac"><LuDna /></span>}>
                    {cd.turning ? `Celebrating birthday number ${cd.turning} next.` : 'Part of a generation that shaped the world.'}
                  </InfoCard>
                )}
              </div>

              <div className="panel p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <LuSparkles className="text-sun" />
                  <h3 className="font-display text-xl font-semibold">Fun facts</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {facts.map((f, i) => (
                    <motion.div
                      key={f.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-2xl bg-cream p-4"
                    >
                      <f.icon className={`text-2xl ${FACT_COLOR[i % FACT_COLOR.length]}`} aria-hidden="true" />
                      <p className="mt-2 font-display text-xl font-semibold tabular-nums sm:text-2xl">{f.value}</p>
                      <p className="text-xs text-muted">{f.label}</p>
                    </motion.div>
                  ))}
                </div>
                {!birthYear && <p className="mt-4 text-sm text-muted">Add a birth year to unlock days alive, heartbeats, full moons and more.</p>}
              </div>
            </>
          )}
        </section>
      </div>

      {valid && (
        <ShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          title={name ? `${name}'s countdown` : 'Birthday countdown'}
          draw={draw}
          shareText={shareText}
          shareUrl={shareUrl}
          fileName={`${slugify(name || 'birthday')}-countdown`}
          defaultFormat="story"
        >
          <div>
            <p className="field-label">Poster design</p>
            <ThemePicker value={theme} onChange={setTheme} />
          </div>
        </ShareModal>
      )}
    </ToolLayout>
  )
}
