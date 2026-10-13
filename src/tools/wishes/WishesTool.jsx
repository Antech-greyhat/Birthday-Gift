import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { LuDices, LuCopy, LuDownload, LuShare2, LuSearch, LuRotateCcw, LuCheck, LuHeart } from 'react-icons/lu'
import ToolLayout from '../../components/ToolLayout'
import ShareModal from '../../components/ShareModal'
import ThemePicker from '../../components/ThemePicker'
import PosterCanvas from '../../components/PosterCanvas'
import ConfettiBurst from '../../components/ConfettiBurst'
import { useToast } from '../../components/Toast'
import { getTool } from '../registry'
import { RECIPIENTS, TONES, MESSAGES, filterMessages, personalize } from './messages'
import { drawWishCard } from './card'
import { copyText, downloadBlob, slugify } from '../../lib/share'
import { renderImage } from '../../lib/media/recorder'
import { buildUrl } from '../../lib/url'
import { getTheme } from '../../lib/canvas/themes'

const tool = getTool('wishes')
const PAGE = 8
const TONE_LABEL = Object.fromEntries(TONES.map((t) => [t.id, `${t.emoji} ${t.label}`]))

const pick = (list) => list[Math.floor(Math.random() * list.length)]

function Step({ n, title, children, className = '' }) {
  return (
    <section className={`panel p-5 sm:p-6 ${className}`}>
      <h2 className="mb-4 flex items-center gap-2.5 font-display text-lg font-semibold">
        <span className="grid size-7 place-items-center rounded-full bg-ink font-sans text-xs text-cream">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

// Recipient view when someone opens a shared wish link
function WishView({ params }) {
  const notify = useToast()
  const data = { name: params.get('n') || '', sender: params.get('f') || '', theme: getTheme(params.get('d')).id, message: params.get('m') || 'Happy birthday!' }
  const draw = useCallback((ctx, w, h, t) => drawWishCard(ctx, w, h, t, data), [params])

  async function save() {
    downloadBlob(await renderImage(draw, 1080, 1350), `${slugify(data.name || 'birthday')}-wish.png`)
    notify('Card saved')
  }

  return (
    <ToolLayout tool={tool} hideIntro>
      <ConfettiBurst fireKey={1} />
      <div className="mx-auto max-w-md text-center">
        <p className="eyebrow">{data.sender ? `A wish from ${data.sender}` : 'A birthday wish for you'}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">{data.name ? `Happy birthday, ${data.name}!` : 'Happy birthday!'}</h1>
        <motion.div initial={{ opacity: 0, y: 30, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ type: 'spring', damping: 18, delay: 0.2 }} className="mt-6 overflow-hidden rounded-3xl shadow-lift">
          <PosterCanvas draw={draw} width={720} height={900} label="Birthday card" />
        </motion.div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link to="/wishes" className="btn-accent">
            <LuHeart /> Send a wish back
          </Link>
          <button onClick={save} className="btn-ghost">
            <LuDownload /> Save card
          </button>
        </div>
      </div>
    </ToolLayout>
  )
}

function Editor() {
  const notify = useToast()
  const [recipient, setRecipient] = useState('anyone')
  const [tone, setTone] = useState('all')
  const [name, setName] = useState('')
  const [sender, setSender] = useState('')
  const [design, setDesign] = useState('confetti')
  const [current, setCurrent] = useState(() => pick(filterMessages('anyone', 'all')))
  const [custom, setCustom] = useState(null)
  const [query, setQuery] = useState('')
  const [visible, setVisible] = useState(PAGE)
  const [shareOpen, setShareOpen] = useState(false)
  const [rolls, setRolls] = useState(0)
  const previewRef = useRef(null)

  const pool = useMemo(() => filterMessages(recipient, tone), [recipient, tone])
  const list = useMemo(() => filterMessages(recipient, tone, query), [recipient, tone, query])
  const message = custom ?? personalize(current.text, name, recipient)

  // Prefer messages written for the chosen person most of the time
  const generate = useCallback(() => {
    const options = pool.filter((m) => m.id !== current.id)
    const specific = options.filter((m) => m.to === recipient)
    const source = recipient !== 'anyone' && specific.length && Math.random() < 0.65 ? specific : options
    setCurrent(pick(source.length ? source : pool))
    setCustom(null)
    setRolls((r) => r + 1)
  }, [pool, current.id, recipient])

  // Pick a fitting wish whenever the recipient or tone changes
  useEffect(() => {
    setVisible(PAGE)
    if (!pool.some((m) => m.id === current.id && (recipient === 'anyone' || m.to === recipient))) generate()
  }, [recipient, tone])

  const draw = useCallback((ctx, w, h, t) => drawWishCard(ctx, w, h, t, { theme: design, name, sender, message }), [design, name, sender, message])

  const shareUrl = buildUrl('/wishes', { view: 1, n: name.trim(), f: sender.trim(), d: design, m: message })
  const shareText = `${message}${sender.trim() ? ` ~ ${sender.trim()}` : ''}`
  const fileName = `${slugify(name || 'birthday')}-wish`

  function choose(m) {
    setCurrent(m)
    setCustom(null)
    setRolls((r) => r + 1)
    if (window.innerWidth < 1024) previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function copy(text = shareText) {
    if (await copyText(text)) notify('Wish copied to clipboard')
  }

  async function download() {
    downloadBlob(await renderImage(draw, 1080, 1350), `${fileName}.png`)
    notify('Card saved')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <Step n={1} title="Who is it for?" className="lg:col-start-1">
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:px-0">
            {RECIPIENTS.map((r) => (
              <button key={r.id} onClick={() => setRecipient(r.id)} className={`chip ${recipient === r.id ? 'chip-active' : ''}`} aria-pressed={recipient === r.id}>
                <span>{r.emoji}</span>
                {r.label}
              </button>
            ))}
          </div>
          <p className="field-label mt-5">Tone</p>
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:px-0">
            {TONES.map((t) => (
              <button key={t.id} onClick={() => setTone(t.id)} className={`chip ${tone === t.id ? 'chip-active' : ''}`} aria-pressed={tone === t.id}>
                <span>{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="w-name" className="field-label">
                Their name
              </label>
              <input id="w-name" className="field" placeholder="e.g. Sarah" maxLength={30} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
            </div>
            <div>
              <label htmlFor="w-from" className="field-label">
                From <span className="font-normal text-muted">(optional)</span>
              </label>
              <input id="w-from" className="field" placeholder="Your name" maxLength={30} value={sender} onChange={(e) => setSender(e.target.value)} autoComplete="off" />
            </div>
          </div>
        </Step>

        <div ref={previewRef} className="scroll-mt-20 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-4 lg:row-start-1">
          <div className="panel p-3 sm:p-4">
            <AnimatePresence mode="wait">
              <motion.div key={rolls} initial={{ opacity: 0.4, scale: 0.96, rotate: -1.5 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 16, stiffness: 220 }} className="overflow-hidden rounded-2xl">
                <PosterCanvas draw={draw} width={720} height={900} replayKey={`${rolls}-${design}`} label="Birthday card preview" />
              </motion.div>
            </AnimatePresence>
            <motion.button whileTap={{ scale: 0.96 }} onClick={generate} className="btn-accent mt-3 w-full py-3.5 text-base">
              <motion.span key={rolls} initial={{ rotate: -180 }} animate={{ rotate: 0 }} transition={{ type: 'spring' }} className="inline-flex">
                <LuDices className="size-5" />
              </motion.span>
              Generate another wish
            </motion.button>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              <button onClick={() => copy()} className="btn-ghost px-2">
                <LuCopy /> Copy
              </button>
              <button onClick={download} className="btn-ghost px-2">
                <LuDownload /> Save
              </button>
              <button onClick={() => setShareOpen(true)} className="btn-primary px-2">
                <LuShare2 /> Share
              </button>
            </div>
          </div>
        </div>

        <Step n={2} title="Pick a card design" className="lg:col-start-1">
          <ThemePicker value={design} onChange={setDesign} />
        </Step>

        <Step n={3} title="Make it personal" className="lg:col-start-1">
          <label htmlFor="w-msg" className="sr-only">
            Message
          </label>
          <textarea id="w-msg" rows={5} maxLength={400} className="field resize-none leading-relaxed" value={message} onChange={(e) => setCustom(e.target.value)} />
          <div className="mt-2 flex items-center justify-between text-xs text-muted">
            <span>{message.length}/400 · edit freely</span>
            {custom !== null && (
              <button onClick={() => setCustom(null)} className="inline-flex items-center gap-1 font-medium text-ink hover:text-coral">
                <LuRotateCcw /> Reset text
              </button>
            )}
          </div>
        </Step>

        <Step n={4} title={`Browse ${MESSAGES.length} wishes`} className="lg:col-start-1">
          <div className="relative mb-4">
            <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input className="field pl-11" placeholder="Search wishes, e.g. cake" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search wishes" />
          </div>
          <p className="mb-3 text-sm text-muted">{list.length} matching wishes</p>
          <motion.div layout className="grid gap-3 sm:grid-cols-2">
            <AnimatePresence initial={false}>
              {list.slice(0, visible).map((m) => {
                const active = m.id === current.id && custom === null
                const text = personalize(m.text, name, recipient)
                return (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`flex flex-col rounded-2xl border p-4 transition ${active ? 'border-ink bg-ink/[0.03] ring-4 ring-ink/5' : 'border-line bg-cream/60 hover:border-ink/30'}`}
                  >
                    <p className="flex-1 text-[15px] leading-relaxed">{text}</p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-paper px-2.5 py-1 text-xs font-medium text-muted">{TONE_LABEL[m.tone]}</span>
                      <div className="flex gap-1.5">
                        <button onClick={() => copy(text)} className="grid size-9 place-items-center rounded-full border border-line bg-paper hover:border-ink/30" aria-label="Copy wish">
                          <LuCopy />
                        </button>
                        <button onClick={() => choose(m)} className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold ${active ? 'bg-mint text-white' : 'bg-ink text-cream hover:bg-plum'}`}>
                          {active ? <LuCheck /> : null}
                          {active ? 'On card' : 'Use'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
          {visible < list.length && (
            <button onClick={() => setVisible((v) => v + PAGE)} className="btn-ghost mt-4 w-full">
              Show more wishes
            </button>
          )}
        </Step>
      </div>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} title={name ? `Wish for ${name}` : 'Birthday wish'} draw={draw} shareText={shareText} shareUrl={shareUrl} fileName={fileName}>
        <div>
          <p className="field-label">Card design</p>
          <ThemePicker value={design} onChange={setDesign} />
        </div>
      </ShareModal>
    </ToolLayout>
  )
}

export default function WishesTool() {
  const [params] = useSearchParams()
  return params.get('view') === '1' ? <WishView params={params} /> : <Editor />
}
