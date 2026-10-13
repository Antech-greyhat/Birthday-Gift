import { useState } from 'react'
import { LuHeart } from 'react-icons/lu'
import { TbZodiacLeo } from 'react-icons/tb'
import FlipNumber from './FlipNumber'
import { useNow } from '../hooks/useNow'

// Ticking mini countdown shown on the countdown card
export function CountdownArt() {
  const now = useNow()
  const [target] = useState(() => Date.now() + (42 * 86400 + 7 * 3600 + 15 * 60 + 9) * 1000)
  const diff = Math.max(0, Math.floor((target - now) / 1000))
  const parts = [
    [Math.floor(diff / 86400), 'days'],
    [Math.floor((diff % 86400) / 3600), 'hrs'],
    [Math.floor((diff % 3600) / 60), 'min'],
    [diff % 60, 'sec'],
  ]
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-3">
      <span className="absolute left-6 top-6 size-2 animate-float rounded-full bg-sun" />
      <span className="absolute right-8 top-10 size-3 animate-float-slow rotate-45 bg-coral" />
      <span className="absolute bottom-8 left-10 size-2.5 animate-float-slow rounded-full bg-mint" />
      <span className="absolute -right-10 -top-10 size-36 animate-spin-slow rounded-full border-2 border-dashed border-white/15" />
      <div className="flex gap-2">
        {parts.map(([v, l]) => (
          <div key={l} className="rounded-xl bg-white/10 px-2.5 py-2 text-center ring-1 ring-white/15 backdrop-blur transition duration-300 group-hover:-translate-y-1">
            <FlipNumber value={v} className="font-display text-2xl font-semibold text-white" />
            <div className="mt-1 text-[10px] font-medium uppercase tracking-widest text-white/60">{l}</div>
          </div>
        ))}
      </div>
      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-sun">
        <TbZodiacLeo /> Leo · Peridot · 27 sleeps
      </span>
    </div>
  )
}

// Fanned greeting cards with rising hearts
export function WishesArt() {
  return (
    <div className="relative grid h-full place-items-center">
      <LuHeart fill="currentColor" className="absolute bottom-6 left-[24%] animate-rise text-xl text-coral" />
      <LuHeart fill="currentColor" className="absolute bottom-4 right-[26%] animate-rise text-lg text-lilac [animation-delay:1.3s]" />
      <LuHeart fill="currentColor" className="absolute bottom-10 right-[40%] animate-rise text-sm text-coral [animation-delay:2.4s]" />
      <div className="relative h-32 w-24">
        <div className="absolute inset-0 -rotate-12 rounded-xl bg-linear-to-br from-[#ffd6e3] to-[#ff8fab] shadow-soft transition duration-500 group-hover:-translate-x-8 group-hover:-rotate-[22deg]" />
        <div className="absolute inset-0 rotate-12 rounded-xl bg-linear-to-br from-[#d9ccff] to-[#a77bff] shadow-soft transition duration-500 group-hover:translate-x-8 group-hover:rotate-[22deg]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white p-2 shadow-lift transition duration-500 group-hover:-translate-y-3">
          <span className="font-script text-xl leading-none text-plum">Happy</span>
          <span className="font-script text-xl leading-none text-coral">Birthday</span>
          <span className="mt-1 h-1 w-12 rounded-full bg-line" />
          <span className="h-1 w-9 rounded-full bg-line" />
          <span className="h-1 w-11 rounded-full bg-line" />
        </div>
      </div>
    </div>
  )
}

// Envelope with an invitation that slides out on hover
export function InvitationArt() {
  return (
    <div className="relative grid h-full place-items-center">
      <div className="absolute left-[14%] top-6 animate-bob">
        <div className="h-12 w-10 rounded-[50%] bg-coral shadow-soft" />
        <div className="mx-auto h-10 w-px bg-ink/30" />
      </div>
      <div className="absolute right-[14%] top-10 animate-bob [animation-delay:1.1s]">
        <div className="h-10 w-8 rounded-[50%] bg-sun shadow-soft" />
        <div className="mx-auto h-8 w-px bg-ink/30" />
      </div>
      <div className="relative mt-10 h-20 w-36">
        <div className="absolute inset-0 rounded-xl bg-[#11a589]" />
        <div className="absolute inset-x-3 bottom-3 flex h-28 -translate-y-6 flex-col items-center gap-1 rounded-lg bg-white p-2.5 shadow-soft transition duration-500 group-hover:-translate-y-14">
          <span className="text-[8px] font-semibold uppercase tracking-[0.25em] text-mint">You're invited</span>
          <span className="font-script text-lg leading-none text-ink">Ava turns 7</span>
          <span className="mt-1 h-1 w-14 rounded-full bg-line" />
          <span className="h-1 w-10 rounded-full bg-line" />
        </div>
        <div className="absolute inset-0 rounded-xl bg-mint [clip-path:polygon(0_0,50%_55%,100%_0,100%_100%,0_100%)]" />
      </div>
    </div>
  )
}
