import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import ChannelBadge from '../components/ChannelBadge'
import StatusBadge from '../components/StatusBadge'
import SlaTimer from '../components/SlaTimer'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { RefreshCw, Search, Inbox } from 'lucide-react'

const STATUS_FILTERS = ['all', 'open', 'pending', 'resolved']

function ConversationRow({ conv, onClick, isSelected }) {
  const contact = conv.contact || {}
  const name = contact.name || contact.phone || contact.email || `#${conv.id?.slice(0, 6)}`
  const lastMsg = conv.last_message || conv.lastMessage || {}
  const ts = conv.updated_at || conv.last_message_at || conv.created_at

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-gray-800 hover:bg-gray-800/60 transition-colors ${
        isSelected ? 'bg-violet-900/20 border-l-2 border-l-violet-500' : ''
      }`}
    >
      {/* Row 1: name + time */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="text-gray-100 text-sm font-medium truncate">{name}</span>
        {ts && (
          <span className="text-gray-500 text-xs shrink-0">
            {formatDistanceToNow(new Date(ts), { addSuffix: true, locale: es })}
          </span>
        )}
      </div>

      {/* Row 2: last message */}
      <p className="text-gray-400 text-xs truncate mb-2">
        {lastMsg.content || lastMsg.text || conv.preview || 'Sin mensajes'}
      </p>

      {/* Row 3: badges + SLA */}
      <div className="flex items-center gap-2 flex-wrap">
        <ChannelBadge channel={conv.channel} />
        <StatusBadge status={conv.status} />
        <SlaTimer slaDeadline={conv.sla_deadline || conv.sla_due_at} status={conv.status} />
      </div>
    </button>
  )
}

export default function InboxPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')
  const [refreshing, setRefreshing] = useState(false)

  const selectedId = searchParams.get('conv')

  async function load(silent = false) {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    setError('')
    try {
      const params = {}
      if (statusFilter !== 'all') params.status = statusFilter
      const data = await api.getConversations(params)
      const list = Array.isArray(data) ? data : (data?.conversations || data?.data || [])
      setConversations(list)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [statusFilter])

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(() => load(true), 30_000)
    return () => clearInterval(id)
  }, [statusFilter])

  function openConversation(id) {
    navigate(`/conversations/${id}`)
  }

  const filtered = conversations.filter(c => {
    if (!search) return true
    const name = (c.contact?.name || c.contact?.phone || '').toLowerCase()
    const preview = (c.last_message?.content || c.preview || '').toLowerCase()
    return name.includes(search.toLowerCase()) || preview.includes(search.toLowerCase())
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <Inbox className="w-4 h-4 text-gray-400" />
          <h1 className="text-gray-100 font-semibold text-sm">Inbox</h1>
          {conversations.length > 0 && (
            <span className="bg-violet-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {conversations.length}
            </span>
          )}
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="text-gray-400 hover:text-gray-200 transition-colors"
          title="Actualizar"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2.5 border-b border-gray-800 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar conversaciones..."
            className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg pl-8 pr-3 py-1.5 text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 px-3 py-2 border-b border-gray-800 shrink-0 overflow-x-auto">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setSearchParams(s !== 'all' ? { status: s } : {}) }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === s
                ? 'bg-violet-600 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            {s === 'all' ? 'Todas' : s === 'open' ? 'Abiertas' : s === 'pending' ? 'Pendientes' : 'Resueltas'}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Cargando...
          </div>
        )}
        {!loading && error && (
          <div className="p-4 text-red-400 text-sm text-center">{error}</div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Inbox className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">No hay conversaciones</p>
          </div>
        )}
        {!loading && filtered.map(conv => (
          <ConversationRow
            key={conv.id}
            conv={conv}
            isSelected={conv.id === selectedId}
            onClick={() => openConversation(conv.id)}
          />
        ))}
      </div>
    </div>
  )
}
