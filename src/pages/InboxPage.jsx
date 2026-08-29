import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Inbox, RefreshCw, Search } from 'lucide-react'
import { api, asList, isAbort } from '../api/client'
import ChannelBadge from '../components/ChannelBadge'
import StatusBadge from '../components/StatusBadge'
import SlaTimer from '../components/SlaTimer'
import {
  contactName,
  conversationPreview,
  conversationTitle,
  relativeTime,
} from '../lib/format'

const STATUS_FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'open', label: 'Abiertas' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'resolved', label: 'Resueltas' },
]

function ConversationRow({ conv, contactsById, onClick, isSelected }) {
  const name = conversationTitle(conv, contactsById)
  const ts = conv.last_message_at || conv.updated_at || conv.first_message_at || conv.created_at

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full border-b border-gray-800 px-4 py-3.5 text-left transition-colors hover:bg-gray-800/60 ${
        isSelected ? 'border-l-2 border-l-teal-500 bg-teal-950/40' : ''
      }`}
    >
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <span className="truncate text-sm font-medium text-gray-100">{name}</span>
        {ts && (
          <span className="shrink-0 text-xs text-gray-500">{relativeTime(ts)}</span>
        )}
      </div>
      <p className="mb-2 truncate text-xs text-gray-400">{conversationPreview(conv)}</p>
      <div className="flex flex-wrap items-center gap-2">
        <ChannelBadge channel={conv.channel} />
        <StatusBadge status={conv.status} />
        <SlaTimer slaBreached={conv.sla_breached} slaDeadline={conv.sla_deadline || conv.sla_due_at} status={conv.status} />
        {conv.ai_active && (
          <span className="text-[10px] font-medium uppercase tracking-wide text-teal-400">IA activa</span>
        )}
      </div>
    </button>
  )
}

export default function InboxPage({ selectedId, contactsById = {} }) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (silent = false, signal) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    if (!silent) setError('')
    try {
      const params = {}
      if (statusFilter !== 'all') params.status = statusFilter
      const data = await api.getConversations(params, signal)
      setConversations(asList(data, ['conversations', 'items', 'data']))
    } catch (e) {
      if (isAbort(e)) return
      setError(e.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [statusFilter])

  useEffect(() => {
    const ac = new AbortController()
    load(false, ac.signal)
    return () => ac.abort()
  }, [load])

  useEffect(() => {
    const ac = new AbortController()
    const id = setInterval(() => load(true, ac.signal), 30_000)
    return () => {
      ac.abort()
      clearInterval(id)
    }
  }, [load])

  function openConversation(id) {
    const qs = statusFilter !== 'all' ? `?status=${statusFilter}` : ''
    navigate(`/inbox/${id}${qs}`)
  }

  function applyFilter(s) {
    setStatusFilter(s)
    const next = s !== 'all' ? { status: s } : {}
    setSearchParams(next, { replace: true })
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter((c) => {
      const name = conversationTitle(c, contactsById).toLowerCase()
      const extra = contactName(c.contact).toLowerCase()
      const preview = conversationPreview(c).toLowerCase()
      const channel = (c.channel || '').toLowerCase()
      const id = String(c.id || '').toLowerCase()
      return name.includes(q) || extra.includes(q) || preview.includes(q) || channel.includes(q) || id.includes(q)
    })
  }, [conversations, contactsById, search])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-800 px-4">
        <div className="flex items-center gap-2">
          <Inbox className="h-4 w-4 text-gray-400" />
          <h1 className="text-sm font-semibold text-gray-100">Inbox</h1>
          {conversations.length > 0 && (
            <span className="rounded-full bg-teal-600 px-1.5 py-0.5 text-xs font-bold text-white">
              {conversations.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => load(true)}
          disabled={refreshing}
          className="text-gray-400 transition-colors hover:text-gray-200"
          title="Actualizar"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="shrink-0 border-b border-gray-800 px-3 py-2.5">
        <div className="relative">
          <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversaciones..."
            className="w-full rounded-lg border border-gray-700 bg-gray-800 py-1.5 pr-3 pl-8 text-sm text-gray-100 placeholder-gray-500 focus:border-teal-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-gray-800 px-3 py-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => applyFilter(s.id)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === s.id
                ? 'bg-teal-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Cargando...
          </div>
        )}
        {!loading && error && (
          <div className="p-4 text-center text-sm text-red-400">
            <p>{error}</p>
            <button type="button" onClick={() => load()} className="mt-2 text-teal-400 hover:underline">
              Reintentar
            </button>
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Inbox className="mb-2 h-8 w-8 opacity-40" />
            <p className="text-sm">No hay conversaciones</p>
          </div>
        )}
        {!loading &&
          filtered.map((conv) => (
            <ConversationRow
              key={conv.id}
              conv={conv}
              contactsById={contactsById}
              isSelected={String(conv.id) === String(selectedId)}
              onClick={() => openConversation(conv.id)}
            />
          ))}
      </div>
    </div>
  )
}
