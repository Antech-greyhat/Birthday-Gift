import { useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { FaWhatsapp } from 'react-icons/fa6'
import { LuShare2, LuDownload, LuCalendarPlus, LuLink, LuMapPin, LuEraser, LuRotateCcw, LuPartyPopper, LuClock, LuShirt, LuSparkles, LuPalette, LuUser, LuMessageCircle } from 'react-icons/lu'
import ToolLayout from '../../components/ToolLayout'
import ShareModal from '../../components/ShareModal'
import ThemePicker from '../../components/ThemePicker'
import PosterCanvas from '../../components/PosterCanvas'
import ConfettiBurst from '../../components/ConfettiBurst'
import { useToast } from '../../components/Toast'
import { useStoredState } from '../../hooks/useStoredState'
import { getTool } from '../registry'
import { drawInvitation } from './card'
import { isoDate, parseDateTime, fmtDate, timeRange, partyTitle, placeLine, mapsUrl, inviteText, phoneDigits } from './details'
import { ACCENTS, FONT_STYLES, getTheme } from '../../lib/canvas/themes'
import { copyText, downloadBlob, slugify, openShareWindow } from '../../lib/share'
import { renderImage } from '../../lib/media/recorder'
import { buildUrl, encodeData, decodeData } from '../../lib/url'
import { downloadEvent } from '../../lib/calendar'

const tool = getTool('invitation')
const FIELDS = ['headline', 'name', 'age', 'date', 'time', 'endTime', 'venue', 'address', 'host', 'rsvp', 'rsvpBy', 'dress', 'note', 'theme', 'accent', 'font']

function sampleInvite() {
  const party = new Date()
  party.setDate(party.getDate() + ((6 - party.getDay() + 7) % 7) + 7)
  const by = new Date(party)
  by.setDate(by.getDate() - 5)
  return {
    headline: "You're invited",
    name: 'Ava',
    age: '7',
    date: isoDate(party),
    time: '16:00',
    endTime: '19:00',
    venue: 'Sunny Park Pavilion',
    address: '123 Garden Lane, Springfield',
    host: 'Emma & James',
    rsvp: '+1 555 012 3456',
    rsvpBy: isoDate(by),
    dress: 'Wear something sparkly!',
    note: 'Cake, games and lots of fun',
    theme: 'balloons',
    accent: '',
    font: '',
  }
}

const EMPTY = Object.fromEntries(FIELDS.map((f) => [f, '']))

// Keeps only known string fields from untrusted data
function cleanInvite(raw) {
  const out = { ...EMPTY, theme: 'balloons' }
  if (raw && typeof raw === 'object') FIELDS.forEach((f) => typeof raw[f] === 'string' && (out[f] = raw[f].slice(0, 200)))
  out.theme = getTheme(out.theme).id
  if (out.accent && !/^#[0-9a-f]{6}$/i.test(out.accent)) out.accent = ''
  if (out.font && !FONT_STYLES[out.font]) out.font = ''
  return out
}

function calendarEvent(d, url) {
  const start = parseDateTime(d.date, d.time || '12:00')
  let end = d.endTime ? parseDateTime(d.date, d.endTime) : null
  if (end && end <= start) end.setDate(end.getDate() + 1)
  downloadEvent({ title: partyTitle(d), start, end, location: placeLine(d), description: `${inviteText(d)}\n\n${url}` })
}

function Field({ id, label, hint, className = '', ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label} {hint && <span className="font-normal text-muted">{hint}</span>}
      </label>
      <input id={id} className="field" autoComplete="off" {...props} />
    </div>
  )
}

function Section({ icon: Icon, title, children, delay = 0 }) {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="panel p-5 sm:p-6">
      <h2 className="mb-4 flex items-center gap-2.5 font-display text-lg font-semibold">
        <span className="grid size-8 place-items-center rounded-xl bg-mint/15 text-mint">
          <Icon />
        </span>
        {title}
      </h2>
      {children}
    </motion.section>
  )
}

// What guests see when they open a shared invitation link
function InviteView({ invite }) {
  const notify = useToast()
  const draw = useCallback((ctx, w, h, t) => drawInvitation(ctx, w, h, t, invite), [invite])
  const phone = phoneDigits(invite.rsvp)
  const url = window.location.href
  const reply = `Hi${invite.host ? ` ${invite.host}` : ''}! Thanks for the invite. We'd love to come to ${partyTitle(invite)}${invite.date ? ` on ${fmtDate(invite.date, { month: 'long', day: 'numeric' })}` : ''}. 🎉`

  async function save() {
    downloadBlob(await renderImage(draw, 1080, 1350), `${slugify(partyTitle(invite))}.png`)
    notify('Invitation saved')
  }

  const rows = [
    invite.date && { icon: LuCalendarPlus, text: fmtDate(invite.date) },
    invite.time && { icon: LuClock, text: timeRange(invite) },
    placeLine(invite) && { icon: LuMapPin, text: placeLine(invite) },
    invite.dress && { icon: LuShirt, text: invite.dress },
    invite.note && { icon: LuSparkles, text: invite.note },
  ].filter(Boolean)

  return (
    <ToolLayout tool={tool} hideIntro>
      <ConfettiBurst fireKey={1} />
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        <motion.div initial={{ opacity: 0, y: 30, rotate: 2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ type: 'spring', damping: 18 }} className="mx-auto w-full max-w-md overflow-hidden rounded-3xl shadow-lift">
          <PosterCanvas draw={draw} width={720} height={900} label="Party invitation" />
        </motion.div>
        <div>
          <p className="eyebrow">{invite.headline || "You're invited"}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">{partyTitle(invite)}</h1>
          <ul className="mt-6 space-y-3">
            {rows.map((r, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }} className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-mint/15 text-mint">
                  <r.icon />
                </span>
                <span className="pt-1.5">{r.text}</span>
              </motion.li>
            ))}
          </ul>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {phone && (
              <a href={`https://wa.me/${phone}?text=${encodeURIComponent(reply)}`} target="_blank" rel="noreferrer" className="btn bg-[#25d366] text-white shadow-soft hover:brightness-105 sm:col-span-2">
                <FaWhatsapp className="text-lg" /> RSVP on WhatsApp
              </a>
            )}
            <button onClick={() => calendarEvent(invite, url)} className="btn-primary">
              <LuCalendarPlus /> Add to calendar
            </button>
            {placeLine(invite) && (
              <a href={mapsUrl(invite)} target="_blank" rel="noreferrer" className="btn-ghost">
                <LuMapPin /> Directions
              </a>
            )}
            <button onClick={save} className="btn-ghost">
              <LuDownload /> Save invitation
            </button>
            <Link to="/invitation" className="btn-ghost">
              <LuPartyPopper /> Make your own
            </Link>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}

function Editor() {
  const notify = useToast()
  const [invite, setInvite] = useStoredState('birthday-studio-invite', sampleInvite())
  const [shareOpen, setShareOpen] = useState(false)
  const [replay, setReplay] = useState(0)
  const th = getTheme(invite.theme)

  const set = (key) => (e) => setInvite((d) => ({ ...d, [key]: e.target.value }))
  const setValue = (key, value) => setInvite((d) => ({ ...d, [key]: value }))

  const draw = useCallback((ctx, w, h, t) => drawInvitation(ctx, w, h, t, invite), [invite])
  const shareUrl = useMemo(() => buildUrl('/invitation', { view: 1, p: encodeData(invite) }), [invite])
  const text = inviteText(invite)
  const fileName = slugify(partyTitle(invite))

  function whatsapp() {
    openShareWindow(`https://wa.me/?text=${encodeURIComponent(`${text}\n\nSee the invitation: ${shareUrl}`)}`)
  }

  async function download() {
    downloadBlob(await renderImage(draw, 1080, 1350), `${fileName}.png`)
    notify('Invitation saved')
  }

  async function copyLink() {
    if (await copyText(shareUrl)) notify('Invitation link copied')
  }

  function addToCalendar() {
    if (!invite.date) return notify('Add a party date first', 'info')
    calendarEvent(invite, shareUrl)
    notify('Calendar event downloaded')
  }

  function pickTheme(id) {
    setInvite((d) => ({ ...d, theme: id, accent: '' }))
    setReplay((r) => r + 1)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <div className="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-6 lg:row-start-1">
          <div className="panel p-3 sm:p-4">
            <div className="overflow-hidden rounded-2xl">
              <PosterCanvas draw={draw} width={720} height={900} replayKey={replay} label="Invitation preview" />
            </div>
            <button onClick={whatsapp} className="btn mt-3 w-full bg-[#25d366] py-3.5 text-base text-white shadow-soft hover:brightness-105">
              <FaWhatsapp className="text-lg" /> Send on WhatsApp
            </button>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              <button onClick={download} className="btn-ghost px-2">
                <LuDownload /> Save
              </button>
              <button onClick={copyLink} className="btn-ghost px-2">
                <LuLink /> Link
              </button>
              <button onClick={() => setShareOpen(true)} className="btn-primary px-2">
                <LuShare2 /> Share
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button onClick={addToCalendar} className="btn px-2 text-muted hover:text-ink">
                <LuCalendarPlus /> Add to calendar
              </button>
              <button onClick={() => setReplay((r) => r + 1)} className="btn px-2 text-muted hover:text-ink">
                <LuRotateCcw /> Replay
              </button>
            </div>
          </div>
        </div>

        <Section icon={LuPalette} title="Theme & style" delay={0.05}>
          <ThemePicker value={invite.theme} onChange={pickTheme} />
          <p className="field-label mt-5">Accent color</p>
          <div className="flex flex-wrap items-center gap-2.5">
            <button onClick={() => setValue('accent', '')} aria-pressed={!invite.accent} className={`grid size-9 place-items-center rounded-full border-2 text-[10px] font-semibold ${!invite.accent ? 'border-ink' : 'border-line'}`} style={{ backgroundColor: th.accent, color: '#fff' }} title="Theme default">
              Auto
            </button>
            {ACCENTS.map((c) => (
              <button
                key={c}
                onClick={() => setValue('accent', c)}
                aria-label={`Accent ${c}`}
                aria-pressed={invite.accent === c}
                className={`size-9 rounded-full border-2 transition hover:scale-110 ${invite.accent === c ? 'scale-110 border-ink ring-4 ring-ink/10' : 'border-white shadow-soft'}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <label className="relative grid size-9 cursor-pointer place-items-center overflow-hidden rounded-full border-2 border-dashed border-line bg-paper text-muted" title="Custom color">
              <LuPalette />
              <input type="color" value={invite.accent || th.accent} onChange={set('accent')} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Custom accent color" />
            </label>
          </div>
          <p className="field-label mt-5">Name font</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {[{ id: '', label: 'Auto' }, ...Object.values(FONT_STYLES)].map((f) => (
              <button
                key={f.id || 'auto'}
                onClick={() => setValue('font', f.id)}
                aria-pressed={invite.font === f.id}
                className={`rounded-2xl border px-3 py-2.5 text-lg transition ${invite.font === f.id ? 'border-ink bg-ink text-cream' : 'border-line bg-paper hover:border-ink/30'}`}
                style={f.family ? { fontFamily: f.family, fontStyle: f.style || 'normal', fontWeight: f.weight } : undefined}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Section>

        <Section icon={LuUser} title="Who's celebrating" delay={0.1}>
          <div className="grid gap-4 sm:grid-cols-[1fr_1fr_110px]">
            <Field id="i-headline" label="Headline" value={invite.headline} onChange={set('headline')} maxLength={40} placeholder="You're invited" />
            <Field id="i-name" label="Birthday star" value={invite.name} onChange={set('name')} maxLength={30} placeholder="e.g. Ava" />
            <Field id="i-age" label="Turning" value={invite.age} onChange={(e) => setValue('age', e.target.value.replace(/\D/g, '').slice(0, 3))} inputMode="numeric" placeholder="7" />
          </div>
        </Section>

        <Section icon={LuClock} title="When & where" delay={0.15}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="i-date" label="Date" type="date" value={invite.date} onChange={set('date')} />
            <Field id="i-time" label="Starts" type="time" value={invite.time} onChange={set('time')} />
            <Field id="i-end" label="Ends" hint="(optional)" type="time" value={invite.endTime} onChange={set('endTime')} />
            <Field id="i-venue" label="Venue" value={invite.venue} onChange={set('venue')} maxLength={60} placeholder="e.g. Sunny Park Pavilion" className="sm:col-span-3" />
            <Field id="i-address" label="Address" value={invite.address} onChange={set('address')} maxLength={90} placeholder="Street, city" className="sm:col-span-3" />
          </div>
        </Section>

        <Section icon={LuMessageCircle} title="Details & RSVP" delay={0.2}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="i-dress" label="Dress code or theme" value={invite.dress} onChange={set('dress')} maxLength={60} placeholder="e.g. Superheroes" />
            <Field id="i-note" label="Note for guests" value={invite.note} onChange={set('note')} maxLength={80} placeholder="e.g. Cake, games and fun" />
            <Field id="i-host" label="Hosted by" value={invite.host} onChange={set('host')} maxLength={40} placeholder="Your name" />
            <Field id="i-rsvp" label="RSVP contact" hint="(phone or email)" value={invite.rsvp} onChange={set('rsvp')} maxLength={40} placeholder="+1 555 012 3456" />
            <Field id="i-rsvpby" label="RSVP by" hint="(optional)" type="date" value={invite.rsvpBy} onChange={set('rsvpBy')} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-5">
            <button onClick={() => setInvite((d) => ({ ...EMPTY, theme: d.theme, accent: d.accent, font: d.font, headline: "You're invited" }))} className="btn-ghost">
              <LuEraser /> Clear details
            </button>
            <button onClick={() => setInvite(sampleInvite())} className="btn-ghost">
              <LuRotateCcw /> Load example
            </button>
          </div>
        </Section>
      </div>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} title="Party invitation" draw={draw} shareText={text} shareUrl={shareUrl} fileName={fileName}>
        <div>
          <p className="field-label">Theme</p>
          <ThemePicker value={invite.theme} onChange={pickTheme} />
        </div>
      </ShareModal>
    </ToolLayout>
  )
}

export default function InvitationTool() {
  const [params] = useSearchParams()
  const shared = params.get('view') === '1' ? decodeData(params.get('p') || '') : null
  const invite = useMemo(() => (shared ? cleanInvite(shared) : null), [params])
  return invite ? <InviteView invite={invite} /> : <Editor />
}
