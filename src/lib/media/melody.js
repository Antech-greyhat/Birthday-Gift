const FREQ = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  'F#4': 369.99,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  G2: 98.0,
  D3: 146.83,
  C3: 130.81,
}

// Happy Birthday melody as [note, beats]
const SONG = [
  ['D4', 0.75], ['D4', 0.25], ['E4', 1], ['D4', 1], ['G4', 1], ['F#4', 2],
  ['D4', 0.75], ['D4', 0.25], ['E4', 1], ['D4', 1], ['A4', 1], ['G4', 2],
  ['D4', 0.75], ['D4', 0.25], ['D5', 1], ['B4', 1], ['G4', 1], ['F#4', 1], ['E4', 2],
  ['C5', 0.75], ['C5', 0.25], ['B4', 1], ['G4', 1], ['A4', 1], ['G4', 3],
]

// Soft bass notes at the start of each bar as [beat, note]
const BASS = [
  [1, 'G2'], [4, 'D3'], [7, 'D3'], [10, 'G2'], [13, 'G2'], [16, 'C3'], [20, 'G2'], [22, 'D3'], [23, 'G2'],
]

function pluck(ctx, out, freq, start, length, volume) {
  const osc = ctx.createOscillator()
  const shimmer = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  shimmer.type = 'sine'
  osc.frequency.value = freq
  shimmer.frequency.value = freq * 2
  const shimmerGain = ctx.createGain()
  shimmerGain.gain.value = 0.25
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length)
  osc.connect(gain)
  shimmer.connect(shimmerGain).connect(gain)
  gain.connect(out)
  osc.start(start)
  shimmer.start(start)
  osc.stop(start + length + 0.05)
  shimmer.stop(start + length + 0.05)
}

// Builds a music box version of the song routed into a media stream
export function createMelody({ beat = 0.34, offset = 0.4 } = {}) {
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return null
  const ctx = new Ctx()
  const dest = ctx.createMediaStreamDestination()
  const master = ctx.createGain()
  master.gain.value = 0.8
  const delay = ctx.createDelay()
  const feedback = ctx.createGain()
  delay.delayTime.value = beat * 0.75
  feedback.gain.value = 0.25
  master.connect(dest)
  master.connect(delay)
  delay.connect(feedback).connect(delay)
  delay.connect(dest)

  return {
    track: dest.stream.getAudioTracks()[0],
    async start() {
      await ctx.resume()
      const t0 = ctx.currentTime + offset
      let at = 0
      SONG.forEach(([note, beats]) => {
        pluck(ctx, master, FREQ[note], t0 + at * beat, Math.max(0.35, beats * beat * 1.1), 0.32)
        at += beats
      })
      BASS.forEach(([b, note]) => pluck(ctx, master, FREQ[note], t0 + b * beat, beat * 2.6, 0.16))
    },
    close() {
      ctx.close().catch(() => {})
    },
  }
}
