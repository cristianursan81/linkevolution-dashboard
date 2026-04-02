const STATUS_CONFIG = {
  open: { label: 'Abierta', bg: 'bg-blue-900/50', text: 'text-blue-300' },
  pending: { label: 'Pendiente', bg: 'bg-yellow-900/50', text: 'text-yellow-300' },
  resolved: { label: 'Resuelta', bg: 'bg-green-900/50', text: 'text-green-300' },
  closed: { label: 'Cerrada', bg: 'bg-gray-800', text: 'text-gray-400' },
  waiting: { label: 'Esperando', bg: 'bg-orange-900/50', text: 'text-orange-300' },
}

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] || {
    label: status || 'Desconocido',
    bg: 'bg-gray-800',
    text: 'text-gray-400',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  )
}
