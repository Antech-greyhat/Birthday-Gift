import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { LuX, LuDownload, LuShare2, LuImage, LuVideo, LuMusic, LuSquare, LuRectangleVertical, LuSmartphone, LuLink, LuCopy, LuRotateCcw, LuLoaderCircle, LuPlay } from 'react-icons/lu'
import PosterCanvas from './PosterCanvas'
import Segmented from './Segmented'
import { useToast } from './Toast'
import { FORMATS } from '../lib/canvas/core'
import { renderImage, renderVideo, canRecordVideo } from '../lib/media/recorder'
import { SOCIALS, openShareWindow, downloadBlob, copyText, shareFile } from '../lib/share'

const FORMAT_OPTIONS = [
  { value: 'square', label: 'Post', icon: LuSquare },
  { value: 'portrait', label: 'Portrait', icon: LuRectangleVertical },
  { value: 'story', label: 'Story', icon: LuSmartphone },
]

const MODE_OPTIONS = [
  { value: 'photo', label: 'Photo', icon: LuImage },
  { value: 'video', label: 'Video', icon: LuVideo },
]

const VIDEO_SCALE = 720 / 1080

// Bottom sheet on mobile, dialog on desktop, for exporting and sharing a poster
export default function ShareModal({ open, onClose, title, draw, shareText, shareUrl, fileName, defaultFormat = 'portrait', children }) {
  const notify = useToast()
  const [format, setFormat] = useState(defaultFormat)
  const [mode, setMode] = useState('photo')
  const [music, setMusic] = useState(true)
  const [replay, setReplay] = useState(0)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [video, setVideo] = useState(null)
  const [photo, setPhoto] = useState(null)
  const fmt = FORMATS[format]
  const videoSupported = useMemo(() => canRecordVideo(), [])

  // A recorded video becomes stale when its inputs change
  useEffect(() => {
    setVideo((v) => {
      if (v) URL.revokeObjectURL(v.url)
      return null
    })
  }, [format, draw, music])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && !busy && onClose()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, busy, onClose])

  const message = `${shareText}\n${shareUrl}`

  async function photoFile() {
    const blob = await renderImage(draw, fmt.w, fmt.h)
    return new File([blob], `${fileName}-${format}.png`, { type: 'image/png' })
  }

  // Pre-render the photo so native share runs inside the tap gesture
  useEffect(() => {
    if (!open) return
    let alive = true
    setPhoto(null)
    const id = setTimeout(async () => {
      const file = await photoFile()
      if (alive) setPhoto(file)
    }, 300)
    return () => {
      alive = false
      clearTimeout(id)
    }
  }, [open, format, draw])

  async function createVideo() {
    setBusy(true)
    setProgress(0)
    try {
      const res = await renderVideo(draw, {
        width: Math.round(fmt.w * VIDEO_SCALE),
        height: Math.round(fmt.h * VIDEO_SCALE),
        duration: music ? 10 : 6,
        music,
        onProgress: setProgress,
      })
      setVideo({ ...res, url: URL.createObjectURL(res.blob) })
      notify('Your video is ready')
    } catch {
      notify('Video recording is not supported in this browser', 'info')
    }
    setBusy(false)
  }

  async function currentFile() {
    if (mode === 'video' && video) return new File([video.blob], `${fileName}-${format}.${video.ext}`, { type: video.blob.type })
    return photo || photoFile()
  }

  async function download() {
    const file = await currentFile()
    downloadBlob(file, file.name)
    notify(mode === 'video' && video ? 'Video saved' : 'Photo saved')
  }

  // Shares the file through the native share sheet, falling back to a download
  async function shareNative(appName) {
    const file = await currentFile()
    const result = await shareFile(file, { title, text: message })
    if (result === 'unsupported') {
      downloadBlob(file, file.name)
      notify(appName ? `Saved. Open ${appName} and post it from your gallery` : 'Saved. Attach it in any app to share', 'info')
    }
  }

  function social(s) {
    if (s.file) return shareNative(s.label)
    openShareWindow(s.link({ title, text: shareText, url: shareUrl }))
  }

  async function copy(text, label) {
    if (await copyText(text)) notify(`${label} copied`)
  }

  const showVideo = mode === 'video' && video

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button aria-label="Close" className="absolute inset-0 bg-ink/55 backdrop-blur-sm" onClick={() => !busy && onClose()} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: '100%', opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative max-h-[94dvh] w-full overflow-y-auto rounded-t-[2rem] bg-cream shadow-lift sm:max-w-4xl sm:rounded-[2rem]"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-cream/90 px-5 py-4 backdrop-blur">
              <div className="mx-auto h-1.5 w-10 rounded-full bg-line sm:hidden absolute left-1/2 top-1.5 -translate-x-1/2" />
              <div>
                <p className="eyebrow">Share</p>
                <h2 className="font-display text-xl font-semibold">{title}</h2>
              </div>
              <button onClick={() => !busy && onClose()} className="grid size-10 place-items-center rounded-full border border-line bg-paper transition hover:rotate-90" aria-label="Close share panel">
                <LuX />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:p-6">
              <div className="flex min-w-0 flex-col items-center gap-3">
                <div className="relative grid w-full place-items-center rounded-3xl bg-ink/5 p-3">
                  {showVideo ? (
                    <video key={video.url} src={video.url} controls autoPlay muted loop playsInline className="mx-auto max-h-[50dvh] w-auto max-w-full rounded-2xl shadow-soft" />
                  ) : (
                    <PosterCanvas draw={draw} width={fmt.w / 2} height={fmt.h / 2} replayKey={`${replay}-${format}`} label={`${title} preview`} className="mx-auto block h-auto max-h-[50dvh] w-auto max-w-full rounded-2xl shadow-soft" />
                  )}
                  {busy && (
                    <div className="absolute inset-3 grid place-items-center rounded-2xl bg-ink/60 text-cream backdrop-blur-sm">
                      <div className="w-3/4 text-center">
                        <LuLoaderCircle className="mx-auto mb-3 size-8 animate-spin" />
                        <p className="font-medium">Recording your video…</p>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream/20">
                          <div className="h-full rounded-full bg-sun transition-[width] duration-200" style={{ width: `${Math.round(progress * 100)}%` }} />
                        </div>
                        <p className="mt-2 text-xs text-cream/70">Keep this tab open</p>
                      </div>
                    </div>
                  )}
                </div>
                {!showVideo && (
                  <button onClick={() => setReplay((r) => r + 1)} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
                    <LuRotateCcw /> Replay animation
                  </button>
                )}
              </div>

              <div className="flex min-w-0 flex-col gap-5">
                {children}

                <div>
                  <p className="field-label">Size</p>
                  <Segmented options={FORMAT_OPTIONS} value={format} onChange={setFormat} disabled={busy} />
                </div>

                <div>
                  <p className="field-label">Share as</p>
                  <Segmented options={MODE_OPTIONS} value={mode} onChange={setMode} disabled={busy} />
                </div>

                {mode === 'video' && (
                  <div className="rounded-2xl border border-line bg-paper p-4">
                    {videoSupported ? (
                      <>
                        <label className="flex cursor-pointer items-center justify-between gap-3">
                          <span className="flex items-center gap-2 text-sm font-medium">
                            <LuMusic className="text-coral" /> Add "Happy Birthday" music
                          </span>
                          <input type="checkbox" checked={music} onChange={(e) => setMusic(e.target.checked)} className="size-5 accent-coral" disabled={busy} />
                        </label>
                        <button onClick={createVideo} disabled={busy} className="btn-accent mt-3 w-full">
                          {video ? <LuRotateCcw /> : <LuPlay />} {video ? 'Record again' : `Create ${music ? '10' : '6'}s video`}
                        </button>
                        <p className="mt-2 text-xs text-muted">Saved as MP4 where supported, otherwise WebM.</p>
                      </>
                    ) : (
                      <p className="text-sm text-muted">Video export is not supported in this browser. Try Chrome, Edge, Firefox or Safari 17+.</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={download} disabled={busy || (mode === 'video' && !video)} className="btn-ghost">
                    <LuDownload /> Download
                  </button>
                  <button onClick={() => shareNative()} disabled={busy || (mode === 'video' && !video)} className="btn-primary">
                    <LuShare2 /> Share {showVideo ? 'video' : 'photo'}
                  </button>
                </div>

                <div>
                  <p className="field-label">Share to</p>
                  <div className="grid grid-cols-4 gap-x-2 gap-y-3 sm:grid-cols-6">
                    {SOCIALS.map((s, i) => (
                      <motion.button
                        key={s.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + i * 0.025 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => social(s)}
                        disabled={busy}
                        className="group flex flex-col items-center gap-1.5 text-[11px] font-medium text-muted"
                      >
                        <span className="grid size-12 place-items-center rounded-2xl text-lg text-white shadow-soft transition group-hover:-translate-y-0.5" style={{ backgroundColor: s.color }}>
                          <s.icon />
                        </span>
                        {s.label}
                      </motion.button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted">Instagram, TikTok and Snapchat open your share sheet with the {mode}. On desktop it's saved so you can upload it.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => copy(shareUrl, 'Link')} className="btn-ghost">
                    <LuLink /> Copy link
                  </button>
                  <button onClick={() => copy(message, 'Message')} className="btn-ghost">
                    <LuCopy /> Copy text
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
