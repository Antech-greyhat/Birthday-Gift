import { LuTimer, LuHeart, LuPartyPopper } from 'react-icons/lu'

// Tool catalogue used by the home page and the tool switcher
export const TOOLS = [
  {
    id: 'countdown',
    path: '/countdown',
    title: 'Birthday Countdown',
    short: 'Countdown',
    tagline: 'Every second counts',
    description: 'Count down to any birthday with live days, hours, minutes and seconds. Discover the zodiac sign, birthstone and fun facts, then share the link.',
    features: ['Live timer', 'Zodiac & birthstone', 'Fun facts', 'Shareable link'],
    icon: LuTimer,
    color: 'bg-coral',
    soft: 'bg-coral/10',
    text: 'text-coral',
    art: 'from-[#2b1640] to-[#5a2a6e]',
  },
  {
    id: 'wishes',
    path: '/wishes',
    title: 'Birthday Wishes',
    short: 'Wishes',
    tagline: 'Find the perfect words',
    description: 'Generate heartfelt, funny or inspiring birthday wishes for family, friends and loved ones, on beautiful cards you can copy, download or share.',
    features: ['200+ messages', '10 card designs', 'Copy & download', 'Photo or video'],
    icon: LuHeart,
    color: 'bg-lilac',
    soft: 'bg-lilac/10',
    text: 'text-lilac',
    art: 'from-[#efe4ff] to-[#ffe1ea]',
  },
  {
    id: 'invitation',
    path: '/invitation',
    title: 'Invitation Maker',
    short: 'Invites',
    tagline: 'Throw a party in minutes',
    description: 'Create a beautiful birthday party invitation. Pick a theme, colors and fonts, add the details and send it on WhatsApp or download it as an image.',
    features: ['10 themes', 'Custom colors', 'WhatsApp ready', 'Calendar & map'],
    icon: LuPartyPopper,
    color: 'bg-mint',
    soft: 'bg-mint/10',
    text: 'text-mint',
    art: 'from-[#c9f2e7] to-[#fff1c9]',
  },
]

export const getTool = (id) => TOOLS.find((t) => t.id === id)
