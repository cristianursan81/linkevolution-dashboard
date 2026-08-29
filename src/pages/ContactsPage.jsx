import { useCallback, useEffect, useMemo, useState } from 'react'
import { Ban, Languages, Mail, Phone, RefreshCw, Search, Users } from 'lucide-react'
import { api, asList, isAbort } from '../api/client'
import { contactName, initials } from '../lib/format'

function leadTone(score) {
  const n = Number(score)
  if (Number.isNaN(n)) return 'text-gray-500'
  if (n >= 70) return 'text-teal-400'
  if (n >= 40) return 'text-yellow-400'
  return 'text-gray-400'
}

function ContactRow({ contact }) {
  const name = contactName(contact) || `#${String(contact.id || '').slice(0, 6)}`

  return (
    <div className="flex items-center gap-3 border-b border-gray-800 px-4 py-3 transition-colors hover:bg-gray-800/40">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-900/60 text-xs font-bold text-teal-300">
        {initials(name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium text-gray-100">{name}</span>
          {contact.is_blocked && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-950 px-2 py-0.5 text-[10px] font-medium text-red-300">
              <Ban className="h-2.5 w-2.5" /> Bloqueado
            </span>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-3">
          {contact.phone && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Phone className="h-2.5 w-2.5" />
              {contact.phone}
            </span>
          )}
          {contact.email && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Mail className="h-2.5 w-2.5" />
              {contact.email}
            </span>
          )}
          {contact.language && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Languages className="h-2.5 w-2.5" />
              {contact.language}
            </span>
          )}
        </div>
      </div>
      {contact.lead_score != null && contact.lead_score !== '' && (
        <span className={`shrink-0 text-xs font-semibold ${leadTone(contact.lead_score)}`}>
          {contact.lead_score}
        </span>
      )}
    </div>
  )
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const load = useCallback(async (signal) => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getContacts({}, signal)
      setContacts(asList(data, ['contacts', 'items', 'data']))
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return contacts
    return contacts.filter((c) => {
      return (
        contactName(c).toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.language || '').toLowerCase().includes(q) ||
        String(c.id || '').toLowerCase().includes(q)
      )
    })
  }, [contacts, search])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-800 px-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <h1 className="text-sm font-semibold text-gray-100">Contactos</h1>
          {contacts.length > 0 && (
            <span className="rounded-full bg-gray-700 px-1.5 py-0.5 text-xs font-medium text-gray-300">
              {contacts.length}
            </span>
          )}
        </div>
        <button type="button" onClick={() => load()} className="text-gray-400 transition-colors hover:text-gray-200">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="shrink-0 border-b border-gray-800 px-3 py-2.5">
        <div className="relative">
          <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, teléfono o email..."
            className="w-full rounded-lg border border-gray-700 bg-gray-800 py-1.5 pr-3 pl-8 text-sm text-gray-100 placeholder-gray-500 focus:border-teal-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Cargando contactos...
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
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Users className="mb-2 h-8 w-8 opacity-40" />
            <p className="text-sm">No hay contactos</p>
          </div>
        )}
        {!loading && filtered.map((c, i) => <ContactRow key={c.id || i} contact={c} />)}
      </div>
    </div>
  )
}
