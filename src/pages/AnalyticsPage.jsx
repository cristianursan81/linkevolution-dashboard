import { useCallback, useEffect, useState } from 'react'
import {
  BarChart2,
  Bot,
  CheckCircle2,
  Clock,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react'
import { api, isAbort } from '../api/client'
import { formatPct } from '../lib/format'

function StatCard({ icon: Icon, label, value, sub, color = 'teal' }) {
  const colors = {
    teal: 'text-teal-400 bg-teal-900/30',
    sky: 'text-sky-400 bg-sky-900/30',
    green: 'text-green-400 bg-green-900/30',
    yellow: 'text-yellow-400 bg-yellow-900/30',
    cyan: 'text-cyan-400 bg-cyan-900/30',
  }
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="mb-3 flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors[color] || colors.teal}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-100">{value ?? '—'}</p>
      <p className="mt-0.5 text-sm text-gray-400">{label}</p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (signal) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.getAnalytics(signal)
      setData(res)
    } catch (e) {
      if (isAbort(e)) return
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const ac = new AbortController()
    load(ac.signal)
    return () => ac.abort()
  }, [load])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-800 px-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-gray-400" />
          <h1 className="text-sm font-semibold text-gray-100">Analytics</h1>
        </div>
        <button type="button" onClick={() => load()} className="text-gray-400 transition-colors hover:text-gray-200">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Cargando métricas...
          </div>
        )}
        {!loading && error && (
          <div className="py-8 text-center text-sm text-red-400">
            <p>{error}</p>
            <button type="button" onClick={() => load()} className="mt-2 text-teal-400 hover:underline">
              Reintentar
            </button>
          </div>
        )}
        {!loading && data && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <StatCard
              icon={MessageSquare}
              label="Conversaciones totales"
              value={data.total_conversations}
              color="teal"
            />
            <StatCard
              icon={TrendingUp}
              label="Abiertas"
              value={data.open_conversations}
              color="sky"
            />
            <StatCard
              icon={CheckCircle2}
              label="Resueltas"
              value={data.resolved_conversations}
              color="green"
            />
            <StatCard
              icon={Users}
              label="Contactos únicos"
              value={data.unique_contacts}
              color="cyan"
            />
            <StatCard
              icon={Clock}
              label="Mensajes hoy"
              value={data.messages_today}
              color="yellow"
            />
            <StatCard
              icon={Bot}
              label="Gestionadas por IA"
              value={data.ai_handled}
              sub={data.ai_handled_pct != null ? `${formatPct(data.ai_handled_pct)} del total` : undefined}
              color="teal"
            />
          </div>
        )}
      </div>
    </div>
  )
}
