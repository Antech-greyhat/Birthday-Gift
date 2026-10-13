// Canvas cannot use web fonts until they are loaded, so request them up front
const FACES = [
  '400 40px "Fraunces"',
  '600 40px "Fraunces"',
  'italic 400 40px "Fraunces"',
  'italic 600 40px "Fraunces"',
  '400 40px "Outfit"',
  '500 40px "Outfit"',
  '600 40px "Outfit"',
  '700 40px "Outfit"',
  '400 40px "Great Vibes"',
  '400 40px "Pacifico"',
  '400 40px "Bebas Neue"',
]

let pending = null

export function loadFonts() {
  if (!pending) {
    pending = document.fonts
      ? Promise.all(FACES.map((f) => document.fonts.load(f).catch(() => null))).then(() => document.fonts.ready)
      : Promise.resolve()
  }
  return pending
}
