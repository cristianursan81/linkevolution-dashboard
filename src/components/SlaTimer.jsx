import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

function parseDuration(ms) {
  const totalSec = Math.floor(Math.abs(ms) / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export default function SlaTimer({ slaDeadline, status }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (status === 'resolved' || status === 'closed') return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [status])

  if (!slaDeadline) return null

  const deadline = new Date(slaDeadline).getTime()
  const diff = deadline - now
  const breached = diff < 0
  const urgent = !breached && diff < 5 * 60 * 1000 // < 5 min

  if (status === 'resolved' || status === 'closed') {
    return <span className="text-xs text-gray-500">Cerrado</span>
  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${
      breached ? 'text-red-400' : urgent ? 'text-yellow-400' : 'text-gray-400'
    }`}>
      <Clock className="w-3 h-3" />
      {breached ? `+${parseDuration(diff)} SLA` : parseDuration(diff)}
    </span>
  )
}
