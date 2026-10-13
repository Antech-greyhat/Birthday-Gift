// Packs an object into a compact url safe string
export function encodeData(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj))
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeData(str) {
  try {
    const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'))
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return null
  }
}

// Full shareable url for a hash route
export function buildUrl(path, params = {}) {
  const search = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null)).toString()
  const base = window.location.href.split('#')[0]
  return `${base}#${path}${search ? `?${search}` : ''}`
}
