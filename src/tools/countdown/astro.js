import { TbZodiacCapricorn, TbZodiacAquarius, TbZodiacPisces, TbZodiacAries, TbZodiacTaurus, TbZodiacGemini, TbZodiacCancer, TbZodiacLeo, TbZodiacVirgo, TbZodiacLibra, TbZodiacScorpio, TbZodiacSagittarius } from 'react-icons/tb'
import { GiRat, GiCow, GiTiger, GiRabbit, GiDragonHead, GiSnake, GiHorseHead, GiGoat, GiMonkey, GiRooster, GiSittingDog, GiPig } from 'react-icons/gi'

// Zodiac signs with the last day of each sign as [month, day], months are 1 based
const ZODIAC = [
  { name: 'Capricorn', symbol: '♑', icon: TbZodiacCapricorn, end: [1, 19], range: 'Dec 22 – Jan 19', element: 'Earth', planet: 'Saturn', traits: ['Ambitious', 'Disciplined', 'Wise'] },
  { name: 'Aquarius', symbol: '♒', icon: TbZodiacAquarius, end: [2, 18], range: 'Jan 20 – Feb 18', element: 'Air', planet: 'Uranus', traits: ['Original', 'Independent', 'Humanitarian'] },
  { name: 'Pisces', symbol: '♓', icon: TbZodiacPisces, end: [3, 20], range: 'Feb 19 – Mar 20', element: 'Water', planet: 'Neptune', traits: ['Compassionate', 'Artistic', 'Intuitive'] },
  { name: 'Aries', symbol: '♈', icon: TbZodiacAries, end: [4, 19], range: 'Mar 21 – Apr 19', element: 'Fire', planet: 'Mars', traits: ['Bold', 'Energetic', 'Courageous'] },
  { name: 'Taurus', symbol: '♉', icon: TbZodiacTaurus, end: [5, 20], range: 'Apr 20 – May 20', element: 'Earth', planet: 'Venus', traits: ['Reliable', 'Patient', 'Devoted'] },
  { name: 'Gemini', symbol: '♊', icon: TbZodiacGemini, end: [6, 20], range: 'May 21 – Jun 20', element: 'Air', planet: 'Mercury', traits: ['Curious', 'Witty', 'Adaptable'] },
  { name: 'Cancer', symbol: '♋', icon: TbZodiacCancer, end: [7, 22], range: 'Jun 21 – Jul 22', element: 'Water', planet: 'Moon', traits: ['Caring', 'Loyal', 'Protective'] },
  { name: 'Leo', symbol: '♌', icon: TbZodiacLeo, end: [8, 22], range: 'Jul 23 – Aug 22', element: 'Fire', planet: 'Sun', traits: ['Confident', 'Generous', 'Warm'] },
  { name: 'Virgo', symbol: '♍', icon: TbZodiacVirgo, end: [9, 22], range: 'Aug 23 – Sep 22', element: 'Earth', planet: 'Mercury', traits: ['Thoughtful', 'Precise', 'Kind'] },
  { name: 'Libra', symbol: '♎', icon: TbZodiacLibra, end: [10, 22], range: 'Sep 23 – Oct 22', element: 'Air', planet: 'Venus', traits: ['Charming', 'Fair', 'Social'] },
  { name: 'Scorpio', symbol: '♏', icon: TbZodiacScorpio, end: [11, 21], range: 'Oct 23 – Nov 21', element: 'Water', planet: 'Pluto', traits: ['Passionate', 'Brave', 'Magnetic'] },
  { name: 'Sagittarius', symbol: '♐', icon: TbZodiacSagittarius, end: [12, 21], range: 'Nov 22 – Dec 21', element: 'Fire', planet: 'Jupiter', traits: ['Adventurous', 'Optimistic', 'Free'] },
]

export function zodiacOf(month, day) {
  const m = month + 1
  const sign = ZODIAC.find(({ end }) => m < end[0] || (m === end[0] && day <= end[1]))
  return sign || ZODIAC[0]
}

export const BIRTHSTONES = [
  { name: 'Garnet', color: '#9b111e', meaning: 'Friendship and trust' },
  { name: 'Amethyst', color: '#9966cc', meaning: 'Peace and clarity' },
  { name: 'Aquamarine', color: '#5fd6c4', meaning: 'Courage and calm' },
  { name: 'Diamond', color: '#cfe8f5', meaning: 'Strength and eternal love' },
  { name: 'Emerald', color: '#50c878', meaning: 'Rebirth and love' },
  { name: 'Pearl', color: '#efe6d2', meaning: 'Purity and wisdom' },
  { name: 'Ruby', color: '#e0115f', meaning: 'Passion and protection' },
  { name: 'Peridot', color: '#a7c42a', meaning: 'Strength and good luck' },
  { name: 'Sapphire', color: '#0f52ba', meaning: 'Wisdom and loyalty' },
  { name: 'Opal', color: '#a8c3bc', meaning: 'Hope and creativity' },
  { name: 'Topaz', color: '#ffb84d', meaning: 'Joy and warmth' },
  { name: 'Turquoise', color: '#40c8c0', meaning: 'Good fortune and success' },
]

export const BIRTH_FLOWERS = [
  { name: 'Carnation', also: 'Snowdrop', meaning: 'Love and admiration' },
  { name: 'Violet', also: 'Primrose', meaning: 'Loyalty and faithfulness' },
  { name: 'Daffodil', also: 'Jonquil', meaning: 'New beginnings' },
  { name: 'Daisy', also: 'Sweet pea', meaning: 'Innocence and joy' },
  { name: 'Lily of the valley', also: 'Hawthorn', meaning: 'Sweetness and humility' },
  { name: 'Rose', also: 'Honeysuckle', meaning: 'Love and passion' },
  { name: 'Larkspur', also: 'Water lily', meaning: 'Lightness and laughter' },
  { name: 'Gladiolus', also: 'Poppy', meaning: 'Strength of character' },
  { name: 'Aster', also: 'Morning glory', meaning: 'Wisdom and faith' },
  { name: 'Marigold', also: 'Cosmos', meaning: 'Warmth and creativity' },
  { name: 'Chrysanthemum', also: 'Peony', meaning: 'Friendship and cheer' },
  { name: 'Narcissus', also: 'Holly', meaning: 'Hope and good wishes' },
]

const ANIMALS = [
  ['Rat', GiRat], ['Ox', GiCow], ['Tiger', GiTiger], ['Rabbit', GiRabbit], ['Dragon', GiDragonHead], ['Snake', GiSnake],
  ['Horse', GiHorseHead], ['Goat', GiGoat], ['Monkey', GiMonkey], ['Rooster', GiRooster], ['Dog', GiSittingDog], ['Pig', GiPig],
]

// Lunar new year falls between Jan 21 and Feb 20, so early year dates are approximate
export function chineseZodiacOf(year, month, day) {
  const before = month === 0 && day < 21
  const y = before ? year - 1 : year
  const [name, icon] = ANIMALS[(((y - 4) % 12) + 12) % 12]
  const approximate = (month === 0 && day >= 21) || (month === 1 && day <= 20)
  return { name, icon, approximate }
}

const RHYME = [
  "Sunday's child is bonny and blithe, good and gay",
  "Monday's child is fair of face",
  "Tuesday's child is full of grace",
  "Wednesday's child is full of woe",
  "Thursday's child has far to go",
  "Friday's child is loving and giving",
  "Saturday's child works hard for a living",
]

export const rhymeFor = (weekday) => RHYME[weekday]

export function generationOf(year) {
  if (year >= 2025) return 'Gen Beta'
  if (year >= 2013) return 'Gen Alpha'
  if (year >= 1997) return 'Gen Z'
  if (year >= 1981) return 'Millennial'
  if (year >= 1965) return 'Gen X'
  if (year >= 1946) return 'Baby Boomer'
  return 'Silent Generation'
}
