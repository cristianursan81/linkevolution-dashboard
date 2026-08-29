import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function contactName(contact) {
  if (!contact) return ''
  return contact.display_name || contact.name || contact.phone || contact.email || ''
}

export function conversationTitle(conv, contactsById = {}) {
  const nested = contactName(conv?.contact)
  if (nested) return nested
  const fromMap = contactName(contactsById[conv?.contact_id])
  if (fromMap) return fromMap
  const id = conv?.id || ''
  return id ? `Conversación ${String(id).slice(0, 8)}` : 'Conversación'
}

export function conversationPreview(conv) {
  const last = conv?.last_message
  const fromLast = messageText(last)
  if (fromLast) return fromLast
  if (conv?.preview) return conv.preview
  const n = conv?.message_count
  if (n == null) return 'Sin vista previa'
  if (n === 0) return 'Sin mensajes'
  return `${n} mensaje${n === 1 ? '' : 's'}`
}

export function messageText(message) {
  return message?.body || message?.content || message?.text || ''
}

export function isInbound(message) {
  return message?.direction === 'inbound' || message?.sender_type === 'contact'
}

export function isAi(message) {
  return (
    message?.ai_generated === true ||
    message?.sender_type === 'ai' ||
    message?.generated_by === 'ai'
  )
}

export function parseDate(ts) {
  if (!ts) return null
  const d = new Date(ts)
  return Number.isNaN(d.getTime()) ? null : d
}

export function relativeTime(ts) {
  const d = parseDate(ts)
  if (!d) return ''
  return formatDistanceToNow(d, { addSuffix: true, locale: es })
}

export function clockTime(ts) {
  const d = parseDate(ts)
  if (!d) return ''
  return format(d, 'HH:mm', { locale: es })
}

export function initials(name) {
  const s = (name || '').trim()
  if (!s) return '?'
  const parts = s.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function formatPct(value) {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  const pct = n <= 1 ? n * 100 : n
  return `${Math.round(pct)}%`
}
