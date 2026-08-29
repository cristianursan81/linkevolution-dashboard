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

export default function SlaTimer({ slaBreached, slaDeadline, status }) {
  const closed = status === 'resolved' || status === 'closed'
  const [tick, setTick] = useState({ breached: false, urgent: false, label: '' })

  useEffect(() => {
    if (closed || slaBreached || !slaDeadline) return undefined

    function update() {
      const deadline = new Date(slaDeadline).getTime()
      if (Number.isNaN(deadline)) {
        setTick({ breached: false, urgent: false, label: '' })
        return
      }
      const diff = deadline - Date.now()
      const breached = diff < 0
      setTick({
        breached,
        urgent: !breached && diff < 5 * 60 * 1000,
        label: breached ? `+${parseDuration(diff)} SLA` : parseDuration(diff),
      })
    }

    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [closed, slaBreached, slaDeadline])

  if (closed) return null

  if (slaBreached) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400">
        <Clock className="h-3 w-3" />
        SLA incumplido
      </span>
    )
  }

  if (!slaDeadline || !tick.label) return null

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        tick.breached ? 'text-red-400' : tick.urgent ? 'text-yellow-400' : 'text-gray-400'
      }`}
    >
      <Clock className="h-3 w-3" />
      {tick.label}
    </span>
  )
}
