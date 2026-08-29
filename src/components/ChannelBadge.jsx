const CHANNEL_CONFIG = {
  whatsapp: { label: 'WhatsApp', bg: 'bg-green-900/60', text: 'text-green-400', dot: 'bg-green-500' },
  instagram: { label: 'Instagram', bg: 'bg-pink-900/60', text: 'text-pink-400', dot: 'bg-pink-500' },
  webchat: { label: 'Webchat', bg: 'bg-cyan-900/60', text: 'text-cyan-400', dot: 'bg-cyan-500' },
  web: { label: 'Web', bg: 'bg-blue-900/60', text: 'text-blue-400', dot: 'bg-blue-500' },
  email: { label: 'Email', bg: 'bg-yellow-900/60', text: 'text-yellow-400', dot: 'bg-yellow-500' },
}

export default function ChannelBadge({ channel }) {
  if (!channel) return null
  const key = String(channel).toLowerCase()
  const cfg = CHANNEL_CONFIG[key] || {
    label: channel,
    bg: 'bg-gray-800',
    text: 'text-gray-400',
    dot: 'bg-gray-500',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}
