import { FaWhatsapp, FaFacebookF, FaXTwitter, FaTelegram, FaLinkedinIn, FaPinterestP, FaRedditAlien, FaInstagram, FaTiktok, FaSnapchat, FaEnvelope, FaCommentSms } from 'react-icons/fa6'

const enc = encodeURIComponent

// Link based networks open a share intent, file based ones need the native share sheet
export const SOCIALS = [
  { id: 'whatsapp', label: 'WhatsApp', icon: FaWhatsapp, color: '#25d366', link: ({ text, url }) => `https://wa.me/?text=${enc(`${text}\n${url}`)}` },
  { id: 'facebook', label: 'Facebook', icon: FaFacebookF, color: '#1877f2', link: ({ url, text }) => `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}&quote=${enc(text)}` },
  { id: 'x', label: 'X', icon: FaXTwitter, color: '#000000', link: ({ text, url }) => `https://x.com/intent/post?text=${enc(text)}&url=${enc(url)}` },
  { id: 'instagram', label: 'Instagram', icon: FaInstagram, color: '#e1306c', file: true },
  { id: 'tiktok', label: 'TikTok', icon: FaTiktok, color: '#111111', file: true },
  { id: 'snapchat', label: 'Snapchat', icon: FaSnapchat, color: '#f7d400', file: true },
  { id: 'telegram', label: 'Telegram', icon: FaTelegram, color: '#229ed9', link: ({ text, url }) => `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}` },
  { id: 'linkedin', label: 'LinkedIn', icon: FaLinkedinIn, color: '#0a66c2', link: ({ url }) => `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
  { id: 'pinterest', label: 'Pinterest', icon: FaPinterestP, color: '#e60023', link: ({ text, url }) => `https://pinterest.com/pin/create/button/?url=${enc(url)}&description=${enc(text)}` },
  { id: 'reddit', label: 'Reddit', icon: FaRedditAlien, color: '#ff4500', link: ({ title, url }) => `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(title)}` },
  { id: 'sms', label: 'Messages', icon: FaCommentSms, color: '#34c759', link: ({ text, url }) => `sms:?&body=${enc(`${text}\n${url}`)}` },
  { id: 'email', label: 'Email', icon: FaEnvelope, color: '#6f5f7d', link: ({ title, text, url }) => `mailto:?subject=${enc(title)}&body=${enc(`${text}\n\n${url}`)}` },
]

export function openShareWindow(href) {
  if (href.startsWith('mailto:') || href.startsWith('sms:')) window.location.href = href
  else window.open(href, '_blank', 'noopener,noreferrer,width=640,height=640')
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.className = 'fixed -left-[9999px]'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}

export function canShareFiles(file) {
  return !!navigator.canShare && navigator.canShare({ files: [file] })
}

// Returns 'shared', 'cancelled' or 'unsupported'
export async function shareFile(file, { title, text }) {
  if (!canShareFiles(file)) return 'unsupported'
  try {
    await navigator.share({ files: [file], title, text })
    return 'shared'
  } catch (err) {
    return err?.name === 'AbortError' ? 'cancelled' : 'unsupported'
  }
}

export async function shareLink({ title, text, url }) {
  if (!navigator.share) return 'unsupported'
  try {
    await navigator.share({ title, text, url })
    return 'shared'
  } catch (err) {
    return err?.name === 'AbortError' ? 'cancelled' : 'unsupported'
  }
}

export function slugify(text) {
  return (
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 40) || 'birthday'
  )
}
