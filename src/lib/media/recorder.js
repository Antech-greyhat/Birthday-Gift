import { createMelody } from './melody'
import { loadFonts } from '../fonts'
import { SETTLE } from '../canvas/core'

const VIDEO_TYPES = [
  'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
  'video/mp4;codecs=avc1,mp4a',
  'video/mp4',
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
]

export function canRecordVideo() {
  return typeof window !== 'undefined' && 'MediaRecorder' in window && !!HTMLCanvasElement.prototype.captureStream
}

// Best mp4 type first, then best webm type as a fallback
function candidateTypes() {
  const supported = VIDEO_TYPES.filter((t) => MediaRecorder.isTypeSupported?.(t))
  const mp4 = supported.find((t) => t.includes('mp4'))
  const webm = supported.find((t) => t.includes('webm'))
  const list = [mp4, webm].filter(Boolean)
  return list.length ? list : ['']
}

// Some browsers report mp4 support but write files without a video track
function hasVideo(blob) {
  return new Promise((resolve) => {
    if (!blob.size) return resolve(false)
    const url = URL.createObjectURL(blob)
    const el = document.createElement('video')
    let settled = false
    const done = (ok) => {
      if (settled) return
      settled = true
      URL.revokeObjectURL(url)
      resolve(ok)
    }
    el.muted = true
    el.preload = 'metadata'
    el.onloadedmetadata = () => done(el.videoWidth > 0)
    el.onerror = () => done(false)
    setTimeout(() => done(el.videoWidth > 0), 4000)
    el.src = url
  })
}

// Renders a still frame after all intro animations have settled
export async function renderImage(draw, width, height) {
  await loadFonts()
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  draw(canvas.getContext('2d'), width, height, SETTLE)
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

// Plays the animation in real time on a hidden canvas and records it
async function recordOnce(draw, { width, height, duration, music, onProgress }, mimeType) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  draw(ctx, width, height, 0)

  const stream = canvas.captureStream(30)
  const melody = music ? createMelody() : null
  if (melody?.track) stream.addTrack(melody.track)

  const recorder = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: 5_000_000 } : undefined)
  const chunks = []
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data)
  const stopped = new Promise((resolve) => (recorder.onstop = resolve))

  recorder.start(250)
  await melody?.start()
  const start = performance.now()
  await new Promise((resolve) => {
    const frame = (now) => {
      const t = (now - start) / 1000
      draw(ctx, width, height, Math.min(t, duration))
      onProgress?.(Math.min(1, t / duration))
      if (t < duration) requestAnimationFrame(frame)
      else resolve()
    }
    requestAnimationFrame(frame)
  })
  recorder.stop()
  await stopped
  melody?.close()
  stream.getTracks().forEach((tr) => tr.stop())

  const type = (recorder.mimeType || mimeType || 'video/webm').split(';')[0]
  return { blob: new Blob(chunks, { type }), ext: type.includes('mp4') ? 'mp4' : 'webm' }
}

// Records with the preferred format and retries with the next one if the file is unusable
export async function renderVideo(draw, options) {
  await loadFonts()
  const types = candidateTypes()
  let result = null
  for (const type of types) {
    options.onProgress?.(0)
    result = await recordOnce(draw, options, type)
    if (await hasVideo(result.blob)) return result
  }
  if (!result?.blob.size) throw new Error('Recording failed')
  return result
}
