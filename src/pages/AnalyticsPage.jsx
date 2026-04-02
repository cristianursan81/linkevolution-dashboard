import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { BarChart2, MessageSquare, Users, Clock, TrendingUp, RefreshCw } from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color = 'violet' }) {
  const colors = {
    violet: 'text-violet-400 bg-violet-900/30',
    sky: 'text-sky-400 bg-sky-900/30',
    green: 'text-green-400 bg-green-900/30',
    yellow: 'text-yellow-400 bg-yellow-900/30',
  }
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-100">{value ?? '—'}</p>
      <p className="text-gray-400 text-sm mt-0.5">{label}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await api.getAnalytics()
      setData(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-gray-400" />
          <h1 className="text-gray-100 font-semibold text-sm">Analytics</h1>
        </div>
        <button onClick={load} className="text-gray-400 hover:text-gray-200 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Cargando métricas...
          </div>
        )}
        {!loading && error && (
          <div className="text-center text-red-400 text-sm py-8">{error}</div>
        )}
        {!loading && data && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                icon={MessageSquare}
                label="Conversaciones totales"
                value={data.total_conversations ?? data.conversations}
                color="violet"
              />
              <StatCard
                icon={TrendingUp}
                label="Abiertas"
                value={data.open_conversations ?? data.open}
                color="sky"
              />
              <StatCard
                icon={Users}
                label="Contactos únicos"
                value={data.unique_contacts ?? data.contacts}
                color="green"
              />
              <StatCard
                icon={Clock}
                label="Tiempo medio respuesta"
                value={data.avg_response_time
                  ? `${Math.round(data.avg_response_time / 60)}m`
                  : data.response_time}
                sub="primeros mensajes"
                color="yellow"
              />
            </div>

            {/* Raw data fallback */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h2 className="text-gray-300 text-sm font-medium mb-3">Resumen completo</h2>
              <pre className="text-gray-400 text-xs overflow-x-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
